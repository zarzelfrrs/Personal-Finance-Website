/**
 * FILE: reports.js
 * DESKRIPSI: Mengelola halaman laporan
 */

/**
 * Load halaman laporan
 */
function loadReports() {
    console.log('Loading reports page...');
    try {
        // Isi dropdown filter
        populateReportFilters();
        
        // Inisialisasi event listeners
        initReportsEventListeners();
        
        // Generate laporan default (minggu ini)
        generateReport();
        
        console.log('Reports page loaded successfully');
    } catch (error) {
        console.error('Error loading reports page:', error);
        app.showNotification('Error loading reports page', 'error');
    }
}

/**
 * Isi dropdown filter laporan
 */
function populateReportFilters() {
    // Isi dropdown bulan untuk laporan
    app.fillMonthOptions('reportMonth', true);
    
    // Isi dropdown kategori laporan
    const categorySelect = document.getElementById('reportCategory');
    const categories = app.getData('categories');
    
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="all">Semua Kategori</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
    
    // Event listener untuk periode custom
    const reportPeriodSelect = document.getElementById('reportPeriod');
    if (reportPeriodSelect) {
        reportPeriodSelect.addEventListener('change', function() {
            const customRange = document.getElementById('customDateRange');
            if (this.value === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
            }
        });
    }
    
    // Set tanggal default untuk custom range
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) {
        startDateInput.value = firstDayOfMonth.toISOString().split('T')[0];
    }
    
    if (endDateInput) {
        endDateInput.value = today.toISOString().split('T')[0];
    }
}

/**
 * Generate laporan berdasarkan filter
 */
