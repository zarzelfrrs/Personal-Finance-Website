/**
 * FILE: app.js
 * DESKRIPSI: File utama aplikasi, mengelola inisialisasi, navigasi, dan fungsi umum
 */

// Data aplikasi (simulasi database di localStorage)
const appData = {
    // Data default jika tidak ada data di localStorage
    defaultWallets: [
        { id: 1, name: "Dompet Utama", type: "cash", balance: 5000000, color: "#4a6bff", createdAt: new Date().toISOString() },
        { id: 2, name: "Rekening BCA", type: "bank", balance: 15000000, color: "#28a745", createdAt: new Date().toISOString() },
        { id: 3, name: "OVO", type: "digital", balance: 2500000, color: "#6f42c1", createdAt: new Date().toISOString() }
    ],
    
    defaultCategories: [
        { id: 1, name: "Gaji", type: "income", color: "#28a745" },
        { id: 2, name: "Investasi", type: "income", color: "#20c997" },
        { id: 3, name: "Hadiah", type: "income", color: "#17a2b8" },
        { id: 4, name: "Makanan & Minuman", type: "expense", color: "#dc3545" },
        { id: 5, name: "Transportasi", type: "expense", color: "#fd7e14" },
        { id: 6, name: "Belanja", type: "expense", color: "#e83e8c" },
        { id: 7, name: "Hiburan", type: "expense", color: "#6f42c1" },
        { id: 8, name: "Kesehatan", type: "expense", color: "#20c997" },
        { id: 9, name: "Pendidikan", type: "expense", color: "#17a2b8" },
        { id: 10, name: "Tagihan", type: "expense", color: "#6c757d" }
    ],
    
    defaultTransactions: [
        { 
            id: 1, 
            description: "Gaji Bulanan", 
            amount: 7500000, 
            type: "income", 
            categoryId: 1, 
            walletId: 2, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(), 
            notes: "Gaji dari perusahaan",
            createdAt: new Date().toISOString()
        },
        { 
            id: 2, 
            description: "Belanja Bulanan", 
            amount: 1200000, 
            type: "expense", 
            categoryId: 4, 
            walletId: 1, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(), 
            notes: "Belanja kebutuhan bulanan",
            createdAt: new Date().toISOString()
        },
        { 
            id: 3, 
            description: "Bensin Motor", 
            amount: 50000, 
            type: "expense", 
            categoryId: 5, 
            walletId: 1, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 12).toISOString(), 
            notes: "",
            createdAt: new Date().toISOString()
        },
        { 
            id: 4, 
            description: "Bayar Listrik", 
            amount: 450000, 
            type: "expense", 
            categoryId: 10, 
            walletId: 2, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString(), 
            notes: "Tagihan bulan April",
            createdAt: new Date().toISOString()
        },
        { 
            id: 5, 
            description: "Nonton Bioskop", 
            amount: 120000, 
            type: "expense", 
            categoryId: 7, 
            walletId: 3, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 18).toISOString(), 
            notes: "Nonton film Avengers",
            createdAt: new Date().toISOString()
        },
        { 
            id: 6, 
            description: "Dividen Saham", 
            amount: 350000, 
            type: "income", 
            categoryId: 2, 
            walletId: 2, 
            date: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString(), 
            notes: "Dividen saham BBCA",
            createdAt: new Date().toISOString()
        }
    ],
    
    defaultBudgets: [
        { id: 1, categoryId: 4, amount: 1500000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), createdAt: new Date().toISOString() },
        { id: 2, categoryId: 5, amount: 500000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), createdAt: new Date().toISOString() },
        { id: 3, categoryId: 7, amount: 300000, month: new Date().getMonth() + 1, year: new Date().getFullYear(), createdAt: new Date().toISOString() }
    ]
};

// Inisialisasi aplikasi
function initApp() {
    console.log('Initializing MoneyMaster App...');
    
    // Inisialisasi data di localStorage jika belum ada
    initLocalStorage();
    
    // Inisialisasi elemen UI
    initUI();
    
    // Inisialisasi event listeners
    initEventListeners();
    
    // Tampilkan halaman dashboard sebagai default
    showPage('dashboard');
    
    // Update tanggal saat ini
    updateCurrentDate();
    
    console.log('MoneyMaster App initialized successfully!');
}

/**
 * Inisialisasi data di localStorage
 */
