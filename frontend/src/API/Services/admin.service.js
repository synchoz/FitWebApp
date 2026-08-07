import axiosInstance from "../axiosInstance";

function getUsers() {
    return axiosInstance
            .get('admin/users')
            .then(response => {
                return response.data;
            });
}

function getUserWeightLogs(userId) {
    return axiosInstance
            .get('admin/weightlogs', { params: { userId } })
            .then(response => {
                return response.data;
            });
}

function updateWeightLog(id, weight, date) {
    return axiosInstance
            .post('admin/weightlogs/update', {
                id,
                weight,
                date
            })
            .then(response => {
                return response.data;
            });
}

function deleteWeightLog(id) {
    return axiosInstance
            .post('admin/weightlogs/delete', {
                id
            })
            .then(response => {
                return response.data;
            });
}

function updateFood(food, { calories, protein, carbs, fats, amount }) {
    return axiosInstance
            .post('admin/foods/update', {
                food,
                calories,
                protein,
                carbs,
                fats,
                amount
            })
            .then(response => {
                return response.data;
            });
}

function deleteFood(food) {
    return axiosInstance
            .post('admin/foods/delete', {
                food
            })
            .then(response => {
                return response.data;
            });
}

function updateExercise(exercise, category) {
    return axiosInstance
            .post('admin/exercises/update', {
                exercise,
                category
            })
            .then(response => {
                return response.data;
            });
}

function deleteExercise(exercise) {
    return axiosInstance
            .post('admin/exercises/delete', {
                exercise
            })
            .then(response => {
                return response.data;
            });
}

function getUserExerciseLog(userId) {
    return axiosInstance
            .get('admin/exerciselogs', { params: { userId } })
            .then(response => {
                return response.data;
            });
}

function updateExerciseLog(id, reps, weight) {
    return axiosInstance
            .post('admin/exerciselogs/update', {
                id,
                reps,
                weight
            })
            .then(response => {
                return response.data;
            });
}

function deleteExerciseLog(id) {
    return axiosInstance
            .post('admin/exerciselogs/delete', {
                id
            })
            .then(response => {
                return response.data;
            });
}

export default {
    getUsers,
    getUserWeightLogs,
    updateWeightLog,
    deleteWeightLog,
    updateFood,
    deleteFood,
    updateExercise,
    deleteExercise,
    getUserExerciseLog,
    updateExerciseLog,
    deleteExerciseLog,
}
