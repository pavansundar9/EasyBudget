document.addEventListener('DOMContentLoaded', () => {
    const incomeForm = document.getElementById('income-form');
    const incomeList = document.getElementById('income-transactions');
    const addIncomeBtn = document.getElementById('add-income');
    const incomeFormDiv = document.querySelector('.income-form');

    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-transactions');
    const addExpenseBtn = document.getElementById('add-expense');
    const expenseFormDiv = document.querySelector('.expense-form');

    const allList = document.getElementById('all-transactions');

    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const netIncomeEl = document.getElementById('net-income');

    // const addIncomeBtn = document.getElementById('add-income');
    // const addExpenseBtn = document.getElementById('add-expense');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const updateSummary = () => {
        const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const netIncome = income - expenses;

        totalIncomeEl.textContent = income.toFixed(2);
        totalExpensesEl.textContent = expenses.toFixed(2);
        netIncomeEl.textContent = netIncome.toFixed(2);
    };

    const renderTransactions = () => {
        incomeList.innerHTML = '';
        expenseList.innerHTML = '';
        allList.innerHTML = '';
    
        transactions.forEach((transaction, index) => {
            const li = document.createElement('li');
            li.classList.add('transaction-item'); // Add a class to each transaction list item
            li.innerHTML = `
                <span class='fixed'>${transaction.date}</span>
                <span class='fixed'>${transaction.description}</span>
                <span class='fixed'>${transaction.category}</span>
                <span class='fixed income'>${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount}</span>
                <button class='fixed' id='delete-button' onclick="deleteTransaction(${index})">Delete</button>
            `;
            allList.appendChild(li);
            
            if (transaction.type === 'income') {
                incomeList.appendChild(li.cloneNode(true));
            } else {
                expenseList.appendChild(li.cloneNode(true));
            }
        });
    };
    
    const addTransaction = (transaction) => {
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderTransactions();
        updateSummary();
        updateCharts();
    };

    addIncomeBtn.addEventListener('click', () => {
        incomeFormDiv.style.display = 'block';
    });

    incomeForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const date = incomeForm.querySelector('#income-date').value;
        const description = incomeForm.querySelector('#income-description').value;
        const category = incomeForm.querySelector('#income-category').value;
        const amount = incomeForm.querySelector('#income-amount').value;
        const type = incomeForm.querySelector('#income-type').value;

        if (!date || !description || !category || !amount || !type) {
            alert('Please fill in all fields');
            return;
        }

        const transaction = { date, description, category, amount, type };
        addTransaction(transaction);

        incomeForm.reset();
        incomeFormDiv.style.display = 'none';
    });

    addExpenseBtn.addEventListener('click', () => {
        expenseFormDiv.style.display = 'block';
    });

    expenseForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const date = expenseForm.querySelector('#expense-date').value;
        const description = expenseForm.querySelector('#expense-description').value;
        const category = expenseForm.querySelector('#expense-category').value;
        const amount = expenseForm.querySelector('#expense-amount').value;
        const type = expenseForm.querySelector('#expense-type').value;

        if (!date || !description || !category || !amount || !type) {
            alert('Please fill in all fields');
            return;
        }

        const transaction = { date, description, category, amount, type };
        addTransaction(transaction);

        expenseForm.reset();
        expenseFormDiv.style.display = 'none';
    });

    const updateButtonText = () => {
        if (screen.width < 600) {
            addIncomeBtn.innerHTML = '<i class="fa-thin fa-square-plus" style="font-size: 20px;"></i>';
            addExpenseBtn.innerHTML = '<i class="fa-thin fa-square-plus" style="font-size: 20px;"></i>';
        } else {
            addIncomeBtn.innerHTML = 'Add Income <i class="fa-thin fa-square-plus" style="font-size: 20px;"></i>';
            addExpenseBtn.innerHTML = 'Add Expense <i class="fa-thin fa-square-plus" style="font-size: 20px;"></i>';
        }
    }

    window.deleteTransaction = (index) => {
        transactions.splice(index, 1);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderTransactions();
        updateSummary();
        updateCharts();
    };
    
    // Function to update the charts
    const updateCharts = () => {
        const incomeCategories = {};
        const expenseCategories = {};

        transactions.forEach(transaction => {
            const category = transaction.category;
            const amount = parseFloat(transaction.amount);

            if (transaction.type === 'income') {
                if (!incomeCategories[category]) {
                    incomeCategories[category] = 0;
                }
                incomeCategories[category] += amount;
            } else {
                if (!expenseCategories[category]) {
                    expenseCategories[category] = 0;
                }
                expenseCategories[category] += amount;
            }
        });

        const incomeLabels = Object.keys(incomeCategories);
        const incomeData = Object.values(incomeCategories);
        const expenseLabels = Object.keys(expenseCategories);
        const expenseData = Object.values(expenseCategories);

        console.log('Income Categories:', incomeCategories);
        console.log('Expense Categories:', expenseCategories);

        // Default data for empty charts
        const emptyData = [1];
        const emptyLabels = ['No Data'];

        // Destroy existing charts if they exist
        if (window.incomeChart && typeof window.incomeChart.destroy === 'function') {
            window.incomeChart.destroy();
        }
        if (window.expensesChart && typeof window.expensesChart.destroy === 'function') {
            window.expensesChart.destroy();
        }

        // Render the expenses pie chart
        window.expensesChart = new Chart(
            document.getElementById('expensesChart'),
            {
                type: 'pie',
                data: {
                    labels: expenseLabels.length ? expenseLabels : emptyLabels,
                    datasets: [{
                        data: expenseData.length ? expenseData : emptyData,
                        backgroundColor: expenseData.length ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] : ['#CCCCCC']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    }
                }
            }
        );

        // Render the income pie chart
        window.incomeChart = new Chart(
            document.getElementById('incomeChart'),
            {
                type: 'pie',
                data: {
                    labels: incomeLabels.length ? incomeLabels : emptyLabels,
                    datasets: [{
                        data: incomeData.length ? incomeData : emptyData,
                        backgroundColor: incomeData.length ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] : ['#CCCCCC']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    }
                }
            }
        );
    };

    updateButtonText();
    renderTransactions();
    updateSummary();
    updateCharts(); 
});
function filterTransactions() {
    const category = document.getElementById('category-filter').value;
    const allTransactions = document.querySelectorAll('.transaction-list .transaction-item');
    
    allTransactions.forEach(transaction => {
        const transactionCategory = transaction.children[2].textContent;
        if (category === '' || transactionCategory === category) {
            transaction.style.display = 'flex';
        } else {
            transaction.style.display = 'none';
        }
    });
}
function filterIncome(){
    const category = document.getElementById('income-filter').value;
    const allTransactions = document.querySelectorAll('.transaction-list .transaction-item');
    
    allTransactions.forEach(transaction => {
        const transactionCategory = transaction.children[2].textContent;
        if (category === '' || transactionCategory === category) {
            transaction.style.display = 'flex';
        } else {
            transaction.style.display = 'none';
        }
    });
}
function filterExpense(){
    const category = document.getElementById('expense-filter').value;
    const allTransactions = document.querySelectorAll('.transaction-list .transaction-item');
    
    allTransactions.forEach(transaction => {
        const transactionCategory = transaction.children[2].textContent;
        if (category === '' || transactionCategory === category) {
            transaction.style.display = 'flex';
        } else {
            transaction.style.display = 'none';
        }
    });
}