function initLocalStorage() {
    console.log('Initializing localStorage...');
    
    // Inisialisasi wallets jika belum ada
    if (!localStorage.getItem('wallets')) {
        localStorage.setItem('wallets', JSON.stringify(appData.defaultWallets));
        console.log('Wallets initialized');
    }
    
    // Inisialisasi categories jika belum ada
    if (!localStorage.getItem('categories')) {
        localStorage.setItem('categories', JSON.stringify(appData.defaultCategories));
        console.log('Categories initialized');
    }
    
    // Inisialisasi transactions jika belum ada
    if (!localStorage.getItem('transactions')) {
        localStorage.setItem('transactions', JSON.stringify(appData.defaultTransactions));
        console.log('Transactions initialized');
    }
    
    // Inisialisasi budgets jika belum ada
    if (!localStorage.getItem('budgets')) {
        localStorage.setItem('budgets', JSON.stringify(appData.defaultBudgets));
        console.log('Budgets initialized');
    }
    
    // Inisialisasi tema jika belum ada
    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'light');
        console.log('Theme initialized');
    }
    
    // Inisialisasi id counter jika belum ada
    if (!localStorage.getItem('lastTransactionId')) {
        localStorage.setItem('lastTransactionId', appData.defaultTransactions.length.toString());
    }
    
    if (!localStorage.getItem('lastWalletId')) {
        localStorage.setItem('lastWalletId', appData.defaultWallets.length.toString());
    }
    
    if (!localStorage.getItem('lastBudgetId')) {
        localStorage.setItem('lastBudgetId', appData.defaultBudgets.length.toString());
    }
}

/**
 * Inisialisasi elemen UI
 */
function initUI() {
    console.log('Initializing UI...');
    
    // Terapkan tema yang disimpan
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Set tanggal default untuk input tanggal
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transDate').value = today;
    document.getElementById('transferDate').value = today;
    
    console.log('UI initialized');
}

/**
 * Inisialisasi event listeners
 */
