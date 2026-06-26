const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 días
const SESSION_EXPIRY_KEY = 'session_expires_at';

export function saveSessionData(data: { token?: string | null; userId?: string | null; userName?: string | null }): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (data.token) {
    localStorage.setItem('token', data.token);
  } else {
    localStorage.removeItem('token');
  }

  if (data.userId) {
    localStorage.setItem('user_id', data.userId);
  } else {
    localStorage.removeItem('user_id');
  }

  if (data.userName) {
    localStorage.setItem('user_name', data.userName);
  } else {
    localStorage.removeItem('user_name');
  }

  localStorage.setItem(SESSION_EXPIRY_KEY, (Date.now() + SESSION_DURATION_MS).toString());
}

export function clearSessionData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_name');
  localStorage.removeItem(SESSION_EXPIRY_KEY);
}

export function hasValidSession(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('token')?.trim();
  const userId = localStorage.getItem('user_id')?.trim();

  if (!token && !userId) {
    return false;
  }

  const expiresAt = Number(localStorage.getItem(SESSION_EXPIRY_KEY) || '0');

  if (expiresAt && Date.now() > expiresAt) {
    clearSessionData();
    return false;
  }

  return true;
}
