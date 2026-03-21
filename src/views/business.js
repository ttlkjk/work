import { saveData } from '../supabase.js';

let projects = JSON.parse(localStorage.getItem('projects')) || [
  {
    id: 1,
    name: 'ERP 시스템 구축',
    description: '인프라 세팅 및 핵심 모듈 데이터베이스 연동 및 기초 아키텍처 설계 합의 단계.',
    team: '운영기획팀',
    progress: 100,
    schedules: [
      { id: 101, content: '기획 완료', startDate: '2026-03-16', endDate: '2026-03-18', color: 'linear-gradient(90deg, #6366f1, #0ea5e9)', desc: '데이터베이스 연동 및 기초 아키텍처 설계 완료' }
    ]
  },
  {
    id: 2,
    name: 'ERP 대시보드 고도화',
    description: '시각화 차트 적용 및 고객 이력 관리 자동화 기능 배포 작업 수행 중.',
    team: '개발팀',
    progress: 65,
    schedules: [
      { id: 201, content: '레이아웃 확정', startDate: '2026-03-16', endDate: '2026-03-18', color: '#0ea5e9', desc: '대시보드 주요 레이아웃 및 컴포넌트 구조 확정' },
      { id: 202, content: '데이터 연동', startDate: '2026-03-20', endDate: '2026-03-21', color: '#10b981', desc: '실시간 데이터 스트리밍 연동 테스트' }
    ]
  },
  {
    id: 3,
    name: 'UI 스타일 가이드 고정',
    description: '전사 공통 디자인 시스템 구축 및 가이드라인 정립.',
    team: '디자인팀',
    progress: 30,
    schedules: [
      { id: 301, content: 'CSS 클러스터', startDate: '2026-03-16', endDate: '2026-03-17', color: '#6d28d9', desc: 'Tailwind 기반 유틸리티 클래스 최적화' }
    ]
  },
  {
    id: 4,
    name: '백엔드 API 라우팅',
    description: 'Node.js 기반 RESTful API 설계 및 문서화.',
    team: '개발팀',
    progress: 0,
    schedules: [
      { id: 401, content: '인증 모듈 연결', startDate: '2026-03-17', endDate: '2026-03-19', color: '#a855f7', desc: 'JWT 기반 인증 및 권한 부여 로직 구현' }
    ]
  }
];

const ganttPalette = [
  'linear-gradient(90deg, #6366f1, #0ea5e9)', // Blue/Indigo
  '#0ea5e9', // Light Blue
  '#10b981', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#6d28d9', // Dark Purple
  '#a855f7', // Light Purple
  '#ec4899'  // Pink
];

// Migration: Convert legacy start/duration to startDate/endDate
projects.forEach(p => {
  p.schedules.forEach(s => {
    if (s.start && !s.startDate) {
      const baseDate = new Date('2026-03-16'); // Mon
      const startD = new Date(baseDate);
      startD.setDate(baseDate.getDate() + (s.start - 2));
      const endD = new Date(startD);
      endD.setDate(startD.getDate() + (s.duration - 1));
      const toYMD = (d) => d.toISOString().split('T')[0];
      s.startDate = toYMD(startD);
      s.endDate = toYMD(endD);
    }
  });
});

function saveProjects() {
  localStorage.setItem('projects', JSON.stringify(projects));
  saveData('projects', projects);
}

export function reloadBusinessData() {
  const stored = localStorage.getItem('projects');
  if (stored) projects = JSON.parse(stored);
}

