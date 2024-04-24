import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/users/'

function getUserInfo(username) {
    return axios
            .get(API_URL + `getUserInfo/${username}`)
            .then(response => {
                return response.data;
            });
}

function upload(formData) {
    console.log('data that was sent to upload');
    return axios
            .post(API_URL + `upload`, formData)
            .then(response => {
                return response.data;
            });
}

/* function uploadExpress(file) {
    console.log(file);
} */

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

function addCustomFoodToList(username, values) {
    return axios
            .post(API_URL + 'addCustomFood', {
                username,
                food: values.food,
                amount: values.amount,
                calories: values.calories,
                fats: values.fats,
                carbs: values.carbs,
                protein: values.protein
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
            })
            .catch(error => {
                console.log('no rows to return for ',username,error);
                return {};
            });
            
}

function getFoodsList() {
    return axios
            .get(API_URL + `getFoodsList`)
            .then(response => {
                return response.data;
            })
            .catch(error => {
                return {};
            });
}

function getUserFoodList(currentUser) {
    return axios
            .get(API_URL + `getUserFoodList/${currentUser}`)
            .then(response => {
                return response.data;
            })
            .catch(error => {
                return {};
            });
}

export default {
    addWeight,
    getWeight,
    getFoodsList,
    addUserFood,
    addCustomFoodToList,
    getUserFoodList,
    updateUserFoodAmount,
    deleteUserFood,
    getUserInfo,
    upload,
/*     uploadExpress, */
  /*   logout,
    register,
    getCurrentUser, */
} 