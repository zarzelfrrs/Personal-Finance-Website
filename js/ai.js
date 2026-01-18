/**
 * FILE: ai-insights.js
 * DESKRIPSI: Mengelola AI Insights di dashboard
 */

/**
 * Update AI insights
 */
function updateAIInsights() {
    const container = document.getElementById('aiInsights');
    if (!container) return;
    
    // Hitung beberapa statistik untuk insights
    const monthlyIncome = app.calculateMonthlyIncome();
    const monthlyExpense = app.calculateMonthlyExpense();
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
    
    // Hitung pengeluaran per kategori
    const categoryExpenses = calculateCategoryExpenses();
    
    // Cari kategori dengan pengeluaran tertinggi
    let highestCategory = { name: 'Tidak ada', amount: 0 };
    Object.values(categoryExpenses).forEach(cat => {
        if (cat.total > highestCategory.amount) {
            highestCategory = { name: cat.name, amount: cat.total };
        }
    });
    
    // Bandingkan dengan bulan lalu (sederhana)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Hitung pengeluaran bulan lalu
    const transactions = app.getData('transactions');
    const lastMonthExpense = transactions
        .filter(trans => {
            try {
                const transDate = new Date(trans.date);
                return trans.type === 'expense' && 
                       transDate.getMonth() === lastMonth.getMonth() && 
                       transDate.getFullYear() === lastMonth.getFullYear();
            } catch (error) {
                return false;
            }
        })
        .reduce((sum, trans) => sum + (trans.amount || 0), 0);
    
    const expenseChange = lastMonthExpense > 0 ? 
        ((monthlyExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0;
    
    // Generate insights
    const insights = [];
    
    // Insight 1: Rasio tabungan
    if (savingsRate > 20) {
        insights.push({
            title: 'Tabungan Sehat',
            message: `Rasio tabungan Anda ${savingsRate.toFixed(1)}% sangat baik! Pertahankan kebiasaan finansial yang sehat ini.`
        });
    } else if (savingsRate > 0) {
        insights.push({
            title: 'Perbaiki Tabungan',
            message: `Rasio tabungan Anda ${savingsRate.toFixed(1)}% masih rendah. Coba kurangi pengeluaran tidak penting untuk meningkatkan tabungan.`
        });
    } else {
        insights.push({
            title: 'Perhatian: Defisit',
            message: 'Pengeluaran Anda lebih besar dari pemasukan bulan ini. Evaluasi pengeluaran dan cari cara untuk mengurangi biaya.'
        });
    }
    
    // Insight 2: Kategori pengeluaran tertinggi
    if (highestCategory.amount > 0) {
        const percentage = (highestCategory.amount / monthlyExpense) * 100;
        if (!isNaN(percentage)) {
            insights.push({
                title: `Fokus pada ${highestCategory.name}`,
                message: `${highestCategory.name} adalah pengeluaran terbesar Anda (${percentage.toFixed(1)}% dari total pengeluaran). Pertimbangkan untuk mengoptimalkan pengeluaran ini.`
            });
        }
    }
    
    // Insight 3: Perbandingan bulan lalu
    if (!isNaN(expenseChange)) {
        if (expenseChange > 10) {
            insights.push({
                title: 'Pengeluaran Meningkat',
                message: `Pengeluaran Anda naik ${expenseChange.toFixed(1)}% dari bulan lalu. Periksa apakah kenaikan ini wajar atau perlu dikendalikan.`
            });
        } else if (expenseChange < -10) {
            insights.push({
                title: 'Pengeluaran Menurun',
                message: `Hebat! Pengeluaran Anda turun ${Math.abs(expenseChange).toFixed(1)}% dari bulan lalu. Terus pertahankan pengelolaan keuangan yang baik.`
            });
        } else {
            insights.push({
                title: 'Pengeluaran Stabil',
                message: 'Pengeluaran Anda stabil dibandingkan bulan lalu. Konsistensi adalah kunci dari pengelolaan keuangan yang baik.'
            });
        }
    }
    
    // Insight 4: Budget
    const budgets = app.getData('budgets');
    if (budgets.length > 0) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        let nearLimitCount = 0;
        
        budgets.forEach(budget => {
            if (budget.month === currentMonth && budget.year === currentYear) {
                // Hitung pengeluaran untuk budget ini
                const categorySpent = transactions
                    .filter(trans => {
                        try {
                            const transDate = new Date(trans.date);
                            return trans.type === 'expense' && 
                                   trans.categoryId === budget.categoryId &&
                                   transDate.getMonth() + 1 === currentMonth &&
                                   transDate.getFullYear() === currentYear;
                        } catch (error) {
                            return false;
                        }
                    })
                    .reduce((sum, trans) => sum + (trans.amount || 0), 0);
                
                const percentage = budget.amount > 0 ? (categorySpent / budget.amount) * 100 : 0;
                
                if (percentage > 90) {
                    nearLimitCount++;
                }
            }
        });
        
        if (nearLimitCount > 0) {
            insights.push({
                title: 'Budget Perhatian',
                message: `${nearLimitCount} kategori budget Anda hampir mencapai limit. Periksa pengeluaran Anda untuk menghindari melebihi budget.`
            });
        } else {
            insights.push({
                title: 'Budget Terkendali',
                message: 'Semua budget Anda masih dalam kendali. Pertahankan pengelolaan anggaran yang baik ini.'
            });
        }
    }
    
    // Generate HTML untuk insights
    let html = '';
    
    if (insights.length > 0) {
        insights.forEach(insight => {
            html += `
                <div class="insight-item">
                    <h4>${insight.title}</h4>
                    <p>${insight.message}</p>
                </div>
            `;
        });
    } else {
        html = `
            <div class="insight-item">
                <h4>Analisis Keuangan</h4>
                <p>AI sedang menganalisis data keuangan Anda. Tambahkan lebih banyak transaksi untuk mendapatkan insight yang lebih akurat.</p>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

/**
 * Hitung total pengeluaran per kategori bulan ini
 * @returns {Object} - Objek dengan kategori sebagai kunci dan total sebagai nilai
 */
function calculateCategoryExpenses() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const transactions = app.getData('transactions');
    const categories = app.getData('categories');
    
    const result = {};
    
    try {
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
                try {
                    const transDate = new Date(trans.date);
                    return trans.type === 'expense' && 
                           transDate.getMonth() === currentMonth && 
                           transDate.getFullYear() === currentYear;
                } catch (error) {
                    return false;
                }
            })
            .forEach(trans => {
                if (result[trans.categoryId]) {
                    result[trans.categoryId].total += (trans.amount || 0);
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
    } catch (error) {
        console.error('Error calculating category expenses:', error);
        return {};
    }
}