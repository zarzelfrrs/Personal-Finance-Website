/**
 * FILE: transactions.js
 * DESKRIPSI: Mengelola halaman transaksi
 */

// Variabel global untuk state transaksi
let currentTransactionId = null;
let currentFilters = {
    type: 'all',
    categoryId: 'all',
    walletId: 'all',
    period: 'all'
};

/**
 * Load halaman transaksi
 */
function loadTransactions() {
    console.log('Loading transactions page...');
    try {
        // Isi filter dropdown
        populateFilterDropdowns();
        
        // Tampilkan transaksi
        updateTransactionsTable();
        
        // Inisialisasi event listeners
        initTransactionsEventListeners();
        
        console.log('Transactions page loaded successfully');
    } catch (error) {
        console.error('Error loading transactions page:', error);
        app.showNotification('Error loading transactions page', 'error');
    }
}

/**
 * Isi dropdown filter dengan data
 */
function populateFilterDropdowns() {
    // Isi filter kategori
    const categoryFilter = document.getElementById('filterCategory');
    const categories = app.getData('categories');
    
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }
    
    // Isi filter dompet
    const walletFilter = document.getElementById('filterWallet');
    const wallets = app.getData('wallets');
    
    if (walletFilter) {
        walletFilter.innerHTML = '<option value="all">Semua Dompet</option>';
        
        wallets.forEach(wallet => {
            const option = document.createElement('option');
            option.value = wallet.id;
            option.textContent = wallet.name;
            walletFilter.appendChild(option);
        });
    }
    
    // Isi kategori untuk form transaksi
    const transCategory = document.getElementById('transCategory');
    if (transCategory) {
        transCategory.innerHTML = '';
        
        // Kelompokkan kategori berdasarkan tipe
        const incomeCategories = categories.filter(cat => cat.type === 'income');
        const expenseCategories = categories.filter(cat => cat.type === 'expense');
        
        // Tambahkan opsi pemasukan
        if (incomeCategories.length > 0) {
            const optgroupIncome = document.createElement('optgroup');
            optgroupIncome.label = 'Pemasukan';
            
            incomeCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                optgroupIncome.appendChild(option);
            });
            
            transCategory.appendChild(optgroupIncome);
        }
        
        // Tambahkan opsi pengeluaran
        if (expenseCategories.length > 0) {
            const optgroupExpense = document.createElement('optgroup');
            optgroupExpense.label = 'Pengeluaran';
            
            expenseCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                optgroupExpense.appendChild(option);
            });
            
            transCategory.appendChild(optgroupExpense);
        }
    }
    
    // Isi dompet untuk form transaksi
    const transWallet = document.getElementById('transWallet');
    if (transWallet && wallets.length > 0) {
        transWallet.innerHTML = '';
        
        wallets.forEach(wallet => {
            const option = document.createElement('option');
            option.value = wallet.id;
            option.textContent = wallet.name;
            transWallet.appendChild(option);
        });
    }
}

/**
 * Update tabel transaksi berdasarkan filter
 */
