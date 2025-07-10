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
    const modalLogoutBtn = document.getElementById('modalLogoutBtn');
    const receivedDrinkMsg = document.getElementById('receivedDrinkMsg');
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

    // Track drink sends
    function recordDrinkSend(fromUser, toUser, table) {
        let sends = JSON.parse(localStorage.getItem('drink_sends') || '[]');
        sends.push({ from: fromUser, to: toUser, table });
        localStorage.setItem('drink_sends', JSON.stringify(sends));
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

    function showReceivedDrinkMsg(table) {
        if (receivedDrinkMsg) {
            receivedDrinkMsg.textContent = `You received a drink from table: ${table}`;
            receivedDrinkMsg.style.display = 'block';
        }
        guiContainer.style.display = 'none';
        sendDrinkBtn.style.display = 'none';
        mapModal.style.display = 'none';
        adminPanel.style.display = 'none';
    }

    function attachModalLogoutListener() {
        const modalLogoutBtn = document.getElementById('modalLogoutBtn');
        if (modalLogoutBtn) {
            modalLogoutBtn.onclick = function() {
                localStorage.removeItem('demo_username');
                localStorage.removeItem('demo_password');
                currentUser = null;
                isAdmin = false;
                guiContainer.style.display = 'none';
                adminPanel.style.display = 'none';
                sendDrinkBtn.style.display = 'none';
                logoutBtn.style.display = 'none';
                mapModal.style.display = 'none';
                authChoice.style.display = 'flex';
                authContainer.style.display = 'block';
                registerForm.style.display = 'none';
                loginForm.style.display = 'none';
            };
        }
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
                    // Set sent drink flag for current user
                    if (currentUser) localStorage.setItem('sent_drink_for_' + currentUser, '1');
                    // Record drink send
                    if (currentUser) recordDrinkSend(currentUser, recipient, tableText);
                    alert('Drink sent to ' + recipient + ' at ' + tableText + '!');
                    // showBraveMsg(true); // Removed as per edit hint
                }
                sendDrinkMode = false;
                mapModal.style.display = 'none';
                updateTableButtons();
                attachModalLogoutListener();
                return;
            }
            if (!isAdmin && currentUser) {
                // Save user-table assignment in localStorage
                let assignments = JSON.parse(localStorage.getItem('table_assignments') || '{}');
                assignments[tableText] = currentUser;
                localStorage.setItem('table_assignments', JSON.stringify(assignments));
                lastChosenTable = tableText;
                // Show table choice message instead of alert
                const tableChoiceMsg = document.getElementById('tableChoiceMsg');
                if (tableChoiceMsg) {
                    tableChoiceMsg.textContent = `Nice! Your table is ${tableText}`;
                    tableChoiceMsg.style.display = 'block';
                    setTimeout(() => { tableChoiceMsg.style.display = 'none'; }, 3000);
                }
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
            attachModalLogoutListener();
        });
    }

    function showMapModal() {
        mapModal.style.display = 'flex';
        sendDrinkMode = false;
        updateTableButtons();
        attachModalLogoutListener();
    }

    closeMapModal.addEventListener('click', function() {
        mapModal.style.display = 'none';
        sendDrinkMode = false;
        updateTableButtons();
        attachModalLogoutListener();
    });

    mapModal.addEventListener('click', function(e) {
        if (e.target === mapModal) {
            mapModal.style.display = 'none';
            sendDrinkMode = false;
            updateTableButtons();
            attachModalLogoutListener();
        }
    });

    // Admin panel logic (localStorage only)
    function showAdminPanel() {
        let assignments = JSON.parse(localStorage.getItem('table_assignments') || '{}');
        let users = JSON.parse(localStorage.getItem('demo_users') || '{}');
        let sends = JSON.parse(localStorage.getItem('drink_sends') || '[]');
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
        // Show drink sends
        html += '<h2 style="margin-top:32px;">Drink Sends</h2>';
        html += '<table style="width:100%;border-collapse:collapse;">';
        html += '<tr><th style="text-align:left;padding:8px;border-bottom:1px solid #ccc;">From User</th><th style="text-align:left;padding:8px;border-bottom:1px solid #ccc;">To User</th><th style="text-align:left;padding:8px;border-bottom:1px solid #ccc;">Table</th></tr>';
        if (sends.length === 0) {
            html += '<tr><td colspan="3" style="padding:8px;text-align:center;color:#888;">No drinks have been sent yet.</td></tr>';
        } else {
            sends.forEach(s => {
                html += `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${s.from}</td><td style="padding:8px;border-bottom:1px solid #eee;">${s.to}</td><td style="padding:8px;border-bottom:1px solid #eee;">${s.table}</td></tr>`;
            });
        }
        html += '</table>';
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
                    localStorage.removeItem('drink_sends');
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
        // If user received a drink, show only that message
        if (currentUser && currentUser !== 'admin') {
            const drinks = JSON.parse(localStorage.getItem('drinks_for_' + currentUser) || '[]');
            if (drinks.length > 0) {
                showReceivedDrinkMsg(drinks[drinks.length - 1]);
                localStorage.setItem('drinks_for_' + currentUser, '[]');
                return;
            }
        }
        // Otherwise, show the main GUI and map modal
        guiContainer.style.display = 'flex';
        mapModal.style.display = 'flex';
        if (receivedDrinkMsg) receivedDrinkMsg.style.display = 'none';
    }

    // Camera/photo logic
    const cameraSection = document.getElementById('cameraSection');
    const cameraVideo = document.getElementById('cameraVideo');
    const takePhotoBtn = document.getElementById('takePhotoBtn');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const capturedPhoto = document.getElementById('capturedPhoto');
    const confirmPhotoBtn = document.getElementById('confirmPhotoBtn');
    const retakePhotoBtn = document.getElementById('retakePhotoBtn');
    const userPhotosSection = document.getElementById('userPhotosSection');
    const userPhotosGrid = document.getElementById('userPhotosGrid');
    let cameraStream = null;
    let pendingPhotoDataUrl = null;

    function showCameraSection() {
        cameraSection.style.display = 'flex';
        guiContainer.style.display = 'none';
        mapModal.style.display = 'none';
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    cameraStream = stream;
                    cameraVideo.srcObject = stream;
                    cameraVideo.play();
                })
                .catch(function(err) {
                    alert('Could not access camera: ' + err);
                });
        } else {
            alert('Camera not supported on this device.');
        }
        capturedPhoto.style.display = 'none';
        confirmPhotoBtn.style.display = 'none';
        retakePhotoBtn.style.display = 'none';
        takePhotoBtn.style.display = 'block';
    }

    function hideCameraSection() {
        cameraSection.style.display = 'none';
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
    }

    takePhotoBtn.onclick = function() {
        cameraCanvas.width = cameraVideo.videoWidth;
        cameraCanvas.height = cameraVideo.videoHeight;
        cameraCanvas.getContext('2d').drawImage(cameraVideo, 0, 0);
        pendingPhotoDataUrl = cameraCanvas.toDataURL('image/png');
        capturedPhoto.src = pendingPhotoDataUrl;
        capturedPhoto.style.display = 'block';
        confirmPhotoBtn.style.display = 'block';
        retakePhotoBtn.style.display = 'block';
        takePhotoBtn.style.display = 'none';
    };

    retakePhotoBtn.onclick = function() {
        capturedPhoto.style.display = 'none';
        confirmPhotoBtn.style.display = 'none';
        retakePhotoBtn.style.display = 'none';
        takePhotoBtn.style.display = 'block';
    };

    confirmPhotoBtn.onclick = function() {
        if (pendingPhotoDataUrl && currentUser) {
            let userPhotos = JSON.parse(localStorage.getItem('user_photos') || '{}');
            userPhotos[currentUser] = pendingPhotoDataUrl;
            localStorage.setItem('user_photos', JSON.stringify(userPhotos));
        }
        hideCameraSection();
        showMapModal();
    };

    // Show all user photos
    function showUserPhotosSection() {
        userPhotosSection.style.display = 'flex';
        userPhotosGrid.innerHTML = '';
        let userPhotos = JSON.parse(localStorage.getItem('user_photos') || '{}');
        for (let user in userPhotos) {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.flexDirection = 'column';
            div.style.alignItems = 'center';
            div.innerHTML = `<img src="${userPhotos[user]}" alt="${user}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;background:#23232b;"/><span style="margin-top:8px;color:#f5f5f5;font-size:1rem;">${user}</span>`;
            userPhotosGrid.appendChild(div);
        }
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
                guiContainer.style.display = 'none';
                currentUser = username;
                isAdmin = false;
                showCameraSection();
                showLogoutBtn(true);
            }, 300);
        }
    });

    // Optionally, add a way to show all user photos (e.g., via nav)
    // Example: document.getElementById('navLibrary').onclick = showUserPhotosSection;
    const navLibrary = document.getElementById('navLibrary');
    if (navLibrary) {
        navLibrary.onclick = showUserPhotosSection;
    }

    function logout() {
        localStorage.removeItem('demo_username');
        localStorage.removeItem('demo_password');
        currentUser = null;
        isAdmin = false;
        guiContainer.style.display = 'none';
        adminPanel.style.display = 'none';
        sendDrinkBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
        mapModal.style.display = 'none';
        authChoice.style.display = 'flex';
        authContainer.style.display = 'block';
        registerForm.style.display = 'none';
        loginForm.style.display = 'none';
        cameraSection.style.display = 'none';
        userPhotosSection.style.display = 'none';
    }

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
        logoutBtn.addEventListener('click', logout);
    }
    if (modalLogoutBtn) {
        modalLogoutBtn.addEventListener('click', logout);
    }
    const navCreate = document.getElementById('navCreate');
    if (navCreate) {
        navCreate.onclick = logout;
    }
}); 