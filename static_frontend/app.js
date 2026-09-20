const API_BASE = '/api';

let state = {
    user: null,
    accessToken: null,
    csrfToken: null,
    allMedicines: [],
    compareList: [], // Store full medicine objects for comparison
    compareModalInstance: null
};

// --- Initialization ---
function initTheme() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => console.log("Service Worker Registered"))
            .catch(err => console.log("Service Worker Failed", err));
    }
}

// --- API Helpers ---
async function fetchWithAuth(url, options = {}) {
    if (!options.headers) options.headers = {};
    if (state.accessToken) {
        options.headers['Authorization'] = `Bearer ${state.accessToken}`;
    }
    if (state.csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
        options.headers['X-CSRFToken'] = state.csrfToken;
    }
    if (options.body && !options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
    }
    
    let response = await fetch(API_BASE + url, options);
    return response.json();
}

// --- Navigation & Templates ---
function navigate(viewName) {
    const main = document.getElementById('app-content');
    const template = document.getElementById(`tpl-${viewName}`);
    if (!template) return;
    
    main.innerHTML = '';
    main.appendChild(template.content.cloneNode(true));
    
    updateNav();
    
    if (viewName === 'dashboard') loadDashboard();
    if (viewName === 'search') {
        loadAllMedicines();
        updateCompareBar();
    }
}

function updateNav() {
    const nav = document.getElementById('navLinks');
    const isDark = document.body.classList.contains('dark-mode');
    const themeIcon = isDark ? 'fa-sun' : 'fa-moon';
    
    let html = '';
    if (state.user) {
        html += `
            <li class="nav-item"><a class="nav-link" href="#" onclick="navigate('dashboard')">Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="navigate('search')">Search</a></li>
            <li class="nav-item"><a class="nav-link" href="#" onclick="handleLogout()">Logout (${state.user.username})</a></li>
        `;
    } else {
        html += `
            <li class="nav-item"><a class="nav-link" href="#" onclick="navigate('login')">Login</a></li>
            <li class="nav-item"><a class="nav-link btn btn-primary py-1 px-3 ms-2" href="#" onclick="navigate('register')">Sign Up</a></li>
        `;
    }
    
    html += `
        <li class="nav-item ms-3 border-start border-dark ps-3">
            <button onclick="toggleDarkMode()" class="btn btn-sm btn-outline-dark border-0 p-1 px-2"><i id="darkModeIcon" class="fa-solid ${themeIcon}"></i></button>
        </li>
    `;
    nav.innerHTML = html;
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateNav();
}

// --- Auth Actions ---
async function bootstrapAuth() {
    initTheme();
    registerServiceWorker();
    
    try {
        const csrfRes = await fetch(API_BASE + '/auth/csrf-token');
        const csrfData = await csrfRes.json();
        state.csrfToken = csrfData.data.csrf_token;
        
        const refreshRes = await fetch(API_BASE + '/auth/refresh', { method: 'POST' });
        const refreshData = await refreshRes.json();
        
        if (refreshData.success) {
            state.accessToken = refreshData.data.access_token;
            state.user = refreshData.data.user;
        }
    } catch (e) {
        console.log("Not logged in");
    }
    
    navigate(state.user ? 'dashboard' : 'home');
}

async function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;
    
    const res = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: u, password: p })
    });
    
    if (res.success) {
        state.accessToken = res.data.access_token;
        state.user = res.data.user;
        navigate('dashboard');
    } else {
        document.getElementById('loginError').innerText = res.message;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const u = document.getElementById('regUsername').value;
    const p = document.getElementById('regPassword').value;
    const cp = document.getElementById('regConfirmPassword').value;
    
    const res = await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: u, password: p, confirm_password: cp })
    });
    
    if (res.success) {
        state.accessToken = res.data.access_token;
        state.user = res.data.user;
        navigate('dashboard');
    } else {
        document.getElementById('regError').innerText = res.message;
    }
}

async function handleLogout() {
    await fetchWithAuth('/auth/logout', { method: 'POST' });
    state.user = null;
    state.accessToken = null;
    navigate('home');
}