function generateReport() {
    const container = document.getElementById('reportContent');
    if (!container) return;
    
    // Tampilkan loading
    container.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Membuat laporan...</p>
        </div>
    `;
    
    // Ambil parameter filter
    const period = document.getElementById('reportPeriod').value;
    const month = document.getElementById('reportMonth').value;
    const categoryId = document.getElementById('reportCategory').value;
    
    // Tentukan rentang tanggal berdasarkan filter
    let startDate, endDate;
    const today = new Date();
    
    switch(period) {
        case 'daily':
            startDate = new Date(today);
            endDate = new Date(today);
            break;
        case 'weekly':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = new Date(today);
            break;
        case 'monthly':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
        case 'custom':
            startDate = new Date(document.getElementById('startDate').value);
            endDate = new Date(document.getElementById('endDate').value);
            break;
        default:
            // Jika bulan tertentu dipilih
            if (month !== 'all') {
                const year = today.getFullYear();
                startDate = new Date(year, parseInt(month) - 1, 1);
                endDate = new Date(year, parseInt(month), 0);
            } else {
                // Semua waktu
                startDate = new Date(0); // Tanggal awal
                endDate = new Date(); // Hari ini
            }
    }
    
    // Atur waktu untuk startDate dan endDate
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    // Ambil transaksi dengan filter
    const filters = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    };
    
    if (categoryId !== 'all') {
        filters.categoryId = categoryId;
    }
    
    const transactions = app.getFilteredTransactions(filters);
    
    // Hitung statistik
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const netBalance = totalIncome - totalExpense;
    
    // Hitung pengeluaran per kategori
    const categoryExpenses = {};
    const categories = app.getData('categories');
    
    transactions
        .filter(t => t.type === 'expense')
        .forEach(trans => {
            const category = categories.find(c => c.id === trans.categoryId);
            if (category) {
                if (!categoryExpenses[category.id]) {
                    categoryExpenses[category.id] = {
                        name: category.name,
                        color: category.color,
                        total: 0
                    };
                }
                categoryExpenses[category.id].total += trans.amount;
            }
        });
    
    // Urutkan kategori berdasarkan pengeluaran tertinggi
    const sortedCategories = Object.values(categoryExpenses)
        .sort((a, b) => b.total - a.total);
    
    // Update judul laporan
    let reportTitle = 'Laporan Keuangan';
    
    if (period === 'daily') {
        reportTitle = `Laporan Harian - ${app.formatDate(today.toISOString())}`;
    } else if (period === 'weekly') {
        reportTitle = `Laporan Mingguan (${app.formatDate(startDate.toISOString())} - ${app.formatDate(endDate.toISOString())})`;
    } else if (period === 'monthly') {
        reportTitle = `Laporan Bulanan ${today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
    } else if (month !== 'all') {
        const monthName = new Date(today.getFullYear(), parseInt(month) - 1, 1)
            .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        reportTitle = `Laporan Bulanan ${monthName}`;
    } else if (period === 'custom') {
        reportTitle = `Laporan Custom (${app.formatDate(startDate.toISOString())} - ${app.formatDate(endDate.toISOString())})`;
    }
    
    const reportTitleEl = document.getElementById('reportTitle');
    if (reportTitleEl) {
        reportTitleEl.textContent = reportTitle;
    }
    
    // Generate HTML untuk laporan
    setTimeout(() => {
        container.innerHTML = `
            <div class="report-summary fade-in-up">
                <div class="summary-cards">
                    <div class="summary-card">
                        <div class="card-header">
                            <div class="card-title">Total Transaksi</div>
                            <div class="card-icon" style="background-color: rgba(74, 107, 255, 0.1); color: #4a6bff;">
                                <i class="fas fa-receipt"></i>
                            </div>
                        </div>
                        <div class="card-value">${transactions.length}</div>
                        <div class="card-subtitle">transaksi ditemukan</div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="card-header">
                            <div class="card-title">Total Pemasukan</div>
                            <div class="card-icon" style="background-color: rgba(40, 167, 69, 0.1); color: #28a745;">
                                <i class="fas fa-arrow-down"></i>
                            </div>
                        </div>
                        <div class="card-value">${app.formatCurrency(totalIncome)}</div>
                        <div class="card-subtitle">dari ${transactions.filter(t => t.type === 'income').length} transaksi</div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="card-header">
                            <div class="card-title">Total Pengeluaran</div>
                            <div class="card-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545;">
                                <i class="fas fa-arrow-up"></i>
                            </div>
                        </div>
                        <div class="card-value">${app.formatCurrency(totalExpense)}</div>
                        <div class="card-subtitle">dari ${transactions.filter(t => t.type === 'expense').length} transaksi</div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="card-header">
                            <div class="card-title">Saldo Bersih</div>
                            <div class="card-icon" style="background-color: rgba(23, 162, 184, 0.1); color: #17a2b8;">
                                <i class="fas fa-balance-scale"></i>
                            </div>
                        </div>
                        <div class="card-value ${netBalance >= 0 ? 'text-success' : 'text-danger'}">
                            ${app.formatCurrency(Math.abs(netBalance))}
                        </div>
                        <div class="card-subtitle">${netBalance >= 0 ? 'Surplus' : 'Defisit'}</div>
                    </div>
                </div>
            </div>
            
            ${sortedCategories.length > 0 ? `
            <div class="report-section fade-in-up" style="animation-delay: 0.1s">
                <h4><i class="fas fa-chart-pie"></i> Pengeluaran per Kategori</h4>
                <div class="category-breakdown">
                    <div class="table-responsive">
                        <table class="breakdown-table">
                            <thead>
                                <tr>
                                    <th>Kategori</th>
                                    <th>Jumlah</th>
                                    <th>Persentase</th>
                                    <th>Chart</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedCategories.map(cat => {
                                    const percentage = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
                                    return `
                                        <tr>
                                            <td>
                                                <div class="d-flex align-center gap-1">
                                                    <div class="category-color" style="background-color: ${cat.color}; width: 12px; height: 12px; border-radius: 50%;"></div>
                                                    ${cat.name}
                                                </div>
                                            </td>
                                            <td class="text-right">${app.formatCurrency(cat.total)}</td>
                                            <td class="text-right">${percentage.toFixed(1)}%</td>
                                            <td>
                                                <div class="progress-bar" style="height: 8px; background-color: var(--border-color); margin: 5px 0;">
                                                    <div class="progress-fill" style="width: ${percentage}%; background-color: ${cat.color};"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="report-section fade-in-up" style="animation-delay: 0.2s">
                <h4><i class="fas fa-history"></i> Transaksi Terbaru</h4>
                <div class="recent-transactions-table">
                    <div class="table-responsive">
                        <table class="transactions-table">
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Deskripsi</th>
                                    <th>Kategori</th>
                                    <th>Tipe</th>
                                    <th>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${transactions.slice(0, 10).map(trans => {
                                    const category = app.getCategoryById(trans.categoryId);
                                    const isIncome = trans.type === 'income';
                                    return `
                                        <tr>
                                            <td>${app.formatDate(trans.date)}</td>
                                            <td>${trans.description}</td>
                                            <td>${category.name}</td>
                                            <td>
                                                <span class="${isIncome ? 'income-badge' : 'expense-badge'}">
                                                    ${isIncome ? 'Pemasukan' : 'Pengeluaran'}
                                                </span>
                                            </td>
                                            <td class="${isIncome ? 'text-success' : 'text-danger'}">
                                                ${isIncome ? '+' : '-'} ${app.formatCurrency(trans.amount)}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="report-footer fade-in-up" style="animation-delay: 0.3s">
                <p class="text-muted">Laporan dibuat pada ${new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
            </div>
        `;
        
    }, 500); // Simulasi loading
}

/**
 * Export laporan ke PDF
 */
function exportToPDF() {
    const reportTitle = document.getElementById('reportTitle').textContent;
    const reportContent = document.getElementById('reportContent').innerHTML;
    
    // Buat window baru untuk print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${reportTitle}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px; 
                    color: #333;
                }
                h1 { 
                    color: #4a6bff; 
                    border-bottom: 2px solid #4a6bff; 
                    padding-bottom: 10px; 
                    margin-bottom: 20px;
                }
                .summary-cards {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin: 20px 0;
                }
                .summary-card { 
                    flex: 1; 
                    min-width: 200px; 
                    background: #f8f9fa; 
                    padding: 15px; 
                    border-radius: 8px; 
                    border-left: 4px solid #4a6bff;
                }
                .card-title { 
                    color: #666; 
                    font-size: 14px; 
                    margin-bottom: 5px;
                }
                .card-value { 
                    font-size: 24px; 
                    font-weight: bold; 
                    margin: 10px 0; 
                    color: #333;
                }
                .card-subtitle { 
                    color: #666; 
                    font-size: 12px;
                }
                .report-section { 
                    margin: 30px 0; 
                }
                .report-section h4 { 
                    color: #4a6bff; 
                    margin-bottom: 15px; 
                    border-bottom: 1px solid #eee; 
                    padding-bottom: 10px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin: 10px 0;
                }
                th, td { 
                    padding: 10px; 
                    border: 1px solid #ddd; 
                    text-align: left;
                }
                th { 
                    background-color: #f8f9fa; 
                    font-weight: bold;
                }
                .text-success { color: #28a745; }
                .text-danger { color: #dc3545; }
                .text-right { text-align: right; }
                .footer { 
                    margin-top: 30px; 
                    text-align: center; 
                    color: #666; 
                    font-size: 12px; 
                    border-top: 1px solid #eee; 
                    padding-top: 20px;
                }
                @media print {
                    body { padding: 0; }
                    .summary-cards { gap: 10px; }
                    .summary-card { min-width: 180px; }
                }
            </style>
        </head>
        <body>
            <h1>${reportTitle}</h1>
            ${reportContent}
            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
    
    app.showNotification('Laporan sedang disiapkan untuk dicetak/PDF', 'info');
}

/**
 * Export laporan ke Excel
 */
function exportToExcel() {
    const reportTitle = document.getElementById('reportTitle').textContent;
    
    // Ambil data dari tabel
    const tables = document.querySelectorAll('.breakdown-table, .transactions-table');
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Tambahkan judul
    csvContent += `${reportTitle}\n\n`;
    
    // Proses setiap tabel
    tables.forEach((table, index) => {
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('th, td');
            
            cells.forEach(cell => {
                // Hapus tag HTML dan ambil teks saja
                let cellText = cell.textContent.trim();
                // Hapus ikon dan simbol
                cellText = cellText.replace(/[🔹🎯⚠️✅📈📉💪💎🚨]/g, '');
                // Escape koma dan kutip
                cellText = cellText.replace(/"/g, '""');
                if (cellText.includes(',') || cellText.includes('"') || cellText.includes('\n')) {
                    cellText = `"${cellText}"`;
                }
                rowData.push(cellText);
            });
            
            csvContent += rowData.join(',') + '\n';
        });
        
        csvContent += '\n'; // Spasi antar tabel
    });
    
    // Tambahkan timestamp
    csvContent += `\nDibuat pada,${new Date().toLocaleString('id-ID')}`;
    
    // Encode URI
    const encodedUri = encodeURI(csvContent);
    
    // Buat link download
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    
    // Download file
    link.click();
    document.body.removeChild(link);
    
    app.showNotification('Laporan berhasil diunduh sebagai CSV/Excel', 'success');
}

/**
 * Inisialisasi event listeners untuk halaman laporan
 */
function initReportsEventListeners() {
    console.log('Initializing reports event listeners...');
    
    // Tombol generate laporan
    const generateReportBtn = document.getElementById('generateReport');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    // Tombol export PDF
    const exportPDFBtn = document.getElementById('exportPDF');
    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', exportToPDF);
    }
    
    // Tombol export Excel
    const exportExcelBtn = document.getElementById('exportExcel');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }
}