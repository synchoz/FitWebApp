import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL + "/api/users/";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// Reads/writes localStorage directly (rather than importing auth.service) to
// avoid a circular dependency, since auth.service itself uses this instance.
function getStoredUser() {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
}

function storeRefreshedTokens(accessToken, refreshToken) {
    const current = getStoredUser() || {};
    localStorage.setItem("user", JSON.stringify({ ...current, accessToken, refreshToken }));
}

function clearSessionAndRedirect() {
    localStorage.removeItem("user");
    if (window.location.pathname !== "/") {
        window.location.href = "/";
    }
}

// Reads a JWT's exp claim without verifying the signature (verification is the
// server's job) — used only to decide whether a proactive refresh is worth attempting.
function decodeJwtExpiryMs(token) {
    try {
        const payload = token.split(".")[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const { exp } = JSON.parse(atob(base64));
        return exp ? exp * 1000 : null;
    } catch {
        return null;
    }
}

axiosInstance.interceptors.request.use((config) => {
    const user = getStoredUser();
    if (user && user.accessToken) {
        config.headers["x-access-token"] = user.accessToken;
    }
    return config;
});

// Bypasses axiosInstance (plain axios) so this call never re-enters the
// interceptors below, and is shared so concurrent 401s only trigger one refresh.
let pendingRefresh = null;
function refreshAccessToken(refreshToken) {
    if (!pendingRefresh) {
        pendingRefresh = axios
            .post(API_BASE_URL + "refresh-token", { refreshToken })
            .then((response) => {
                storeRefreshedTokens(response.data.accessToken, response.data.refreshToken);
                return response.data.accessToken;
            })
            .finally(() => {
                pendingRefresh = null;
            });
    }
    return pendingRefresh;
}

// On a 401, try a silent refresh-and-retry once before giving up; only then
// clear the stale session and send the user back to the login page.
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;
        const isAuthEndpoint = config && (config.url === "login" || config.url === "refresh-token");

        if (response && response.status === 401 && config && !config._retriedAfterRefresh && !isAuthEndpoint) {
            const user = getStoredUser();
            if (user && user.refreshToken) {
                config._retriedAfterRefresh = true;
                try {
                    const newAccessToken = await refreshAccessToken(user.refreshToken);
                    config.headers["x-access-token"] = newAccessToken;
                    return axiosInstance(config);
                } catch (refreshError) {
                    // Falls through to the session-clearing block below.
                }
            }
        }

        if (response && response.status === 401) {
            clearSessionAndRedirect();
        }
        return Promise.reject(error);
    }
);

// A tab left open and backgrounded for a long time (e.g. overnight) never makes a
// new request on its own, so a dead refresh token just leaves stale dashboard
// content on screen indefinitely. Re-validate as soon as the tab is looked at again.
if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState !== "visible") {
            return;
        }
        const user = getStoredUser();
        if (!user || !user.refreshToken || !user.accessToken) {
            return;
        }
        const expiryMs = decodeJwtExpiryMs(user.accessToken);
        if (expiryMs && expiryMs > Date.now()) {
            return;
        }
        refreshAccessToken(user.refreshToken).catch(clearSessionAndRedirect);
    });
}

export default axiosInstance;
