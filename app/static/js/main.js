document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

function initApp() {
  console.log('Initializing Voice Notes application...');
  
  // Restore language direction from local storage if available
  const savedDir = localStorage.getItem('app-direction');
  if (savedDir) {
    document.documentElement.dir = savedDir;
    console.log('Restored language direction:', savedDir);
  }
  
  // Create uploads directory if needed
  fetch('/api/extract-tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: '' })
  }).catch(err => console.error('Error checking API connection:', err));
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize the UI based on the current page
  updateActiveNavLink();
  
  // Fetch data
  if (document.getElementById('categories-list')) {
    fetchCategories();
  }
  
  // Load page-specific content
  const path = window.location.pathname;
  
  if (path === '/' || path === '/archived') {
    const isArchived = path === '/archived';
    fetchNotes(isArchived);
  } else if (path === '/tasks') {
    fetchTasks();
  } else if (path === '/reminders') {
    fetchReminders();
  }
}

function setupEventListeners() {
  // Menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }
  
  // Search toggle
  const searchToggle = document.getElementById('search-toggle');
  const searchClear = document.getElementById('search-clear');
  if (searchToggle && searchClear) {
    searchToggle.addEventListener('click', toggleSearch);
    searchClear.addEventListener('click', clearSearch);
  }
  
  // Language toggle
  const languageToggle = document.getElementById('language-toggle');
  if (languageToggle) {
    languageToggle.addEventListener('click', toggleLanguage);
  }
  
  // User profile
  const userProfile = document.getElementById('user-profile');
  if (userProfile) {
    userProfile.addEventListener('click', function() {
      alert('ملف المستخدم غير متاح حاليًا. سيتم تنفيذ هذه الميزة قريبًا.');
    });
  }
  
  // Mobile recording button
  const mobileRecordBtn = document.getElementById('mobile-record-btn');
  if (mobileRecordBtn) {
    mobileRecordBtn.addEventListener('click', scrollToRecordingModule);
  }
  
  // Navigation links in sidebar
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Only prevent default if we're on mobile and need to close the menu
      if (window.innerWidth < 992) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
          sidebar.classList.remove('active');
        }
      }
    });
  });
  
  // Recording functionality
  const recordButton = document.getElementById('record-button');
  if (recordButton) {
    recordButton.addEventListener('click', toggleRecording);
  }
  
  // Transcript editing
  const editTranscript = document.getElementById('edit-transcript');
  if (editTranscript) {
    editTranscript.addEventListener('click', toggleTranscriptEditing);
  }
  
  // View mode
  const viewGrid = document.getElementById('view-grid');
  const viewList = document.getElementById('view-list');
  if (viewGrid && viewList) {
    viewGrid.addEventListener('click', () => setViewMode('grid'));
    viewList.addEventListener('click', () => setViewMode('list'));
  }
  
  // Task form handling
  const createTaskBtn = document.getElementById('create-task');
  const saveTaskBtn = document.getElementById('save-new-task');
  const cancelTaskBtn = document.getElementById('cancel-new-task');
  
  if (createTaskBtn && saveTaskBtn && cancelTaskBtn) {
    createTaskBtn.addEventListener('click', () => {
      document.getElementById('new-task-form').style.display = 'block';
      document.getElementById('new-task-input').focus();
    });
    
    saveTaskBtn.addEventListener('click', () => {
      const taskContent = document.getElementById('new-task-input').value;
      if (taskContent.trim()) {
        fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: taskContent,
            isCompleted: false
          })
        })
        .then(response => response.json())
        .then(data => {
          fetchTasks();
          document.getElementById('new-task-form').style.display = 'none';
          document.getElementById('new-task-input').value = '';
        })
        .catch(error => console.error('Error creating task:', error));
      }
    });
    
    cancelTaskBtn.addEventListener('click', () => {
      document.getElementById('new-task-form').style.display = 'none';
      document.getElementById('new-task-input').value = '';
    });
    
    // Show/hide completed tasks
    const showCompletedBtn = document.getElementById('show-completed');
    if (showCompletedBtn) {
      showCompletedBtn.addEventListener('click', () => {
        const completedSection = document.getElementById('completed-tasks-section');
        if (completedSection.style.display === 'none') {
          completedSection.style.display = 'block';
          showCompletedBtn.textContent = 'Hide Completed';
          showCompletedBtn.classList.add('active');
          
          // Fetch completed tasks
          fetch('/api/tasks?completed=true')
            .then(response => response.json())
            .then(tasks => {
              const completedList = document.getElementById('completed-tasks-list');
              completedList.innerHTML = '';
              
              if (tasks.length === 0) {
                completedList.innerHTML = '<div class="empty-message">No completed tasks</div>';
                return;
              }
              
              tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = 'task-item completed';
                taskElement.innerHTML = `
                  <input type="checkbox" class="task-checkbox" checked data-id="${task.id}">
                  <div class="task-content">
                    <div class="task-text">${task.content}</div>
                    <div class="task-meta">
                      <div class="task-time">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ${formatDate(task.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div class="task-actions">
                    <button class="task-button delete" data-id="${task.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                `;
                completedList.appendChild(taskElement);
              });
              
              setupTaskEventListeners(completedList);
            })
            .catch(error => console.error('Error fetching completed tasks:', error));
            
        } else {
          completedSection.style.display = 'none';
          showCompletedBtn.textContent = 'Show Completed';
          showCompletedBtn.classList.remove('active');
        }
      });
    }
  }
  
  // Reminder form handling
  const createReminderBtn = document.getElementById('create-reminder');
  const saveReminderBtn = document.getElementById('save-reminder');
  const cancelReminderBtn = document.getElementById('cancel-reminder');
  
  if (createReminderBtn && saveReminderBtn && cancelReminderBtn) {
    createReminderBtn.addEventListener('click', () => {
      document.getElementById('new-reminder-form').style.display = 'block';
      
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      
      const dateTimeInput = document.getElementById('reminder-datetime');
      dateTimeInput.value = tomorrow.toISOString().slice(0, 16);
      
      document.getElementById('reminder-title').focus();
    });
    
    saveReminderBtn.addEventListener('click', () => {
      const title = document.getElementById('reminder-title').value;
      const description = document.getElementById('reminder-description').value;
      const reminderTime = document.getElementById('reminder-datetime').value;
      
      if (title.trim() && reminderTime) {
        fetch('/api/reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: title,
            description: description,
            reminderTime: new Date(reminderTime).toISOString()
          })
        })
        .then(response => response.json())
        .then(data => {
          fetchReminders();
          document.getElementById('new-reminder-form').style.display = 'none';
          document.getElementById('reminder-title').value = '';
          document.getElementById('reminder-description').value = '';
        })
        .catch(error => console.error('Error creating reminder:', error));
      }
    });
    
    cancelReminderBtn.addEventListener('click', () => {
      document.getElementById('new-reminder-form').style.display = 'none';
      document.getElementById('reminder-title').value = '';
      document.getElementById('reminder-description').value = '';
    });
    
    // Reminder tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    if (tabButtons.length > 0) {
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          // Remove active class from all tabs
          tabButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          
          // Hide all containers
          document.querySelectorAll('.reminders-container').forEach(container => {
            container.style.display = 'none';
          });
          
          // Show the selected container
          const tabId = button.getAttribute('data-tab');
          document.getElementById(`${tabId}-reminders`).style.display = 'block';
        });
      });
    }
  }
}

