import axiosInstance from "../axiosInstance";

function getUserInfo() {
    return axiosInstance
            .get('getUserInfo')
            .then(response => {
                return response.data;
            });
}

function upload(formData) {
    return axiosInstance
            .post('upload', formData)
            .then(response => {
                return response.data;
            });
}

function addWeight(weight, date) {
    return axiosInstance
            .post('addWeight', {
                weight,
                date
            })
            .then(response => {
                return response.data;
            });
}

function updateUserFoodAmount(id, amount) {
    return axiosInstance
            .post('updateUserFood', {
                id,
                amount
            })
            .then(response => {
                return response.data;
            });
}

function deleteUserFood(id) {
    return axiosInstance
            .post('deleteUserFood', {
                id
            })
            .then(response => {
                return response.data;
            });
}

function addUserFood(food, amount, date) {
    return axiosInstance
            .post('addUserFood', {
                food,
                amount,
                date
            })
            .then(response => {
                return response.data;
            });
}

function getWeight() {
    return axiosInstance
            .get('getWeight')
            .then(response => {
                return response.data;
            });
}

function getFoodsList() {
    return axiosInstance
            .get('getFoodsList')
            .then(response => {
                return response.data;
            });
}

function getUserFoodList(date) {
    return axiosInstance
            .get('getUserFoodList', { params: date ? { date } : {} })
            .then(response => {
                return response.data;
            });
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
}
