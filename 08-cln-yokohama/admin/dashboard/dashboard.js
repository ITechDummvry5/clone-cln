// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts
    initServiceChart();
    initStaffChart();
    
    // Add event listeners
    setupEventListeners();
});

// Initialize Service Chart (Bar Graph)
function initServiceChart() {
    const ctx = document.getElementById('serviceChart').getContext('2d');
    
    const serviceData = {
        labels: ['Alignment', 'Balancing', 'Mounting', 'Tune-Up', 'Change-Oil', 'Underchassis', 'Brakes'],
        datasets: [
            {
                label: 'Revenue',
                data: [15500, 8900, 12700, 19200, 25500, 14200, 17800, 22100],
                backgroundColor: 'rgba(58, 134, 255, 0.7)',
                borderColor: 'rgba(58, 134, 255, 1)',
                borderWidth: 2
            }
        ]
    };
    
    new Chart(ctx, {
        type: 'bar',
        data: serviceData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += 'Php' + context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'Php' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Initialize Staff Chart (Pie Graph)
function initStaffChart() {
    const ctx = document.getElementById('staffChart').getContext('2d');
    
    const staffData = {
        labels: ['Staff 1', 'Staff 2', 'Staff 3', 'Staff 4', 'Staff 5', 'Staff 6', 'Staff 7', 'Staff 8'],
        datasets: [{
            data: [1, 1, 1, 1, 1, 1, 1, 1],
            backgroundColor: [
                'rgba(58, 134, 255, 0.7)',   // Blue
                'rgba(46, 204, 113, 0.7)',   // Green
                'rgba(243, 156, 18, 0.7)',   // Orange
                'rgba(231, 76, 60, 0.7)',    // Red
                'rgba(155, 89, 182, 0.7)',   // Purple
                'rgba(52, 152, 219, 0.7)',   // Light Blue
                'rgba(26, 188, 156, 0.7)',   // Teal
                'rgba(241, 196, 15, 0.7)'    // Yellow
            ],
            borderColor: [
                'rgba(58, 134, 255, 1)',
                'rgba(46, 204, 113, 1)',
                'rgba(243, 156, 18, 1)',
                'rgba(231, 76, 60, 1)',
                'rgba(155, 89, 182, 1)',
                'rgba(52, 152, 219, 1)',
                'rgba(26, 188, 156, 1)',
                'rgba(241, 196, 15, 1)'
            ],
            borderWidth: 1
        }]
    };
    
    new Chart(ctx, {
        type: 'doughnut',
        data: staffData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return label + ': ' + value + ' contributions';
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Time period select
    const timePeriodSelect = document.getElementById('time-period');
    if (timePeriodSelect) {
        timePeriodSelect.addEventListener('change', function() {
            // In a real application, this would refresh the data based on the selected time period
            console.log('Time period changed to:', this.value);
        });
    }
    
    // Refresh button
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            // In a real application, this would refresh all data
            console.log('Refreshing data...');
            // Add a loading spinner (in a real application)
            setTimeout(() => {
                console.log('Data refreshed!');
                // And remove the spinner here
            }, 1000);
        });
    }
    
    // Export button
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            // In a real application, this would generate and download a report
            console.log('Exporting report...');
            alert('Report export started. The file will be downloaded shortly.');
        });
    }
    
    // Segmented control for chart view
    const segmentedButtons = document.querySelectorAll('.segmented-control button');
    segmentedButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            segmentedButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // In a real application, this would change the chart data
            console.log('View changed to:', this.textContent);
        });
    });
    
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            // e.preventDefault();
            // In a real application, this would handle logout
            console.log('Logging out...');
            alert('You have been logged out.');
            // Redirect to login page
            // window.location.href = 'login.html';
        });
    }
}