import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import Database from 'better-sqlite3';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

function buildFtsQuery(text) {
  const stopwords = new Set([
    "a", "an", "the", "and", "or", "but",
    "what", "is", "to", "in", "on", "for",
    "with", "of", "at", "by", "from", "up",
    "about", "into", "over", "after", "then",
    "once", "so", "than", "too", "very"
  ]);

  let cleaned = text.toLowerCase();
  cleaned = cleaned.replace(/[^\w\s]/g, "");
  let tokens = cleaned.split(/\s+/).filter(Boolean);
  tokens = tokens.filter(t => !stopwords.has(t));
  if (tokens.length === 0) tokens = cleaned.split(/\s+/).filter(Boolean);
  return tokens.map(t => `"${t}"`).join(" OR ");
}

const PORT = process.env.PORT || 3000;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'nomic-embed-text';
const OLLAMA_MODEL_CHAT = process.env.OLLAMA_MODEL_CHAT || 'llama3.2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// --- Database setup ---
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
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts
  USING fts5(title, content, content_rowid = 'id');
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS document_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding TEXT NOT NULL,
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
  );
`);
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS document_chunks_fts
  USING fts5(content, content_rowid = 'id');
`);

// --- Helpers ---
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

function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 0) chunks.push(chunk);
  }
  return chunks;
}

  function extractDocTitlesForSummary(query, allDocs) {
    const lowerQuery = query.toLowerCase();
    const summaryKeywords = ["summarize", "summary", "summarise"];
    const isSummary = summaryKeywords.some(k => lowerQuery.includes(k));
    if (!isSummary) return null;

    // Extract document titles mentioned in query
    const matchedDocs = allDocs.filter(d => lowerQuery.includes(d.title.toLowerCase()));
    return matchedDocs.length > 0 ? matchedDocs : null;
  }

async function rerankWithLLM(query, candidates) {
  const contextList = candidates.map(
    (c, i) => `DOC${i+1}: ${c.content.substring(0, 500)}`
  ).join("\n\n");

  const prompt = `
You are a reranking model.
Question: "${query}"
Documents:
${contextList}

Rank these documents by relevance to the question (most to least).
Respond ONLY with a JSON array of document indices (DOC numbers).
`;

  try {
    const resp = await axios.post('http://localhost:11434/api/chat', {
      model: OLLAMA_MODEL_CHAT,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      options: { temperature: 0 }
    });

    const order = JSON.parse(resp.data?.message.content || "[]");
    const orderMap = new Map(order.map((docNum, idx) => [docNum, idx]));

    return candidates.slice().sort((a, b) => {
      const rankA = orderMap.get(`DOC${candidates.indexOf(a)+1}`) ?? 999;
      const rankB = orderMap.get(`DOC${candidates.indexOf(b)+1}`) ?? 999;
      return rankA - rankB;
    });
  } catch (e) {
    console.error("Rerank failed:", e.message);
    return candidates; // fallback
  }
}