function toggleMenu() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    console.log("Toggle sidebar"); // Debug
    sidebar.classList.toggle('active');
    
    // Add overlay for mobile
    let overlay = document.getElementById('sidebar-overlay');
    if (!overlay && sidebar.classList.contains('active') && window.innerWidth < 992) {
      overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.classList.add('sidebar-overlay');
      document.body.appendChild(overlay);
      
      // Close menu when clicking outside
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.remove();
      });
    } else if (overlay && !sidebar.classList.contains('active')) {
      overlay.remove();
    }
  }
}

function toggleSearch() {
  const searchContainer = document.getElementById('search-container');
  if (!searchContainer) return;
  
  searchContainer.classList.toggle('active');
  
  if (searchContainer.classList.contains('active')) {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }
}

function clearSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  
  searchInput.value = '';
  searchInput.focus();
}

function toggleLanguage() {
  // Get current direction
  const currentDir = document.documentElement.dir || 'ltr';
  
  // Toggle direction
  const newDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
  document.documentElement.dir = newDir;
  
  // Store preference in local storage
  localStorage.setItem('app-direction', newDir);
  
  console.log('Language direction changed to:', newDir);
}

// Recording state
let mediaRecorder = null;
let audioChunks = [];
let startTime = null;
let timerInterval = null;
let recordingDuration = 0;

