import { saveData } from '../supabase.js';

let initialClients = [
  {
    id: 1,
    name: '서울연세병원',
    type: 'B2B',
    plan: 'Premium',
    billing: '매월',
    renewalDate: '2026.04.15',
    history: '전화 상담',
    status: '데모중',
    sales: {
      expectedProducts: '초음파 진단기 U-500',
      proposedItems: 'MRI 업그레이드 모듈, CT 유지보수',
      likelihood: '높음',
      requests: '장비 데모 시연 및 견적서 송부 요청',
      notes: '원장님 직접 컨택 중, 예산 확정 대기 상태'
    },
    logs: [
      { date: '2026.03.15', content: '장비 데모 요청 접수 및 일정 조율 (상담사: 김도현)' },
      { date: '2026.02.20', content: '기존 장비 사용 만족도 조사 및 피드백 수렴' }
    ]
  },
  {
    id: 2,
    name: '대한메디컬 의원',
    type: 'B2B',
    plan: 'Standard',
    billing: '매년',
    renewalDate: '2026.06.30',
    history: '계약 연장 논의',
    status: '구매예정',
    sales: {
      expectedProducts: '환자 모니터링 시스템',
      proposedItems: '클라우드 연동 패키지',
      likelihood: '중간',
      requests: '타사 대비 특장점 요약본 제안 요청',
      notes: '경쟁사 제품 단가 비교 중인 것으로 파악됨'
    },
    logs: [
      { date: '2026.03.10', content: '기능 설명회 진행 및 질문 답변 세션 수행' },
      { date: '2026.01.15', content: '새해 인사 및 정기 점검 방문' }
    ]
  },
  {
    id: 3,
    name: '김도현 님 (개인)',
    type: 'B2C',
    plan: 'Basic',
    billing: '매월',
    renewalDate: '2026.03.25',
    history: '결제 수단 변경',
    status: '관심고객',
    sales: {
      expectedProducts: '가정용 혈압계',
      proposedItems: '정기 건강 리포팅 서비스',
      likelihood: '낮음',
      requests: '카드 갱신 처리 방법 문의',
      notes: '현재 결제 오류로 서비스 이용 일시 중단 상태'
    },
    logs: [
      { date: '2026.03.12', content: '결제 실패 안내 SMS 발송 및 상담 처리' }
    ]
  },
  {
    id: 4,
    name: '헬스밸런스 파트너스',
    type: 'B2B',
    plan: 'Premium',
    billing: '-',
    renewalDate: '-',
    history: '도입 문의 접수',
    status: '구매고객',
    sales: {
      expectedProducts: '디지털 헬스케어 플랫폼 연동',
      proposedItems: 'Enterprise 전용 API 패키지',
      likelihood: '매우 높음',
      requests: '보안 가이드라인 및 API 문서 사전 제공 요청',
      notes: 'C-Level 의사결정 완료, 계약서 검토 단계'
    },
    logs: [
      { date: '2026.03.17', content: 'MOU 체결 관련 실무자 미팅 진행 (최종 조율)' },
      { date: '2026.03.05', content: '첫 도입 인콰이어리 상담 진행' }
    ]
  }
];

let clients = JSON.parse(localStorage.getItem('crm_clients'));

if (!clients) {
  clients = initialClients;
  localStorage.setItem('crm_clients', JSON.stringify(clients));
}

function saveClientsToStorage() {
  localStorage.setItem('crm_clients', JSON.stringify(clients));
  saveData('crm_clients', clients);
}

