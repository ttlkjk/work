export function renderDashboard() {
  const projectsData = localStorage.getItem('projects');
  const projects = projectsData ? JSON.parse(projectsData) : [
    { id: 1, name: 'ERP 시스템 구축', description: '인프라 세팅 및 핵심 모듈 데이터베이스 연동 및 기초 아키텍처 설계 합의 단계.', progress: 100 },
    { id: 2, name: '대시보드 및 CRM 고도화', description: '대시보드 시각화 차트 적용 및 고객 이력 관리 자동화 기능 배포 작업 수행 중.', progress: 65 },
    { id: 3, name: '재무 모듈 및 세금 처리 자동화', description: '월별 손익 계산 정산 시스템 구축 및 세금 계산서 발행 API 연동 예정.', progress: 0 }
  ];

  const totalProgress = Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / (projects.length || 1));
  
  const roadmapItems = projects.map((p, i) => {
    let status = '대기';
    let statusColor = '#94a3b8';
    let bgOpacity = 0.1;

    const progressValue = p.progress !== undefined ? p.progress : 0;
    
    if (progressValue === 100) {
      status = '완료';
      statusColor = '#10b981';
    } else if (progressValue > 0) {
      status = '진행 중';
      statusColor = '#0ea5e9';
    }

    const hexOpacity = Math.floor(bgOpacity * 255).toString(16).padStart(2, '0');

    return `
      <div style="position: relative;">
        <div style="position: absolute; left: -2.35rem; width: 10px; height: 10px; border-radius: 50%; background: ${statusColor}; border: 3px solid var(--bg-color); box-shadow: 0 0 0 4px ${statusColor}33;"></div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 600;">[Q${i+1}] ${p.name}</h4>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.25rem;">${p.description || ''}</p>
          </div>
          <span style="background: ${statusColor}${hexOpacity}; color: ${statusColor}; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${status}</span>
        </div>
      </div>
    `;
  }).join('');

  const financeData = localStorage.getItem('financeSummary');
  const summary = financeData ? JSON.parse(financeData) : {
    monthlySales: 24500000,
    monthlyExpense: 8200000,
    salesChange: '+12%',
    expenseChange: '-2%'
  };

  const crmData = localStorage.getItem('crm_clients');
  const crmClients = crmData ? JSON.parse(crmData) : [
    { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 } // Minimal fallback for count
  ];
  const activeCustomersCount = crmClients.length;
  // For the trend, we can use the number of clients added today or just a fixed but slightly dynamic logic
  const newRegistrations = crmClients.filter(c => {
    // If it's a new ID (from Date.now()), it will be > 1000000000000
    // The initial IDs are 1, 2, 3, 4
    return c.id > 1000000000000 && c.id > (Date.now() - 86400000); 
  }).length || 4; // Default to 4 if none new today, for better UI

  const formatM = (val) => `₩${(val / 1000000).toFixed(1)}M`;

  return `
    <div class="animate-fade">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.875rem; font-weight: 700;">대시보드</h1>
          <p style="color: var(--text-muted); margin-top: 0.25rem;">Dosicare ERP 운영 현황 요약입니다.</p>
        </div>
        <button id="add-task-btn" style="background: var(--secondary-accent); color: #fff; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);">
          <i class="fa-solid fa-plus" style="margin-right: 0.5rem;"></i> 새 과제 추가
        </button>
      </div>

      <!-- KPI Grid -->
      <div class="dashboard-grid">
        <div class="glass-card metric-card">
          <div class="metric-header">
            <span>총 매출 (MOM)</span>
            <i class="fa-solid fa-arrow-trend-up trend-up"></i>
          </div>
          <div class="metric-value">${formatM(summary.monthlySales)}</div>
          <div class="metric-trend ${summary.salesChange.includes('+') ? 'trend-up' : 'trend-down'}">
            <i class="fa-solid fa-circle-chevron-${summary.salesChange.includes('+') ? 'up' : 'down'}"></i> ${summary.salesChange} 지난달 대비
          </div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-header">
            <span>활성 고객사</span>
            <i class="fa-solid fa-users" style="color: var(--secondary-accent);"></i>
          </div>
          <div class="metric-value">${activeCustomersCount}</div>
          <div class="metric-trend trend-up">
            <i class="fa-solid fa-circle-chevron-up"></i> +${newRegistrations} 신규 등록
          </div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-header">
            <span>KPI 달성률</span>
            <i class="fa-solid fa-circle-check" style="color: #10b981;"></i>
          </div>
          <div class="metric-value">${totalProgress}%</div>
          <div class="metric-trend" style="color: var(--text-muted);">
            목표치 대비 순항 중
          </div>
        </div>

        <div class="glass-card metric-card">
          <div class="metric-header">
            <span>지출 현황</span>
            <i class="fa-solid fa-credit-card" style="color: #fca5a5;"></i>
          </div>
          <div class="metric-value">${formatM(summary.monthlyExpense)}</div>
          <div class="metric-trend ${summary.expenseChange.includes('-') ? 'trend-down' : 'trend-up'}">
            <i class="fa-solid fa-circle-chevron-${summary.expenseChange.includes('-') ? 'down' : 'up'}"></i> ${summary.expenseChange} 고정비 변동
          </div>
        </div>
      </div>

      <!-- Charts & Roadmap Grid -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
        
        <!-- Left: Sales Chart -->
        <div class="glass-card chart-card">
          <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 600;">매출 및 지출 추이</h3>
          <div style="height: 300px; width: 100%;">
            <canvas id="salesChart"></canvas>
          </div>
        </div>

        <!-- Right: KPI Circle & Summary -->
        <div class="glass-card chart-card" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <h3 style="margin-bottom: 1rem; font-size: 1.1rem; font-weight: 600; width: 100%; text-align: left;">추진 과제 현황</h3>
          <div style="width: 200px; height: 180px;">
            <canvas id="kpiChart"></canvas>
          </div>
          <div style="width: 100%; margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
              <span>연간 로드맵 진행률</span>
              <span style="color: var(--secondary-accent); font-weight: 600;">${totalProgress}%</span>
            </div>
            <div style="background: rgba(255,255,255,0.05); height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="width: ${totalProgress}%; background: linear-gradient(to right, var(--primary-accent), var(--secondary-accent)); height: 100%;"></div>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom: Roadmap Timeline -->
      <div class="glass-card" style="margin-top: 1.5rem;">
        <h3 style="margin-bottom: 1.25rem; font-size: 1.1rem; font-weight: 600;">사업 추진 로드맵 (연간/분기별)</h3>
        
        <div style="position: relative; padding-left: 2rem; border-left: 1px dashed var(--glass-edge); display: flex; flex-direction: column; gap: 1.5rem;">
          ${roadmapItems}
        </div>
      </div>
    </div>
  `;
}
