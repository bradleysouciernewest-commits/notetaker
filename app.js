// LocalNotes — simple note taking stored in localStorage
// Key used in localStorage:
const STORAGE_KEY = 'localnotes.v1';

const notesListEl = document.getElementById('notesList');
const noteForm = document.getElementById('noteForm');
const titleInput = document.getElementById('noteTitle');
const contentInput = document.getElementById('noteContent');
const pinCheck = document.getElementById('pinCheck');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const newNoteBtn = document.getElementById('newNoteBtn');
const searchInput = document.getElementById('search');
const statusEl = document.getElementById('status');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const clearAllBtn = document.getElementById('clearAllBtn');

let notes = [];
let selectedId = null;

// Utilities
function loadNotes(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    notes = raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error('Failed to parse notes', e);
    notes = [];
  }
}

function saveNotes(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  showStatus('Saved');
}

function showStatus(txt){
  statusEl.textContent = txt;
  setTimeout(()=>{ if(statusEl.textContent === txt) statusEl.textContent = '' }, 1400);
}

function newNote(){
  const id = Date.now().toString();
  const note = {
    id,
    title: '',
    content: '',
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  notes.unshift(note);
  selectedId = id;
  saveNotes();
  renderNotes();
  populateEditor(note);
}

function populateEditor(note){
  selectedId = note.id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  pinCheck.checked = !!note.pinned;
  highlightSelected();
}

function highlightSelected(){
  // scroll and mark the selected note in the list
  Array.from(document.querySelectorAll('.note-item')).forEach(el=>{
    el.classList.toggle('selected', el.dataset.id === selectedId);
  });
}

function updateNoteFromEditor(){
  if(!selectedId) return;
  const note = notes.find(n=>n.id===selectedId);
  if(!note) return;
  note.title = titleInput.value;
  note.content = contentInput.value;
  note.pinned = pinCheck.checked;
  note.updatedAt = new Date().toISOString();
  // keep pinned notes at top
  notes = notes.filter(n=>n.id!==note.id);
  if(note.pinned) notes.unshift(note);
  else notes.push(note);
  saveNotes();
  renderNotes();
}

function deleteSelectedNote(){
  if(!selectedId) return;
  if(!confirm('Delete this note?')) return;
  notes = notes.filter(n=>n.id!==selectedId);
  selectedId = null;
  saveNotes();
  renderNotes();
  clearEditor();
}

function clearEditor(){
  selectedId = null;
  titleInput.value = '';
  contentInput.value = '';
  pinCheck.checked = false;
  highlightSelected();
}

function renderNotes(filter = ''){
  notesListEl.innerHTML = '';
  // sort: pinned first (already managed), then updatedAt desc
  notes.sort((a,b)=>{
    if(a.pinned && !b.pinned) return -1;
    if(!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const f = filter.trim().toLowerCase();
  const shown = notes.filter(n=>{
    if(!f) return true;
    return (n.title + ' ' + n.content).toLowerCase().includes(f);
  });

  if(shown.length === 0){
    notesListEl.innerHTML = `<div class="empty">No notes yet — click "New" to create one.</div>`;
    return;
  }

  shown.forEach(note=>{
    const item = document.createElement('div');
    item.className = 'note-item';
    item.dataset.id = note.id;

    const header = document.createElement('div');
    header.className = 'note-header';

    const title = document.createElement('div');
    title.className = 'note-title';
    title.textContent = note.title || 'Untitled note';

    const meta = document.createElement('div');
    meta.className = 'note-meta';
    if(note.pinned){
      const pin = document.createElement('span');
      pin.className = 'pin';
      pin.textContent = '📌';
      meta.appendChild(pin);
    }
    const time = document.createElement('small');
    time.style.opacity = 0.6;
    time.style.marginLeft = '8px';
    time.textContent = new Date(note.updatedAt).toLocaleString();
    meta.appendChild(time);

    header.appendChild(title);
    header.appendChild(meta);

    const preview = document.createElement('div');
    preview.className = 'note-preview';
    preview.textContent = (note.content || '').split('\n')[0];

    item.appendChild(header);
    item.appendChild(preview);

    item.addEventListener('click', ()=>{
      populateEditor(note);
    });

    notesListEl.appendChild(item);
  });

  highlightSelected();
}

// Export/Import
function exportNotesToFile(){
  const dataStr = JSON.stringify(notes, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `localnotes-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importFromFile(file){
  const reader = new FileReader();
  reader.onload = (e)=>{
    try{
      const imported = JSON.parse(e.target.result);
      if(!Array.isArray(imported)) throw new Error('Invalid format');
      // merge: keep existing and add imported with new ids if collisions
      const existingIds = new Set(notes.map(n=>n.id));
      for(const it of imported){
        if(!it.id || existingIds.has(it.id)){
          it.id = Date.now().toString() + Math.random().toString(36).slice(2,6);
        }
        // ensure required fields
        it.title = it.title || '';
        it.content = it.content || '';
        it.pinned = !!it.pinned;
        it.createdAt = it.createdAt || new Date().toISOString();
        it.updatedAt = it.updatedAt || it.createdAt;
        notes.push(it);
      }
      saveNotes();
      renderNotes();
      showStatus('Imported');
    }catch(err){
      alert('Failed to import: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// init
function init(){
  loadNotes();
  renderNotes();

  noteForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!selectedId){
      // if nothing selected, create a new note then save
      const id = Date.now().toString();
      const note = {
        id,
        title: titleInput.value,
        content: contentInput.value,
        pinned: pinCheck.checked,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if(note.pinned) notes.unshift(note);
      else notes.push(note);
      selectedId = id;
      saveNotes();
      renderNotes();
      showStatus('Saved');
      return;
    }
    updateNoteFromEditor();
  });

  newNoteBtn.addEventListener('click', ()=> newNote());
  deleteBtn.addEventListener('click', ()=> deleteSelectedNote());
  searchInput.addEventListener('input', ()=> renderNotes(searchInput.value));
  exportBtn.addEventListener('click', ()=> exportNotesToFile());
  importFile.addEventListener('change', (e)=>{
    const f = e.target.files && e.target.files[0];
    if(f) importFromFile(f);
    importFile.value = '';
  });
  clearAllBtn.addEventListener('click', ()=>{
    if(!confirm('Clear ALL notes? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY);
    notes = [];
    selectedId = null;
    renderNotes();
    clearEditor();
    showStatus('Cleared');
  });

  // auto-save drafts periodically (every 5s) when a note is selected and changed
  let draftTimer = null;
  function scheduleDraftSave(){
    if(draftTimer) clearTimeout(draftTimer);
    draftTimer = setTimeout(()=> {
      if(selectedId) updateNoteFromEditor();
    }, 2500);
  }
  titleInput.addEventListener('input', scheduleDraftSave);
  contentInput.addEventListener('input', scheduleDraftSave);
  pinCheck.addEventListener('change', scheduleDraftSave);

  // keyboard shortcut: Ctrl/Cmd+N
  window.addEventListener('keydown', (e)=>{
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n'){
      e.preventDefault();
      newNote();
      titleInput.focus();
    }
  });

  // select the most recent note if any
  if(notes.length>0){
    selectedId = notes[0].id;
    populateEditor(notes[0]);
  }
}

init();