function renderGantt(scale, weekOffset = 0) {
  const colCount = scale === 'monthly' ? 12 : scale === 'weekly' ? 8 : 7;

  // Normalize to local midnight
  const normalizeDate = (d) => {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const today = normalizeDate(todayStr);

  const headers = [];
  const dateMap = [];

  if (scale === 'daily') {
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    const Monday = new Date(today);
    Monday.setDate(today.getDate() - (dayOfWeek - 1) + (weekOffset * 7));
    const days = ['월', '화', '수', '목', '금', '토', '일'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Monday);
      d.setDate(Monday.getDate() + i);
      const isToday = normalizeDate(d).getTime() === today.getTime();
      headers.push(`${days[i]}(${d.getDate()})${isToday ? ' [오늘]' : ''}`);
      dateMap.push({ start: normalizeDate(d), end: normalizeDate(d) });
    }
  } else if (scale === 'weekly') {
    // weekOffset shifts by 8-week blocks
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    const Monday = new Date(today);
    Monday.setDate(today.getDate() - (dayOfWeek - 1) + (weekOffset * 8 * 7));
    for (let i = 0; i < 8; i++) {
      const d = new Date(Monday);
      d.setDate(Monday.getDate() + (i * 7));
      const month = d.getMonth() + 1;
      const weekNum = Math.ceil(d.getDate() / 7);
      headers.push(`${month}월 ${weekNum}주`);
      const weekEnd = new Date(d);
      weekEnd.setDate(d.getDate() + 6);
      dateMap.push({ start: normalizeDate(d), end: normalizeDate(weekEnd) });
    }
  } else {
    // weekOffset shifts by year for monthly view
    const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
    const targetYear = today.getFullYear() + weekOffset;
    for (let i = 0; i < 12; i++) {
      headers.push(months[i]);
      dateMap.push({
        start: normalizeDate(new Date(targetYear, i, 1)),
        end: normalizeDate(new Date(targetYear, i + 1, 0))
      });
    }
  }


  let html = `
    <div style="display: grid; grid-template-columns: 200px repeat(${colCount}, 1fr); gap: 1px; background: var(--glass-border); border-radius: 12px; overflow: hidden; border: 1px solid var(--glass-border);">
      <div style="background: rgba(255,255,255,0.02); padding: 1rem; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">프로젝트명</div>
      ${headers.map(h => {
        const isToday = h.includes('[오늘]');
        const style = isToday 
          ? "background: rgba(14, 165, 233, 0.1); color: var(--secondary-accent); font-weight: 700; padding: 1rem; text-align: center; font-size: 0.85rem; border-bottom: 2px solid var(--secondary-accent);" 
          : "background: rgba(255,255,255,0.02); padding: 1rem; text-align: center; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);";
        return `<div style="${style}">${h}</div>`;
      }).join('')}
  `;

  projects.forEach(project => {
    const schedulePositions = project.schedules.map(s => {
      const sStart = normalizeDate(s.startDate);
      const sEnd = normalizeDate(s.endDate);
      
      let gridStart = -1;
      let gridSpan = 0;

      for (let i = 0; i < dateMap.length; i++) {
        const colStart = dateMap[i].start;
        const colEnd = dateMap[i].end;

        if (sStart <= colEnd && sEnd >= colStart) {
          if (gridStart === -1) gridStart = i + 2;
          gridSpan++;
        }
      }

      return { ...s, gridStart, gridSpan };
    }).filter(sp => sp.gridStart !== -1);

    const tracks = [];
    const sortedSchedules = [...schedulePositions].sort((a, b) => a.gridStart - b.gridStart);
    
    sortedSchedules.forEach(s => {
      let placed = false;
      for (let i = 0; i < tracks.length; i++) {
        const lastInTrack = tracks[i][tracks[i].length - 1];
        if (s.gridStart >= (lastInTrack.gridStart + lastInTrack.gridSpan)) {
          tracks[i].push(s);
          placed = true;
          break;
        }
      }
      if (!placed) {
        tracks.push([s]);
      }
    });

    if (tracks.length === 0) tracks.push([]);

    html += `
      <div class="edit-project-name" data-id="${project.id}" style="background: var(--bg-color); padding: 1rem; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; cursor: pointer; border-right: 1px solid var(--glass-border); position: relative; min-height: 50px; grid-row: span ${tracks.length};">
        ${project.name}
      </div>
    `;

    tracks.forEach((trackSchedules, trackIdx) => {
      for (let i = 1; i <= colCount; i++) {
        const colIdx = i + 1;
        const s = trackSchedules.find(x => x.gridStart === colIdx);
        
        if (s) {
          html += `
            <div class="gantt-cell" style="background: var(--bg-color); grid-column: ${colIdx} / span ${s.gridSpan}; padding: 4px 0; position: relative; min-height: 40px; display: flex; align-items: center;">
              <div class="edit-target" data-project-id="${project.id}" data-schedule-id="${s.id}" title="${s.desc}" style="width: 100%; background: ${s.color}; color: white; padding: 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-align: center; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin: 0 4px;">
                ${s.content}
              </div>
            </div>
          `;
          i += (s.gridSpan - 1); 
        } else {
          const isCovered = trackSchedules.some(ts => colIdx > ts.gridStart && colIdx < ts.gridStart + ts.gridSpan);
          if (!isCovered) {
             const d = dateMap[i-1].start;
             const cellDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
             html += `
              <div class="gantt-cell clickable-cell" data-project-id="${project.id}" data-date="${cellDate}" style="background: var(--bg-color); height: 40px; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid rgba(255,255,255,0.02);" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='var(--bg-color)'"></div>
            `;
          }
        }
      }
    });
  });

  html += `</div>`;
  return html;
}

