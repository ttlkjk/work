import { saveData } from '../supabase.js';

const defaultUsers = [
  { id: 1, name: '홍길동', email: 'admin@dosicare.com', dept: '운영기획팀', position: '팀장', role: '마스터 관리자', date: '2026.01.01', status: '활성' },
  { id: 2, name: '이순신', email: 'finance@dosicare.com', dept: '재무회계팀', position: '과장', role: '재무 담당자', date: '2026.02.15', status: '활성' },
  { id: 3, name: '김영희', email: 'staff1@dosicare.com', dept: '고객지원팀', position: '대리', role: '일반 사용자', date: '2026.03.01', status: '활성' }
];

export let users = JSON.parse(localStorage.getItem('admin_users')) || defaultUsers;

function saveUsers() {
  localStorage.setItem('admin_users', JSON.stringify(users));
  saveData('admin_users', users);
}

export function renderAdmin() {
  return `
    <div class="animate-fade">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.875rem; font-weight: 700;">시스템 설정</h1>
          <p style="color: var(--text-muted); margin-top: 0.25rem;">사용자 권한 및 시스템 전반의 환경 설정을 관리합니다.</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div style="display: flex; gap: 1rem; border-bottom: 1px solid var(--glass-border); margin-bottom: 2rem; padding-bottom: 0.5rem;">
        <button style="background: transparent; border: none; color: var(--secondary-accent); font-weight: 600; padding: 0.5rem 1rem; border-bottom: 2px solid var(--secondary-accent); cursor: pointer;">사용자 관리</button>
        <button style="background: transparent; border: none; color: var(--text-muted); font-weight: 500; padding: 0.5rem 1rem; cursor: pointer;">권한 설정</button>
        <button style="background: transparent; border: none; color: var(--text-muted); font-weight: 500; padding: 0.5rem 1rem; cursor: pointer;">일반 설정</button>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.1rem; font-weight: 600;">사용자 리스트</h3>
        <button id="new-user-btn" style="background: var(--secondary-accent); color: #fff; border: none; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer;">
          <i class="fa-solid fa-user-plus" style="margin-right: 0.5rem;"></i> 사용자 추가
        </button>
      </div>

      <!-- User List Table -->
      <div class="glass-card" style="padding: 1rem;">
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>사용자명</th>
                <th>이메일 (ID)</th>
                <th>부서 / 직함</th>
                <th>시스템 권한</th>
                <th>가입일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody id="user-table-body">
              <!-- Dynamically Populated -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Permission Assignment Cards -->
      <div style="margin-top: 1.5rem;">
        <h3 style="margin-bottom: 1rem; font-size: 1.1rem; font-weight: 600;">권한 그룹 및 접근 제어</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          
          <div class="glass-card" style="background: rgba(255,255,255,0.01);">
            <h4 style="font-size: 1rem; margin-bottom: 0.5rem;">마스터 관리자 (Admin)</h4>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1rem;">시스템 전체 설정, 사용자 관리, 재무 및 인사 조회 및 수정 권한을 포함한 모든 권한</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <span style="font-size: 0.7rem; background: rgba(255,255,255,0.04); padding: 0.25rem 0.5rem; border-radius: 12px;">대시보드</span>
              <span style="font-size: 0.7rem; background: rgba(255,255,255,0.04); padding: 0.25rem 0.5rem; border-radius: 12px;">CRM</span>
              <span style="font-size: 0.7rem; background: rgba(255,255,255,0.04); padding: 0.25rem 0.5rem; border-radius: 12px;">재무</span>
              <span style="font-size: 0.7rem; background: rgba(255,255,255,0.04); padding: 0.25rem 0.5rem; border-radius: 12px;">시스템 설정</span>
            </div>
          </div>

          <div class="glass-card" style="background: rgba(255,255,255,0.01);">
            <h4 style="font-size: 1rem; margin-bottom: 0.5rem;">운영 담당자 (Staff)</h4>
            <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1rem;">프로젝트(사업 계획), 대시보드 조회 및 고객사 정보 조회/수정 권한</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <span style="font-size: 0.7rem; background: rgba(255,255,255,0.04); padding: 0.25rem 0.5rem; border-radius: 12px;">대시보드</span>
              <span style="font-size: 0.7rem; background: rgba(255,255,255,0.04); padding: 0.25rem 0.5rem; border-radius: 12px;">사업 계획</span>
              <span style="font-size: 0.7rem; background: rgba(255,255,255,0.04); padding: 0.25rem 0.5rem; border-radius: 12px;">CRM (조회/수정)</span>
            </div>
          </div>

        </div>
      </div>

      <!-- ==================================
           USER REGISTRATION MODAL
           ================================== -->
      <div id="user-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); z-index: 999; justify-content: center; align-items: center;">
        <div class="glass-card animate-fade" style="width: 450px; padding: 2rem; border: 1px solid var(--glass-edge); background: rgba(15, 23, 42, 0.9);">
          <h3 style="margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 700;">신규 사용자 등록</h3>
          
          <div style="margin-bottom: 1.25rem;">
            <label style="display:block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">사용자명</label>
            <input type="text" id="user-name" placeholder="이름을 입력하세요" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); color: var(--text-main); outline: none;" />
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display:block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">이메일 (ID)</label>
            <input type="email" id="user-email" placeholder="example@dosicare.com" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); color: var(--text-main); outline: none;" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
            <div>
              <label style="display:block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">부서</label>
              <input type="text" id="user-dept" placeholder="예: 개발팀" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); color: var(--text-main); outline: none;" />
            </div>
            <div>
              <label style="display:block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">직함</label>
              <input type="text" id="user-position" placeholder="예: 대리" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); color: var(--text-main); outline: none;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div>
              <label style="display:block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">시스템 권한</label>
              <select id="user-role" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); color: var(--text-main); outline: none;">
                <option value="일반 사용자">일반 사용자</option>
                <option value="재무 담당자">재무 담당자</option>
                <option value="마스터 관리자">마스터 관리자</option>
              </select>
            </div>
            <div>
              <label style="display:block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">상태</label>
              <select id="user-status" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); color: var(--text-main); outline: none;">
                <option value="활성">활성</option>
                <option value="비활성">비활성</option>
              </select>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
            <button id="user-modal-cancel" style="background: transparent; border: 1px solid var(--glass-edge); color: var(--text-main); padding: 0.75rem 1.25rem; border-radius: 10px; cursor: pointer; font-weight: 500;">취소</button>
            <button id="user-modal-save" style="background: var(--secondary-accent); border: none; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);">등록하기</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function initAdminView() {
  const openBtn = document.getElementById('new-user-btn');
  const modal = document.getElementById('user-modal');
  const cancelBtn = document.getElementById('user-modal-cancel');
  const saveBtn = document.getElementById('user-modal-save');
  const tableBody = document.getElementById('user-table-body');

  function renderRows() {
    if (!tableBody) return;
    tableBody.innerHTML = users.map(user => {
      let roleStyle = 'background: rgba(148, 163, 184, 0.1); color: #94a3b8;';
      if (user.role === '마스터 관리자') roleStyle = 'background: rgba(109, 40, 217, 0.1); color: #a855f7;';
      else if (user.role === '재무 담당자') roleStyle = 'background: rgba(14, 165, 233, 0.1); color: #0ea5e9;';

      let statusStyle = 'background: rgba(16, 185, 129, 0.1); color: #10b981;';
      if (user.status === '비활성') statusStyle = 'background: rgba(239, 68, 68, 0.1); color: #ef4444;';

      const initial = user.name.charAt(0);

      // Randomize background for avatar for variety if needed, or keep static
      const colors = ['#ea580c', '#16a34a', '#2563eb', '#7c3aed'];
      const avatarColor = user.id === 1 ? '#2563eb' : (user.id === 2 ? '#ea580c' : '#16a34a'); // match original

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div class="avatar" style="width: 28px; height: 28px; font-size: 0.8rem; background: ${avatarColor};">${initial}</div>
              <span style="font-weight: 600;">${user.name}</span>
            </div>
          </td>
          <td>${user.email}</td>
          <td>${user.dept} / ${user.position}</td>
          <td><span style="${roleStyle} padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${user.role}</span></td>
          <td>${user.date}</td>
          <td><span style="${statusStyle} padding: 0.25rem 0.4rem; border-radius: 20px; font-size: 0.75rem;">${user.status}</span></td>
          <td>
            <div style="display: flex; gap: 0.5rem;">
              <button class="edit-user-btn" data-id="${user.id}" style="background: transparent; border: none; color: var(--secondary-accent); cursor: pointer; font-size: 0.85rem;">수정</button>
              <button class="delete-user-btn" data-id="${user.id}" style="background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.85rem;">삭제</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Delete Listeners
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        if (confirm('정말 삭제하시겠습니까?')) {
          users = users.filter(u => u.id !== id);
          saveUsers();
          renderRows();
        }
      });
    });
  }

  // Initial Render
  renderRows();

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
      // Clear inputs
      document.getElementById('user-name').value = '';
      document.getElementById('user-email').value = '';
      document.getElementById('user-dept').value = '';
      document.getElementById('user-position').value = '';
    });
  }

  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = document.getElementById('user-name').value.trim();
      const email = document.getElementById('user-email').value.trim();
      const dept = document.getElementById('user-dept').value.trim();
      const position = document.getElementById('user-position').value.trim();
      const role = document.getElementById('user-role').value;
      const status = document.getElementById('user-status').value;

      if (!name || !email || !dept || !position) {
        alert('모든 필드를 입력해주세요.');
        return;
      }

      saveBtn.innerText = '등록 중...';
      saveBtn.disabled = true;

      setTimeout(() => {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '.');

        users.unshift({
          id: Date.now(), // simple ID
          name,
          email,
          dept,
          position,
          role,
          date: dateStr,
          status
        });

        saveUsers();
        renderRows();

        modal.style.display = 'none';
        saveBtn.innerText = '등록하기';
        saveBtn.disabled = false;

        // Toast
        const toast = document.createElement('div');
        toast.innerText = '사용자가 등록되었습니다.';
        toast.style = 'position:fixed; bottom: 20px; right: 20px; background: #10b981; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 0.85rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; animation: fade-in-out 3s ease;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);

      }, 500);
    });
  }
}