function createWaveform() {
  const waveform = document.getElementById('waveform');
  if (!waveform) return;
  
  waveform.innerHTML = '';
  
  // Create bars for the waveform
  for (let i = 0; i < 50; i++) {
    const bar = document.createElement('div');
    bar.className = 'waveform-bar';
    waveform.appendChild(bar);
  }
}

function animateWaveform(start) {
  const bars = document.querySelectorAll('.waveform-bar');
  if (bars.length === 0) return;
  
  if (start) {
    const animateBar = () => {
      if (!mediaRecorder || mediaRecorder.state !== 'recording') return;
      
      bars.forEach(bar => {
        const height = Math.max(5, Math.floor(Math.random() * 50));
        bar.style.height = `${height}px`;
      });
      
      requestAnimationFrame(animateBar);
    };
    
    animateBar();
  } else {
    bars.forEach(bar => {
      bar.style.height = '10px';
    });
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function toggleRecording() {
  if (!mediaRecorder || mediaRecorder.state !== 'recording') {
    await startRecording();
  } else {
    stopRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    
    mediaRecorder.addEventListener('dataavailable', event => {
      audioChunks.push(event.data);
    });
    
    mediaRecorder.addEventListener('stop', () => {
      // Create audio blob
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // Start speech recognition on the recorded audio
      startSpeechRecognition(audioBlob);
      
      // Save the recording
      saveRecording(audioBlob);
      
      // Reset UI
      document.getElementById('record-button').innerHTML = '<svg id="record-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>';
      document.getElementById('record-button').classList.remove('recording');
      document.getElementById('record-status').textContent = 'Tap to start recording';
      
      // Stop waveform animation
      animateWaveform(false);
    });
    
    // Start recording
    mediaRecorder.start();
    
    // Update UI
    document.getElementById('record-button').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"></rect></svg>';
    document.getElementById('record-button').classList.add('recording');
    document.getElementById('record-status').textContent = 'Recording... Tap to stop';
    
    // Create and animate waveform
    createWaveform();
    animateWaveform(true);
    
    // Start timer
    startTime = Date.now();
    recordingDuration = 0;
    
    document.getElementById('recording-time').textContent = '0:00';
    
    timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      recordingDuration = elapsed;
      document.getElementById('recording-time').textContent = formatTime(elapsed);
    }, 1000);
    
  } catch (error) {
    console.error('Error starting recording:', error);
    document.getElementById('record-status').textContent = 'Error: Could not access microphone';
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    
    // Stop all tracks
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    
    // Clear timer
    clearInterval(timerInterval);
  }
}

function startSpeechRecognition(audioBlob) {
  const transcriptContainer = document.getElementById('transcript-container');
  const transcriptText = document.getElementById('transcript-text');
  
  if (!transcriptContainer || !transcriptText) return;
  
  // Show loading message
  transcriptContainer.style.display = 'block';
  transcriptText.textContent = 'Processing transcription...';
  
  // Create a temporary URL for the audio
  const audioURL = URL.createObjectURL(audioBlob);
  
  // Initialize a new speech recognition instance if available
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = document.getElementById('language-selector').value;
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      transcriptText.textContent = transcript;
      
      // Extract tasks from transcript
      if (transcript) {
        extractTasks(transcript);
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      transcriptText.textContent = 'Could not transcribe. Please try again.';
    };
    
    // Start recognition
    recognition.start();
  } else {
    // Fallback if Web Speech API is not available
    transcriptText.textContent = 'Speech recognition not supported in this browser.';
  }
}

