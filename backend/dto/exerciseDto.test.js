const {
    toExerciseCatalogDto,
    toExerciseCatalogListDto,
    toUserExerciseDto,
    toUserExerciseListDto,
} = require('./exerciseDto');

test('toExerciseCatalogDto maps the expected fields', () => {
    const exercise = { exercise: 'Barbell Bench Press', category: 'Chest' };

    expect(toExerciseCatalogDto(exercise)).toEqual(exercise);
});

test('toExerciseCatalogListDto maps every entry', () => {
    const exercises = [
        { exercise: 'Barbell Bench Press', category: 'Chest' },
        { exercise: 'Deadlift', category: 'Back' },
    ];

    expect(toExerciseCatalogListDto(exercises)).toEqual(exercises);
});

test('toUserExerciseDto nests the associated exercise catalog entry', () => {
    const userExercise = {
        id: 1,
        setnumber: 2,
        reps: 8,
        weight: 60,
        logdate: '2026-08-01',
        exercise: { exercise: 'Barbell Bench Press', category: 'Chest' },
    };

    expect(toUserExerciseDto(userExercise)).toEqual({
        id: 1,
        setnumber: 2,
        reps: 8,
        weight: 60,
        logdate: '2026-08-01',
        exercise: { exercise: 'Barbell Bench Press', category: 'Chest' },
    });
});

test('toUserExerciseDto tolerates a missing associated exercise (null-linked row)', () => {
    const userExercise = { id: 1, setnumber: 1, reps: 8, weight: null, logdate: '2026-08-01', exercise: null };

    expect(toUserExerciseDto(userExercise)).toEqual({
        id: 1,
        setnumber: 1,
        reps: 8,
        weight: null,
        logdate: '2026-08-01',
        exercise: null,
    });
});

test('toUserExerciseListDto maps every entry', () => {
    const userExercises = [
        { id: 1, setnumber: 1, reps: 8, weight: 60, exercise: null },
        { id: 2, setnumber: 2, reps: 8, weight: 62.5, exercise: null },
    ];

    expect(toUserExerciseListDto(userExercises)).toHaveLength(2);
});
