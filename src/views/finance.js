import { users } from './admin.js';
import { saveData } from '../supabase.js';

let financeItems = JSON.parse(localStorage.getItem('financeItems')) || [
  { id: 1, date: '2026.03.18', type: '출금', category: 'AWS 인프라 사용 비용', amount: -1250000, user: '이순신', remarks: '자동 결제' },
  { id: 2, date: '2026.03.15', type: '입금', category: '(주) 메디텍코리아', amount: 4950000, user: '홍길동', remarks: '정기구독' },
  { id: 3, date: '2026.03.12', type: '입금', category: '대한병원 클라우드', amount: 13200000, user: '김영희', remarks: '솔루션 도입' },
  { id: 4, date: '2026.03.10', type: '출금', category: '서브원 (소모품)', amount: -880000, user: '이순신', remarks: '-' }
];

function saveFinanceItems() {
  localStorage.setItem('financeItems', JSON.stringify(financeItems));
  saveData('financeItems', financeItems);
}

let summaryData = JSON.parse(localStorage.getItem('financeSummary')) || {
  balance: 148250000,
  monthlySales: 24500000,
  monthlyExpense: 8200000,
  netProfit: 16300000,
  bankInfo: '신한은행 110-***-***',
  salesChange: '+15.2%',
  expenseChange: '-2.1%',
  profitMargin: '66.5%'
};

function saveSummaryData() {
  localStorage.setItem('financeSummary', JSON.stringify(summaryData));
  saveData('financeSummary', summaryData);
}

export function updateFinanceSummary() {
  const currentMonth = '2026.03';
  const monthItems = financeItems.filter(item => item.date.startsWith(currentMonth));
  
  const sales = monthItems
    .filter(item => item.type === '입금')
    .reduce((sum, item) => sum + item.amount, 0);
    
  const expense = Math.abs(monthItems
    .filter(item => item.type === '출금')
    .reduce((sum, item) => sum + item.amount, 0));
    
  summaryData.monthlySales = sales;
  summaryData.monthlyExpense = expense;
  summaryData.netProfit = sales - expense;
  
  // Calculate profit margin
  if (sales > 0) {
    summaryData.profitMargin = ((summaryData.netProfit / sales) * 100).toFixed(1) + '%';
  } else {
    summaryData.profitMargin = '0%';
  }
  
  saveSummaryData();
}

// Initial Sync
updateFinanceSummary();

let hospitalGoals = JSON.parse(localStorage.getItem('hospitalGoals')) || [
  { id: 1, name: '(주) 메디텍코리아', goal: 10000000, current: 4500000, color: 'linear-gradient(90deg, #6366f1, #0ea5e9)' },
  { id: 2, name: '대한병원 클라우드', goal: 15000000, current: 12000000, color: '#10b981' },
  { id: 3, name: '연세튼튼의원', goal: 5000000, current: 3200000, color: '#f59e0b' }
];

function saveHospitalGoals() {
  localStorage.setItem('hospitalGoals', JSON.stringify(hospitalGoals));
  saveData('hospitalGoals', hospitalGoals);
}

export function renderHospitalGoals() {
  return hospitalGoals.map(h => {
    const currentAmount = financeItems
      .filter(item => item.type === '입금' && item.category === h.name)
      .reduce((sum, item) => sum + item.amount, 0);
    
    const percent = Math.round((currentAmount / h.goal) * 100);
    const displayPercent = Math.min(percent, 100);
    const color = h.color || 'var(--secondary-accent)';
    return `
      <div style="background: rgba(255,255,255,0.01); padding: 1.2rem; border-radius: 12px; border: 1px solid var(--glass-border); position: relative; transition: all 0.3s ease;" class="hospital-goal-card">
        <div style="position: absolute; top: 0.75rem; right: 0.75rem; display: flex; gap: 0.6rem;">
          <button class="edit-hospital-btn" data-id="${h.id}" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.85rem;" title="수정"><i class="fa-solid fa-pen-to-square"></i></button>
          <button class="delete-hospital-btn" data-id="${h.id}" style="background: transparent; border: none; color: #ef4444; opacity: 0.6; cursor: pointer; font-size: 0.85rem;" title="삭제"><i class="fa-solid fa-trash-can"></i></button>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; padding-right: 3rem;">
          <span style="font-weight: 600; font-size: 1rem;">${h.name}</span>
          <span style="font-size: 0.9rem; font-weight: 700; color: ${percent >= 100 ? '#10b981' : 'var(--secondary-accent)'};">${percent}%</span>
        </div>
        <div style="background: rgba(255,255,255,0.05); height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 0.75rem;">
          <div style="width: ${displayPercent}%; background: ${color}; height: 100%; border-radius: 5px; transition: width 0.5s ease-out;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted);">
          <span>목표: <strong style="color: var(--text-main);">₩${h.goal.toLocaleString()}</strong></span>
          <span>현재: <strong style="color: var(--text-main);">₩${currentAmount.toLocaleString()}</strong></span>
        </div>
      </div>
    `;
  }).join('');
}

