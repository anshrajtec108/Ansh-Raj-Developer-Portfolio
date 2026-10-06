export const login = (password: string): boolean => {
  if (password === 'ansh@admin') {
    const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours
    localStorage.setItem('portfolio:auth', expiresAt.toString());
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem('portfolio:auth');
};

export const isAuthenticated = (): boolean => {
  const expiresAtStr = localStorage.getItem('portfolio:auth');
  if (!expiresAtStr) return false;
  
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || new Date().getTime() > expiresAt) {
    logout();
    return false;
  }
  
  return true;
};
