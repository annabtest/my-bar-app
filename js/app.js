// Registration and login logic
window.addEventListener('DOMContentLoaded', function() {
    const authChoice = document.getElementById('authChoice');
    const chooseRegister = document.getElementById('chooseRegister');
    const chooseLogin = document.getElementById('chooseLogin');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const authContainer = document.getElementById('authContainer');
    const guiContainer = document.getElementById('guiContainer');
    const adminPanel = document.getElementById('adminPanel');
    const loginError = document.getElementById('loginError');
    const toLogin = document.getElementById('toLogin');
    const toRegister = document.getElementById('toRegister');
    const mapModal = document.getElementById('mapModal');
    const closeMapModal = document.getElementById('closeMapModal');
    const registerError = document.getElementById('registerError');
    const sendDrinkBtn = document.getElementById('sendDrinkBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    let sendDrinkMode = false;
    let lastChosenTable = null;

    let currentUser = null;
    let isAdmin = false;

    // Show choice buttons on load
    authChoice.style.display = 'flex';
    authContainer.style.display = 'block';
    registerForm.style.display = 'none';
    loginForm.style.display = 'none';

    chooseRegister.onclick = function() {
        authChoice.style.display = 'none';
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    };
    chooseLogin.onclick = function() {
        authChoice.style.display = 'none';
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    };
    toLogin.onclick = function(e) {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    };
    toRegister.onclick = function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    };

    // Show notification if user received a drink
    function showDrinkNotification() {
        if (!currentUser || currentUser === 'admin') return;
        const drinks = JSON.parse(localStorage.getItem('drinks_for_' + currentUser) || '[]');
        if (drinks.length > 0) {
            alert('You received a drink from table: ' + drinks[drinks.length - 1]);
            localStorage.setItem('drinks_for_' + currentUser, '[]');
        }
    }

    // Table button logic (localStorage only)
    function updateTableButtons() {
        let assignments = JSON.parse(localStorage.getItem('table_assignments') || '{}');
        document.querySelectorAll('.map-btn').forEach(function(btn) {
            const tableText = btn.textContent.trim();
            if (sendDrinkMode) {
                // In send drink mode, only highlight tables with users (not self)
                if (assignments[tableText] && assignments[tableText] !== currentUser) {
                    btn.classList.remove('map-btn-unavailable');
                    btn.disabled = false;
                } else {
                    btn.classList.add('map-btn-unavailable');
                    btn.disabled = true;
                }
            } else {
                if (assignments[tableText] && assignments[tableText] !== currentUser) {
                    btn.classList.add('map-btn-unavailable');
                    btn.disabled = true;
                } else {
                    btn.classList.remove('map-btn-unavailable');
                    btn.disabled = false;
                }
            }
        });
    }

    document.querySelectorAll('.map-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const tableText = this.textContent.trim();
            if (sendDrinkMode) {
                // Send drink to the user at this table
                let assignments = JSON.parse(localStorage.getItem('table_assignments') || '{}');
                const recipient = assignments[tableText];
                if (recipient) {
                    let drinks = JSON.parse(localStorage.getItem('drinks_for_' + recipient) || '[]');
                    drinks.push(lastChosenTable);
                    localStorage.setItem('drinks_for_' + recipient, JSON.stringify(drinks));
                    alert('Drink sent to ' + recipient + ' at ' + tableText + '!');
                }
                sendDrinkMode = false;
                mapModal.style.display = 'none';
                updateTableButtons();
                return;
            }
            if (!isAdmin && currentUser) {
                // Save user-table assignment in localStorage
                let assignments = JSON.parse(localStorage.getItem('table_assignments') || '{}');
                assignments[tableText] = currentUser;
                localStorage.setItem('table_assignments', JSON.stringify(assignments));
                lastChosenTable = tableText;
                alert(`nice! your table is ${tableText}`);
                mapModal.style.display = 'none';
                // Show send drink button
                if (sendDrinkBtn && currentUser !== 'admin') {
                    sendDrinkBtn.style.display = 'block';
                }
            }
        });
    });

    if (sendDrinkBtn) {
        sendDrinkBtn.addEventListener('click', function() {
            sendDrinkMode = true;
            mapModal.style.display = 'flex';
            updateTableButtons();
        });
    }

    function showMapModal() {
        mapModal.style.display = 'flex';
        sendDrinkMode = false;
        updateTableButtons();
    }

    closeMapModal.addEventListener('click', function() {
        mapModal.style.display = 'none';
        sendDrinkMode = false;
        updateTableButtons();
    });

    mapModal.addEventListener('click', function(e) {
        if (e.target === mapModal) {
            mapModal.style.display = 'none';
            sendDrinkMode = false;
            updateTableButtons();
        }
    });

    // Admin panel logic (localStorage only)
    function showAdminPanel() {
        let assignments = JSON.parse(localStorage.getItem('table_assignments') || '{}');
        let users = JSON.parse(localStorage.getItem('demo_users') || '{}');
        let html = '<button id="deleteAllBtn" style="background:#d84315;color:#fff;padding:10px 24px;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;margin-bottom:24px;">Delete All Users and Choices</button>';
        html += '<h2>User Table Assignments</h2>';
        if (Object.keys(assignments).length === 0) {
            html += '<p>No users have chosen tables yet.</p>';
        } else {
            html += '<table style="width:100%;border-collapse:collapse;">';
            html += '<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #ccc;">Table</th><th style="text-align:left;padding:8px;border-bottom:1px solid #ccc;">User</th></tr>';
            for (let table in assignments) {
                html += `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${table}</td><td style="padding:8px;border-bottom:1px solid #eee;">${assignments[table]}</td></tr>`;
            }
            html += '</table>';
        }
        html += '<h2 style="margin-top:32px;">All Registered Users</h2>';
        if (Object.keys(users).length === 0) {
            html += '<p>No users registered yet.</p>';
        } else {
            html += '<table style="width:100%;border-collapse:collapse;">';
            html += '<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #ccc;">User</th><th style="text-align:left;padding:8px;border-bottom:1px solid #ccc;">Password</th></tr>';
            for (let user in users) {
                html += `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${user}</td><td style="padding:8px;border-bottom:1px solid #eee;">${users[user]}</td></tr>`;
            }
            html += '</table>';
        }
        adminPanel.innerHTML = html;
        // Re-attach deleteAllBtn event listener
        const deleteAllBtn = document.getElementById('deleteAllBtn');
        if (deleteAllBtn) {
            deleteAllBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete ALL users and table choices? This cannot be undone.')) {
                    localStorage.removeItem('demo_users');
                    localStorage.removeItem('table_assignments');
                    localStorage.removeItem('demo_username');
                    localStorage.removeItem('demo_password');
                    showAdminPanel();
                }
            });
        }
    }

    // Admin delete all logic
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete ALL users and table choices? This cannot be undone.')) {
                localStorage.removeItem('demo_users');
                localStorage.removeItem('table_assignments');
                localStorage.removeItem('demo_username');
                localStorage.removeItem('demo_password');
                showAdminPanel();
            }
        });
    }

    // Show drink notification on login
    function afterLogin() {
        showDrinkNotification();
    }

    // Registration and login logic using localStorage only
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        registerError.style.display = 'none';
        registerError.textContent = '';
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        if (username && password) {
            let users = JSON.parse(localStorage.getItem('demo_users') || '{}');
            if (users[username]) {
                registerError.textContent = 'Username already exists.';
                registerError.style.display = 'block';
                return;
            }
            users[username] = password;
            localStorage.setItem('demo_users', JSON.stringify(users));
            localStorage.setItem('demo_username', username);
            localStorage.setItem('demo_password', password);
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            setTimeout(() => {
                document.getElementById('authContainer').style.display = 'none';
                guiContainer.style.display = 'flex';
                currentUser = username;
                isAdmin = false;
                showMapModal();
                afterLogin();
                showLogoutBtn(true);
            }, 300);
        }
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        // Admin login
        if (username === 'admin' && password === 'admin') {
            document.getElementById('authContainer').style.display = 'none';
            guiContainer.style.display = 'none';
            adminPanel.style.display = 'block';
            mapModal.style.display = 'none';
            showAdminPanel();
            currentUser = 'admin';
            isAdmin = true;
            showLogoutBtn(false);
            return;
        }
        // Regular user login
        let users = JSON.parse(localStorage.getItem('demo_users') || '{}');
        if (users[username] && users[username] === password) {
            localStorage.setItem('demo_username', username);
            localStorage.setItem('demo_password', password);
            document.getElementById('authContainer').style.display = 'none';
            guiContainer.style.display = 'flex';
            setTimeout(() => {
                currentUser = username;
                isAdmin = false;
                showMapModal();
                afterLogin();
                showLogoutBtn(true);
            }, 300);
        } else {
            loginError.style.display = 'block';
        }
    });

    function showLogoutBtn(show) {
        if (logoutBtn) logoutBtn.style.display = show ? 'block' : 'none';
    }

    // Logout logic
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('demo_username');
            localStorage.removeItem('demo_password');
            currentUser = null;
            isAdmin = false;
            guiContainer.style.display = 'none';
            adminPanel.style.display = 'none';
            sendDrinkBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
            authChoice.style.display = 'flex';
            authContainer.style.display = 'block';
            registerForm.style.display = 'none';
            loginForm.style.display = 'none';
        });
    }
}); 