// --- API routes ---
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Save doc + chunks
app.post('/api/save', async (req, res) => {
  const { title, content } = req.body || {};
  if (!title || !content) return res.status(400).send('title and content required');
  try {
    const lastModified = new Date().toISOString();
    const docStmt = db.prepare(
      'INSERT INTO documents (title, content, embedding, lastModified) VALUES (?, ?, ?, ?)'
    );
    const docInfo = docStmt.run(title, content, "[]", lastModified);

    db.prepare(`INSERT INTO documents_fts(rowid, title, content) VALUES (?, ?, ?)`)
      .run(docInfo.lastInsertRowid, title, content);

    const chunks = chunkText(content);
    let chunkIndex = 0;
    for (const chunk of chunks) {
      const emb = await getEmbedding(chunk);
      const chunkInfo = db.prepare(`
        INSERT INTO document_chunks (document_id, chunk_index, content, embedding)
        VALUES (?, ?, ?, ?)
      `).run(docInfo.lastInsertRowid, chunkIndex, chunk, JSON.stringify(emb));

      db.prepare(`INSERT INTO document_chunks_fts(rowid, content) VALUES (?, ?)`)
        .run(chunkInfo.lastInsertRowid, chunk);

      chunkIndex++;
    }

    res.json({ id: docInfo.lastInsertRowid, lastModified });
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
    // --- Vector search ---
    const qEmb = await getEmbedding(query);
    const rows = db.prepare('SELECT id, title, embedding FROM documents').all();

    const vectorScores = rows.map(r => {
      const emb = JSON.parse(r.embedding);
      return {
        id: r.id,
        title: r.title,
        score: cosineSimilarity(emb, qEmb)
      };
    });

    // --- Keyword search (FTS5) ---
    const ftsQuery = buildFtsQuery(query);
    const keywordRows = db.prepare(`
      SELECT rowid as id, bm25(documents_fts) AS keywordScore
      FROM documents_fts
      WHERE documents_fts MATCH ?
      ORDER BY keywordScore
    `).all(ftsQuery);

    const keywordMap = new Map(keywordRows.map(r => [r.id, -r.keywordScore])); // invert bm25

    // --- Combine vector + keyword scores ---
    const combinedScores = vectorScores.map(v => {
      const kScore = keywordMap.get(v.id) || 0;
      return { ...v, score: 0.7 * v.score + 0.3 * kScore };
    });

    // --- Aggregate by document ---
    const docMap = new Map();
    combinedScores.forEach(doc => {
      const existing = docMap.get(doc.id);
      if (!existing || doc.score > existing.score) {
        docMap.set(doc.id, { id: doc.id, title: doc.title, score: doc.score });
      }
    });

    // --- Return topK results ---
    const ranked = Array.from(docMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, Math.min(50, topK)));

    res.json(ranked);

  } catch (e) {
    console.error(e);
    res.status(500).send(e.message || 'search failed');
  }
});


app.delete('/api/doc/:id', (req, res) => {
  const id = Number(req.params.id);
  const stmt = db.prepare('DELETE FROM documents WHERE id = ?');
  const info = stmt.run(id);
  db.prepare(`DELETE FROM documents_fts WHERE rowid = ?`).run(id);
  db.prepare(`DELETE FROM document_chunks WHERE document_id = ?`).run(id);
  if (info.changes === 0) return res.status(404).send('Document not found');
  res.json({ success: true });
});

// Serve frontend
const frontendPath = path.join(__dirname, '../frontend/public');
app.use(express.static(frontendPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`API + frontend serving at http://localhost:${PORT}`);
  console.log(`Using Ollama embedding model: ${OLLAMA_MODEL}`);
  console.log(`Using Ollama chat model: ${OLLAMA_MODEL_CHAT}`);
});

