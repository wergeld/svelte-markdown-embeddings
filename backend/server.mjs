import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import Database from 'better-sqlite3';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import Stream from 'stream';

const PORT = process.env.PORT || 3000;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'nomic-embed-text';
const OLLAMA_MODEL_CHAT = process.env.OLLAMA_MODEL_CHAT || 'llama3.2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const db = new Database('./documents.db');
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding TEXT NOT NULL,
    lastModified TEXT NOT NULL
  );
`);

// --- Embedding + cosineSimilarity functions same as before ---
function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function getEmbedding(text) {
  try {
    const res = await axios.post("http://localhost:11434/api/embeddings", {
      model: OLLAMA_MODEL,
      prompt: text
    });
    return res.data.embedding;
  } catch (err) {
    console.error("Ollama embedding error:", err.response?.data || err.message);
    throw new Error("Failed to generate embedding with Ollama");
  }
}

// --- API routes ---
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/save', async (req, res) => {
  const { title, content } = req.body || {};
  if (!title || !content) return res.status(400).send('title and content required');
  try {
    const embedding = await getEmbedding(content);
    const lastModified = new Date().toISOString();
    const stmt = db.prepare('INSERT INTO documents (title, content, embedding, lastModified) VALUES (?, ?, ?, ?)');
    const info = stmt.run(title, content, JSON.stringify(embedding), lastModified);
    res.json({ id: info.lastInsertRowid, lastModified });
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message || 'save failed');
  }
});

app.get('/api/docs', (req, res) => {
  const rows = db.prepare('SELECT id, title, lastModified FROM documents ORDER BY id DESC').all();
  res.json(rows);
});

app.get('/api/doc/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT id, title, content, lastModified FROM documents WHERE id = ?').get(id);
  if (!row) return res.status(404).send('not found');
  res.json(row);
});

app.post('/api/search', async (req, res) => {
  const { query, topK = 5 } = req.body || {};
  if (!query) return res.status(400).send('query required');
  try {
    const qEmb = await getEmbedding(query);
    const rows = db.prepare('SELECT id, title, embedding, lastModified FROM documents').all();
    const scored = rows.map(r => {
      const emb = JSON.parse(r.embedding);
      return { id: r.id, title: r.title, lastModified: r.lastModified, score: cosineSimilarity(emb, qEmb) };
    }).sort((a,b) => b.score - a.score).slice(0, Math.max(1, Math.min(50, topK)));
    res.json(scored);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message || 'search failed');
  }
});

// DELETE document
app.delete('/api/doc/:id', (req, res) => {
  const id = Number(req.params.id);
  const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
  const info = stmt.run(id);
  if (info.changes === 0) return res.status(404).send('Document not found');
  res.json({ success: true });
});

// --- Serve frontend ---
const frontendPath = path.join(__dirname, '../frontend/public');
app.use(express.static(frontendPath));

// SPA fallback (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`API + frontend serving at http://localhost:${PORT}`);
  console.log(`Using Ollama model: ${OLLAMA_MODEL}`);
});

// --- Chat with notes ---
app.post('/api/chat', async (req, res) => {
  const { question, topK = 5 } = req.body || {};
  if (!question) return res.status(400).send('question required');

  try {
    // 1. Get embedding for the question
    const qEmb = await getEmbedding(question);

    // 2. Load all documents with embeddings
    const rows = db.prepare('SELECT id, title, content, embedding FROM documents').all();

    // 3. Compute similarity and get top K
    // const scored = rows.map(r => {
    //   const emb = JSON.parse(r.embedding);
    //   return { id: r.id, title: r.title, content: r.content, score: cosineSimilarity(emb, qEmb) };
    // }).sort((a,b) => b.score - a.score).slice(0, topK);
    const scored = rows.map((row) => ({
      id: row.id,
      content: row.content,
      score: cosineSimilarity(qEmb, JSON.parse(row.embedding))
    }));
    const topDocs = scored.sort((a, b) => b.score - a.score).slice(0, topK);

    // 4. Construct prompt for LLM
//     let contextText = scored.map(r => `Title: ${r.title}\nContent: ${r.content}`).join('\n\n');
//     const prompt = `
// You are a helpful assistant. Use the following notes to answer the question.
// Question: ${question}

// Notes:
// ${contextText}

// Answer concisely:
// `;
    const docsSection = topDocs
      .map(d => `Document ${d.id}:\n${d.content}`)
      .join('\n\n');

    const prompt = `
  You are an AI assistant. Answer the user’s question using ONLY the provided documents. 
  If the answer is not contained in the documents, say "I don’t know."

  For each answer, list the document ID(s) that support your response.

  ---
  User question:
  ${question}

  ---
  Relevant documents:
  ${docsSection}

  ---
  Answer in the following format:

  Answer:
  [Your concise answer here]

  Sources:
  [List of document IDs that contain the answer]
  `;

    // 5. Send prompt to Ollama LLM
    const resp = await axios.post('http://localhost:11434/api/chat', {
      model: OLLAMA_MODEL_CHAT, // replace with your Ollama chat model
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ],
      max_tokens: 300000,
      "stream": false
    });

    console.log(prompt);
    console.log(resp.data);

    const answer = resp.data?.message.content || 'No response';
    res.json({ answer, sources: scored.map(r => ({ id: r.id, title: r.title, score: r.score })) });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || 'chat failed');
  }
});
