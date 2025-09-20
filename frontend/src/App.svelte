<script>
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import Prism from 'prismjs';
  import 'prismjs/themes/prism.css';
  import 'prismjs/components/prism-javascript.js';

  let title = '', content = '', preview = '';
  let docs = [], selectedDocId = null;
  let darkMode = false;

  let searchQuery = '';
  let searchResults = [];

  // Active tab: "all" or "search"
  let activeTab = 'all';

  function toggleTheme() {
    darkMode = !darkMode;
    document.body.classList.toggle('bg-dark', darkMode);
    document.body.classList.toggle('text-light', darkMode);
  }

  async function loadDocs() {
    const res = await fetch('/api/docs');
    docs = (await res.json());
    //docs = (await res.json()).sort((a,b)=>a.title.localeCompare(b.title));
    console.log(docs);
  }

  async function saveDoc() {
    if (!title || !content) return;

    const now = new Date().toISOString(); // Save current timestamp
    // If updating an existing doc, optionally include the same ID
    const docPayload = {
      title,
      content,
      lastModified: now
    };

    if (selectedDocId) {
      await fetch(`/api/doc/${selectedDocId}`, { method: 'DELETE' });
    }
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(docPayload)
      //body: JSON.stringify({title, content})
    });
    if(res.ok) { clearEditor(); await loadDocs(); }
  }

  function clearEditor() {
    title=''; content=''; preview=''; selectedDocId=null;
  }

  async function editDoc(doc) {
    const res = await fetch(`/api/doc/${doc.id}`);
    if(!res.ok) return;
    const data = await res.json();
    selectedDocId = data.id;
    title = data.title;
    content = data.content;
    updatePreview();
  }

  async function deleteDoc(doc) {
    if(!confirm(`Delete "${doc.title}"?`)) return;
    await fetch(`/api/doc/${doc.id}`,{method:'DELETE'});
    await loadDocs();
  }

  function updatePreview() {
    preview = marked.parse(content);
    setTimeout(()=>document.querySelectorAll('pre code').forEach(block=>Prism.highlightElement(block)),0);
  }

  async function searchDocs() {
    if (!searchQuery) return;
    const res = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: searchQuery })
    });
    if (!res.ok) return;
    searchResults = (await res.json()).sort((a,b)=>b.score - a.score);
    //searchResults = (await res.json()).sort((a,b)=>b.score - a.score);
    activeTab = 'search';
  }

  let chatInput = '';
  let chatMessages = [];
  
  // Example messages for testing
    // let chatMessages = [
    //   { role: 'user', text: 'What are the benefits for using RazorSvelte?' },
     //  { role: 'assistant', text: 'RazorSvelte helps integrate Svelte into Razor pages for full-stack apps.' }
    // ];
  async function sendChat() {
    if (!chatInput.trim()) return;
    //chatMessages.push({ role: 'user', text: chatInput });
    chatMessages = [...chatMessages, { role: 'user', text: chatInput }];
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ question: chatInput })
    });
    const data = await res.json();
    console.log(data);
    //chatMessages.push({ role: 'assistant', text: data.answer });
    chatMessages = [...chatMessages, { role: 'assistant', text: data.answer }];
    console.log(chatMessages);
    chatInput = '';
  }

  onMount(loadDocs);
</script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">

<header class="d-flex justify-content-between align-items-center px-3 py-2"
        class:bg-dark={darkMode} class:text-light={darkMode}>
  <h1>My Notes</h1>

  <!-- Dark mode toggle -->
  <div class="mb-0 text-end">
    <button class="btn btn-outline-secondary" on:click={()=>darkMode=!darkMode}>
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  </div>
</header>