// --- Chat with chunks ---
app.post('/api/chat', async (req, res) => {
  const { query, topK = 5 } = req.body || {};
  if (!query) return res.status(400).send('query required');

  try {
    // --- Retrieve all documents ---
    const allDocs = db.prepare('SELECT id, title, content, embedding FROM documents').all();

    // --- Check if user wants to summarize documents ---
    const extractDocTitlesForSummary = (query, docs) => {
      const lowerQuery = query.toLowerCase();
      const summaryKeywords = ["summarize", "summary", "summarise"];
      const isSummary = summaryKeywords.some(k => lowerQuery.includes(k));
      if (!isSummary) return null;

      // Find docs whose titles are mentioned in query
      const matchedDocs = docs.filter(d => lowerQuery.includes(d.title.toLowerCase()));
      return matchedDocs.length > 0 ? matchedDocs : null;
    };

    const docsToSummarize = extractDocTitlesForSummary(query, allDocs);

    if (docsToSummarize) {
      // --- Build context from selected docs only ---
      const contextText = docsToSummarize
        .map(d => `<<DOC_ID:${d.id} TITLE:${d.title}>>\n${d.content}\n<</DOC_ID>>`)
        .join('\n\n');

      const prompt = `
You are an assistant. Summarize the following documents:

Context:
${contextText}

Instructions:
- Summarize concisely.
- Do NOT add information not present in the documents.
- Preserve inline tags in your answer.
`;

      const resp = await axios.post('http://localhost:11434/api/chat', {
        model: OLLAMA_MODEL_CHAT,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        options: { seed: 101, temperature: 0.2 }
      });

      const response = resp.data?.message.content || 'No response';

      return res.json({
        answer: response,
        docIds: docsToSummarize.map(d => ({ id: d.id, title: d.title }))
      });
    }
    // --- Otherwise, normal hybrid search flow ---

    // --- Vector embedding for query ---
    const qEmb = await getEmbedding(query);

    // Retrieve all chunks + parent document titles
    const rows = db.prepare(`
      SELECT c.id as chunk_id, c.document_id, c.content, c.embedding, d.title
      FROM document_chunks c
      JOIN documents d ON c.document_id = d.id
    `).all();

    // Vector similarity
    const vectorScores = rows.map(r => {
      const emb = JSON.parse(r.embedding);
      return {
        chunk_id: r.chunk_id,
        document_id: r.document_id,
        title: r.title,
        content: r.content,
        vectorScore: cosineSimilarity(emb, qEmb)
      };
    });

    // Keyword search using FTS
    const ftsQuery = buildFtsQuery(query);
    const keywordRows = db.prepare(`
      SELECT rowid as chunk_id, bm25(document_chunks_fts) AS keywordScore
      FROM document_chunks_fts
      WHERE document_chunks_fts MATCH ?
      ORDER BY keywordScore
      LIMIT ?
    `).all(ftsQuery, topK);

    const keywordMap = new Map(keywordRows.map(r => [r.chunk_id, -r.keywordScore]));

    // Hybrid scoring
    let combined = vectorScores.map(v => {
      const kScore = keywordMap.get(v.chunk_id) || 0;
      const finalScore = 0.7 * v.vectorScore + 0.3 * kScore; // tunable weights
      return { ...v, keywordScore: kScore, finalScore };
    });

    // Sort + topK
    combined = combined.sort((a, b) => b.finalScore - a.finalScore).slice(0, topK);
    combined = await rerankWithLLM(query, combined);

    // --- Log for debug ---
    combined.forEach(item => {
      console.log(`${item.title} (doc ${item.document_id}, chunk ${item.chunk_id}): vector=${item.vectorScore.toFixed(3)}, keyword=${item.keywordScore.toFixed(3)}, final=${item.finalScore.toFixed(3)}`);
    });
    console.log('---------------------------------------');

    // --- Build context for LLM with inline doc reference tags ---
    const contextText = combined
      .map(d => `<<DOC_ID:${d.document_id} TITLE:${d.title} SCORE:${d.finalScore.toFixed(3)}>>\n${d.content}\n<</DOC_ID>>`)
      .join('\n\n');

    const prompt = `YYou are an AI assistant specialized in providing accurate summaries of documents. You have access only to the documents and summaries provided. Follow these rules strictly:
- Use only provided content: Answer user requests solely based on the contents of the documents and summaries you have access to. Do not provide information from external sources, prior knowledge, or assumptions.
- Summarize accurately: When a user asks about a topic, provide a concise, clear summary of relevant document content. Ensure you capture the key points and context accurately.
- Include document references: Always include the referenced document text using the following format:
<<DOC_ID:3 TITLE:My Note SCORE:0.45>>[Quoted or paraphrased text from the document here]<</DOC_ID>>
- Replace the ID, TITLE, and SCORE with the actual values for each document you reference.
- Include as many document references as needed to fully answer the user query.
- Do not fabricate: If the documents contain no relevant information, respond clearly that no information is available rather than guessing or generating external content.
- Stay objective: Keep summaries neutral and factual, reflecting only the content of the documents.
- Clarify user queries if needed: If the user’s request is ambiguous, ask precise clarifying questions before summarizing.
- Limit length: Provide summaries that are concise unless the user requests more detailed information.

Example Behavior:
User: “Summarize the document about climate policy.”
AI: <<DOC_ID:12 TITLE:Climate Policy Summary SCORE:0.82>>The document outlines current climate policy initiatives, focusing on emissions reductions, renewable energy incentives, and international cooperation. No financial projections are included.<</DOC_ID>>

User: “What does the document say about tax incentives?”
AI: “No information on tax incentives is available in the documents provided.”

Context:
${contextText}

Question: ${query}
`;

    // --- Send to Ollama ---
    const resp = await axios.post('http://localhost:11434/api/chat', {
      model: OLLAMA_MODEL_CHAT,
      messages: [{ role: "user", content: prompt }],
      stream: false,
      options: { seed: 101, temperature: 0.2 }
    });

    const response = resp.data?.message.content || 'No response';

    // Return both answer + document references
    res.json({
      answer: response,
      docs: combined.map(d => ({
        document_id: d.document_id,
        title: d.title,
        chunk_id: d.chunk_id,
        content: d.content,
        finalScore: d.finalScore
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message || 'chat failed');
  }
});