function saveRecording(audioBlob) {
  // Create form data
  const formData = new FormData();
  formData.append('audio', audioBlob);
  
  // Upload to server
  fetch('/api/upload-audio', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    const transcriptText = document.getElementById('transcript-text').textContent;
    
    // Create new note with the audio and transcript
    return fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: transcriptText.split('.')[0] || 'Voice Note',
        content: transcriptText,
        audioUrl: data.audioUrl,
        duration: Math.round(recordingDuration),
        categoryId: 1 // Default category
      })
    });
  })
  .then(response => response.json())
  .then(noteData => {
    console.log('Note saved:', noteData);
    
    // Refresh the notes list
    fetchNotes();
  })
  .catch(error => {
    console.error('Error saving recording:', error);
  });
}

function extractTasks(text, noteId) {
  fetch('/api/extract-tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  })
  .then(response => response.json())
  .then(data => {
    if (data.tasks && data.tasks.length > 0) {
      // Create tasks in the database
      data.tasks.forEach(taskText => {
        fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: taskText,
            noteId: noteId,
            isCompleted: false
          })
        })
        .then(response => response.json())
        .then(taskData => {
          console.log('Task created:', taskData);
        })
        .catch(error => {
          console.error('Error creating task:', error);
        });
      });
    }
  })
  .catch(error => {
    console.error('Error extracting tasks:', error);
  });
}

function toggleTranscriptEditing() {
  const transcriptText = document.getElementById('transcript-text');
  const editButton = document.getElementById('edit-transcript');
  
  if (transcriptText.contentEditable === 'true') {
    // Save changes
    transcriptText.contentEditable = 'false';
    transcriptText.classList.remove('editable');
    editButton.textContent = 'Edit';
    
    saveTranscript();
  } else {
    // Enable editing
    transcriptText.contentEditable = 'true';
    transcriptText.classList.add('editable');
    transcriptText.focus();
    editButton.textContent = 'Save';
  }
}

function saveTranscript() {
  // In a real application, you would save the edited transcript to the database
  const transcriptText = document.getElementById('transcript-text').textContent;
  console.log('Saving transcript:', transcriptText);
}

function updateTranscript(e) {
  // Called when the transcript is updated
  const transcriptText = e.target.textContent;
  console.log('Transcript updated:', transcriptText);
}

function setViewMode(mode) {
  const notesContainer = document.getElementById('notes-list');
  const viewGridBtn = document.getElementById('view-grid');
  const viewListBtn = document.getElementById('view-list');
  
  if (mode === 'grid') {
    notesContainer.className = 'notes-grid';
    viewGridBtn.classList.add('active');
    viewListBtn.classList.remove('active');
  } else {
    notesContainer.className = 'notes-list';
    viewGridBtn.classList.remove('active');
    viewListBtn.classList.add('active');
  }
}

function scrollToRecordingModule() {
  const recordingModule = document.querySelector('.recording-module');
  if (recordingModule) {
    recordingModule.scrollIntoView({ behavior: 'smooth' });
  }
}

function fetchCategories() {
  fetch('/api/categories')
    .then(response => response.json())
    .then(categories => {
      renderCategories(categories);
    })
    .catch(error => {
      console.error('Error fetching categories:', error);
      document.getElementById('categories-list').innerHTML = '<li>Error loading categories</li>';
    });
}

function renderCategories(categories) {
  const categoriesList = document.getElementById('categories-list');
  if (!categoriesList) return;
  
  categoriesList.innerHTML = '';
  
  if (categories.length === 0) {
    categoriesList.innerHTML = '<li>No categories found</li>';
    return;
  }
  
  categories.forEach(category => {
    const categoryItem = document.createElement('li');
    categoryItem.className = 'category-item';
    categoryItem.setAttribute('data-id', category.id);
    categoryItem.innerHTML = `
      <span class="category-color" style="background-color: ${category.color}"></span>
      <span class="category-name">${category.name}</span>
    `;
    
    // Add event listener to filter notes by category
    categoryItem.addEventListener('click', () => {
      fetchNotesByCategory(category.id);
    });
    
    categoriesList.appendChild(categoryItem);
  });
}

function fetchNotes(isArchived = false) {
  const endpoint = isArchived ? '/api/notes/archived' : '/api/notes';
  
  fetch(endpoint)
    .then(response => response.json())
    .then(notes => {
      renderNotes(notes);
    })
    .catch(error => {
      console.error('Error fetching notes:', error);
      document.getElementById('notes-list').innerHTML = '<div class="empty-message">Error loading notes</div>';
    });
}