export function renderCRM() {
  return `
    <div class="animate-fade">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.875rem; font-weight: 700;">고객 관리 (CRM)</h1>
          <p style="color: var(--text-muted); margin-top: 0.25rem;">고객사 거래 이력 및 서비스 상담 일정을 관리합니다.</p>
        </div>
        <button id="new-customer-btn" style="background: var(--secondary-accent); color: #fff; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer;">
          <i class="fa-solid fa-user-plus" style="margin-right: 0.5rem;"></i> 신규 등록
        </button>
      </div>

      <!-- Filters Row -->
      <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
        <div class="search-bar" style="flex: 1;">
          <i class="fa-solid fa-magnifying-glass" style="color: var(--text-muted);"></i>
          <input type="text" placeholder="고객사(병원명), 담당자 검색..." />
        </div>
        <select style="background: var(--glass-bg); color: var(--text-main); border: 1px solid var(--glass-edge); border-radius: 10px; padding: 0.6rem 1rem; outline: none; cursor: pointer;">
          <option value="all">전체 상태</option>
          <option value="관심고객">관심고객</option>
          <option value="구매예정">구매예정</option>
          <option value="데모중">데모중</option>
          <option value="구매고객">구매고객</option>
          <option value="그외 고객">그외 고객</option>
        </select>
      </div>

      <!-- Data Table Card -->
      <div class="glass-card" style="padding: 1rem;">
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>고객사 (병원명)</th>
                <th>판매 가능 리스트</th>
                <th>구매 가능성</th>
                <th>병원 요청 사항</th>
                <th>방문 예정일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody id="crm-table-body">
              <!-- Dynamically Populated -->
            </tbody>
          </table>
        </div>
        
        <!-- Pagination Placeholder -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
          <span>총 ${clients.length}건 중 1-4건 표시</span>
        </div>
      </div>

      <!-- ==================================
           CRM REGISTRATION MODAL
           ================================== -->
      <div id="crm-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); z-index: 999; justify-content: center; align-items: flex-start; padding-top: 50px; overflow-y: auto;">
        <div class="glass-card animate-fade" style="width: 500px; padding: 2rem; border: 1px solid var(--glass-edge); background: rgba(15, 23, 42, 0.9); margin-bottom: 50px;">
          <h3 id="crm-modal-title" style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 700;">신규 고객 등록</h3>
          
          <div style="margin-bottom: 1rem;">
            <label style="display:block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">고객명</label>
            <input type="text" id="cust-name" placeholder="고객명 또는 병원명 입력" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); color: var(--text-main); outline: none;" />
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display:block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.4rem;">방문 예정일</label>
            <input type="text" id="cust-renewal" placeholder="YYYY.MM.DD" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); color: var(--text-main); outline: none;" />
          </div>

          <div style="margin-bottom: 1.5rem; border-top: 1px solid var(--glass-border); padding-top: 1rem;">
            <h4 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--secondary-accent);">[영업 및 상세 정보]</h4>
            
            <div style="margin-bottom: 0.75rem;">
              <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">제품 구매 예정</label>
              <input type="text" id="sales-expected" placeholder="예: 초음파 진단기 U-500" style="width: 100%; padding: 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); color: var(--text-main);" />
            </div>

            <div style="margin-bottom: 0.75rem;">
              <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">판매 가능 리스트 (제안 상품)</label>
              <input type="text" id="sales-proposed" placeholder="예: MRI 부품, 서버 증설" style="width: 100%; padding: 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); color: var(--text-main);" />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
              <div>
                <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">구매 가능성</label>
                <select id="sales-likelihood" style="width: 100%; padding: 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); color: var(--text-main);">
                  <option value="매우 높음">매우 높음</option>
                  <option value="높음">높음</option>
                  <option value="중간">중간</option>
                  <option value="낮음">낮음</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">상태</label>
                <select id="cust-status" style="width: 100%; padding: 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); color: var(--text-main);">
                  <option value="관심고객">관심고객</option>
                  <option value="구매예정">구매예정</option>
                  <option value="데모중">데모중</option>
                  <option value="구매고객">구매고객</option>
                  <option value="그외 고객">그외 고객</option>
                </select>
              </div>
            </div>

            <div style="margin-bottom: 0.75rem;">
              <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">병원 요청 사항</label>
              <textarea id="sales-requests" rows="2" placeholder="견적, 데모 시연 등 요청 사항" style="width: 100%; padding: 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); color: var(--text-main); outline: none; font-family: inherit; font-size: 0.85rem;"></textarea>
            </div>

            <div style="margin-bottom: 0.75rem;">
              <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">판매 관리 유의 사항</label>
              <textarea id="sales-notes" rows="2" placeholder="영업 시 주의할 점 또는 특이사항" style="width: 100%; padding: 0.6rem; border-radius: 6px; background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); color: var(--text-main); outline: none; font-family: inherit; font-size: 0.85rem;"></textarea>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button id="crm-modal-cancel" style="background: transparent; border: 1px solid var(--glass-edge); color: var(--text-main); padding: 0.75rem 1.25rem; border-radius: 10px; cursor: pointer; font-weight: 500;">취소</button>
            <button id="crm-modal-save" style="background: var(--secondary-accent); border: none; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);">등록하기</button>
          </div>
        </div>
      </div>

      <!-- ==================================
           CRM DETAIL SIDE DRAWER (panel)
           ================================== -->
      <div id="crm-detail-drawer" style="display: none; position: fixed; top: 0; right: 0; width: 450px; height: 100%; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(12px); border-left: 1px solid var(--glass-border); z-index: 1000; flex-direction: column; animation: slide-in 0.3s ease;">
        <div style="padding: 1.5rem; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 id="detail-title" style="font-size: 1.25rem; font-weight: 700;">병원명</h3>
          </div>
          <button id="close-drawer-btn" style="background: transparent; border: none; color: var(--text-muted); font-size: 1.2rem; cursor: pointer;"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div style="flex: 1; overflow-y: auto; padding: 1.5rem;">
          
          <!-- Sales Info Section -->
          <div style="margin-bottom: 2rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; color: var(--secondary-accent); display: flex; align-items: center; justify-content: space-between;">
              <span style="display: flex; align-items: center; gap: 0.5rem;"><i class="fa-solid fa-file-invoice"></i> 영업 상세 관리</span>
              <select id="det-cust-status" style="background: rgba(14, 165, 233, 0.1); color: #0ea5e9; border: 1px solid rgba(14, 165, 233, 0.2); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; outline: none; cursor: pointer;">
                <option value="관심고객">관심고객</option>
                <option value="구매예정">구매예정</option>
                <option value="데모중">데모중</option>
                <option value="구매고객">구매고객</option>
                <option value="그외 고객">그외 고객</option>
              </select>
            </h4>
            <div class="glass-card" style="padding: 1rem; background: rgba(255,255,255,0.02);">
              <div style="margin-bottom: 1rem;">
                <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">방문 예정일</label>
                <input type="text" id="det-cust-renewal" style="width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 4px; color: var(--text-main); font-size: 0.85rem;">
              </div>
              <div style="margin-bottom: 1rem;">
                <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">제품 구매 예정</label>
                <input type="text" id="det-sales-expected" style="width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 4px; color: var(--text-main); font-size: 0.85rem;">
              </div>
              <div style="margin-bottom: 1rem;">
                <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">판매 가능 리스트</label>
                <input type="text" id="det-sales-proposed" style="width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 4px; color: var(--text-main); font-size: 0.85rem;">
              </div>
              <div style="margin-bottom: 1rem;">
                <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">구매 가능성</label>
                <select id="det-sales-likelihood" style="width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 4px; color: var(--text-main); font-size: 0.85rem;">
                  <option value="매우 높음">매우 높음</option>
                  <option value="높음">높음</option>
                  <option value="중간">중간</option>
                  <option value="낮음">낮음</option>
                </select>
              </div>
              <div style="margin-bottom: 1rem;">
                <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">병원 요청 사항</label>
                <textarea id="det-sales-requests" rows="2" style="width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 4px; color: var(--text-main); font-size: 0.85rem; resize: none;"></textarea>
              </div>
              <div style="margin-bottom: 1rem;">
                <label style="display:block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.3rem;">판매 관리 유의 사항</label>
                <textarea id="det-sales-notes" rows="2" style="width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); border-radius: 4px; color: var(--text-main); font-size: 0.85rem; resize: none;"></textarea>
              </div>
              <button id="save-detail-btn" style="width: 100%; background: var(--secondary-accent); border: none; padding: 0.6rem; border-radius: 6px; color: white; font-weight: 600; cursor: pointer; font-size: 0.85rem;">상세 정보 저장</button>
            </div>
          </div>

          <!-- Visit Log Section -->
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
              <span style="display: flex; align-items: center; gap: 0.5rem;"><i class="fa-solid fa-clipboard-check"></i> 방문 및 상담 일지</span>
              <button id="add-log-btn" style="background: transparent; border: 1px solid var(--glass-edge); color: var(--text-main); font-size: 0.75rem; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer;">+ 일지 추가</button>
            </h4>

            <!-- Active Log Add Form -->
            <div id="log-form" style="display: none; margin-bottom: 1rem; border: 1px solid var(--glass-border); padding: 0.75rem; border-radius: 8px; background: rgba(0,0,0,0.2);">
              <textarea id="log-input" rows="2" placeholder="전화 상담 또는 방문 내용 입력..." style="width: 100%; background: transparent; border: none; color: var(--text-main); font-size: 0.85rem; outline: none; font-family: inherit; resize: none;"></textarea>
              <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem;">
                <button id="log-cancel" style="background: transparent; border: none; color: var(--text-muted); font-size: 0.8rem; cursor: pointer;">취소</button>
                <button id="log-save" style="background: var(--secondary-accent); border: none; color: white; font-size: 0.8rem; padding: 0.3rem 0.7rem; border-radius: 4px; cursor: pointer;">등록</button>
              </div>
            </div>

            <div id="visit-logs" style="position: relative; padding-left: 1.5rem;">
              <div style="position: absolute; left: 0.5rem; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.1);"></div>
              <!-- Dynamically Populated Timeline -->
            </div>
          </div>

        </div>
      </div>

    </div>
  `;
}

