import axiosInstance from "../axiosInstance";

function login(email, password) {
        return axiosInstance
            .post('login', {
                email,
                password
            })
            .then(response => {
                if(response.data.accessToken) {
                    localStorage.setItem("user", JSON.stringify(response.data));
                }

                return response.data;
            });
}

function register(username, email, password) {
    return axiosInstance
            .post('register', {
                username,
                email,
                password
            })
            .then(response => {
                return response.data;
            });
}

function logout() {
    // Attach the still-present refresh token to revoke it server-side before clearing it locally.
    const rawUser = localStorage.getItem("user");
    const refreshToken = rawUser ? JSON.parse(rawUser).refreshToken : undefined;

    return axiosInstance
            .post('logout', { refreshToken })
            .catch(() => {})
            .finally(() => {
                localStorage.removeItem("user");
            });
}

function getCurrentUser() {
    return localStorage.getItem("user");
}

function isAdmin() {
    const rawUser = getCurrentUser();
    if (!rawUser) {
        return false;
    }
    try {
        return JSON.parse(rawUser).role === "admin";
    } catch {
        return false;
    }
}

function forgotPassword(email) {
    return axiosInstance
            .post('forgot-password', { email })
            .then(response => {
                return response.data;
            });
}

function resetPassword(token, newPassword) {
    return axiosInstance
            .post('reset-password', { token, newPassword })
            .then(response => {
                return response.data;
            });
}

function updateUserDetails(
email,
address,
phonenumber,
weight,
gender,
fullname) {
    return axiosInstance
            .post('updateUserDetails', {
                email,
                address,
                phonenumber,
                weight,
                gender,
                fullname
            })
            .then(response => {
                return response.data;
            });
}

export default {
    login,
    logout,
    register,
    getCurrentUser,
    isAdmin,
    updateUserDetails,
    forgotPassword,
    resetPassword,
}