function fetchNotesByCategory(categoryId) {
  fetch(`/api/categories/${categoryId}/notes`)
    .then(response => response.json())
    .then(notes => {
      renderNotes(notes);
      
      // Update page title
      const categoryName = document.querySelector(`.category-item[data-id="${categoryId}"] .category-name`).textContent;
      document.querySelector('.notes-title').textContent = `${categoryName} Notes`;
    })
    .catch(error => {
      console.error('Error fetching notes by category:', error);
      document.getElementById('notes-list').innerHTML = '<div class="empty-message">Error loading notes</div>';
    });
}

function renderNotes(notes) {
  const notesContainer = document.getElementById('notes-list');
  if (!notesContainer) return;
  
  notesContainer.innerHTML = '';
  
  if (notes.length === 0) {
    notesContainer.innerHTML = '<div class="empty-message">No notes found</div>';
    return;
  }
  
  notes.forEach(note => {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.dataset.id = note.id;
    
    noteCard.innerHTML = `
      <div class="note-header">
        <h3 class="note-title">${note.title}</h3>
        <div class="note-actions">
          <button class="btn-icon note-delete" data-id="${note.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
      
      <div class="note-content">${note.content || ''}</div>
      
      ${note.audioUrl ? `
      <div class="audio-player">
        <button class="play-button" data-url="${note.audioUrl}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
        <div class="audio-info">
          <div class="audio-duration">${formatTime(note.duration || 0)}</div>
          <div class="audio-progress">
            <div class="progress-bar"></div>
          </div>
        </div>
      </div>
      ` : ''}
      
      <div class="note-footer">
        <div class="note-meta">
          ${note.categoryId ? `<span class="note-category">${getCategoryColor(note.categoryId)}</span>` : ''}
          <span class="note-time">${formatDate(note.createdAt)}</span>
        </div>
        ${note.tasks && note.tasks.length > 0 ? `
        <div class="note-tasks-count">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
          ${note.tasks.length} ${note.tasks.length === 1 ? 'task' : 'tasks'}
        </div>
        ` : ''}
      </div>
    `;
    
    notesContainer.appendChild(noteCard);
  });
  
  setupNoteEventListeners();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCategoryColor(categoryId) {
  // Find category name based on ID
  const categoryItem = document.querySelector(`.category-item[data-id="${categoryId}"]`);
  return categoryItem ? categoryItem.querySelector('.category-name').textContent : 'Category';
}

function setupNoteEventListeners() {
  // Delete note buttons
  document.querySelectorAll('.note-delete').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const noteId = button.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this note?')) {
        deleteNote(noteId);
      }
    });
  });
  
  // Play audio buttons
  document.querySelectorAll('.play-button').forEach(button => {
    button.addEventListener('click', () => {
      const audioUrl = button.getAttribute('data-url');
      playAudio(audioUrl, button);
    });
  });
}

