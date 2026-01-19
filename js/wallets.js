/**
 * FILE: wallets.js
 * DESKRIPSI: Mengelola halaman dompet
 */

/**
 * Load halaman dompet
 */
function loadWallets() {
    console.log('Loading wallets page...');
    try {
        // Tampilkan dompet
        updateWalletsDisplay();
        
        // Inisialisasi event listeners
        initWalletsEventListeners();
        
        console.log('Wallets page loaded successfully');
    } catch (error) {
        console.error('Error loading wallets page:', error);
        app.showNotification('Error loading wallets page', 'error');
    }
}

/**
 * Update tampilan dompet
 */
function updateWalletsDisplay() {
    const container = document.getElementById('walletsContainer');
    if (!container) return;
    
    // Ambil data dompet
    const wallets = app.getData('wallets');
    
    // Hitung total saldo
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);
    
    // Generate HTML untuk dompet cards
    let html = '';
    
    wallets.forEach((wallet, index) => {
        // Hitung persentase dari total saldo
        const percentage = totalBalance > 0 ? (wallet.balance / totalBalance) * 100 : 0;
        
        // Tentukan icon berdasarkan tipe dompet
        let walletIcon = 'fa-wallet';
        switch(wallet.type) {
            case 'bank':
                walletIcon = 'fa-university';
                break;
            case 'digital':
                walletIcon = 'fa-mobile-alt';
                break;
            case 'savings':
                walletIcon = 'fa-piggy-bank';
                break;
            case 'cash':
                walletIcon = 'fa-money-bill-wave';
                break;
        }
        
        html += `
            <div class="wallet-card fade-in-up" style="animation-delay: ${index * 0.1}s; border-left: 4px solid ${wallet.color}">
                <div class="wallet-header">
                    <div class="wallet-title">${wallet.name}</div>
                    <div class="wallet-actions">
                        <button class="btn-edit" onclick="editWallet(${wallet.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteWallet(${wallet.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="wallet-type">
                    <i class="fas ${walletIcon}"></i> ${getWalletTypeName(wallet.type)}
                </div>
                
                <div class="wallet-balance">${app.formatCurrency(wallet.balance)}</div>
                
                <div class="wallet-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%; background-color: ${wallet.color};"></div>
                    </div>
                    <div class="wallet-percentage">${percentage.toFixed(1)}% dari total saldo</div>
                </div>
                
                <div class="wallet-details">
                    <div class="detail-row">
                        <span>Warna:</span>
                        <div class="color-preview" style="background-color: ${wallet.color}; width: 20px; height: 20px; border-radius: 4px;"></div>
                    </div>
                    <div class="detail-row">
                        <span>Dibuat:</span>
                        <span>${app.formatDate(wallet.createdAt)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    // Tambahkan card untuk total saldo
    html += `
        <div class="wallet-card total-balance fade-in-up" style="animation-delay: ${wallets.length * 0.1}s">
            <div class="wallet-header">
                <div class="wallet-title">Total Saldo</div>
                <div class="wallet-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
            </div>
            
            <div class="wallet-type">
                <i class="fas fa-layer-group"></i> Semua Dompet
            </div>
            
            <div class="wallet-balance">${app.formatCurrency(totalBalance)}</div>
            
            <div class="wallet-stats">
                <div class="stat-item">
                    <span class="stat-label">Jumlah Dompet</span>
                    <span class="stat-value">${wallets.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Rata-rata Saldo</span>
                    <span class="stat-value">${app.formatCurrency(wallets.length > 0 ? totalBalance / wallets.length : 0)}</span>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Dapatkan nama tipe dompet
 * @param {string} type - Tipe dompet
 * @returns {string} - Nama tipe dompet
 */
function getWalletTypeName(type) {
    const typeNames = {
        'cash': 'Tunai',
        'bank': 'Rekening Bank',
        'digital': 'Dompet Digital',
        'savings': 'Tabungan',
        'other': 'Lainnya'
    };
    
    return typeNames[type] || 'Tidak Diketahui';
}

/**
 * Tambah dompet baru
 */
function addNewWallet() {
    console.log('Adding new wallet');
    
    // Reset form
    const form = document.getElementById('walletForm');
    if (form) {
        form.reset();
    }
    
    // Set warna default
    document.getElementById('walletColor').value = '#4a6bff';
    
    // Update judul modal
    document.getElementById('modalWalletTitle').textContent = 'Tambah Dompet Baru';
    
    // Reset ID dompet
    document.getElementById('walletId').value = '';
    
    // Tampilkan modal
    app.showModal('walletModal');
}

/**
 * Edit dompet
 * @param {number} id - ID dompet
 */
function editWallet(id) {
    console.log('Editing wallet:', id);
    
    // Ambil data dompet
    const wallets = app.getData('wallets');
    const wallet = wallets.find(w => w.id === id);
    
    if (!wallet) {
        app.showNotification('Dompet tidak ditemukan', 'error');
        return;
    }
    
    // Set nilai form
    document.getElementById('walletId').value = wallet.id;
    document.getElementById('walletName').value = wallet.name;
    document.getElementById('walletType').value = wallet.type;
    document.getElementById('walletBalance').value = wallet.balance;
    document.getElementById('walletColor').value = wallet.color;
    
    // Update judul modal
    document.getElementById('modalWalletTitle').textContent = 'Edit Dompet';
    
    // Tampilkan modal
    app.showModal('walletModal');
}

/**
 * Hapus dompet
 * @param {number} id - ID dompet
 */
function deleteWallet(id) {
    // Cek apakah dompet memiliki transaksi
    const transactions = app.getData('transactions');
    const walletTransactions = transactions.filter(trans => trans.walletId === id);
    
    if (walletTransactions.length > 0) {
        if (!confirm(`Dompet ini memiliki ${walletTransactions.length} transaksi. Menghapus dompet akan menghapus semua transaksi terkait. Apakah Anda yakin?`)) {
            return;
        }
        
        // Hapus transaksi terkait
        const updatedTransactions = transactions.filter(trans => trans.walletId !== id);
        app.saveData('transactions', updatedTransactions);
    }
    
    // Hapus dompet
    let wallets = app.getData('wallets');
    const walletIndex = wallets.findIndex(w => w.id === id);
    
    if (walletIndex === -1) {
        app.showNotification('Dompet tidak ditemukan', 'error');
        return;
    }
    
    wallets.splice(walletIndex, 1);
    app.saveData('wallets', wallets);
    
    // Update tampilan
    updateWalletsDisplay();
    
    // Update dashboard jika sedang aktif
    if (document.getElementById('dashboard').classList.contains('active')) {
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        }
    }
    
    // Tampilkan notifikasi
    app.showNotification('Dompet berhasil dihapus', 'success');
}

/**
 * Transfer dana antar dompet
 */
function transferFunds() {
    console.log('Transferring funds');
    
    // Reset form
    const form = document.getElementById('transferForm');
    if (form) {
        form.reset();
    }
    
    // Isi dropdown dompet
    const fromWalletSelect = document.getElementById('fromWallet');
    const toWalletSelect = document.getElementById('toWallet');
    const wallets = app.getData('wallets');
    
    if (fromWalletSelect && toWalletSelect) {
        fromWalletSelect.innerHTML = '';
        toWalletSelect.innerHTML = '';
        
        wallets.forEach(wallet => {
            const option1 = document.createElement('option');
            option1.value = wallet.id;
            option1.textContent = `${wallet.name} (${app.formatCurrency(wallet.balance)})`;
            
            const option2 = document.createElement('option');
            option2.value = wallet.id;
            option2.textContent = `${wallet.name} (${app.formatCurrency(wallet.balance)})`;
            
            fromWalletSelect.appendChild(option1.cloneNode(true));
            toWalletSelect.appendChild(option2.cloneNode(true));
        });
    }
    
    // Set tanggal hari ini
    document.getElementById('transferDate').value = new Date().toISOString().split('T')[0];
    
    // Event listener untuk update saldo saat dompet berubah
    if (fromWalletSelect) {
        fromWalletSelect.addEventListener('change', updateWalletBalances);
    }
    
    if (toWalletSelect) {
        toWalletSelect.addEventListener('change', updateWalletBalances);
    }
    
    // Inisialisasi saldo
    updateWalletBalances();
    
    // Tampilkan modal
    app.showModal('transferModal');
}

/**
 * Update tampilan saldo dompet di form transfer
 */
function updateWalletBalances() {
    const fromWalletId = parseInt(document.getElementById('fromWallet').value);
    const toWalletId = parseInt(document.getElementById('toWallet').value);
    
    const wallets = app.getData('wallets');
    
    const fromWallet = wallets.find(w => w.id === fromWalletId);
    const toWallet = wallets.find(w => w.id === toWalletId);
    
    const fromWalletBalanceEl = document.getElementById('fromWalletBalance');
    const toWalletBalanceEl = document.getElementById('toWalletBalance');
    
    if (fromWallet && fromWalletBalanceEl) {
        fromWalletBalanceEl.textContent = `Saldo: ${app.formatCurrency(fromWallet.balance)}`;
    }
    
    if (toWallet && toWalletBalanceEl) {
        toWalletBalanceEl.textContent = `Saldo: ${app.formatCurrency(toWallet.balance)}`;
    }
}

/**
 * Simpan transfer dana
 */
function saveTransfer() {
    // Validasi form
    const form = document.getElementById('transferForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Ambil nilai form
    const fromWalletId = parseInt(document.getElementById('fromWallet').value);
    const toWalletId = parseInt(document.getElementById('toWallet').value);
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const date = document.getElementById('transferDate').value;
    const notes = document.getElementById('transferNotes').value;
    
    // Validasi
    if (fromWalletId === toWalletId) {
        app.showNotification('Dompet sumber dan tujuan tidak boleh sama', 'error');
        return;
    }
    
    if (amount <= 0) {
        app.showNotification('Jumlah transfer harus lebih dari 0', 'error');
        return;
    }
    
    // Ambil data dompet
    let wallets = app.getData('wallets');
    const fromWalletIndex = wallets.findIndex(w => w.id === fromWalletId);
    const toWalletIndex = wallets.findIndex(w => w.id === toWalletId);
    
    if (fromWalletIndex === -1 || toWalletIndex === -1) {
        app.showNotification('Dompet tidak ditemukan', 'error');
        return;
    }
    
    // Cek saldo dompet sumber
    if (wallets[fromWalletIndex].balance < amount) {
        app.showNotification('Saldo dompet sumber tidak mencukupi', 'error');
        return;
    }
    
    // Update saldo dompet
    wallets[fromWalletIndex].balance -= amount;
    wallets[toWalletIndex].balance += amount;
    
    // Simpan perubahan saldo
    app.saveData('wallets', wallets);
    
    // Buat transaksi transfer
    let transactions = app.getData('transactions');
    
    // Transaksi pengeluaran dari dompet sumber
    const expenseId = app.generateId('transaction');
    const expenseTransaction = {
        id: expenseId,
        description: notes || `Transfer ke ${wallets[toWalletIndex].name}`,
        amount: amount,
        type: 'expense',
        categoryId: 10, // Kategori tagihan
        walletId: fromWalletId,
        date: new Date(date).toISOString(),
        notes: `Transfer ke ${wallets[toWalletIndex].name}`,
        createdAt: new Date().toISOString()
    };
    
    // Transaksi pemasukan ke dompet tujuan
    const incomeId = expenseId + 1;
    const incomeTransaction = {
        id: incomeId,
        description: notes || `Transfer dari ${wallets[fromWalletIndex].name}`,
        amount: amount,
        type: 'income',
        categoryId: 10, // Kategori tagihan
        walletId: toWalletId,
        date: new Date(date).toISOString(),
        notes: `Transfer dari ${wallets[fromWalletIndex].name}`,
        createdAt: new Date().toISOString()
    };
    
    transactions.push(expenseTransaction, incomeTransaction);
    app.saveData('transactions', transactions);
    
    // Update ID counter untuk transaksi (karena kita tambah 2 transaksi)
    const lastId = parseInt(localStorage.getItem('lastTransactionId')) || 0;
    localStorage.setItem('lastTransactionId', (lastId + 2).toString());
    
    // Tutup modal
    app.closeAllModals();
    
    // Update tampilan
    updateWalletsDisplay();
    
    // Update dashboard jika sedang aktif
    if (document.getElementById('dashboard').classList.contains('active')) {
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        }
    }
    
    // Update halaman transaksi jika sedang aktif
    if (document.getElementById('transactions').classList.contains('active')) {
        if (typeof loadTransactions === 'function') {
            loadTransactions();
        }
    }
    
    // Tampilkan notifikasi
    app.showNotification(`Transfer ${app.formatCurrency(amount)} berhasil`, 'success');
}

/**
 * Simpan dompet (tambah atau edit)
 */
function saveWallet() {
    // Validasi form
    const form = document.getElementById('walletForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Ambil nilai form
    const id = document.getElementById('walletId').value;
    const name = document.getElementById('walletName').value;
    const type = document.getElementById('walletType').value;
    const balance = parseFloat(document.getElementById('walletBalance').value) || 0;
    const color = document.getElementById('walletColor').value;
    
    // Validasi
    if (balance < 0) {
        app.showNotification('Saldo tidak boleh negatif', 'error');
        return;
    }
    
    // Ambil data dompet
    let wallets = app.getData('wallets');
    
    if (id) {
        // Edit dompet yang ada
        const walletIndex = wallets.findIndex(w => w.id === parseInt(id));
        
        if (walletIndex === -1) {
            app.showNotification('Dompet tidak ditemukan', 'error');
            return;
        }
        
        // Update dompet
        wallets[walletIndex] = {
            ...wallets[walletIndex],
            name,
            type,
            balance,
            color,
            updatedAt: new Date().toISOString()
        };
    } else {
        // Tambah dompet baru
        const newId = app.generateId('wallet');
        
        const newWallet = {
            id: newId,
            name,
            type,
            balance,
            color,
            createdAt: new Date().toISOString()
        };
        
        wallets.push(newWallet);
    }
    
    // Simpan ke localStorage
    app.saveData('wallets', wallets);
    
    // Tutup modal
    app.closeAllModals();
    
    // Update tampilan
    updateWalletsDisplay();
    
    // Update dashboard jika sedang aktif
    if (document.getElementById('dashboard').classList.contains('active')) {
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        }
    }
    
    // Tampilkan notifikasi
    app.showNotification(
        id ? 'Dompet berhasil diperbarui' : 'Dompet berhasil ditambahkan',
        'success'
    );
}

/**
 * Inisialisasi event listeners untuk halaman dompet
 */
function initWalletsEventListeners() {
    console.log('Initializing wallets event listeners...');
    
    // Tombol tambah dompet
    const addWalletBtn = document.getElementById('addWalletBtn');
    if (addWalletBtn) {
        addWalletBtn.addEventListener('click', addNewWallet);
    }
    
    // Tombol transfer dana
    const transferFundsBtn = document.getElementById('transferFundsBtn');
    if (transferFundsBtn) {
        transferFundsBtn.addEventListener('click', transferFunds);
    }
    
    // Form dompet
    const walletForm = document.getElementById('walletForm');
    if (walletForm) {
        walletForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveWallet();
        });
    }
    
    // Form transfer
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTransfer();
        });
    }
}

// Ekspos fungsi ke global scope untuk event handlers di HTML
window.editWallet = editWallet;
window.deleteWallet = deleteWallet;