function initEventListeners() {
    console.log('Initializing event listeners...');
    
    // Toggle tema gelap/terang
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Navigasi menu
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            showPage(page);
            
            // Update active state di menu
            document.querySelectorAll('.nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Tombol lihat semua transaksi
    document.getElementById('viewAllTransactions').addEventListener('click', function() {
        showPage('transactions');
        document.querySelectorAll('.nav-item').forEach(navItem => {
            navItem.classList.remove('active');
            if (navItem.getAttribute('data-page') === 'transactions') {
                navItem.classList.add('active');
            }
        });
    });
    
    // Event listeners untuk modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Tutup modal saat klik di luar konten modal
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
    
    // Filter transaksi terbaru
    document.getElementById('transactionFilter').addEventListener('change', function() {
        updateRecentTransactions();
    });
    
    // Refresh AI insights
    document.getElementById('refreshInsights').addEventListener('click', function() {
        if (typeof updateAIInsights === 'function') {
            updateAIInsights();
            // Animasi refresh
            this.classList.add('rotating');
            setTimeout(() => {
                this.classList.remove('rotating');
            }, 500);
        }
    });
    
    // Tambah animasi untuk refresh button
    const style = document.createElement('style');
    style.textContent = `
        .rotating {
            animation: rotate 0.5s linear;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    console.log('Event listeners initialized');
}

/**
 * Toggle tema gelap/terang
 */
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    
    // Toggle kelas tema
    body.classList.toggle('dark-theme');
    
    // Update icon dan simpan preferensi
    if (body.classList.contains('dark-theme')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
    
    // Animasi tombol
    themeToggle.classList.add('rotate');
    setTimeout(() => {
        themeToggle.classList.remove('rotate');
    }, 500);
}

/**
 * Tampilkan halaman tertentu
 * @param {string} pageId - ID halaman yang akan ditampilkan
 */
function showPage(pageId) {
    console.log('Showing page:', pageId);
    
    // Sembunyikan semua halaman
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Tampilkan halaman yang dipilih
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load data untuk halaman tertentu
        switch(pageId) {
            case 'dashboard':
                if (typeof loadDashboard === 'function') {
                    loadDashboard();
                }
                break;
            case 'transactions':
                if (typeof loadTransactions === 'function') {
                    loadTransactions();
                }
                break;
            case 'budgets':
                if (typeof loadBudgets === 'function') {
                    loadBudgets();
                }
                break;
            case 'reports':
                if (typeof loadReports === 'function') {
                    loadReports();
                }
                break;
            case 'wallets':
                if (typeof loadWallets === 'function') {
                    loadWallets();
                }
                break;
        }
    }
}

/**
 * Update tanggal saat ini di header
 */
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('id-ID', options);
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) {
        currentDateEl.textContent = formattedDate;
    }
}

/**
 * Format angka ke Rupiah
 * @param {number} amount - Jumlah uang
 * @returns {string} - String yang diformat sebagai Rupiah
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Format tanggal ke format Indonesia
 * @param {string} dateString - String tanggal
 * @returns {string} - Tanggal yang diformat
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Format tanggal dengan waktu
 * @param {string} dateString - String tanggal
 * @returns {string} - Tanggal dan waktu yang diformat
 */
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Tampilkan modal
 * @param {string} modalId - ID modal yang akan ditampilkan
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Mencegah scroll di background
    }
}

/**
 * Tutup semua modal
 */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto'; // Aktifkan scroll kembali
}

/**
 * Ambil data dari localStorage
 * @param {string} key - Kunci data
 * @returns {Array} - Array data
 */
function getData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting data from localStorage:', error);
        return [];
    }
}

/**
 * Simpan data ke localStorage
 * @param {string} key - Kunci data
 * @param {Array} data - Data yang akan disimpan
 */
function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
    }
}

/**
 * Ambil kategori berdasarkan ID
 * @param {number} id - ID kategori
 * @returns {Object} - Objek kategori
 */
function getCategoryById(id) {
    const categories = getData('categories');
    return categories.find(cat => cat.id === id) || { name: 'Tidak Diketahui', color: '#6c757d', type: 'expense' };
}

/**
 * Ambil dompet berdasarkan ID
 * @param {number} id - ID dompet
 * @returns {Object} - Objek dompet
 */
function getWalletById(id) {
    const wallets = getData('wallets');
    return wallets.find(wallet => wallet.id === id) || { name: 'Tidak Diketahui', color: '#6c757d' };
}

/**
 * Ambil semua transaksi dengan filter
 * @param {Object} filters - Objek filter
 * @returns {Array} - Array transaksi yang difilter
 */
function getFilteredTransactions(filters = {}) {
    let transactions = getData('transactions');
    
    // Filter berdasarkan tipe
    if (filters.type && filters.type !== 'all') {
        transactions = transactions.filter(trans => trans.type === filters.type);
    }
    
    // Filter berdasarkan kategori
    if (filters.categoryId && filters.categoryId !== 'all') {
        const categoryId = parseInt(filters.categoryId);
        transactions = transactions.filter(trans => trans.categoryId === categoryId);
    }
    
    // Filter berdasarkan dompet
    if (filters.walletId && filters.walletId !== 'all') {
        const walletId = parseInt(filters.walletId);
        transactions = transactions.filter(trans => trans.walletId === walletId);
    }
    
    // Filter berdasarkan periode
    if (filters.period && filters.period !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch(filters.period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }
        
        transactions = transactions.filter(trans => {
            const transDate = new Date(trans.date);
            return transDate >= startDate;
        });
    }
    
    // Filter berdasarkan rentang tanggal kustom
    if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999); // Sampai akhir hari
        
        transactions = transactions.filter(trans => {
            const transDate = new Date(trans.date);
            return transDate >= start && transDate <= end;
        });
    }
    
    // Urutkan berdasarkan tanggal (terbaru dulu)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return transactions;
}

/**
 * Hitung total saldo dari semua dompet
 * @returns {number} - Total saldo
 */
function calculateTotalBalance() {
    const wallets = getData('wallets');
    return wallets.reduce((total, wallet) => total + wallet.balance, 0);
}

/**
 * Hitung total pemasukan bulan ini
 * @returns {number} - Total pemasukan bulan ini
 */
function calculateMonthlyIncome() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const transactions = getData('transactions');
    
    return transactions
        .filter(trans => {
            const transDate = new Date(trans.date);
            return trans.type === 'income' && 
                   transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        })
        .reduce((total, trans) => total + trans.amount, 0);
}

/**
 * Hitung total pengeluaran bulan ini
 * @returns {number} - Total pengeluaran bulan ini
 */
function calculateMonthlyExpense() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const transactions = getData('transactions');
    
    return transactions
        .filter(trans => {
            const transDate = new Date(trans.date);
            return trans.type === 'expense' && 
                   transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        })
        .reduce((total, trans) => total + trans.amount, 0);
}

/**
 * Hitung total pengeluaran per kategori bulan ini
 * @returns {Object} - Objek dengan kategori sebagai kunci dan total sebagai nilai
 */
function calculateCategoryExpenses() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const transactions = getData('transactions');
    const categories = getData('categories');
    
    const result = {};
    
    // Inisialisasi semua kategori pengeluaran dengan 0
    categories
        .filter(cat => cat.type === 'expense')
        .forEach(cat => {
            result[cat.id] = {
                name: cat.name,
                color: cat.color,
                total: 0
            };
        });
    
    // Hitung total per kategori
    transactions
        .filter(trans => {
            const transDate = new Date(trans.date);
            return trans.type === 'expense' && 
                   transDate.getMonth() === currentMonth && 
                   transDate.getFullYear() === currentYear;
        })
        .forEach(trans => {
            if (result[trans.categoryId]) {
                result[trans.categoryId].total += trans.amount;
            }
        });
    
    // Filter hanya kategori dengan total > 0
    const filteredResult = {};
    Object.keys(result).forEach(key => {
        if (result[key].total > 0) {
            filteredResult[key] = result[key];
        }
    });
    
    return filteredResult;
}

/**
 * Isi opsi bulan untuk filter
 * @param {string} selectId - ID select element
 * @param {boolean} includeAllOption - Apakah termasuk opsi "Semua Bulan"
 */
function fillMonthOptions(selectId, includeAllOption = false) {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '';
    
    if (includeAllOption) {
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Semua Bulan';
        select.appendChild(allOption);
    }
    
    const currentMonth = new Date().getMonth();
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        if (index === currentMonth) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

/**
 * Isi opsi tahun untuk filter
 * @param {string} selectId - ID select element
 * @param {boolean} includeAllOption - Apakah termasuk opsi "Semua Tahun"
 */
function fillYearOptions(selectId, includeAllOption = false) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '';
    
    if (includeAllOption) {
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Semua Tahun';
        select.appendChild(allOption);
    }
    
    const currentYear = new Date().getFullYear();
    
    // Tampilkan 3 tahun: tahun lalu, tahun ini, tahun depan
    for (let i = -1; i <= 1; i++) {
        const year = currentYear + i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (i === 0) {
            option.selected = true;
        }
        select.appendChild(option);
    }
}

/**
 * Generate ID unik untuk data baru
 * @param {string} type - Jenis data (transaction, wallet, budget)
 * @returns {number} - ID baru
 */
function generateId(type) {
    const key = `last${type.charAt(0).toUpperCase() + type.slice(1)}Id`;
    let lastId = parseInt(localStorage.getItem(key)) || 0;
    lastId++;
    localStorage.setItem(key, lastId.toString());
    return lastId;
}

/**
 * Tampilkan notifikasi
 * @param {string} message - Pesan notifikasi
 * @param {string} type - Tipe notifikasi (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
    // Hapus notifikasi sebelumnya jika ada
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Tambahkan ke body
    document.body.appendChild(notification);
    
    // Tampilkan notifikasi dengan animasi
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Event listener untuk tombol close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-hide setelah 5 detik
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Tambahkan style untuk notifikasi
    if (!document.getElementById('notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: var(--card-bg);
                color: var(--text-color);
                border-radius: 8px;
                box-shadow: var(--shadow-hover);
                padding: 15px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                z-index: 10000;
                transform: translateX(150%);
                transition: transform 0.3s ease;
                border-left: 4px solid;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left-color: var(--success-color);
            }
            
            .notification-error {
                border-left-color: var(--danger-color);
            }
            
            .notification-info {
                border-left-color: var(--info-color);
            }
            
            .notification-warning {
                border-left-color: var(--warning-color);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            
            .notification-content i {
                font-size: 1.2rem;
            }
            
            .notification-success .notification-content i {
                color: var(--success-color);
            }
            
            .notification-error .notification-content i {
                color: var(--danger-color);
            }
            
            .notification-info .notification-content i {
                color: var(--info-color);
            }
            
            .notification-warning .notification-content i {
                color: var(--warning-color);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-light);
                cursor: pointer;
                font-size: 1rem;
                margin-left: 10px;
                transition: color 0.2s;
            }
            
            .notification-close:hover {
                color: var(--text-color);
            }
            
            @media (max-width: 768px) {
                .notification {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                    min-width: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Ekspor fungsi yang diperlukan untuk file JS lainnya
window.app = {
    formatCurrency,
    formatDate,
    formatDateTime,
    getData,
    saveData,
    getCategoryById,
    getWalletById,
    getFilteredTransactions,
    calculateTotalBalance,
    calculateMonthlyIncome,
    calculateMonthlyExpense,
    calculateCategoryExpenses,
    fillMonthOptions,
    fillYearOptions,
    showModal,
    closeAllModals,
    generateId,
    showNotification,
    showPage
};

// Inisialisasi aplikasi
window.initApp = initApp;