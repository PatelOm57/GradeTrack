export type StorageMode = 'local' | 'cloud';

const MODE_COOKIE_NAME = 'gradetrack_mode';

export function getStorageMode(): StorageMode {
  if (typeof window === 'undefined') return 'local';

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${MODE_COOKIE_NAME}=`);
  if (parts.length === 2) {
    const mode = parts.pop()?.split(';').shift();
    if (mode === 'cloud' || mode === 'local') return mode;
  }
  return 'local';
}

export function setStorageMode(mode: StorageMode): void {
  document.cookie = `${MODE_COOKIE_NAME}=${mode}; path=/; max-age=31536000; SameSite=Lax`;
  window.location.reload();
}