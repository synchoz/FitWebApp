jest.mock('./exerciseService');

const exerciseService = require('./exerciseService');
const { previewWhatsappImport, findMatchingExercise } = require('./exerciseImportService');

beforeEach(() => {
    jest.clearAllMocks();
});

const CATALOG = [
    { exercise: 'Dumbbell Bench Press', category: 'Chest' },
    { exercise: 'Barbell Bench Press', category: 'Chest' },
    { exercise: 'Pull Up', category: 'Back' },
];

describe('findMatchingExercise', () => {
    test('matches exactly, case-insensitively', () => {
        expect(findMatchingExercise('barbell bench press', CATALOG)).toBe('Barbell Bench Press');
    });

    test('tolerates a small typo', () => {
        expect(findMatchingExercise('Dumbell Bench Press', CATALOG)).toBe('Dumbbell Bench Press');
    });

    test('returns null when nothing is close enough', () => {
        expect(findMatchingExercise('Seated Calf Raise', CATALOG)).toBeNull();
    });

    test('does not match across a reordered name', () => {
        expect(findMatchingExercise('Bench dumbell', CATALOG)).toBeNull();
    });
});

describe('previewWhatsappImport', () => {
    test('parses text and attaches a catalog match per entry', async () => {
        exerciseService.getExercisesList.mockResolvedValue(CATALOG);

        const text = '[10:00, 01/01/2026] me: Dumbell Bench Press 30kg 10,10\nSquats 60kg 5';
        const result = await previewWhatsappImport(text);

        expect(exerciseService.getExercisesList).toHaveBeenCalledTimes(1);
        expect(result).toEqual([
            { date: '2026-01-01', exerciseRaw: 'Dumbell Bench Press', matchedExercise: 'Dumbbell Bench Press', weight: 30, reps: 10, sourceLine: expect.any(String) },
            { date: '2026-01-01', exerciseRaw: 'Dumbell Bench Press', matchedExercise: 'Dumbbell Bench Press', weight: 30, reps: 10, sourceLine: expect.any(String) },
            { date: '2026-01-01', exerciseRaw: 'Squats', matchedExercise: null, weight: 60, reps: 5, sourceLine: expect.any(String) },
        ]);
    });
});
