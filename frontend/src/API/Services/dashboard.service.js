import axios from "axios";

const API_URL = 'http://localhost:4000/api/users/'

function getUserInfo(username) {
    return axios
            .get(API_URL + `getUserInfo/${username}`)
            .then(response => {
                return response.data;
            });
}

function upload(formData,username) {
    console.log('data that was sent to upload');
    formData.append('username',username);
    console.log(formData);

    return axios
            .post(API_URL + `upload`, formData)
            .then(response => {
                return response.data;
            });
}

function addWeight(username, weight, date) {
    return axios
            .post(API_URL + 'addWeight', {
                username,
                weight,
                date
            })
            .then(response => {
                return response.data;
            });
}

function updateUserFoodAmount(id, amount) {
    return axios
            .post(API_URL + 'updateUserFood', {
                id,
                amount
            }) 
            .then(response => {
                return response.data;
            });
}

function deleteUserFood(id) {
    return axios
            .post(API_URL + 'deleteUserFood', {
                id
            })
            .then(response => {
                return response.data;
            });
}

function addUserFood(username, food, amount) {
    return axios
            .post(API_URL + 'addUserFood', {
                username,
                food,
                amount
            }) 
            .then(response => {
                return response.data;
            });
}

function getWeight(username) {
    return axios
            .get(API_URL + `getWeight/${username}`)
            .then(response => {
                return response.data;
            });
}

function getFoodsList() {
    return axios
            .get(API_URL + `getFoodsList`)
            .then(response => {
                return response.data;
            });
}

function getUserFoodList(currentUser) {
    return axios
            .get(API_URL + `getUserFoodList/${currentUser}`)
            .then(response => {
                return response.data;
            })
}

export default {
    addWeight,
    getWeight,
    getFoodsList,
    addUserFood,
    getUserFoodList,
    updateUserFoodAmount,
    deleteUserFood,
    getUserInfo,
    upload,
  /*   logout,
    register,
    getCurrentUser, */
} 