export function initCRMView() {
  const openBtn = document.getElementById('new-customer-btn');
  const modal = document.getElementById('crm-modal');
  const cancelBtn = document.getElementById('crm-modal-cancel');
  const saveBtn = document.getElementById('crm-modal-save');
  const tableBody = document.getElementById('crm-table-body');

  const drawer = document.getElementById('crm-detail-drawer');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const logForm = document.getElementById('log-form');
  const addLogBtn = document.getElementById('add-log-btn');
  const logInput = document.getElementById('log-input');
  const logSave = document.getElementById('log-save');
  const logCancel = document.getElementById('log-cancel');

  let currentSelectedClient = null;

  function renderRows() {
    tableBody.innerHTML = clients.map(client => {
      let badgeStyle = '';
      if (client.status === '구매고객') badgeStyle = 'background: rgba(16, 185, 129, 0.1); color: #10b981;';
      else if (client.status === '구매예정') badgeStyle = 'background: rgba(245, 158, 11, 0.1); color: #f59e0b;';
      else if (client.status === '관심고객') badgeStyle = 'background: rgba(14, 165, 233, 0.1); color: #0ea5e9;';
      else if (client.status === '데모중') badgeStyle = 'background: rgba(168, 85, 247, 0.1); color: #a855f7;';
      else badgeStyle = 'background: rgba(148, 163, 184, 0.1); color: #94a3b8;';

      const proposedItems = client.sales.proposedItems || '-';
      const likelihood = client.sales.likelihood || '중간';
      const requests = client.sales.requests || '-';

      let likeColor = '#f59e0b'; // 중간
      if (likelihood === '매우 높음' || likelihood === '높음') likeColor = '#10b981';
      else if (likelihood === '낮음') likeColor = '#ef4444';

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
          <td style="padding: 1rem; font-weight: 600;">${client.name}</td>
          <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-main);">${proposedItems}</td>
          <td style="padding: 1rem; font-size: 0.85rem;"><span style="color: ${likeColor}; font-weight: 600;">${likelihood}</span></td>
          <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted); max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${requests}</td>
          <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted);">${client.renewalDate}</td>
          <td style="padding: 1rem;"><span style="padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; ${badgeStyle}">${client.status}</span></td>
          <td style="padding: 1rem; text-align: center;">
            <div style="display: flex; gap: 0.5rem; justify-content: center;">
              <button class="detail-btn" data-id="${client.id}" style="background: transparent; border: none; color: var(--secondary-accent); cursor: pointer; font-size: 0.85rem;">상세</button>
              <button class="edit-btn" data-id="${client.id}" style="background: transparent; border: none; color: #10b981; cursor: pointer; font-size: 0.85rem;">수정</button>
              <button class="delete-btn" data-id="${client.id}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.85rem;">삭제</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Listeners
    document.querySelectorAll('.detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        openDrawer(id);
      });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        openEditModal(id);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        deleteClient(id);
      });
    });
  }

  function openDrawer(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    currentSelectedClient = client;

    document.getElementById('det-sales-expected').value = client.sales.expectedProducts || '';
    document.getElementById('det-sales-proposed').value = client.sales.proposedItems || '';
    document.getElementById('det-sales-likelihood').value = client.sales.likelihood || '중간';
    document.getElementById('det-sales-requests').value = client.sales.requests || '';
    document.getElementById('det-sales-notes').value = client.sales.notes || '';
    document.getElementById('det-cust-status').value = client.status;
    document.getElementById('det-cust-renewal').value = client.renewalDate || '';

    renderLogs(client);

    drawer.style.display = 'flex';
    logForm.style.display = 'none'; // reset form
  }

  function openEditModal(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    currentSelectedClient = client;
    
    document.getElementById('crm-modal-title').innerText = '고객 정보 수정';
    saveBtn.innerText = '수정하기';
    
    document.getElementById('cust-name').value = client.name;
    document.getElementById('sales-expected').value = client.sales.expectedProducts || '';
    document.getElementById('sales-proposed').value = client.sales.proposedItems || '';
    document.getElementById('sales-likelihood').value = client.sales.likelihood || '중간';
    document.getElementById('cust-status').value = client.status;
    document.getElementById('cust-renewal').value = client.renewalDate;
    document.getElementById('sales-requests').value = client.sales.requests || '';
    document.getElementById('sales-notes').value = client.sales.notes || '';

    modal.style.display = 'flex';
  }

  function deleteClient(clientId) {
    if (confirm('해당 고객 정보를 삭제하시겠습니까?')) {
      clients = clients.filter(c => c.id !== clientId);
      saveClientsToStorage();
      renderRows();
    }
  }

  function renderLogs(client) {
    const logContainer = document.getElementById('visit-logs');
    if (!logContainer) return;

    if (!client.logs || client.logs.length === 0) {
      logContainer.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-muted);">작성된 일지가 없습니다.</span>';
      return;
    }

    logContainer.innerHTML = client.logs.map(log => `
      <div style="margin-bottom: 1.25rem; position: relative;">
        <div style="position: absolute; left: -1.35rem; top: 0.2rem; width: 0.6rem; height: 0.6rem; border-radius: 50%; background: var(--secondary-accent); border: 2px solid var(--bg-color);"></div>
        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${log.date}</div>
        <div style="font-size: 0.85rem; color: var(--text-main); margin-top: 0.25rem; line-height: 1.4;">${log.content}</div>
      </div>
    `).join('');
  }

  // Initial Render
  renderRows();

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      currentSelectedClient = null;
      document.getElementById('crm-modal-title').innerText = '신규 고객 등록';
      saveBtn.innerText = '등록하기';
      
      // Reset fields
      document.getElementById('cust-name').value = '';
      document.getElementById('cust-renewal').value = '';
      document.getElementById('sales-expected').value = '';
      document.getElementById('sales-proposed').value = '';
      document.getElementById('sales-requests').value = '';
      document.getElementById('sales-notes').value = '';
      
      modal.style.display = 'flex';
    });
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', () => {
      drawer.style.display = 'none';
      currentSelectedClient = null;
    });
  }

  if (addLogBtn && logForm) {
    addLogBtn.addEventListener('click', () => {
      logForm.style.display = 'block';
      logInput.focus();
    });
  }

  if (logCancel) {
    logCancel.addEventListener('click', () => {
      logForm.style.display = 'none';
      logInput.value = '';
    });
  }

  if (logSave) {
    logSave.addEventListener('click', () => {
      const text = logInput.value.trim();
      if (!text || !currentSelectedClient) return;

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '.');

      if (!currentSelectedClient.logs) currentSelectedClient.logs = [];
      currentSelectedClient.logs.unshift({
        date: dateStr,
        content: text
      });

      renderLogs(currentSelectedClient);
      saveClientsToStorage();
      logInput.value = '';
      logForm.style.display = 'none';
    });
  }

  const saveDetailBtn = document.getElementById('save-detail-btn');
  if (saveDetailBtn) {
    saveDetailBtn.addEventListener('click', () => {
      if (!currentSelectedClient) return;
      
      currentSelectedClient.sales.expectedProducts = document.getElementById('det-sales-expected').value.trim();
      currentSelectedClient.sales.proposedItems = document.getElementById('det-sales-proposed').value.trim();
      currentSelectedClient.sales.likelihood = document.getElementById('det-sales-likelihood').value;
      currentSelectedClient.sales.requests = document.getElementById('det-sales-requests').value.trim();
      currentSelectedClient.sales.notes = document.getElementById('det-sales-notes').value.trim();
      currentSelectedClient.status = document.getElementById('det-cust-status').value;
      currentSelectedClient.renewalDate = document.getElementById('det-cust-renewal').value.trim();
      
      saveClientsToStorage();
      renderRows();
      
      const toast = document.createElement('div');
      toast.innerText = '상세 정보가 저장되었습니다.';
      toast.style = 'position:fixed; bottom: 20px; right: 20px; background: #10b981; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 0.85rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; animation: fade-in-out 3s ease;';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = document.getElementById('cust-name').value.trim();
      const expected = document.getElementById('sales-expected').value.trim();
      const proposed = document.getElementById('sales-proposed').value.trim();
      const likelihood = document.getElementById('sales-likelihood').value;
      const status = document.getElementById('cust-status').value;
      const requests = document.getElementById('sales-requests').value.trim();
      const notes = document.getElementById('sales-notes').value.trim();
      const renewalDate = document.getElementById('cust-renewal').value.trim();

      if (!name) {
        alert('병원명(고객사)을 입력해주세요.');
        return;
      }

      saveBtn.innerText = '등록 중...';
      saveBtn.disabled = true;

      setTimeout(() => {
        if (currentSelectedClient) {
          // Edit existing
          currentSelectedClient.name = name;
          currentSelectedClient.sales.expectedProducts = expected;
          currentSelectedClient.sales.proposedItems = proposed;
          currentSelectedClient.sales.likelihood = likelihood;
          currentSelectedClient.status = status;
          currentSelectedClient.renewalDate = renewalDate;
          currentSelectedClient.sales.requests = requests;
          currentSelectedClient.sales.notes = notes;
        } else {
          // Add new
          clients.unshift({
            id: Date.now(),
            name,
            billing: '매월',
            renewalDate: renewalDate || '2026.04.01',
            history: '신규 등록',
            status,
            sales: {
              expectedProducts: expected,
              proposedItems: proposed,
              likelihood: likelihood,
              requests: requests,
              notes: notes
            },
            logs: []
          });
        }

        saveClientsToStorage();
        renderRows();

        modal.style.display = 'none';
        saveBtn.innerText = currentSelectedClient ? '수정하기' : '등록하기';
        saveBtn.disabled = false;

        // Clear modal logs inputs
        document.getElementById('cust-name').value = '';
        document.getElementById('sales-expected').value = '';
        document.getElementById('sales-proposed').value = '';
        document.getElementById('sales-requests').value = '';
        document.getElementById('sales-notes').value = '';
        document.getElementById('cust-renewal').value = '';
        
        currentSelectedClient = null;

      }, 500);
    });
  }
}