function playAudio(url, button) {
  // Create audio element if it doesn't exist
  let audio = document.querySelector(`audio[data-url="${url}"]`);
  
  if (!audio) {
    audio = new Audio(url);
    audio.setAttribute('data-url', url);
    document.body.appendChild(audio);
    
    // Update progress
    audio.addEventListener('timeupdate', () => {
      const progressBar = button.closest('.audio-player').querySelector('.progress-bar');
      if (progressBar) {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progress}%`;
      }
    });
    
    // Reset when finished
    audio.addEventListener('ended', () => {
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
      
      const progressBar = button.closest('.audio-player').querySelector('.progress-bar');
      if (progressBar) {
        progressBar.style.width = '0%';
      }
    });
  }
  
  // Toggle play/pause
  if (audio.paused) {
    // Pause all other audio
    document.querySelectorAll('audio').forEach(a => {
      if (a !== audio) {
        a.pause();
        
        // Reset all other play buttons
        document.querySelectorAll('.play-button').forEach(btn => {
          if (btn !== button) {
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
          }
        });
      }
    });
    
    audio.play();
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
  } else {
    audio.pause();
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
  }
}

function deleteNote(noteId) {
  fetch(`/api/notes/${noteId}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (response.ok) {
      // Remove note from UI
      const noteElement = document.querySelector(`.note-card[data-id="${noteId}"]`);
      if (noteElement) {
        noteElement.remove();
      }
      
      // Check if no notes left
      const notesContainer = document.getElementById('notes-list');
      if (notesContainer.children.length === 0) {
        notesContainer.innerHTML = '<div class="empty-message">No notes found</div>';
      }
    } else {
      throw new Error('Failed to delete note');
    }
  })
  .catch(error => {
    console.error('Error deleting note:', error);
    alert('Error deleting note');
  });
}

function fetchTasks() {
  fetch('/api/tasks')
    .then(response => response.json())
    .then(tasks => {
      renderTasks(tasks);
    })
    .catch(error => {
      console.error('Error fetching tasks:', error);
      document.getElementById('tasks-list').innerHTML = '<div class="empty-message">Error loading tasks</div>';
    });
}

function renderTasks(tasks) {
  const tasksList = document.getElementById('tasks-list');
  if (!tasksList) return;
  
  tasksList.innerHTML = '';
  
  if (tasks.length === 0) {
    tasksList.innerHTML = '<div class="empty-message">No active tasks</div>';
    return;
  }
  
  tasks.forEach(task => {
    renderTask(task, tasksList);
  });
  
  setupTaskEventListeners(tasksList);
}

function renderTask(task, container) {
  const taskElement = document.createElement('div');
  taskElement.className = 'task-item';
  taskElement.innerHTML = `
    <input type="checkbox" class="task-checkbox" ${task.isCompleted ? 'checked' : ''} data-id="${task.id}">
    <div class="task-content">
      <div class="task-text">${task.content}</div>
      <div class="task-meta">
        <div class="task-time">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${formatDate(task.createdAt)}
        </div>
      </div>
    </div>
    <div class="task-actions">
      <button class="task-button delete" data-id="${task.id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  `;
  
  if (task.isCompleted) {
    taskElement.classList.add('completed');
  }
  
  container.appendChild(taskElement);
}

function setupTaskEventListeners(container) {
  // Task checkboxes
  container.querySelectorAll('.task-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const taskId = checkbox.getAttribute('data-id');
      const isCompleted = checkbox.checked;
      
      updateTaskStatus(taskId, isCompleted);
      
      // Update UI immediately
      const taskItem = checkbox.closest('.task-item');
      if (isCompleted) {
        taskItem.classList.add('completed');
      } else {
        taskItem.classList.remove('completed');
      }
    });
  });
  
  // Delete task buttons
  container.querySelectorAll('.task-button.delete').forEach(button => {
    button.addEventListener('click', () => {
      const taskId = button.getAttribute('data-id');
      deleteTask(taskId);
    });
  });
}

function updateTaskStatus(taskId, isCompleted) {
  fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      isCompleted: isCompleted
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Task updated:', data);
    
    // If completed, remove from active tasks list
    if (isCompleted) {
      const taskItem = document.querySelector(`#tasks-list .task-item .task-checkbox[data-id="${taskId}"]`).closest('.task-item');
      if (taskItem) {
        taskItem.remove();
        
        // Check if no active tasks left
        const tasksList = document.getElementById('tasks-list');
        if (tasksList.children.length === 0) {
          tasksList.innerHTML = '<div class="empty-message">No active tasks</div>';
        }
      }
    }
  })
  .catch(error => {
    console.error('Error updating task:', error);
  });
}

function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        // Remove task from UI
        const taskItems = document.querySelectorAll(`.task-checkbox[data-id="${taskId}"]`);
        taskItems.forEach(item => {
          const taskItem = item.closest('.task-item');
          if (taskItem) {
            taskItem.remove();
          }
        });
        
        // Check if no tasks left in active list
        const tasksList = document.getElementById('tasks-list');
        if (tasksList && tasksList.children.length === 0) {
          tasksList.innerHTML = '<div class="empty-message">No active tasks</div>';
        }
        
        // Check if no tasks left in completed list
        const completedList = document.getElementById('completed-tasks-list');
        if (completedList && completedList.children.length === 0) {
          completedList.innerHTML = '<div class="empty-message">No completed tasks</div>';
        }
      } else {
        throw new Error('Failed to delete task');
      }
    })
    .catch(error => {
      console.error('Error deleting task:', error);
      alert('Error deleting task');
    });
  }
}

