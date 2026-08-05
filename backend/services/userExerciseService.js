const UserExercise = require('../models/userexercise');
const Exercise = require('../models/exercise');
const { NotFoundError, ForbiddenError } = require('../errors/AppError');

async function getUserExerciseList(userid, { limit, offset, logdate } = {}) {
    return UserExercise.findAndCountAll({
        where: { userid, ...(logdate ? { logdate } : {}) },
        include: [{ model: Exercise }],
        order: [['userexercise', 'ASC'], ['setnumber', 'ASC']],
        limit,
        offset,
    });
}

async function getExerciseDates(userid) {
    const rows = await UserExercise.findAll({
        where: { userid },
        attributes: ['logdate'],
        group: ['logdate'],
        order: [['logdate', 'DESC']],
        raw: true,
    });
    return rows.map((row) => row.logdate);
}

async function getNextSetNumber(userid, exercise, logdate) {
    const maxSetNumber = await UserExercise.max('setnumber', { where: { userid, userexercise: exercise, logdate } });
    return (maxSetNumber || 0) + 1;
}

async function addUserExercise(userid, exercise, reps, weight, logdate) {
    const existingExercise = await Exercise.findByPk(exercise);
    if (!existingExercise) {
        throw new NotFoundError(`Exercise "${exercise}" was not found in the catalog`);
    }

    const setnumber = await getNextSetNumber(userid, exercise, logdate);
    return UserExercise.create({
        userid,
        userexercise: exercise,
        setnumber,
        reps,
        weight,
        logdate,
    });
}

async function getOwnedUserExercise(id, userid) {
    const userExercise = await UserExercise.findOne({ where: { id } });
    if (!userExercise) {
        throw new NotFoundError('Exercise log entry not found');
    }
    if (userExercise.userid !== userid) {
        throw new ForbiddenError('You do not have access to this exercise log entry');
    }
    return userExercise;
}

async function updateUserExercise(id, userid, { reps, weight }) {
    const userExercise = await getOwnedUserExercise(id, userid);
    const updates = {};
    if (reps !== undefined) {
        updates.reps = reps;
    }
    if (weight !== undefined) {
        updates.weight = weight;
    }
    await userExercise.update(updates);
    return userExercise;
}

async function deleteUserExercise(id, userid) {
    const userExercise = await getOwnedUserExercise(id, userid);
    await userExercise.destroy();
    return userExercise;
}

async function copyExerciseLog(userid, fromDate, toDate) {
    const rows = await UserExercise.findAll({
        where: { userid, logdate: fromDate },
        order: [['userexercise', 'ASC'], ['setnumber', 'ASC']],
    });
    if (rows.length === 0) {
        throw new NotFoundError(`No exercise log found for ${fromDate}`);
    }

    const created = await UserExercise.bulkCreate(
        rows.map((row) => ({
            userid,
            userexercise: row.userexercise,
            setnumber: row.setnumber,
            reps: row.reps,
            weight: row.weight,
            logdate: toDate,
        })),
        { returning: true },
    );

    return UserExercise.findAll({
        where: { id: created.map((row) => row.id) },
        include: [{ model: Exercise }],
        order: [['userexercise', 'ASC'], ['setnumber', 'ASC']],
    });
}

module.exports = {
    getUserExerciseList,
    getExerciseDates,
    addUserExercise,
    updateUserExercise,
    deleteUserExercise,
    copyExerciseLog,
};