<div class="container-fluid vh-100 d-flex flex-column p-2">
  <!-- Top row: File list | Editor | Preview -->
  <div class="row flex-grow-1 mb-2" style="min-height:0; height:70%;">

    <!-- File list panel -->
    <div class="col-2 border rounded p-2 d-flex flex-column overflow-auto"
         class:bg-dark={darkMode} class:text-light={darkMode}>
      
      <!-- Tabs -->
      <ul class="nav nav-tabs mb-2" class:bg-dark={darkMode} class:text-light={darkMode} style="border-bottom:none;">
        <li class="nav-item">
          <a href="#"
            class="nav-link"
            class:active={activeTab==='all'}
            class:bg-dark={darkMode}
            class:text-light={darkMode}
            on:click={(e) => { e.preventDefault(); activeTab='all'; }}>
            All Files
          </a>
        </li>
        <li class="nav-item">
          <a href="#"
            class="nav-link"
            class:active={activeTab==='search'}
            class:bg-dark={darkMode}
            class:text-light={darkMode}
            on:click={(e) => { e.preventDefault(); activeTab='search'; }}>
            Search Results
          </a>
        </li>
      </ul>

      <!-- Search box -->
      <div class="input-group mb-2">
        <input class="form-control form-control-sm" placeholder="Search..." bind:value={searchQuery} />
        <button class="btn btn-sm btn-primary" on:click={searchDocs}>Go</button>
      </div>

      <!-- All Files Tab -->
      {#if activeTab==='all'}
        {#if docs.length === 0}
          <div class="alert alert-info text-center">
            No documents available. Save a document to get started.
          </div>
        {:else}
          <ul class="list-group flex-grow-1 overflow-auto">
            {#each docs.sort((a,b)=>a.title.localeCompare(b.title)) as doc}
              <li class="list-group-item d-flex justify-content-between align-items-center"
                  class:bg-dark={darkMode} class:text-light={darkMode}>
                <div>
                  <strong>{doc.title}</strong><br>
                  <small class="last-modified" class:text-light={darkMode}>
                    {new Date(doc.lastModified).toLocaleString()}
                  </small>
                </div>
                <span>
                  <button class="btn btn-sm btn-outline-primary me-1" on:click={()=>editDoc(doc)} title="Edit">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" on:click={()=>deleteDoc(doc)} title="Delete">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </span>
              </li>
            {/each}
          </ul>
        {/if}
      {/if}

      <!-- Search Results Tab -->
      {#if activeTab==='search'}
        {#if searchResults.length === 0}
          <div class="alert alert-info text-center">
            No search results.
          </div>
        {:else}
          <ul class="list-group flex-grow-1 overflow-auto">
            {#each searchResults as r}
              <li class="list-group-item d-flex justify-content-between align-items-center"
                  class:bg-dark={darkMode} class:text-light={darkMode}>
                <div>
                  <strong>{r.title}</strong><br>
                  <small class="score-text" class:text-light={darkMode}>
                    Score: {r.score.toFixed(3)}
                  </small>
                </div>
                <span>
                  <button class="btn btn-sm btn-outline-primary" on:click={()=>editDoc(r)} title="Edit">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                </span>
              </li>
            {/each}
          </ul>
        {/if}
      {/if}

    </div>

    <!-- Editor panel -->
    <div class="col-5 d-flex flex-column border rounded p-2"
        class:bg-dark={darkMode} class:text-light={darkMode} style="min-height:0;">

      <!-- Document title input -->
      <div class="mb-2">
        <label for="docTitle" class="form-label" class:text-light={darkMode}>Document Title</label>
        <input id="docTitle"
              class="form-control"
              placeholder="Enter title..."
              bind:value={title}
              class:bg-dark={darkMode}
              class:text-light={darkMode} />
      </div>

      <!-- Scrollable textarea -->
      <textarea
        class="form-control flex-grow-1"
        bind:value={content}
        style="resize:none; overflow:auto; min-height:0;"
        class:bg-dark={darkMode}
        class:text-light={darkMode}></textarea>

      <!-- Action buttons -->
      <div class="mt-2 d-flex gap-2">
        <button class="btn btn-primary flex-grow-1" on:click={saveDoc}>Save</button>
        <button class="btn btn-secondary flex-grow-1" on:click={() => { title=''; content=''; currentDocId=null; }}>Clear</button>
      </div>
    </div>

    <!-- Preview panel -->
    <div class="col-5 border rounded p-2 d-flex flex-column"
         class:bg-dark={darkMode} class:text-light={darkMode}>
      <div class="flex-grow-1 overflow-auto" style="min-height:0;">
        {@html preview}
      </div>
    </div>

  </div>

  <!-- Bottom row: Chat panel -->
  <div class="row" style="height:30%;">
    <div class="col-12 border rounded p-2 d-flex flex-column"
         class:bg-dark={darkMode} class:text-light={darkMode}>
      <h5>Chat with your notes</h5>
      <div class="chat-history mb-2 flex-grow-1 overflow-auto border rounded p-2" style="max-height:300px;">
        {#each chatMessages as c, i}
          <div class={c.role === 'user' ? 'text-end mb-2' : 'text-start mb-2'}>

            {#if c.role === 'user'}
              <!-- User message -->
              <div
                class="p-2 border rounded d-inline-block"
                class:bg-primary={!darkMode}
                class:text-white={!darkMode}
                class:bg-dark={darkMode}
                class:text-light={darkMode}
              >
                <strong>You:</strong> {c.text}
              </div>

            {:else if c.role === 'assistant'}
              <!-- Assistant message -->
              <div
                class="p-2 border rounded d-inline-block"
                class:bg-light={!darkMode}
                class:text-dark={!darkMode}
                class:bg-secondary={darkMode}
                class:text-light={darkMode}
              >
                <strong>Assistant:</strong> {@html marked.parse(c.text)}
              </div>
            {/if}

          </div>
        {/each}
      </div>
      <div class="input-group mt-auto">
        <input class="form-control" placeholder="Ask a question..." bind:value={chatInput } />
        <button class="btn btn-primary" on:click={sendChat}>Send</button>
      </div>
    </div>
  </div>

</div>

<style>
/* Ensure flex children don’t expand beyond their parent */
.row.flex-grow-1 {
  min-height: 0;
  height: 70%; /* top row takes 70% of container height */
}

.col-5, .col-2 {
  display: flex;
  flex-direction: column;
  min-height: 0; /* important for scroll to work */
}

textarea, .flex-grow-1 {
  flex: 1 1 0;
  min-height: 0; /* important for scroll to work inside flex container */
  overflow: auto;
}
  /* Dark mode tabs custom styles */
  /* Dark mode tabs custom styles */
  :global(.nav-tabs.bg-dark .nav-link) {
    color: rgba(255,255,255,0.7);
    border: none;
    border-bottom: 2px solid transparent;
    transition: border-color 0.2s, color 0.2s;
  }

  :global(.nav-tabs.bg-dark .nav-link:hover) {
    color: #fff;
    border-bottom-color: rgba(255,255,255,0.5);
  }

  /* Active tab visual indicator */
  :global(.nav-tabs.bg-dark .nav-link.active) {
    background-color: #343a40;
    color: #fff;
    border-bottom: 3px solid #0d6efd; /* blue underline for active tab */
  }

  /* Optional: light mode styling */
  :global(.nav-tabs .nav-link.active) {
    border-bottom: 3px solid #0d6efd; /* blue underline for active tab in light mode */
  }
  textarea.bg-dark {
    background-color: #343a40 !important;
    color: #fff !important;
    border-color: #495057 !important;
  }

  textarea.bg-dark::placeholder {
    color: rgba(255, 255, 255, 0.6) !important;
  }
</style>