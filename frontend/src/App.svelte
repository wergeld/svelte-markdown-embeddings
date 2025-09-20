<script>
  import { onMount, onDestroy } from 'svelte';
  import { marked } from 'marked';
  import Prism from 'prismjs';
  import 'prismjs/themes/prism.css';
  import 'prismjs/components/prism-javascript.js';

  let title = '', content = '', preview = '';
  let docs = [], selectedDocId = null;
  let darkMode = false;

  let searchQuery = '';
  let searchResults = [];

  let savedTitle = "";
  let savedContent = "";
  let dirty = false;
  // Whenever content or title changes, mark as dirty
  $: dirty = (title !== savedTitle || content !== savedContent);

  // Active tab: "all" or "search"
  let activeTab = 'all';

  
  let isResizing = false;
  let startY;
  let startHeight;

  function startResize(e) {
    isResizing = true;
    startY = e.clientY;
    const topRow = document.querySelector(".top-row");
    startHeight = topRow.offsetHeight;

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  }

  function resize(e) {
    if (!isResizing) return;
    const containerHeight = document.querySelector(".container-fluid").offsetHeight;
    const dy = e.clientY - startY;
    const newTopHeight = startHeight + dy;

    // Minimums: don't let them collapse completely
    if (newTopHeight < 100 || newTopHeight > containerHeight - 100) return;

    const topRow = document.querySelector(".top-row");
    const bottomRow = document.querySelector(".bottom-row");

    topRow.style.height = `${newTopHeight}px`;
    bottomRow.style.height = `${containerHeight - newTopHeight - 8}px`; // account for resizer height

    // Save height to localStorage
    localStorage.setItem("topRowHeight", newTopHeight);
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
  }

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

    
    // Update saved state after successful save
    savedTitle = title;
    savedContent = content;
  }

    // Warn user if leaving with unsaved changes
    function handleBeforeUnload(event) {
      if (dirty) {
        event.preventDefault();
        event.returnValue = ""; // Required for Chrome + most browsers
      }
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

    // set saved state to match loaded doc
    savedTitle = title;
    savedContent = content;
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
    chatMessages = [...chatMessages, { role: 'assistant', text: data.answer, docIds: data.docIds }];
    console.log(chatMessages);
    chatInput = '';
  }

  function openDocById(id) {
    fetch(`/api/doc/${id}`)
      .then(r => r.json())
      .then(d => {
        selectedDocId = d.id;
        title = d.title;
        content = d.content;
        dirty = false;
      });
  }

  onMount(() => {
    loadDocs();
    window.addEventListener("beforeunload", handleBeforeUnload);

    const savedHeight = localStorage.getItem("topRowHeight");
    if (savedHeight) {
      const container = document.querySelector(".container-fluid");
      const containerHeight = container.offsetHeight;
      const topRow = document.querySelector(".top-row");
      const bottomRow = document.querySelector(".bottom-row");

      topRow.style.height = `${savedHeight}px`;
      bottomRow.style.height = `${containerHeight - savedHeight - 8}px`;
    }
  });

  onDestroy(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  });
</script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">