export function renderTableRows() {
  const formatAmount = (amount) => {
    return (amount > 0 ? '+' : '') + '₩' + Math.abs(amount).toLocaleString();
  };

  return financeItems.map(item => `
    <tr>
      <td>${item.date}</td>
      <td><span style="color: ${item.type === '입금' ? '#10b981' : '#ef4444'}; font-weight: 600;">${item.type}</span></td>
      <td>${item.category}</td>
      <td>${formatAmount(item.amount)}</td>
      <td><span style="background: rgba(148, 163, 184, 0.1); color: #94a3b8; padding: 0.25rem 0.5rem; border-radius: 20px; font-size: 0.75rem;">${item.user || item.status || '-'}</span></td>
      <td>${item.remarks}</td>
      <td>
        <button class="edit-btn" data-id="${item.id}" style="background: rgba(14, 165, 233, 0.1); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.2); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer; margin-right: 0.25rem;">수정</button>
        <button class="delete-btn" data-id="${item.id}" style="background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; cursor: pointer;">삭제</button>
      </td>
    </tr>
  `).join('');
}

export function renderFinance() {
  return `
    <div class="animate-fade">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.875rem; font-weight: 700;">재무 관리</h1>
          <p style="color: var(--text-muted); margin-top: 0.25rem;">월별 손익 현황, 지출 기록 및 통장 잔고를 관리합니다.</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button style="background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer;">
            <i class="fa-solid fa-file-invoice-dollar" style="margin-right: 0.5rem;"></i> 지출 기록하기
          </button>
          <button style="background: transparent; color: var(--text-main); border: 1px solid var(--glass-edge); padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer;">
            <i class="fa-solid fa-file-export" style="margin-right: 0.5rem;"></i> 보고서 다운로드
          </button>
        </div>
      </div>

      <!-- Financial Summary Grid -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.1rem; font-weight: 600;">재무 현황 요약</h3>
        <button id="edit-summary-btn" style="background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: var(--text-muted); padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">
          <i class="fa-solid fa-pen-to-square" style="margin-right: 0.4rem;"></i> 현황 수정
        </button>
      </div>
      <div class="dashboard-grid">
        <div class="glass-card metric-card" style="border-top: 3px solid var(--secondary-accent);">
          <div class="metric-header"><span>현재 통장 잔고</span><i class="fa-solid fa-building-columns"></i></div>
          <div class="metric-value">₩${summaryData.balance.toLocaleString()}</div>
          <p style="font-size: 0.8rem; color: var(--text-muted);">${summaryData.bankInfo}</p>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-header"><span>당월 총 매출</span></div>
          <div class="metric-value" style="color: #10b981;">₩${summaryData.monthlySales.toLocaleString()}</div>
          <p style="font-size: 0.8rem; color: var(--text-muted);">전월 대비 ${summaryData.salesChange}</p>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-header"><span>당월 총 지출</span></div>
          <div class="metric-value" style="color: #ef4444;">₩${summaryData.monthlyExpense.toLocaleString()}</div>
          <p style="font-size: 0.8rem; color: var(--text-muted);">전월 대비 ${summaryData.expenseChange}</p>
        </div>
        <div class="glass-card metric-card">
          <div class="metric-header"><span>당기 순이익</span></div>
          <div class="metric-value" style="color: var(--secondary-accent);">₩${summaryData.netProfit.toLocaleString()}</div>
          <p style="font-size: 0.8rem; color: var(--secondary-accent);">수익률 ${summaryData.profitMargin}</p>
        </div>
      </div>

      <!-- 병원별 목표 매출 -->
      <div class="glass-card" style="margin-bottom: 2rem; padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 600;">병원별 목표 매출</h3>
          <button id="add-hospital-btn" style="background: var(--secondary-accent); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
            <i class="fa-solid fa-plus" style="margin-right: 0.25rem;"></i> 병원 추가
          </button>
        </div>
        <div id="hospital-goals-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
          ${renderHospitalGoals()}
        </div>
      </div>


      <!-- Invoice List / Expense List -->
      <div class="glass-card" style="padding: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-left: 0.5rem; padding-right: 0.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 600;">입출금 관리</h3>
          <button id="open-register-modal" style="background: var(--secondary-accent); color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
            <i class="fa-solid fa-plus" style="margin-right: 0.25rem;"></i> 항목 등록
          </button>
        </div>
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>일자</th>
                <th>구분</th>
                <th>상세 내역 (거래처)</th>
                <th>금액</th>
                <th>담당자</th>
                <th>비고</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody id="finance-table-body">
              ${renderTableRows()}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Account Modals -->
      <div id="register-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; backdrop-filter: blur(4px); align-items: center; justify-content: center;">
         <div class="glass-card" style="width: 450px; padding: 2rem; border: 1px solid var(--glass-edge);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
               <h3 id="modal-title" style="font-size: 1.25rem; font-weight: 700;">입출금 내역 등록</h3>
               <button class="close-modal" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="register-form" style="display: flex; flex-direction: column; gap: 1rem;">
               <input type="hidden" id="item-id">
               <div style="display: flex; gap: 1rem;">
                  <div style="flex: 1;">
                     <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">일자</label>
                     <input type="date" id="item-date" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);" required>
                  </div>
                  <div style="flex: 1;">
                     <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">구분</label>
                     <select id="item-type" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);" required>
                        <option value="입금">입금</option>
                        <option value="출금">출금</option>
                     </select>
                  </div>
               </div>
               <div>
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">상세 내역 (거래처)</label>
                  <input type="text" id="item-category" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);" placeholder="AWS, 메디텍 등" required>
               </div>
               <div>
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">금액</label>
                  <input type="number" id="item-amount" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);" placeholder="숫자만 입력 (예: 1200000)" required>
               </div>
               <div style="display: flex; gap: 1rem;">
                  <div style="flex: 1;">
                     <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">담당자</label>
                     <select id="item-user" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);">
                        <option value="">담당자 선택</option>
                        ${users.map(user => `<option value="${user.name}">${user.name} (${user.dept})</option>`).join('')}
                     </select>
                  </div>
                  <div style="flex: 1;">
                     <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">비고</label>
                     <input type="text" id="item-remarks" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);" placeholder="-">
                  </div>
               </div>
               <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
                  <button type="button" class="close-modal" style="flex: 1; background: transparent; border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; color: var(--text-main); cursor: pointer;">취소</button>
                  <button type="submit" style="flex: 1; background: var(--secondary-accent); border: none; padding: 0.75rem; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">등록하기</button>
               </div>
            </form>
         </div>
      </div>

      <!-- Summary Edit Modal -->
      <div id="summary-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; backdrop-filter: blur(4px); align-items: center; justify-content: center;">
         <div class="glass-card" style="width: 500px; padding: 2rem; border: 1px solid var(--glass-edge);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
               <h3 style="font-size: 1.25rem; font-weight: 700;">재무 현황 수정</h3>
               <button class="close-summary-modal" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="summary-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
               <div style="grid-column: span 2;">
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">현재 통장 잔고 (₩) <span style="font-size: 0.7rem; color: var(--secondary-accent); font-weight: normal;">* 입출금 시 자동 반영됩니다.</span></label>
                  <input type="number" id="summary-balance" value="${summaryData.balance}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);" required>
               </div>
               <div style="grid-column: span 2;">
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">은행 정보</label>
                  <input type="text" id="summary-bank" value="${summaryData.bankInfo}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);">
               </div>
               <div>
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">당월 총 매출 <span style="font-size: 0.7rem; color: #10b981;">(자동 계산됨)</span></label>
                  <input type="number" id="summary-sales" value="${summaryData.monthlySales}" style="width: 100%; background: rgba(0,0,0,0.1); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-muted);" readonly>
               </div>
               <div>
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">매출 변동 (텍스트)</label>
                  <input type="text" id="summary-sales-change" value="${summaryData.salesChange}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);">
               </div>
               <div>
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">당월 총 지출 <span style="font-size: 0.7rem; color: #ef4444;">(자동 계산됨)</span></label>
                  <input type="number" id="summary-expense" value="${summaryData.monthlyExpense}" style="width: 100%; background: rgba(0,0,0,0.1); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-muted);" readonly>
               </div>
               <div>
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">지출 변동 (텍스트)</label>
                  <input type="text" id="summary-expense-change" value="${summaryData.expenseChange}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);">
               </div>
               <div>
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">당기 순이익 (₩)</label>
                  <input type="number" id="summary-profit" value="${summaryData.netProfit}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);" required>
               </div>
               <div>
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">수익률 (예: 66.5%)</label>
                  <input type="text" id="summary-margin" value="${summaryData.profitMargin}" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);">
               </div>
               <div style="grid-column: span 2; display: flex; gap: 0.75rem; margin-top: 1rem;">
                  <button type="button" class="close-summary-modal" style="flex: 1; background: transparent; border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; color: var(--text-main); cursor: pointer;">취소</button>
                  <button type="submit" style="flex: 1; background: var(--secondary-accent); border: none; padding: 0.75rem; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">변경사항 저장</button>
               </div>
            </form>
         </div>
      </div>

      <!-- Hospital Goal Modal -->
      <div id="hospital-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; backdrop-filter: blur(4px); align-items: center; justify-content: center;">
         <div class="glass-card" style="width: 450px; padding: 2rem; border: 1px solid var(--glass-edge);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
               <h3 id="hospital-modal-title" style="font-size: 1.25rem; font-weight: 700;">병원 매출 목표 추가</h3>
               <button class="close-hospital-modal" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form id="hospital-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
               <input type="hidden" id="hospital-id">
               <div>
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">병원명</label>
                  <input type="text" id="hospital-name" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);" placeholder="예: (주) 메디텍코리아" required>
               </div>
               <div>
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">목표 금액 (₩)</label>
                  <input type="number" id="hospital-goal" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);" placeholder="예: 10000000" required>
               </div>
               <div>
                  <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">테마 색상</label>
                  <select id="hospital-color" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 8px; padding: 0.6rem; color: var(--text-main);">
                    <option value="linear-gradient(90deg, #6366f1, #0ea5e9)">블루 그라데이션</option>
                    <option value="#10b981">그린</option>
                    <option value="#f59e0b">오렌지</option>
                    <option value="#a855f7">퍼플</option>
                    <option value="#ef4444">레드</option>
                  </select>
               </div>
               <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
                  <button type="button" class="close-hospital-modal" style="flex: 1; background: transparent; border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; color: var(--text-main); cursor: pointer;">취소</button>
                  <button type="submit" style="flex: 1; background: var(--secondary-accent); border: none; padding: 0.75rem; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">저장하기</button>
               </div>
            </form>
         </div>
      </div>

    </div>
  `;
}

