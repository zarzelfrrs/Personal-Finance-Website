/**
 * FILE: dashboard.js
 * DESKRIPSI: Mengelola dashboard dan komponennya
 */

// Inisialisasi charts
let cashflowChart = null;
let expenseChart = null;

/**
 * Load dashboard dengan semua komponennya
 */
function loadDashboard() {
    console.log('Loading dashboard...');
    try {
        updateSummaryCards();
        initCharts();
        updateRecentTransactions();
        updateAIInsights();
        
        // Inisialisasi event listeners untuk dashboard
        initDashboardEventListeners();
        
        console.log('Dashboard loaded successfully');
    } catch (error) {
        console.error('Error loading dashboard:', error);
        app.showNotification('Error loading dashboard', 'error');
    }
}

/**
 * Update summary cards di dashboard
 */
function updateSummaryCards() {
    const cardsContainer = document.getElementById('summaryCards');
    if (!cardsContainer) return;
    
    // Hitung data untuk cards
    const totalBalance = app.calculateTotalBalance();
    const monthlyIncome = app.calculateMonthlyIncome();
    const monthlyExpense = app.calculateMonthlyExpense();
    
    // Hitung perubahan dari bulan lalu (sederhana, dalam aplikasi nyata akan lebih kompleks)
    const balanceChange = 2.5; // +2.5%
    const incomeChange = 5.7;  // +5.7%
    const expenseChange = -3.2; // -3.2%
    
    // Hitung sisa budget (total budget - pengeluaran bulan ini)
    const budgets = app.getData('budgets');
    const categories = app.getData('categories');
    
    let totalBudget = 0;
    let totalSpent = 0;
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    budgets.forEach(budget => {
        if (budget.month === currentMonth && budget.year === currentYear) {
            totalBudget += budget.amount;
            
            // Hitung pengeluaran untuk kategori ini bulan ini
            const transactions = app.getData('transactions');
            const categorySpent = transactions
                .filter(trans => 
                    trans.type === 'expense' && 
                    trans.categoryId === budget.categoryId &&
                    new Date(trans.date).getMonth() + 1 === currentMonth &&
                    new Date(trans.date).getFullYear() === currentYear
                )
                .reduce((sum, trans) => sum + trans.amount, 0);
            
            totalSpent += categorySpent;
        }
    });
    
    const budgetRemaining = totalBudget - totalSpent;
    const budgetPercentage = totalBudget > 0 ? (budgetRemaining / totalBudget) * 100 : 100;
    
    // Tentukan status budget
    let budgetStatus = 'Aman';
    let budgetStatusClass = 'status-safe';
    let budgetProgressClass = 'progress-safe';
    
    if (budgetPercentage < 20) {
        budgetStatus = 'Hampir Habis';
        budgetStatusClass = 'status-warning';
        budgetProgressClass = 'progress-warning';
    }
    
    if (budgetRemaining < 0) {
        budgetStatus = 'Melewati Limit';
        budgetStatusClass = 'status-danger';
        budgetProgressClass = 'progress-danger';
    }
    
    // Generate HTML untuk cards
    cardsContainer.innerHTML = `
        <div class="summary-card balance fade-in-up">
            <div class="card-header">
                <div class="card-title">Total Saldo</div>
                <div class="card-icon">
                    <i class="fas fa-wallet"></i>
                </div>
            </div>
            <div class="card-value">${app.formatCurrency(totalBalance)}</div>
            <div class="card-change ${balanceChange >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-${balanceChange >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                ${Math.abs(balanceChange)}% dari bulan lalu
            </div>
        </div>
        
        <div class="summary-card income fade-in-up" style="animation-delay: 0.1s">
            <div class="card-header">
                <div class="card-title">Pemasukan Bulan Ini</div>
                <div class="card-icon">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
            </div>
            <div class="card-value">${app.formatCurrency(monthlyIncome)}</div>
            <div class="card-change ${incomeChange >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-${incomeChange >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                ${Math.abs(incomeChange)}% dari bulan lalu
            </div>
        </div>
        
        <div class="summary-card expense fade-in-up" style="animation-delay: 0.2s">
            <div class="card-header">
                <div class="card-title">Pengeluaran Bulan Ini</div>
                <div class="card-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
            </div>
            <div class="card-value">${app.formatCurrency(monthlyExpense)}</div>
            <div class="card-change ${expenseChange >= 0 ? 'positive' : 'negative'}">
                <i class="fas fa-${expenseChange >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                ${Math.abs(expenseChange)}% dari bulan lalu
            </div>
        </div>
        
        <div class="summary-card budget fade-in-up" style="animation-delay: 0.3s">
            <div class="card-header">
                <div class="card-title">Sisa Budget</div>
                <div class="card-icon">
                    <i class="fas fa-chart-pie"></i>
                </div>
            </div>
            <div class="card-value">${app.formatCurrency(budgetRemaining > 0 ? budgetRemaining : 0)}</div>
            <div class="budget-progress ${budgetProgressClass}">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(budgetPercentage, 100)}%"></div>
                </div>
                <div class="budget-status">
                    <span>${budgetPercentage.toFixed(1)}% tersisa</span>
                    <span class="status-badge ${budgetStatusClass}">${budgetStatus}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Inisialisasi charts
 */
function initCharts() {
    console.log('Initializing charts...');
    
    // Inisialisasi cashflow chart
    initCashflowChart();
    
    // Inisialisasi expense chart
    initExpenseChart();
}

/**
 * Inisialisasi cashflow chart
 */
function initCashflowChart() {
    const ctx = document.getElementById('cashflowChart');
    if (!ctx) return;
    
    // Hancurkan chart sebelumnya jika ada
    if (cashflowChart) {
        cashflowChart.destroy();
    }
    
    // Ambil data untuk 6 bulan terakhir
    const now = new Date();
    const months = [];
    const incomeData = [];
    const expenseData = [];
    const balanceData = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthYear = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        months.push(monthYear);
        
        // Hitung pemasukan dan pengeluaran untuk bulan ini
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const transactions = app.getData('transactions');
        
        const income = transactions
            .filter(trans => {
                const transDate = new Date(trans.date);
                return trans.type === 'income' && 
                       transDate.getMonth() === month && 
                       transDate.getFullYear() === year;
            })
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        const expense = transactions
            .filter(trans => {
                const transDate = new Date(trans.date);
                return trans.type === 'expense' && 
                       transDate.getMonth() === month && 
                       transDate.getFullYear() === year;
            })
            .reduce((sum, trans) => sum + trans.amount, 0);
        
        incomeData.push(income);
        expenseData.push(expense);
        balanceData.push(income - expense);
    }
    
    // Buat chart baru
    cashflowChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Pemasukan',
                    data: incomeData,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Pengeluaran',
                    data: expenseData,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Saldo',
                    data: balanceData,
                    borderColor: '#4a6bff',
                    backgroundColor: 'rgba(74, 107, 255, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${app.formatCurrency(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return 'Rp' + (value / 1000000).toFixed(1) + 'Jt';
                            } else if (value >= 1000) {
                                return 'Rp' + (value / 1000).toFixed(0) + 'Rb';
                            }
                            return 'Rp' + value;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Inisialisasi expense chart
 */
function initExpenseChart() {
    const ctx = document.getElementById('expenseChart');
    if (!ctx) return;
    
    // Hancurkan chart sebelumnya jika ada
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    // Ambil data pengeluaran per kategori bulan ini
    const categoryExpenses = app.calculateCategoryExpenses();
    
    const labels = Object.values(categoryExpenses).map(cat => cat.name);
    const data = Object.values(categoryExpenses).map(cat => cat.total);
    const backgroundColors = Object.values(categoryExpenses).map(cat => cat.color);
    
    // Jika tidak ada data, tampilkan chart kosong
    if (labels.length === 0) {
        expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Tidak ada data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e9ecef'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
        
        // Tambahkan custom plugin untuk teks
        Chart.register({
            id: 'noDataText',
            afterDraw: function(chart) {
                const { ctx, width, height } = chart;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '14px Arial';
                ctx.fillStyle = '#6c757d';
                ctx.fillText('Tidak ada pengeluaran', width / 2, height / 2);
                ctx.restore();
            }
        });
        
        return;
    }
    
    // Buat chart baru
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: ${app.formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

/**
 * Ubah tipe cashflow chart
 * @param {string} chartType - Tipe chart (line/bar)
 */
function changeCashflowChartType(chartType) {
    if (!cashflowChart) return;
    
    cashflowChart.config.type = chartType;
    
    // Update konfigurasi berdasarkan tipe chart
    if (chartType === 'bar') {
        cashflowChart.data.datasets.forEach(dataset => {
            dataset.fill = false;
            dataset.backgroundColor = dataset.backgroundColor.replace('0.1', '0.7');
        });
    } else {
        cashflowChart.data.datasets.forEach(dataset => {
            dataset.fill = true;
            dataset.backgroundColor = dataset.backgroundColor.replace('0.7', '0.1');
        });
    }
    
    cashflowChart.update();
}

/**
 * Ubah tipe expense chart
 * @param {string} chartType - Tipe chart (pie/doughnut/bar)
 */
function changeExpenseChartType(chartType) {
    if (!expenseChart) return;
    
    // Jika tidak ada data, jangan lakukan apa-apa
    const data = expenseChart.data.datasets[0].data;
    if (data.length === 1 && data[0] === 1) {
        return;
    }
    
    expenseChart.config.type = chartType;
    
    // Update konfigurasi berdasarkan tipe chart
    if (chartType === 'bar') {
        expenseChart.options.plugins.legend.position = 'top';
        expenseChart.options.cutout = 0;
        expenseChart.options.scales = {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        if (value >= 1000000) {
                            return 'Rp' + (value / 1000000).toFixed(1) + 'Jt';
                        } else if (value >= 1000) {
                            return 'Rp' + (value / 1000).toFixed(0) + 'Rb';
                        }
                        return 'Rp' + value;
                    }
                }
            }
        };
    } else {
        expenseChart.options.plugins.legend.position = 'right';
        expenseChart.options.cutout = chartType === 'doughnut' ? '60%' : 0;
        delete expenseChart.options.scales;
    }
    
    expenseChart.update();
}

/**
 * Update recent transactions list
 */
function updateRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;
    
    const filterValue = document.getElementById('transactionFilter').value;
    
    // Tentukan filter berdasarkan pilihan
    let filters = {};
    
    switch(filterValue) {
        case '1':
            filters.period = 'today';
            break;
        case '7':
            // Untuk minggu ini, kita atur custom
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filters.startDate = weekAgo.toISOString().split('T')[0];
            filters.endDate = new Date().toISOString().split('T')[0];
            break;
        case '30':
            filters.period = 'month';
            break;
        case '365':
            filters.period = 'year';
            break;
        case 'all':
            // Tidak ada filter
            break;
    }
    
    const transactions = app.getFilteredTransactions(filters);
    const recentTransactions = transactions.slice(0, 5); // Ambil 5 transaksi terbaru
    
    // Generate HTML
    if (recentTransactions.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <i class="fas fa-receipt"></i>
                <p>Tidak ada transaksi</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    recentTransactions.forEach((trans, index) => {
        const category = app.getCategoryById(trans.categoryId);
        const wallet = app.getWalletById(trans.walletId);
        const isIncome = trans.type === 'income';
        
        html += `
            <div class="transaction-item ${isIncome ? 'transaction-income' : 'transaction-expense'} fade-in-up" style="animation-delay: ${index * 0.05}s">
                <div class="transaction-info">
                    <div class="transaction-icon">
                        <i class="fas fa-${isIncome ? 'arrow-down' : 'arrow-up'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${trans.description}</h4>
                        <p>${category.name} • ${wallet.name} • ${app.formatDate(trans.date)}</p>
                    </div>
                </div>
                <div class="transaction-amount">
                    ${isIncome ? '+' : '-'} ${app.formatCurrency(trans.amount)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Update AI insights (dipindahkan ke file terpisah)
 */
function updateAIInsights() {
    // Fungsi ini ada di file ai-insights.js
    console.log('AI Insights should be updated from ai-insights.js');
}

/**
 * Inisialisasi event listeners untuk dashboard
 */
function initDashboardEventListeners() {
    console.log('Initializing dashboard event listeners...');
    
    // Event listeners untuk mengubah tipe cashflow chart
    const cashflowControls = document.querySelector('#cashflowChart')?.closest('.chart-container')?.querySelector('.chart-controls');
    if (cashflowControls) {
        cashflowControls.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-chart-type')) {
                const chartType = e.target.getAttribute('data-chart');
                
                // Update active state
                this.querySelectorAll('.btn-chart-type').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Ubah tipe chart
                changeCashflowChartType(chartType);
            }
        });
    }
    
    // Event listeners untuk mengubah tipe expense chart
    const expenseControls = document.querySelector('#expenseChart')?.closest('.chart-container')?.querySelector('.chart-controls');
    if (expenseControls) {
        expenseControls.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-chart-type')) {
                const chartType = e.target.getAttribute('data-chart');
                
                // Update active state
                this.querySelectorAll('.btn-chart-type').forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Ubah tipe chart
                changeExpenseChartType(chartType);
            }
        });
    }
}