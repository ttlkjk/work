import { renderDashboard } from './views/dashboard.js';
import { renderBusiness, initBusinessView } from './views/business.js';
import { renderCRM, initCRMView } from './views/crm.js';
import { renderFinance, initFinanceView } from './views/finance.js';
import { renderAdmin, initAdminView } from './views/admin.js';

// DOM Elements
const contentView = document.getElementById('content-view');
const navItems = document.querySelectorAll('.nav-item');
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menu-toggle');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');

// View Map
const views = {
  dashboard: renderDashboard,
  business: renderBusiness,
  crm: renderCRM,
  finance: renderFinance,
  admin: renderAdmin
};

// Navigation Controller
function setupNavigation() {
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active from all
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active to clicked
      item.classList.add('active');

      const viewName = item.getAttribute('data-view');
      navigate(viewName);

      // Close sidebar on mobile after navigation
      if (window.innerWidth <= 768 || document.body.classList.contains('mobile-mode')) {
        closeSidebar();
      }
    });
  });
}

function toggleSidebar() {
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    closeSidebar();
  } else {
    sidebar.classList.add('open');
    sidebarBackdrop.classList.add('active');
  }
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('active');
}

// Render View
export function navigate(viewName) {
  contentView.className = 'content-viewport'; // Reset animations
  
  if (views[viewName]) {
    // Inject HTML
    contentView.innerHTML = views[viewName]();
    
    // Trigger animations
    setTimeout(() => {
        contentView.classList.add('animate-fade');
        // Initialize charts if view has setup logic
        if (viewName === 'dashboard') {
            initDashboardCharts();
        } else if (viewName === 'business') {
            initBusinessView();
        } else if (viewName === 'crm') {
            initCRMView();
        } else if (viewName === 'finance') {
            initFinanceView();
        } else if (viewName === 'admin') {
            initAdminView();
        }
    }, 10);
  } else {
    contentView.innerHTML = `<div class="glass-card"><h2>View Not Found: ${viewName}</h2></div>`;
  }
}

// Chart Initializers (to be implemented in views or called from here)
function initDashboardCharts() {
  const ctx1 = document.getElementById('salesChart')?.getContext('2d');
  const ctx2 = document.getElementById('kpiChart')?.getContext('2d');
  const addBtn = document.getElementById('add-task-btn');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      navigate('business');
      // 사업 계획 뷰가 렌더링 된 후 '신규 프로젝트' 버튼 자동 클릭
      setTimeout(() => {
        const newProjectBtn = document.getElementById('new-project-btn');
        if (newProjectBtn) newProjectBtn.click();
      }, 100); // 넉넉하게 100ms 지연
    });
  }

  if (ctx1 && typeof Chart !== 'undefined') {
    const financeData = localStorage.getItem('financeSummary');
    const summary = financeData ? JSON.parse(financeData) : {
      monthlySales: 24500000,
      monthlyExpense: 8200000
    };

    new Chart(ctx1, {
      type: 'line',
      data: {
        labels: ['10월', '11월', '12월', '1월', '2월', '3월'],
        datasets: [{
          label: '매출',
          data: [18000000, 22000000, 25000000, 20000000, 22000000, summary.monthlySales],
          borderColor: '#0ea5e9',
          borderWidth: 3,
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
          tension: 0.4
        }, {
          label: '매입/지출',
          data: [12000000, 14000000, 17000000, 11000000, 9000000, summary.monthlyExpense],
          borderColor: '#a855f7',
          borderWidth: 3,
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }

  if (ctx2 && typeof Chart !== 'undefined') {
      const projectsData = localStorage.getItem('projects');
      const projects = projectsData ? JSON.parse(projectsData) : [];
      
      let completed = projects.filter(p => p.progress === 100).length;
      let inProgress = projects.filter(p => p.progress > 0 && p.progress < 100).length;
      let delayed = projects.filter(p => p.progress === 0).length;

      // Default if no projects
      if (projects.length === 0) {
        completed = 65; inProgress = 20; delayed = 15;
      }

      new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['목표 달성', '개선 필요', '지연'],
          datasets: [{
            data: [completed, inProgress, delayed],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          cutout: '70%',
          plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
        }
      });
  }
}

// initFinanceCharts definition removed (moved to finance.js)

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();

  // Theme Toggle Logic
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      themeIcon.className = isLight ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
    });
  }

  // Mobile View Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      document.body.classList.toggle('mobile-mode');
      // Ensure sidebar is closed when toggling simulator mode
      closeSidebar();
    });
  }

  // Hamburger Menu Toggle
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
  }

  // Backdrop click to close
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeSidebar);
  }

  // Load Chart.js via script tag for simplicity in prototype, or bundle it
  const chartScript = document.createElement('script');
  chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
  chartScript.onload = () => {
    // Navigate to default view once charts ready
    navigate('business');
  };
  document.head.appendChild(chartScript);
});