export function initFinanceView() {
  updateFinanceSummary();
  const modal = document.getElementById('register-modal');
  const openBtn = document.getElementById('open-register-modal');
  const closeBtns = document.querySelectorAll('.close-modal');
  const form = document.getElementById('register-form');
  const tbody = document.getElementById('finance-table-body');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      document.getElementById('modal-title').textContent = '입출금 내역 등록';
      document.getElementById('item-id').value = '';
      form.reset();
      modal.style.display = 'flex';
      document.getElementById('item-date').value = new Date().toISOString().split('T')[0];
      
      // Populate users again just in case admin list changed
      const userSelect = document.getElementById('item-user');
      if (userSelect) {
        userSelect.innerHTML = '<option value="">담당자 선택</option>' + 
          users.map(user => `<option value="${user.name}">${user.name} (${user.dept})</option>`).join('');
      }
    });
  }

  if (closeBtns) {
    closeBtns.forEach(btn => btn.addEventListener('click', () => modal.style.display = 'none'));
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = document.getElementById('item-id').value;
      const date = document.getElementById('item-date').value;
      const type = document.getElementById('item-type').value;
      const category = document.getElementById('item-category').value;
      const amount = parseFloat(document.getElementById('item-amount').value) * (type === '출금' ? -1 : 1);
      const user = document.getElementById('item-user').value || '-';
      const remarks = document.getElementById('item-remarks').value || '-';

      if (id) {
        // Update existing
        const index = financeItems.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
          const oldAmount = financeItems[index].amount;
          financeItems[index] = { ...financeItems[index], date, type, category, amount, user, remarks };
          summaryData.balance += (amount - oldAmount);
        }
      } else {
        // Add new
        const newItem = {
          id: Date.now(),
          date,
          type,
          category,
          amount,
          user,
          remarks
        };
        financeItems.unshift(newItem); 
        summaryData.balance += amount;
      }

      saveFinanceItems();
      updateFinanceSummary();
      if (tbody) tbody.innerHTML = renderTableRows();
      
      // Auto-refresh summary cards
      const contentView = document.getElementById('content-view');
      if (contentView) {
        contentView.innerHTML = renderFinance();
        initFinanceView();
      }
      
      modal.style.display = 'none';
      form.reset();
    });
  }

  if (tbody) {
    tbody.addEventListener('click', (e) => {
       if (e.target.classList.contains('delete-btn')) {
          const id = parseInt(e.target.getAttribute('data-id'));
          if (confirm('해당 입출금 내역을 삭제하시겠습니까?')) {
             const item = financeItems.find(i => i.id === id);
             if (item) summaryData.balance -= item.amount;
             financeItems = financeItems.filter(item => item.id !== id);
             saveFinanceItems();
             updateFinanceSummary();
             tbody.innerHTML = renderTableRows();
             
             // Auto-refresh summary cards
             const contentView = document.getElementById('content-view');
             if (contentView) {
               contentView.innerHTML = renderFinance();
               initFinanceView();
             }
          }
       } else if (e.target.classList.contains('edit-btn')) {
          const id = parseInt(e.target.getAttribute('data-id'));
          const item = financeItems.find(i => i.id === id);
          if (item) {
             document.getElementById('modal-title').textContent = '입출금 내역 수정';
             document.getElementById('item-id').value = item.id;
             document.getElementById('item-date').value = item.date;
             document.getElementById('item-type').value = item.type;
             document.getElementById('item-category').value = item.category;
             document.getElementById('item-amount').value = Math.abs(item.amount);
             
             // Update user select
             const userSelect = document.getElementById('item-user');
             if (userSelect) {
               userSelect.innerHTML = '<option value="">담당자 선택</option>' + 
                 users.map(u => `<option value="${u.name}">${u.name} (${u.dept})</option>`).join('');
               userSelect.value = item.user || '';
             }
             
             document.getElementById('item-remarks').value = item.remarks === '-' ? '' : item.remarks;
             modal.style.display = 'flex';
          }
       }
    });
  }

  // Summary Edit Logic
  const summaryModal = document.getElementById('summary-modal');
  const editSummaryBtn = document.getElementById('edit-summary-btn');
  const closeSummaryBtns = document.querySelectorAll('.close-summary-modal');
  const summaryForm = document.getElementById('summary-form');

  if (editSummaryBtn && summaryModal) {
    editSummaryBtn.addEventListener('click', () => {
      summaryModal.style.display = 'flex';
    });
  }

  if (closeSummaryBtns) {
    closeSummaryBtns.forEach(btn => btn.addEventListener('click', () => summaryModal.style.display = 'none'));
  }

  if (summaryModal) {
    summaryModal.addEventListener('click', (e) => {
      if (e.target === summaryModal) summaryModal.style.display = 'none';
    });
  }

  if (summaryForm) {
    summaryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      summaryData = {
        ...summaryData,
        balance: parseInt(document.getElementById('summary-balance').value),
        bankInfo: document.getElementById('summary-bank').value,
        salesChange: document.getElementById('summary-sales-change').value,
        expenseChange: document.getElementById('summary-expense-change').value,
        profitMargin: document.getElementById('summary-margin').value
      };

      saveSummaryData();
      
      // Auto-refresh the view to reflect changes
      const contentView = document.getElementById('content-view');
      if (contentView) {
        contentView.innerHTML = renderFinance();
        initFinanceView(); // Re-initialize listeners
      }
      
      summaryModal.style.display = 'none';
    });
  }

  // Hospital Goals Logic
  const hospitalModal = document.getElementById('hospital-modal');
  const addHospitalBtn = document.getElementById('add-hospital-btn');
  const closeHospitalBtns = document.querySelectorAll('.close-hospital-modal');
  const hospitalForm = document.getElementById('hospital-form');
  const goalsContainer = document.getElementById('hospital-goals-container');

  if (addHospitalBtn && hospitalModal) {
    addHospitalBtn.addEventListener('click', () => {
      document.getElementById('hospital-modal-title').textContent = '병원 매출 목표 추가';
      document.getElementById('hospital-id').value = '';
      hospitalForm.reset();
      hospitalModal.style.display = 'flex';
    });
  }

  if (closeHospitalBtns) {
    closeHospitalBtns.forEach(btn => btn.addEventListener('click', () => hospitalModal.style.display = 'none'));
  }

  if (hospitalModal) {
    hospitalModal.addEventListener('click', (e) => {
      if (e.target === hospitalModal) hospitalModal.style.display = 'none';
    });
  }

  if (hospitalForm) {
    hospitalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const id = document.getElementById('hospital-id').value;
      const name = document.getElementById('hospital-name').value;
      const goal = parseInt(document.getElementById('hospital-goal').value);
      const color = document.getElementById('hospital-color').value;

      if (id) {
        const index = hospitalGoals.findIndex(h => h.id === parseInt(id));
        if (index !== -1) {
          hospitalGoals[index] = { ...hospitalGoals[index], name, goal, color };
        }
      } else {
        hospitalGoals.push({ id: Date.now(), name, goal, current: 0, color });
      }

      saveHospitalGoals();
      if (goalsContainer) goalsContainer.innerHTML = renderHospitalGoals();
      hospitalModal.style.display = 'none';
      hospitalForm.reset();
    });
  }

  if (goalsContainer) {
    goalsContainer.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.edit-hospital-btn');
      const deleteBtn = e.target.closest('.delete-hospital-btn');

      if (editBtn) {
        const id = parseInt(editBtn.getAttribute('data-id'));
        const hospital = hospitalGoals.find(h => h.id === id);
        if (hospital) {
          document.getElementById('hospital-modal-title').textContent = '병원 매출 목표 수정';
          document.getElementById('hospital-id').value = hospital.id;
          document.getElementById('hospital-name').value = hospital.name;
          document.getElementById('hospital-goal').value = hospital.goal;
          document.getElementById('hospital-color').value = hospital.color;
          hospitalModal.style.display = 'flex';
        }
      } else if (deleteBtn) {
        if (confirm('해당 병원의 목표 매출 데이터를 삭제하시겠습니까?')) {
          const id = parseInt(deleteBtn.getAttribute('data-id'));
          hospitalGoals = hospitalGoals.filter(h => h.id !== id);
          saveHospitalGoals();
          goalsContainer.innerHTML = renderHospitalGoals();
        }
      }
    });
  }
}

// Ensure summary is synced when module loads
updateFinanceSummary();