function updateTransactionsTable() {
    const tbody = document.getElementById('transactionsTableBody');
    if (!tbody) return;
    
    // Ambil transaksi dengan filter saat ini
    const transactions = app.getFilteredTransactions(currentFilters);
    
    // Generate HTML untuk tabel
    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="no-data">
                        <i class="fas fa-receipt"></i>
                        <p>Tidak ada transaksi yang ditemukan</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    transactions.forEach((trans, index) => {
        const category = app.getCategoryById(trans.categoryId);
        const wallet = app.getWalletById(trans.walletId);
        const isIncome = trans.type === 'income';
        
        html += `
            <tr class="fade-in-up" style="animation-delay: ${index * 0.02}s">
                <td>${app.formatDate(trans.date)}</td>
                <td>
                    <strong>${trans.description}</strong>
                    ${trans.notes ? `<br><small class="text-muted">${trans.notes}</small>` : ''}
                </td>
                <td>
                    <span class="category-badge" style="background-color: ${category.color}20; color: ${category.color}; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                        ${category.name}
                    </span>
                </td>
                <td>
                    <span class="${isIncome ? 'income-badge' : 'expense-badge'}">
                        ${isIncome ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                </td>
                <td>
                    <div class="d-flex align-center gap-1">
                        <div class="wallet-color" style="background-color: ${wallet.color}; width: 12px; height: 12px; border-radius: 50%;"></div>
                        ${wallet.name}
                    </div>
                </td>
                <td class="${isIncome ? 'text-success' : 'text-danger'}">
                    <strong>${isIncome ? '+' : '-'} ${app.formatCurrency(trans.amount)}</strong>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-edit" onclick="editTransaction(${trans.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteTransaction(${trans.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

/**
 * Edit transaksi
 * @param {number} id - ID transaksi
 */
function editTransaction(id) {
    console.log('Editing transaction:', id);
    
    // Ambil data transaksi
    const transactions = app.getData('transactions');
    const transaction = transactions.find(trans => trans.id === id);
    
    if (!transaction) {
        app.showNotification('Transaksi tidak ditemukan', 'error');
        return;
    }
    
    // Isi dropdown kategori
    const categorySelect = document.getElementById('transCategory');
    const categories = app.getData('categories');
    
    if (categorySelect) {
        categorySelect.innerHTML = '';
        
        // Kelompokkan kategori berdasarkan tipe
        const incomeCategories = categories.filter(cat => cat.type === 'income');
        const expenseCategories = categories.filter(cat => cat.type === 'expense');
        
        // Tambahkan opsi pemasukan
        if (incomeCategories.length > 0) {
            const optgroupIncome = document.createElement('optgroup');
            optgroupIncome.label = 'Pemasukan';
            
            incomeCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                if (category.id === transaction.categoryId) {
                    option.selected = true;
                }
                optgroupIncome.appendChild(option);
            });
            
            categorySelect.appendChild(optgroupIncome);
        }
        
        // Tambahkan opsi pengeluaran
        if (expenseCategories.length > 0) {
            const optgroupExpense = document.createElement('optgroup');
            optgroupExpense.label = 'Pengeluaran';
            
            expenseCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                if (category.id === transaction.categoryId) {
                    option.selected = true;
                }
                optgroupExpense.appendChild(option);
            });
            
            categorySelect.appendChild(optgroupExpense);
        }
    }
    
    // Set nilai form
    document.getElementById('transId').value = transaction.id;
    document.getElementById('transDescription').value = transaction.description;
    document.getElementById('transAmount').value = transaction.amount;
    document.getElementById('transType').value = transaction.type;
    document.getElementById('transWallet').value = transaction.walletId;
    document.getElementById('transDate').value = transaction.date.split('T')[0];
    document.getElementById('transNotes').value = transaction.notes || '';
    
    // Update kategori berdasarkan tipe
    updateCategoryOptions(transaction.type);
    
    // Update judul modal
    document.getElementById('modalTransactionTitle').textContent = 'Edit Transaksi';
    
    // Simpan ID transaksi yang sedang diedit
    currentTransactionId = id;
    
    // Tampilkan modal
    app.showModal('transactionModal');
}

/**
 * Update opsi kategori berdasarkan tipe transaksi
 * @param {string} type - Tipe transaksi (income/expense)
 */
function updateCategoryOptions(type) {
    const categorySelect = document.getElementById('transCategory');
    if (!categorySelect) return;
    
    // Nonaktifkan semua option terlebih dahulu
    Array.from(categorySelect.options).forEach(option => {
        option.disabled = false;
    });
    
    // Nonaktifkan optgroup yang tidak sesuai dengan tipe
    Array.from(categorySelect.children).forEach(child => {
        if (child.tagName === 'OPTGROUP') {
            if (type === 'income' && child.label !== 'Pemasukan') {
                Array.from(child.children).forEach(option => {
                    option.disabled = true;
                });
            } else if (type === 'expense' && child.label !== 'Pengeluaran') {
                Array.from(child.children).forEach(option => {
                    option.disabled = true;
                });
            }
        }
    });
    
    // Reset ke opsi pertama yang tidak disabled jika yang dipilih sekarang disabled
    const selectedOption = categorySelect.options[categorySelect.selectedIndex];
    if (selectedOption.disabled) {
        // Cari opsi pertama yang tidak disabled
        const firstEnabledOption = Array.from(categorySelect.options).find(option => !option.disabled);
        if (firstEnabledOption) {
            categorySelect.value = firstEnabledOption.value;
        }
    }
}

/**
 * Hapus transaksi
 * @param {number} id - ID transaksi
 */
function deleteTransaction(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        return;
    }
    
    // Ambil data transaksi
    let transactions = app.getData('transactions');
    const transactionIndex = transactions.findIndex(trans => trans.id === id);
    
    if (transactionIndex === -1) {
        app.showNotification('Transaksi tidak ditemukan', 'error');
        return;
    }
    
    // Ambil data transaksi untuk memperbarui saldo dompet
    const transaction = transactions[transactionIndex];
    
    // Hapus transaksi dari array
    transactions.splice(transactionIndex, 1);
    
    // Simpan ke localStorage
    app.saveData('transactions', transactions);
    
    // Update saldo dompet (kembalikan saldo)
    let wallets = app.getData('wallets');
    const walletIndex = wallets.findIndex(wallet => wallet.id === transaction.walletId);
    
    if (walletIndex !== -1) {
        if (transaction.type === 'income') {
            // Jika penghapusan transaksi pemasukan, kurangi saldo
            wallets[walletIndex].balance -= transaction.amount;
        } else {
            // Jika penghapusan transaksi pengeluaran, tambahkan saldo
            wallets[walletIndex].balance += transaction.amount;
        }
        
        app.saveData('wallets', wallets);
    }
    
    // Update UI
    updateTransactionsTable();
    
    // Update dashboard jika sedang aktif
    if (document.getElementById('dashboard').classList.contains('active')) {
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        }
    }
    
    // Tampilkan notifikasi
    app.showNotification('Transaksi berhasil dihapus', 'success');
}

/**
 * Tambah transaksi baru
 */
function addNewTransaction() {
    console.log('Adding new transaction');
    
    // Reset form
    const form = document.getElementById('transactionForm');
    if (form) {
        form.reset();
    }
    
    // Set tanggal hari ini
    document.getElementById('transDate').value = new Date().toISOString().split('T')[0];
    
    // Isi dropdown kategori
    const categorySelect = document.getElementById('transCategory');
    const categories = app.getData('categories');
    
    if (categorySelect) {
        categorySelect.innerHTML = '';
        
        // Kelompokkan kategori berdasarkan tipe
        const incomeCategories = categories.filter(cat => cat.type === 'income');
        const expenseCategories = categories.filter(cat => cat.type === 'expense');
        
        // Tambahkan opsi pemasukan
        if (incomeCategories.length > 0) {
            const optgroupIncome = document.createElement('optgroup');
            optgroupIncome.label = 'Pemasukan';
            
            incomeCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                optgroupIncome.appendChild(option);
            });
            
            categorySelect.appendChild(optgroupIncome);
        }
        
        // Tambahkan opsi pengeluaran
        if (expenseCategories.length > 0) {
            const optgroupExpense = document.createElement('optgroup');
            optgroupExpense.label = 'Pengeluaran';
            
            expenseCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                optgroupExpense.appendChild(option);
            });
            
            categorySelect.appendChild(optgroupExpense);
        }
    }
    
    // Update kategori berdasarkan tipe default (expense)
    updateCategoryOptions('expense');
    
    // Update judul modal
    document.getElementById('modalTransactionTitle').textContent = 'Tambah Transaksi Baru';
    
    // Reset ID transaksi
    document.getElementById('transId').value = '';
    currentTransactionId = null;
    
    // Tampilkan modal
    app.showModal('transactionModal');
}

/**
 * Simpan transaksi (tambah atau edit)
 */
function saveTransaction() {
    // Validasi form
    const form = document.getElementById('transactionForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Ambil nilai form
    const id = document.getElementById('transId').value;
    const description = document.getElementById('transDescription').value;
    const amount = parseFloat(document.getElementById('transAmount').value);
    const type = document.getElementById('transType').value;
    const categoryId = parseInt(document.getElementById('transCategory').value);
    const walletId = parseInt(document.getElementById('transWallet').value);
    const date = document.getElementById('transDate').value;
    const notes = document.getElementById('transNotes').value;
    
    // Validasi
    if (amount <= 0) {
        app.showNotification('Jumlah harus lebih dari 0', 'error');
        return;
    }
    
    // Ambil data saat ini
    let transactions = app.getData('transactions');
    let wallets = app.getData('wallets');
    
    if (id) {
        // Edit transaksi yang ada
        const transactionIndex = transactions.findIndex(trans => trans.id === parseInt(id));
        
        if (transactionIndex === -1) {
            app.showNotification('Transaksi tidak ditemukan', 'error');
            return;
        }
        
        // Ambil transaksi lama untuk memperbarui saldo dompet
        const oldTransaction = transactions[transactionIndex];
        
        // Update saldo dompet (kembalikan saldo lama dulu, lalu terapkan yang baru)
        const walletIndex = wallets.findIndex(wallet => wallet.id === oldTransaction.walletId);
        if (walletIndex !== -1) {
            if (oldTransaction.type === 'income') {
                // Kurangi saldo dari transaksi pemasukan lama
                wallets[walletIndex].balance -= oldTransaction.amount;
            } else {
                // Tambahkan saldo dari transaksi pengeluaran lama
                wallets[walletIndex].balance += oldTransaction.amount;
            }
        }
        
        // Update transaksi
        transactions[transactionIndex] = {
            ...oldTransaction,
            description,
            amount,
            type,
            categoryId,
            walletId,
            date: new Date(date).toISOString(),
            notes,
            updatedAt: new Date().toISOString()
        };
    } else {
        // Tambah transaksi baru
        const newId = app.generateId('transaction');
        
        const newTransaction = {
            id: newId,
            description,
            amount,
            type,
            categoryId,
            walletId,
            date: new Date(date).toISOString(),
            notes,
            createdAt: new Date().toISOString()
        };
        
        transactions.push(newTransaction);
    }
    
    // Update saldo dompet dengan transaksi baru
    const walletIndex = wallets.findIndex(wallet => wallet.id === walletId);
    if (walletIndex !== -1) {
        if (type === 'income') {
            wallets[walletIndex].balance += amount;
        } else {
            wallets[walletIndex].balance -= amount;
        }
    }
    
    // Simpan ke localStorage
    app.saveData('transactions', transactions);
    app.saveData('wallets', wallets);
    
    // Tutup modal
    app.closeAllModals();
    
    // Update UI
    updateTransactionsTable();
    
    // Update dashboard jika sedang aktif
    if (document.getElementById('dashboard').classList.contains('active')) {
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        }
    }
    
    // Tampilkan notifikasi
    app.showNotification(
        id ? 'Transaksi berhasil diperbarui' : 'Transaksi berhasil ditambahkan',
        'success'
    );
}

/**
 * Terapkan filter transaksi
 */
function applyFilters() {
    // Ambil nilai filter
    currentFilters = {
        type: document.getElementById('filterType').value,
        categoryId: document.getElementById('filterCategory').value,
        walletId: document.getElementById('filterWallet').value,
        period: document.getElementById('filterPeriod').value
    };
    
    // Update tabel
    updateTransactionsTable();
    
    // Tampilkan notifikasi
    app.showNotification('Filter diterapkan', 'info');
}

/**
 * Reset filter transaksi
 */
function resetFilters() {
    // Reset nilai filter ke default
    document.getElementById('filterType').value = 'all';
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('filterWallet').value = 'all';
    document.getElementById('filterPeriod').value = 'all';
    
    // Reset filter state
    currentFilters = {
        type: 'all',
        categoryId: 'all',
        walletId: 'all',
        period: 'all'
    };
    
    // Update tabel
    updateTransactionsTable();
    
    // Tampilkan notifikasi
    app.showNotification('Filter direset', 'info');
}

/**
 * Inisialisasi event listeners untuk halaman transaksi
 */
function initTransactionsEventListeners() {
    console.log('Initializing transactions event listeners...');
    
    // Tombol tambah transaksi
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', addNewTransaction);
    }
    
    // Tombol terapkan filter
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    // Tombol reset filter
    const resetFiltersBtn = document.getElementById('resetFilters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    // Form transaksi
    const transactionForm = document.getElementById('transactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTransaction();
        });
    }
    
    // Update kategori berdasarkan tipe transaksi
    const transTypeSelect = document.getElementById('transType');
    if (transTypeSelect) {
        transTypeSelect.addEventListener('change', function() {
            const type = this.value;
            updateCategoryOptions(type);
        });
    }
}

// Ekspos fungsi ke global scope untuk event handlers di HTML
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;