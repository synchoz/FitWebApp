import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL + "/api/users/";


function login(email, password) {
        return axios
            .post(API_URL + 'login', {
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
    return axios
            .post(API_URL + 'register', {
                username,
                email,
                password
            })
            .then(response => {
                return response.data;
            });
}

function logout() {
    localStorage.removeItem("user");
    /* make a post request to server via api */
}

function getCurrentUser() {
    return localStorage.getItem("user");
}

function updateUserDetails(
username,
email,
address,
phonenumber,
weight,
gender,
fullname) {
    return axios
            .post(API_URL + 'updateUserDetails', {
                username,
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
    updateUserDetails,
}