<!-- NOTE: header moved INSIDE the container so it's part of the same flex layout -->
<div class="container-fluid app-root p-2" class:bg-dark={darkMode} class:text-light={darkMode}>

  <header class="d-flex justify-content-between align-items-center px-3 py-2 app-header"
          class:bg-dark={darkMode} class:text-light={darkMode}>
    <h1 class="m-0">My Notes</h1>

    <!-- Dark mode toggle -->
    <div class="mb-0 text-end">
      <button class="btn btn-outline-secondary" on:click={()=>darkMode=!darkMode}>
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  </header>

  <!-- Top + Bottom resizable layout -->
  <div class="flex-grow-1 d-flex flex-column" style="min-height:0;">
    <!-- TOP ROW: file list | editor | preview -->
    <div class="top-row d-flex w-100 min-0">
      <!-- File list panel -->
      <div class="col-panel file-list-panel border rounded p-2 d-flex flex-column min-0"
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

        <!-- Search -->
        <div class="input-group mb-2">
          <input class="form-control form-control-sm" placeholder="Search..." bind:value={searchQuery} />
          <button class="btn btn-sm btn-primary" on:click={searchDocs}>Go</button>
        </div>

        <!-- All Files -->
        {#if activeTab==='all'}
          {#if docs.length === 0}
            <div class="alert alert-info text-center">No documents available. Save a document to get started.</div>
          {:else}
            <ul class="list-group flex-grow-1 overflow-auto min-0">
              {#each docs.sort((a,b)=>a.title.localeCompare(b.title)) as doc}
                <li class="list-group-item d-flex justify-content-between align-items-center"
                    class:bg-dark={darkMode} class:text-light={darkMode}>
                  <div>
                    <strong>{doc.title}</strong><br>
                    <small class="last-modified" class:text-light={darkMode}>{new Date(doc.lastModified).toLocaleString()}</small>
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

        <!-- Search results -->
        {#if activeTab==='search'}
          {#if searchResults.length === 0}
            <div class="alert alert-info text-center">No search results.</div>
          {:else}
            <ul class="list-group flex-grow-1 overflow-auto min-0">
              {#each searchResults as r}
                <li class="list-group-item d-flex justify-content-between align-items-center"
                    class:bg-dark={darkMode} class:text-light={darkMode}>
                  <div>
                    <strong>{r.title}</strong><br>
                    <small class="score-text" class:text-light={darkMode}>Score: {r.score.toFixed(3)}</small>
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
      <div class="col-panel editor-panel border rounded p-2 d-flex flex-column min-0"
          class:bg-dark={darkMode} class:text-light={darkMode}>
        <div class="mb-2">
          <label for="docTitle" class="form-label" class:text-light={darkMode}>Document Title</label>
          <input id="docTitle" class="form-control" placeholder="Enter title..." bind:value={title}
                class:bg-dark={darkMode} class:text-light={darkMode} />
        </div>

        {#if dirty}
          <div class="text-warning mt-1"><small>⚠ Unsaved changes…</small></div>
        {/if}

        <div class="mt-2 d-flex gap-2">
          <button class="btn btn-primary flex-grow-1" on:click={saveDoc}>Save</button>
          <button class="btn btn-secondary flex-grow-1" on:click={() => { title=''; content=''; selectedDocId=null; }}>Clear</button>
        </div>

        <!-- textarea must be AFTER the buttons so layout is consistent; it occupies remaining space -->
        <textarea class="form-control flex-grow-1 min-0" bind:value={content}
                  style="resize:none; overflow:auto;" class:bg-dark={darkMode} class:text-light={darkMode}></textarea>
      </div>

      <!-- Preview panel -->
      <div class="col-panel preview-panel border rounded p-2 d-flex flex-column min-0"
          class:bg-dark={darkMode} class:text-light={darkMode}>
        <div class="flex-grow-1 overflow-auto min-0">
          {@html marked.parse(content || '')}
        </div>
      </div>
    </div>
    
    <!-- Resizer bar -->
    <div class="resizer" on:mousedown={startResize}></div>

    <!-- Chat row: fixed height so input stays visible -->
    <div class="bottom-row d-flex w-100 min-0" role="region" aria-label="chat panel">
      <div class="col-12 border rounded p-2 d-flex flex-column min-0" class:bg-dark={darkMode} class:text-light={darkMode}>
        <h5 class="mb-2">Chat with your notes</h5>

        <!-- chat messages scroll only -->
        <div class="chat-history flex-grow-1 overflow-auto border rounded p-2 min-0">
          {#each chatMessages as c}
            <div class={c.role === 'user' ? 'text-end mb-2' : 'text-start mb-2'}>
              {#if c.role === 'user'}
                <div class="p-2 border rounded d-inline-block"
                    class:bg-primary={!darkMode} class:text-white={!darkMode}
                    class:bg-dark={darkMode} class:text-light={darkMode}>
                  <strong>You:</strong> {c.text}
                </div>
              {:else}
                <div class="p-2 border rounded d-inline-block ...">
                  <strong>Assistant:</strong> {@html marked.parse(c.text)}
                    {#if c.docIds?.length}
                      <div class="mt-1">
                        {#each c.docIds as doc}
                          <button class="btn btn-sm btn-outline-info me-1" 
                                  on:click={() => openDocById(doc.id)}>
                            Open "{doc.title}"
                          </button>
                        {/each}
                      </div>
                    {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- input pinned at bottom (not scrolled away) -->
        <div class="input-group mt-2 flex-shrink-0">
          <input class="form-control" placeholder="Ask a question..." bind:value={chatInput} on:keydown={(e)=> e.key==='Enter' && sendChat()}/>
          <button class="btn btn-primary" on:click={sendChat}>Send</button>
        </div>
      </div>
    </div>
  </div>


</div>

<style>
  /* Ensure the page root uses full viewport and is a column flex container */
  :global(html), :global(body) {
    height: 100%;
  }

  .app-root {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* header stays natural height */
  .app-header {
    flex: 0 0 auto;
  }

  /* TOP ROW: takes remaining space and can shrink properly */
  .top-row {
    flex: 1 1 0;
    display: flex;
    gap: 1rem;
    min-height: 0; /* critical for nested scrolling */
  }

  /* each "col-panel" is a flex column that cannot expand beyond parent */
  .col-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  /* width presets for the three panels; adjust as needed */
  .file-list-panel { width: 220px; flex: 0 0 220px; } /* left narrow panel */
  .editor-panel { flex: 1 1 0; }  /* middle */
  .preview-panel { flex: 1 1 0; } /* right */

  /* Chat row: fixed pixel height so input stays visible */
  .chat-row {
    flex: 0 0 420px; /* fixed height; adjust (220px is a good default) */
    min-height: 0;
    margin-top: 0.5rem;
  }

  /* nested scrolling behavior */
  .min-0 { min-height: 0 !important; }
  textarea, .flex-grow-1 { flex: 1 1 0; min-height: 0; overflow: auto; }

  .resizer {
    height: 8px;
    background: #ccc;
    cursor: row-resize;
    margin: 2px 0;
  }
  .resizer:hover {
    background: #999;
  }

  /* Dark-mode tab styles (as before) */
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
  :global(.nav-tabs.bg-dark .nav-link.active) {
    background-color: #343a40;
    color: #fff;
    border-bottom: 3px solid #0d6efd;
  }
  :global(.nav-tabs .nav-link.active) {
    border-bottom: 3px solid #0d6efd;
  }

  /* Dark mode textarea */
  textarea.bg-dark {
    background-color: #343a40 !important;
    color: #fff !important;
    border-color: #495057 !important;
  }

  textarea.bg-dark::placeholder {
    color: rgba(255, 255, 255, 0.6) !important;
  }
</style>