// --- Autocomplete & Search ---
async function loadAllMedicines() {
    if (state.allMedicines.length > 0) return;
    const res = await fetchWithAuth('/medicines/');
    if (res.success) {
        state.allMedicines = res.data;
    }
}

// Fuzzy Match Helper
function getEditDistance(a, b) {
    if(a.length === 0) return b.length; 
    if(b.length === 0) return a.length; 
    var matrix = [];
    for(var i = 0; i <= b.length; i++) { matrix[i] = [i]; }
    for(var j = 0; j <= a.length; j++) { matrix[0][j] = j; }
    for(var i = 1; i <= b.length; i++) {
        for(var j = 1; j <= a.length; j++) {
            if(b.charAt(i-1) == a.charAt(j-1)) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, Math.min(matrix[i][j-1] + 1, matrix[i-1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

let searchTimeout;
async function handleSearchInput() {
    clearTimeout(searchTimeout);
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    const dd = document.getElementById('autocompleteResults');
    
    if (!q) {
        dd.classList.add('d-none');
        return;
    }

    if (state.allMedicines.length === 0) {
        dd.innerHTML = '<li class="list-group-item text-muted"><i class="fa-solid fa-spinner fa-spin me-2"></i> Loading database...</li>';
        dd.classList.remove('d-none');
        await loadAllMedicines();
    }
    
    searchTimeout = setTimeout(() => {
        // Find exact substring matches first
        let matches = state.allMedicines.filter(m => m.toLowerCase().includes(q));
        
        // If not enough exact matches, do a fuzzy search for typos (e.g. Paracitamol -> Paracetamol)
        if (matches.length < 5 && q.length > 3) {
            let fuzzy = state.allMedicines.map(m => {
                // Check distance against beginning of medicine name to reward prefix matches
                let namePrefix = m.toLowerCase().substring(0, q.length + 1);
                return { name: m, dist: getEditDistance(q, namePrefix) };
            }).filter(obj => obj.dist <= 2).sort((a,b) => a.dist - b.dist).map(obj => obj.name);
            
            // Merge and deduplicate
            matches = [...new Set([...matches, ...fuzzy])];
        }
        
        matches = matches.slice(0, 10);
        
        if (matches.length > 0) {
            dd.innerHTML = matches.map(m => `
                <li class="list-group-item autocomplete-item" onclick="selectSuggestion('${m.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-pills text-muted me-2"></i> ${m}
                </li>
            `).join('');
            dd.classList.remove('d-none');
        } else {
            dd.innerHTML = `<li class="list-group-item text-muted text-uppercase text-center py-3" style="font-family: var(--font-mono); font-size: 0.75rem;">
                No matches found<br>
                <a href="#" onclick="navigate('suggest')" class="text-primary mt-2 d-inline-block text-decoration-none hover-blue">Suggest it here</a>
            </li>`;
            dd.classList.remove('d-none');
        }
    }, 150);
}

window.selectSuggestion = function(name) {
    document.getElementById('searchInput').value = name;
    document.getElementById('autocompleteResults').classList.add('d-none');
    executeSearch();
}

document.addEventListener('click', function(e) {
    const dd = document.getElementById('autocompleteResults');
    if (dd && !e.target.closest('.search-box-wrapper')) {
        dd.classList.add('d-none');
    }
});

function handleSearchKeydown(e) {
    if (e.key === 'Enter') executeSearch();
}

async function executeSearch() {
    const q = document.getElementById('searchInput').value.trim();
    if (!q) return;
    
    document.getElementById('autocompleteResults')?.classList.add('d-none');
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<div class="col-12 text-center text-muted"><i class="fa-solid fa-spinner fa-spin me-2"></i> Finding best matches...</div>';
    
    const res = await fetchWithAuth('/medicines/search', {
        method: 'POST',
        body: JSON.stringify({ medicine_name: q })
    });
    
    if (!res.success) {
        resultsContainer.innerHTML = `<div class="col-12"><div class="alert alert-danger shadow-sm rounded-0"><i class="fa-solid fa-triangle-exclamation me-2"></i>${res.message}</div></div>`;
        return;
    }
    
    // ... Inside executeSearch() ...
    state.lastSearchResults = res.data.results;
    
    let html = `
        <div class="col-12 d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <h4 class="fw-bold mb-0" style="font-family: var(--font-serif)">Top Matches for "${res.data.searched_name}"</h4>
            <button onclick="window.print()" class="btn btn-outline-dark btn-sm rounded-0"><i class="fa-solid fa-print"></i> Print Report</button>
        </div>
    `;
    
    res.data.results.forEach((m, idx) => {
        let badgeColor = m.match_score > 80 ? 'border-success text-success' : (m.match_score > 50 ? 'border-warning text-warning' : 'border-secondary text-secondary');
        
        const isCompared = state.compareList.some(c => c.name === m.name);
        const compareText = isCompared ? 'Remove Compare' : 'Compare';
        const compareIcon = isCompared ? 'fa-minus' : 'fa-plus';
        
        // Escape quotes just for the save bookmark string
        const safeName = m.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        
        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 medicine-card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <a href="https://www.google.com/search?q=${encodeURIComponent(m.name + ' medicine')}" target="_blank" class="text-decoration-none" title="Search Google">
                                <h5 class="fw-bold mb-0 hover-blue text-dark">${m.name} <i class="fa-solid fa-arrow-up-right-from-square text-muted ms-1" style="font-size: 0.7em;"></i></h5>
                            </a>
                            <span class="badge ${badgeColor}">${m.match_score}% Match</span>
                        </div>
                        <p class="mb-2"><span class="badge bg-transparent border-dark text-dark"><i class="fa-solid fa-notes-medical me-1"></i> ${m.reason}</span></p>
                        <p class="small text-muted mb-3 line-clamp-3">${m.description.substring(0, 100)}...</p>
                        <p class="small mb-0"><strong><i class="fa-solid fa-circle-exclamation me-1"></i>Side Effects:</strong> ${m.side_effects.substring(0, 60)}...</p>
                    </div>
                    <div class="card-footer bg-transparent border-0 pt-0 pb-3 d-flex justify-content-between">
                        <button onclick="toggleCompare(this, ${idx})" class="btn btn-sm btn-outline-dark w-50 me-2"><i class="fa-solid ${compareIcon}"></i> ${compareText}</button>
                        <button onclick="saveBookmark('${safeName}')" class="btn btn-sm btn-dark w-50"><i class="fa-regular fa-bookmark"></i> Save</button>
                    </div>
                </div>
            </div>
        `;
    });
    resultsContainer.innerHTML = html;
}

// --- Compare Functionality ---
window.toggleCompare = function(btn, idx) {
    const med = state.lastSearchResults[idx];
    const existsIndex = state.compareList.findIndex(c => c.name === med.name);
    
    if (existsIndex > -1) {
        state.compareList.splice(existsIndex, 1);
        btn.innerHTML = `<i class="fa-solid fa-plus"></i> Compare`;
    } else {
        if (state.compareList.length >= 4) {
            alert("You can compare up to 4 medicines at once.");
            return;
        }
        state.compareList.push(med);
        btn.innerHTML = `<i class="fa-solid fa-minus"></i> Remove Compare`;
    }
    updateCompareBar();
}

function updateCompareBar() {
    const bar = document.getElementById('compareBar');
    if (!bar) return;
    
    if (state.compareList.length > 0) {
        document.getElementById('compareCount').innerText = state.compareList.length;
        bar.classList.remove('d-none');
        bar.classList.add('d-flex');
    } else {
        bar.classList.add('d-none');
        bar.classList.remove('d-flex');
    }
}

window.clearCompare = function() {
    state.compareList = [];
    updateCompareBar();
    executeSearch(); // re-render buttons
}

window.openCompareModal = function() {
    if (state.compareList.length < 2) {
        alert("Please select at least 2 medicines to compare.");
        return;
    }
    
    const thead = document.getElementById('compareTableHead');
    const tbody = document.getElementById('compareTableBody');
    
    thead.innerHTML = '<th style="width: 20%">Feature</th>' + state.compareList.map(m => `<th>${m.name}</th>`).join('');
    
    tbody.innerHTML = `
        <tr>
            <td class="fw-bold">Match Score</td>
            ${state.compareList.map(m => `<td>${m.match_score}%</td>`).join('')}
        </tr>
        <tr>
            <td class="fw-bold">Reason</td>
            ${state.compareList.map(m => `<td>${m.reason}</td>`).join('')}
        </tr>
        <tr>
            <td class="fw-bold">Description</td>
            ${state.compareList.map(m => `<td><small>${m.description}</small></td>`).join('')}
        </tr>
        <tr>
            <td class="fw-bold text-danger">Side Effects</td>
            ${state.compareList.map(m => `<td><small>${m.side_effects}</small></td>`).join('')}
        </tr>
    `;
    
    if (!state.compareModalInstance) {
        state.compareModalInstance = new bootstrap.Modal(document.getElementById('compareModal'));
    }
    state.compareModalInstance.show();
}

// --- Suggest Form ---
async function handleSuggest(e) {
    e.preventDefault();
    if (!state.user) {
        alert("Please login to suggest a medicine.");
        navigate('login');
        return;
    }
    
    const name = document.getElementById('suggestName').value;
    const desc = document.getElementById('suggestDesc').value;
    const msgBox = document.getElementById('suggestMsg');
    
    msgBox.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    msgBox.className = "mb-3 fw-bold small text-primary";
    
    const res = await fetchWithAuth('/requests/', { // Maps to existing endpoint
        method: 'POST',
        body: JSON.stringify({ medicine_name: name, details: desc })
    });
    
    if (res.success) {
        msgBox.className = "mb-3 fw-bold small text-success";
        msgBox.innerHTML = '<i class="fa-solid fa-check"></i> ' + res.message;
        document.getElementById('suggestForm').reset();
    } else {
        msgBox.className = "mb-3 fw-bold small text-danger";
        msgBox.innerHTML = '<i class="fa-solid fa-xmark"></i> ' + res.message;
    }
}

// --- Dashboard ---
async function loadDashboard() {
    if (!state.user) return;
    
    document.getElementById('dashUsername').innerText = state.user.username;
    
    const histRes = await fetchWithAuth('/user/history');
    const histList = document.getElementById('historyList');
    if (histRes.success && histRes.data.length > 0) {
        histList.innerHTML = histRes.data.map(h => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span><i class="fa-solid fa-magnifying-glass me-2"></i>${h.query}</span>
                <span class="badge">${new Date(h.searched_at).toLocaleDateString()}</span>
            </li>
        `).join('');
    } else {
        histList.innerHTML = '<li class="list-group-item text-muted">No search history.</li>';
    }
    
    const bookRes = await fetchWithAuth('/user/bookmarks');
    const bookList = document.getElementById('bookmarksList');
    if (bookRes.success && bookRes.data.length > 0) {
        bookList.innerHTML = bookRes.data.map(b => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span class="fw-bold"><i class="fa-solid fa-pills me-2"></i>${b.medicine_name}</span>
                <button onclick="removeBookmark('${b.medicine_name.replace(/'/g, "\\'")}')" class="btn btn-sm btn-outline-danger border-0"><i class="fa-solid fa-trash"></i></button>
            </li>
        `).join('');
    } else {
        bookList.innerHTML = '<li class="list-group-item text-muted">No saved bookmarks.</li>';
    }
}

async function clearHistory() {
    if(!confirm("Clear all search history?")) return;
    await fetchWithAuth('/user/history', { method: 'DELETE' });
    loadDashboard();
}

async function saveBookmark(name) {
    if(!state.user) {
        alert("Please login to save bookmarks");
        return;
    }
    const res = await fetchWithAuth('/user/bookmarks', { 
        method: 'POST',
        body: JSON.stringify({ medicine_name: name })
    });
    if(res.success) {
        alert('Saved ' + name + ' to bookmarks!');
    } else {
        alert(res.message);
    }
}

window.removeBookmark = async function(name) {
    await fetchWithAuth('/user/bookmarks/' + encodeURIComponent(name), { method: 'DELETE' });
    loadDashboard();
}

// Init
window.onload = bootstrapAuth;
