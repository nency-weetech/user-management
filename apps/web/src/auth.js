const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_NAME_KEY = 'authUserName';
 // shared base URL, so pages don't redeclare it

function getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

function setToken(token, userName) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (userName) {
        localStorage.setItem(AUTH_USER_NAME_KEY, userName);
    }
}

function getUserName() {
    return localStorage.getItem(AUTH_USER_NAME_KEY) || '';
}

function clearToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
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
                .map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
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

