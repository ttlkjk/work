import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nlxbimmhevppcxhucgcu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seGJpbW1oZXZwcGN4aHVjZ2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTA2ODEsImV4cCI6MjA4OTU4NjY4MX0.iW1_p3vHzbhVglej1xXNQ9zrw2n6bImzFyKSDNeyXLM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Supabase에서 데이터를 로드합니다. 실패 시 localStorage 폴백.
 * @param {string} key - 데이터 키 (예: 'projects', 'crm_clients')
 * @returns {any|null} 저장된 데이터 또는 null
 */
export async function loadData(key) {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('key', key)
      .single();

    if (error) {
      // PGRST116 = row not found, not a real error
      if (error.code === 'PGRST116') {
        // Try localStorage fallback
        const local = localStorage.getItem(key);
        return local ? JSON.parse(local) : null;
      }
      console.warn(`[Supabase] Load error for "${key}":`, error.message);
      // Fallback to localStorage
      const local = localStorage.getItem(key);
      return local ? JSON.parse(local) : null;
    }

    // Also cache to localStorage for offline access
    if (data?.value !== undefined) {
      localStorage.setItem(key, JSON.stringify(data.value));
    }
    return data?.value ?? null;
  } catch (err) {
    console.warn(`[Supabase] Network error, falling back to localStorage for "${key}"`, err);
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : null;
  }
}

/**
 * Supabase에 데이터를 저장합니다. localStorage에도 동시 캐시.
 * @param {string} key - 데이터 키
 * @param {any} value - 저장할 데이터
 */
export async function saveData(key, value) {
  // Always save to localStorage first (instant, offline-safe)
  localStorage.setItem(key, JSON.stringify(value));

  try {
    const { error } = await supabase
      .from('app_data')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) {
      console.warn(`[Supabase] Save error for "${key}":`, error.message);
    }
  } catch (err) {
    console.warn(`[Supabase] Network error saving "${key}", data saved locally`, err);
  }
}

/**
 * 앱 시작 시 모든 데이터를 Supabase에서 로드하여 localStorage에 캐시합니다.
 */
export async function syncAllData() {
  try {
    const { data, error } = await supabase
      .from('app_data')
      .select('key, value');

    if (error) {
      console.warn('[Supabase] Sync error:', error.message);
      return false;
    }

    if (data && data.length > 0) {
      data.forEach(row => {
        localStorage.setItem(row.key, JSON.stringify(row.value));
      });
      return true;
    }

    // No data in Supabase yet, push localStorage data up
    await pushLocalDataToSupabase();
    return true;
  } catch (err) {
    console.warn('[Supabase] Network error during sync', err);
    return false;
  }
}

/**
 * 기존 localStorage 데이터를 Supabase로 업로드합니다. (최초 마이그레이션)
 */
async function pushLocalDataToSupabase() {
  const keys = ['projects', 'crm_clients', 'financeItems', 'financeSummary', 'hospitalGoals', 'admin_users'];
  
  for (const key of keys) {
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const value = JSON.parse(local);
        await supabase
          .from('app_data')
          .upsert(
            { key, value, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          );
      } catch (e) {
        console.warn(`[Supabase] Push failed for "${key}"`, e);
      }
    }
  }
}