export function renderBusiness() {
  return `
    <div class="animate-fade">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 1.875rem; font-weight: 700;">사업 계획 및 로드맵</h1>
          <p style="color: var(--text-muted); margin-top: 0.25rem;">연간 프로젝트 타임라인 및 마일스톤을 다각도 스케일로 관리합니다.</p>
        </div>
        <button id="new-project-btn" style="background: var(--secondary-accent); color: #fff; border: none; padding: 0.75rem 1.25rem; border-radius: 10px; font-weight: 600; cursor: pointer;">
          <i class="fa-solid fa-folder-plus" style="margin-right: 0.5rem;"></i> 신규 프로젝트
        </button>
      </div>

      <!-- Scale Toggle Controls -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.1rem; font-weight: 600;">프로젝트 로드맵</h3>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <!-- Week Navigation (daily view only) -->
          <div id="week-nav" style="display: flex; align-items: center; gap: 0.5rem;">
            <button id="prev-week-btn" style="background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--glass-border); padding: 0.4rem 0.75rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'"><i class="fa-solid fa-chevron-left"></i></button>
            <span id="week-label" style="font-size: 0.82rem; color: var(--text-muted); min-width: 120px; text-align: center; font-weight: 500;">이번 주</span>
            <button id="next-week-btn" style="background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--glass-border); padding: 0.4rem 0.75rem; border-radius: 6px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
          <div class="scale-controls" style="display: flex; background: rgba(255,255,255,0.05); padding: 4px; border-radius: 8px; border: 1px solid var(--glass-border);">
            <button class="scale-btn active" data-scale="daily" style="background: var(--secondary-accent); color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">일별</button>
            <button class="scale-btn" data-scale="weekly" style="background: transparent; color: var(--text-muted); border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s;">주별</button>
            <button class="scale-btn" data-scale="monthly" style="background: transparent; color: var(--text-muted); border: none; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s;">월별</button>
          </div>
        </div>
      </div>

      <!-- Gantt Views -->
      <div id="gantt-monthly" class="gantt-view glass-card" style="padding: 1.5rem; overflow-x: auto; display: none;">
        ${renderGantt('monthly')}
      </div>

      <div id="gantt-weekly" class="gantt-view glass-card" style="padding: 1.5rem; overflow-x: auto; display: none;">
        ${renderGantt('weekly')}
      </div>

      <div id="gantt-daily" class="gantt-view glass-card" style="padding: 1.5rem; overflow-x: auto;">
        ${renderGantt('daily', 0)}
      </div>

      <!-- ==================================
           4. EDIT PROJECT MODAL (팝업)
           ================================== -->
      <div id="edit-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); z-index: 999; flex-direction: column; align-items: center; justify-content: flex-start !important; overflow-y: auto; padding: 120px 20px;">
        <div class="glass-card animate-fade" style="width: 520px; padding: 2.5rem; border: 1px solid #e2e8f0; background: rgba(255, 255, 255, 0.98); margin-bottom: 100px; position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.3); color: #0f172a;">
          <h3 style="margin-top: 0; margin-bottom: 1.5rem; font-size: 1.25rem; font-weight: 700; color: #0f172a;">프로젝트 수정</h3>
          
          <div style="margin-bottom: 1rem;">
            <label style="display:block; font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; font-weight: 500;">프로젝트명</label>
            <input type="text" id="edit-title" value="ERP 시스템 구축" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; outline: none;" />
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display:block; font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; font-weight: 500;">상세 설명</label>
            <textarea id="edit-desc" rows="2" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; outline: none; font-family: inherit;">데이터베이스 연동 및 기초 아키텍처 설계 완료</textarea>
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display:block; font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; font-weight: 500;">일정 내용</label>
            <input type="text" id="edit-schedule-content" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; outline: none;" />
          </div>

          <div style="margin-bottom: 1rem;">
            <label style="display:block; font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; font-weight: 500;">일정 상세 내용</label>
            <textarea id="edit-schedule-desc" rows="2" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; outline: none; font-family: inherit;"></textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div>
              <label style="display:block; font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; font-weight: 500;">진행률 (%)</label>
              <input type="number" id="edit-progress" value="100" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a;" />
            </div>
            <div>
              <label style="display:block; font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; font-weight: 500;">담당 팀</label>
              <select id="edit-team" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; outline: none;">
                <option value="운영기획팀">운영기획팀</option>
                <option value="개발팀">개발팀</option>
                <option value="디자인팀">디자인팀</option>
              </select>
            </div>
            <div>
               <label style="display:block; font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; font-weight: 500;">색상 테마</label>
               <select id="edit-color" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; outline: none;">
                 <option value="linear-gradient(90deg, #6366f1, #0ea5e9)">블루 그라데이션</option>
                 <option value="#0ea5e9">라이트 블루</option>
                 <option value="#10b981">그린</option>
                 <option value="#f59e0b">오렌지</option>
                 <option value="#ef4444">레드</option>
                 <option value="#6d28d9">퍼플</option>
                 <option value="#a855f7">라이트 퍼플</option>
                 <option value="#ec4899">핑크</option>
               </select>
            </div>
            <div>
              <label style="display:block; font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; font-weight: 500;">시작일</label>
              <input type="date" id="edit-start-date" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; outline: none;" />
            </div>
            <div>
              <label style="display:block; font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; font-weight: 500;">종료일</label>
              <input type="date" id="edit-start-end" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; outline: none;" />
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: space-between;">
            <button id="modal-delete" style="background: rgba(239, 68, 68, 0.05); border: 1px solid #ef4444; color: #ef4444; padding: 0.75rem 1.25rem; border-radius: 10px; cursor: pointer; font-weight: 500;">삭제</button>
            <div style="display: flex; gap: 0.75rem;">
              <button id="modal-cancel" style="background: transparent; border: 1px solid #cbd5e1; color: #475569; padding: 0.75rem 1.25rem; border-radius: 10px; cursor: pointer; font-weight: 500;">취소</button>
              <button id="modal-save" style="background: var(--secondary-accent); border: none; color: #fff; padding: 0.75rem 1.5rem; border-radius: 10px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);">저장하기</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

// Client-side execution hook
export function initBusinessView() {
  const buttons = document.querySelectorAll('.scale-btn');
  const views = document.querySelectorAll('.gantt-view');
  const modal = document.getElementById('edit-modal');
  const modalCancel = document.getElementById('modal-cancel');
  const modalSave = document.getElementById('modal-save');
  const modalDelete = document.getElementById('modal-delete');
  const modalHeader = modal ? modal.querySelector('h3') : null;
  const newProjectBtn = document.getElementById('new-project-btn');

  let activeScale = 'daily';
  let currentProjectId = null;
  let currentScheduleId = null;
  let isNewProject = false;
  let isNewSchedule = false;
  let weekOffset = 0;

  const getWeekLabel = (offset) => {
    const now = new Date();
    const dow = now.getDay() === 0 ? 7 : now.getDay();
    const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;

    if (activeScale === 'daily') {
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dow - 1) + (offset * 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      if (offset === 0) return `이번 주 (${fmt(monday)}~${fmt(sunday)})`;
      if (offset === 1) return `다음 주 (${fmt(monday)}~${fmt(sunday)})`;
      if (offset === -1) return `지난 주 (${fmt(monday)}~${fmt(sunday)})`;
      return `${offset > 0 ? '+' : ''}${offset}주 (${fmt(monday)}~${fmt(sunday)})`;
    } else if (activeScale === 'weekly') {
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dow - 1) + (offset * 8 * 7));
      const end = new Date(monday);
      end.setDate(monday.getDate() + 55); // 8 weeks - 1 day
      if (offset === 0) return `이번 기간 (${fmt(monday)}~${fmt(end)})`;
      if (offset === 1) return `다음 기간 (${fmt(monday)}~${fmt(end)})`;
      if (offset === -1) return `이전 기간 (${fmt(monday)}~${fmt(end)})`;
      return `${offset > 0 ? '+' : ''}${offset}기간 (${fmt(monday)}~${fmt(end)})`;
    } else {
      const year = now.getFullYear() + offset;
      if (offset === 0) return `올해 (${year}년)`;
      if (offset === 1) return `내년 (${year}년)`;
      if (offset === -1) return `작년 (${year}년)`;
      return `${year}년`;
    }
  };

  const updateWeekLabel = () => {
    const label = document.getElementById('week-label');
    if (label) label.textContent = getWeekLabel(weekOffset);
  };

  const refreshGantt = () => {
    views.forEach(view => {
      const scale = view.id.replace('gantt-', '');
      view.innerHTML = renderGantt(scale, weekOffset);
      view.style.display = scale === activeScale ? 'block' : 'none';
    });
    updateWeekLabel();
    // Re-bind listeners after innerHTML change
    bindGridListeners();
  };

  const bindGridListeners = () => {
    // Project Name Clicks
    document.querySelectorAll('.edit-project-name').forEach(el => {
      el.onclick = (e) => {
        const id = parseInt(el.getAttribute('data-id'));
        openProjectModal(id);
      };
    });

    // Schedule Bar Clicks
    document.querySelectorAll('.edit-target').forEach(el => {
      el.onclick = (e) => {
        e.stopPropagation();
        const pid = parseInt(el.getAttribute('data-project-id'));
        const sid = parseInt(el.getAttribute('data-schedule-id'));
        openScheduleModal(pid, sid);
      };
    });

    // Empty Cell Clicks (Fast Add)
    document.querySelectorAll('.clickable-cell').forEach(el => {
      el.onclick = (e) => {
        const pid = parseInt(el.getAttribute('data-project-id'));
        const date = el.getAttribute('data-date');
        openScheduleModal(pid, null, date);
      };
    });
  };

  const updateDropdowns = (activeScale) => {
    // Dropdowns are no longer used for dates
  };

  const openProjectModal = (id) => {
    resetDeleteBtn();
    if (modal) modal.scrollTop = 0;
    isNewProject = id === null;
    isNewSchedule = false;
    currentProjectId = id;
    currentScheduleId = null;

    if (modalHeader) modalHeader.innerText = isNewProject ? '신규 프로젝트 생성' : '프로젝트 수정';
    
    // UI Toggle
    document.getElementById('edit-schedule-content').parentElement.style.display = isNewProject ? 'block' : 'none';
    document.getElementById('edit-schedule-desc').parentElement.style.display = isNewProject ? 'block' : 'none';
    
    // Grid sub-fields control
    const colorField = document.getElementById('edit-color').parentElement;
    const startField = document.getElementById('edit-start-date').parentElement;
    const endField = document.getElementById('edit-start-end').parentElement;
    
    colorField.style.display = isNewProject ? 'block' : 'none';
    startField.style.display = isNewProject ? 'block' : 'none';
    endField.style.display = isNewProject ? 'block' : 'none';
    
    // Ensure the grid itself is always visible as it contains team and progress
    document.getElementById('edit-team').parentElement.parentElement.style.display = 'grid';
    
    if (isNewProject) {
      document.getElementById('edit-title').value = '';
      document.getElementById('edit-desc').value = '';
      document.getElementById('edit-team').value = '운영기획팀';
      document.getElementById('edit-schedule-content').value = '';
      document.getElementById('edit-schedule-desc').value = '';
      document.getElementById('edit-color').value = ganttPalette[0]; 
      document.getElementById('edit-start-date').value = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 2);
      document.getElementById('edit-start-end').value = nextWeek.toISOString().split('T')[0];
    } else {
      const p = projects.find(x => x.id === id);
      if (p) {
        document.getElementById('edit-title').value = p.name;
        document.getElementById('edit-desc').value = p.description;
        document.getElementById('edit-team').value = p.team || '운영기획팀';
        document.getElementById('edit-progress').value = p.progress || 0;
      }
    }
    
    if (modalDelete) modalDelete.style.display = isNewProject ? 'none' : 'block';
    if (modal) modal.style.display = 'flex';
  };

  const openScheduleModal = (pid, sid, startDate = null) => {
    resetDeleteBtn();
    if (modal) modal.scrollTop = 0;
    isNewProject = false;
    isNewSchedule = sid === null;
    currentProjectId = pid;
    currentScheduleId = sid;

    if (modalHeader) modalHeader.innerText = isNewSchedule ? '새 일정 추가' : '일정 내용 수정';
    
    // Field visibility control
    document.getElementById('edit-title').parentElement.style.display = 'none';
    document.getElementById('edit-desc').parentElement.style.display = 'none';
    
    document.getElementById('edit-schedule-content').parentElement.style.display = 'block';
    document.getElementById('edit-schedule-desc').parentElement.style.display = 'block';
    
    const colorField = document.getElementById('edit-color').parentElement;
    const startField = document.getElementById('edit-start-date').parentElement;
    const endField = document.getElementById('edit-start-end').parentElement;
    const teamField = document.getElementById('edit-team').parentElement;
    const progressField = document.getElementById('edit-progress').parentElement;
    
    colorField.style.display = 'block';
    startField.style.display = 'block';
    endField.style.display = 'block';
    teamField.style.display = 'none'; // Not needed for schedule edit
    progressField.style.display = 'block'; // KEEP PROGRESS VISIBLE
    
    document.getElementById('edit-team').parentElement.parentElement.style.display = 'grid';
    
    const p = projects.find(x => x.id === pid);
    if (isNewSchedule) {
      document.getElementById('edit-schedule-content').value = '';
      document.getElementById('edit-schedule-desc').value = '';
      document.getElementById('edit-start-date').value = startDate || new Date().toISOString().split('T')[0];
      document.getElementById('edit-start-end').value = startDate || new Date().toISOString().split('T')[0];
      
      // Auto-assign next color based on LAST schedule's color for better variety
      let nextIndex = 0;
      if (p.schedules.length > 0) {
        const lastColor = p.schedules[p.schedules.length - 1].color;
        const lastIdx = ganttPalette.indexOf(lastColor);
        if (lastIdx !== -1) {
          nextIndex = (lastIdx + 1) % ganttPalette.length;
        } else {
          nextIndex = p.schedules.length % ganttPalette.length;
        }
      }
      document.getElementById('edit-color').value = ganttPalette[nextIndex];
    } else {
      const s = p.schedules.find(x => x.id === sid);
      if (s) {
        document.getElementById('edit-schedule-content').value = s.content;
        document.getElementById('edit-schedule-desc').value = s.desc || '';
        document.getElementById('edit-start-date').value = s.startDate;
        document.getElementById('edit-start-end').value = s.endDate;
        document.getElementById('edit-color').value = s.color;
      }
    }

    if (modalDelete) modalDelete.style.display = 'block';
    if (modal) modal.style.display = 'flex';
  };

  // 1. Scale Toggles
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.style.background = 'transparent';
        b.style.color = 'var(--text-muted)';
        b.classList.remove('active');
      });
      btn.style.background = 'var(--secondary-accent)';
      btn.style.color = '#fff';
      btn.classList.add('active');

      activeScale = btn.getAttribute('data-scale');
      weekOffset = 0; // reset offset when switching scale
      refreshGantt();
    });
  });

  // 2. Prev/Next Week Buttons
  const prevWeekBtn = document.getElementById('prev-week-btn');
  const nextWeekBtn = document.getElementById('next-week-btn');

  if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', () => {
      weekOffset--;
      refreshGantt();
    });
  }
  if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', () => {
      weekOffset++;
      refreshGantt();
    });
  }

  // Initialize week label
  updateWeekLabel();

  // New Project
  if (newProjectBtn) {
    newProjectBtn.onclick = () => {
      // Reset visibility for full project create
      document.getElementById('edit-title').parentElement.style.display = 'block';
      document.getElementById('edit-desc').parentElement.style.display = 'block';
      document.getElementById('edit-team').parentElement.parentElement.style.display = 'grid';
      openProjectModal(null);
    };
  }

  // Cancel
  if (modalCancel) {
    modalCancel.onclick = () => modal.style.display = 'none';
  }

  // Delete
  if (modalDelete) {
    modalDelete.onclick = () => {
      if (isNewProject) {
        modal.style.display = 'none';
        return;
      }

      // 2-step confirmation logic
      if (!modalDelete.dataset.confirmed) {
        modalDelete.dataset.confirmed = 'true';
        modalDelete.innerText = '정말 삭제?';
        modalDelete.style.background = '#ef4444';
        modalDelete.style.color = '#fff';
        return;
      }

      // Actual Delete
      if (currentScheduleId) {
        const p = projects.find(x => x.id === currentProjectId);
        if (p) {
          p.schedules = p.schedules.filter(s => s.id !== currentScheduleId);
          showToast('일정이 삭제되었습니다.');
        }
      } else if (currentProjectId) {
        projects = projects.filter(x => x.id !== currentProjectId);
        showToast('프로젝트가 삭제되었습니다.');
      }

      saveProjects();
      refreshGantt();
      resetDeleteBtn();
      modal.style.display = 'none';
    };
  }

  function resetDeleteBtn() {
    if (modalDelete) {
      delete modalDelete.dataset.confirmed;
      modalDelete.innerText = '삭제';
      modalDelete.style.background = 'rgba(239, 68, 68, 0.1)';
      modalDelete.style.border = '1px solid #ef4444';
      modalDelete.style.color = '#ef4444';
    }
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.innerText = msg;
    toast.style = 'position:fixed; bottom: 20px; right: 20px; background: #ef4444; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 0.85rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; animation: fade-in;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // Save
  if (modalSave) {
    modalSave.onclick = () => {
      if (isNewProject) {
        const newProj = {
          id: Date.now(),
          name: document.getElementById('edit-title').value,
          description: document.getElementById('edit-desc').value,
          team: document.getElementById('edit-team').value,
          progress: parseInt(document.getElementById('edit-progress').value) || 0,
          schedules: [{
            id: Date.now() + 1,
            content: document.getElementById('edit-schedule-content').value || '기획',
            startDate: document.getElementById('edit-start-date').value,
            endDate: document.getElementById('edit-start-end').value,
            color: document.getElementById('edit-color').value,
            desc: document.getElementById('edit-schedule-desc').value
          }]
        };
        projects.push(newProj);
      } else if (isNewSchedule) {
        const p = projects.find(x => x.id === currentProjectId);
        p.schedules.push({
          id: Date.now(),
          content: document.getElementById('edit-schedule-content').value,
          startDate: document.getElementById('edit-start-date').value,
          endDate: document.getElementById('edit-start-end').value,
          color: document.getElementById('edit-color').value,
          desc: document.getElementById('edit-schedule-desc').value
        });
      } else {
        const p = projects.find(x => x.id === currentProjectId);
        if (p) {
          // Always update project-level progress if field exists
          const progressInput = document.getElementById('edit-progress');
          if (progressInput) {
            p.progress = parseInt(progressInput.value) || 0;
          }

          if (currentScheduleId) {
            const s = p.schedules.find(x => x.id === currentScheduleId);
            s.content = document.getElementById('edit-schedule-content').value;
            s.desc = document.getElementById('edit-schedule-desc').value;
            s.startDate = document.getElementById('edit-start-date').value;
            s.endDate = document.getElementById('edit-start-end').value;
            s.color = document.getElementById('edit-color').value;
          } else {
            p.name = document.getElementById('edit-title').value;
            p.description = document.getElementById('edit-desc').value;
            p.team = document.getElementById('edit-team').value;
          }
        }
      }

      saveProjects();
      refreshGantt();
      modal.style.display = 'none';
      
      const toast = document.createElement('div');
      toast.innerText = '성공적으로 저장되었습니다.';
      toast.style = 'position:fixed; bottom: 20px; right: 20px; background: #10b981; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 0.85rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 9999; animation: fade-in;';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    };
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = 'none';
    };
  }

  // Initial Bind
  bindGridListeners();
  updateDropdowns(activeScale);
}