function fetchReminders() {
  // Fetch today's reminders by default
  fetch('/api/reminders/today')
    .then(response => response.json())
    .then(reminders => {
      renderReminders(reminders, 'today');
    })
    .catch(error => {
      console.error('Error fetching today reminders:', error);
      document.getElementById('today-reminders').querySelector('.reminders-list').innerHTML = '<div class="empty-message">Error loading reminders</div>';
    });
  
  // Fetch upcoming reminders
  fetch('/api/reminders/upcoming')
    .then(response => response.json())
    .then(reminders => {
      renderReminders(reminders, 'upcoming');
    })
    .catch(error => {
      console.error('Error fetching upcoming reminders:', error);
      document.getElementById('upcoming-reminders').querySelector('.reminders-list').innerHTML = '<div class="empty-message">Error loading reminders</div>';
    });
  
  // Fetch past reminders
  fetch('/api/reminders/past')
    .then(response => response.json())
    .then(reminders => {
      renderReminders(reminders, 'past');
    })
    .catch(error => {
      console.error('Error fetching past reminders:', error);
      document.getElementById('past-reminders').querySelector('.reminders-list').innerHTML = '<div class="empty-message">Error loading reminders</div>';
    });
}

function renderReminders(reminders, type) {
  const remindersContainer = document.getElementById(`${type}-reminders`).querySelector('.reminders-list');
  if (!remindersContainer) return;
  
  remindersContainer.innerHTML = '';
  
  if (reminders.length === 0) {
    remindersContainer.innerHTML = `<div class="empty-message">No ${type} reminders</div>`;
    return;
  }
  
  reminders.forEach(reminder => {
    const reminderCard = document.createElement('div');
    reminderCard.className = 'reminder-card';
    reminderCard.innerHTML = `
      <div class="reminder-content">
        <div class="reminder-time">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          ${formatReminderTime(reminder.reminderTime)}
        </div>
        <h3 class="reminder-title">${reminder.title}</h3>
        ${reminder.description ? `<div class="reminder-description">${reminder.description}</div>` : ''}
      </div>
      <div class="reminder-footer">
        <div class="reminder-source">
          ${reminder.noteId ? `<span>From Note</span>` : ''}
          ${reminder.taskId ? `<span>From Task</span>` : ''}
        </div>
        <div class="reminder-actions">
          <button class="reminder-button delete" data-id="${reminder.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;
    
    remindersContainer.appendChild(reminderCard);
    
    // Setup delete button
    reminderCard.querySelector('.reminder-button.delete').addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this reminder?')) {
        fetch(`/api/reminders/${reminder.id}`, {
          method: 'DELETE'
        })
        .then(response => {
          if (response.ok) {
            reminderCard.remove();
            
            // Check if no reminders left
            if (remindersContainer.children.length === 0) {
              remindersContainer.innerHTML = `<div class="empty-message">No ${type} reminders</div>`;
            }
          } else {
            throw new Error('Failed to delete reminder');
          }
        })
        .catch(error => {
          console.error('Error deleting reminder:', error);
          alert('Error deleting reminder');
        });
      }
    });
  });
}

function formatReminderTime(timeString) {
  const date = new Date(timeString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Format time
  const timeFormat = { hour: 'numeric', minute: '2-digit', hour12: true };
  const time = date.toLocaleTimeString(undefined, timeFormat);
  
  // Check if reminder is today
  if (date >= today && date < tomorrow) {
    return `Today at ${time}`;
  }
  
  // Check if reminder is tomorrow
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  if (date >= tomorrow && date < tomorrowEnd) {
    return `Tomorrow at ${time}`;
  }
  
  // Otherwise, return full date
  return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${time}`;
}

function updateActiveNavLink() {
  const currentPath = window.location.pathname;
  console.log("Current path:", currentPath); // Debug
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const linkPath = link.getAttribute('href');
    console.log("Link path:", linkPath); // Debug
    
    // Exact match or handle special cases for root path
    if (linkPath === currentPath || 
        (linkPath === '/' && (currentPath === '' || currentPath === '/index.html')) ||
        (currentPath === '/archived' && linkPath === '/archived')) {
      link.classList.add('active');
    }
  });
}