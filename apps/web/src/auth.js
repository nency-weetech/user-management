const AUTH_ACCESS_TOKEN_KEY = 'accessToken';
const AUTH_REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_USER_NAME_KEY = 'authUserName';

function getToken() {
  return localStorage.getItem(AUTH_ACCESS_TOKEN_KEY) || '';
}

function setToken(accessToken, refreshToken, userName) {
  localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken)
  if (userName) {
    localStorage.setItem(AUTH_USER_NAME_KEY, userName);
  }
}

function getRefreshToken() {
  return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) || '';
}

function setRefreshToken(token) {
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, token);
}

function getUserName() {
  return localStorage.getItem(AUTH_USER_NAME_KEY) || '';
}

function clearToken() {
  localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_NAME_KEY);
}

function isLoggedIn() {
  return !!getToken();
}

function requireAuth(redirectTo = 'index.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
  }
}

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function signOut(redirectTo = 'index.html') {
  clearToken();
  window.location.href = redirectTo;
}
