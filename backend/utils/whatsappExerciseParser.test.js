const { parseWhatsappExerciseText, parseExerciseLine } = require('./whatsappExerciseParser');

describe('parseExerciseLine', () => {
    test('weight + comma-separated reps', () => {
        expect(parseExerciseLine('Dumbell bench press 30kg 11,13,12')).toEqual([
            { exerciseRaw: 'Dumbell bench press', weight: 30, reps: 11 },
            { exerciseRaw: 'Dumbell bench press', weight: 30, reps: 13 },
            { exerciseRaw: 'Dumbell bench press', weight: 30, reps: 12 },
        ]);
    });

    test('bodyweight when no weight token is present', () => {
        expect(parseExerciseLine('Pullups 8,8,8')).toEqual([
            { exerciseRaw: 'Pullups', weight: null, reps: 8 },
            { exerciseRaw: 'Pullups', weight: null, reps: 8 },
            { exerciseRaw: 'Pullups', weight: null, reps: 8 },
        ]);
    });

    test('explicit "b" bodyweight marker mid-line switches weight context', () => {
        expect(parseExerciseLine('Pullups 10kg 4,6 b 8')).toEqual([
            { exerciseRaw: 'Pullups', weight: 10, reps: 4 },
            { exerciseRaw: 'Pullups', weight: 10, reps: 6 },
            { exerciseRaw: 'Pullups', weight: null, reps: 8 },
        ]);
    });

    test('repeating weight+rep pairs split into separate sets', () => {
        expect(parseExerciseLine('Dips 30kg 5 35kg 5')).toEqual([
            { exerciseRaw: 'Dips', weight: 30, reps: 5 },
            { exerciseRaw: 'Dips', weight: 35, reps: 5 },
        ]);
    });

    test('unitless weight followed by an N*M sets-times-reps token', () => {
        expect(parseExerciseLine('Bench rows 18 3*10')).toEqual([
            { exerciseRaw: 'Bench rows', weight: 18, reps: 10 },
            { exerciseRaw: 'Bench rows', weight: 18, reps: 10 },
            { exerciseRaw: 'Bench rows', weight: 18, reps: 10 },
        ]);
    });

    test('unitless weight followed by a comma reps list', () => {
        expect(parseExerciseLine('Dumbbell bench press 32 12,11,11')).toEqual([
            { exerciseRaw: 'Dumbbell bench press', weight: 32, reps: 12 },
            { exerciseRaw: 'Dumbbell bench press', weight: 32, reps: 11 },
            { exerciseRaw: 'Dumbbell bench press', weight: 32, reps: 11 },
        ]);
    });

    test('typo unit suffix on a weight is tolerated (87jg -> 87kg)', () => {
        expect(parseExerciseLine('bench press 85kg 2 85kg 3 87jg 3 87kg 5')).toEqual([
            { exerciseRaw: 'bench press', weight: 85, reps: 2 },
            { exerciseRaw: 'bench press', weight: 85, reps: 3 },
            { exerciseRaw: 'bench press', weight: 87, reps: 3 },
            { exerciseRaw: 'bench press', weight: 87, reps: 5 },
        ]);
    });

    test('a bare number followed by a reps list is re-read as a new weight, even after a weight was already set', () => {
        expect(parseExerciseLine('Dips 40kg 5 42.5 5,5')).toEqual([
            { exerciseRaw: 'Dips', weight: 40, reps: 5 },
            { exerciseRaw: 'Dips', weight: 42.5, reps: 5 },
            { exerciseRaw: 'Dips', weight: 42.5, reps: 5 },
        ]);
    });

    test('parenthetical asides are stripped', () => {
        expect(parseExerciseLine('bench press 80kg 5,5 (not to hard)')).toEqual([
            { exerciseRaw: 'bench press', weight: 80, reps: 5 },
            { exerciseRaw: 'bench press', weight: 80, reps: 5 },
        ]);
    });

    test('a spaced-out unit ("30 kg") is tolerated', () => {
        expect(parseExerciseLine('Leg extension 20kg 15, 30 kg 14, 40kg 14 , 60kg 12')).toEqual([
            { exerciseRaw: 'Leg extension', weight: 20, reps: 15 },
            { exerciseRaw: 'Leg extension', weight: 30, reps: 14 },
            { exerciseRaw: 'Leg extension', weight: 40, reps: 14 },
            { exerciseRaw: 'Leg extension', weight: 60, reps: 12 },
        ]);
    });

    test.each([
        ['Bench rows'],
        ['Leg curls'],
        ['Today'],
        ['Dips 20kg'],
    ])('lines with no usable reps produce no sets: %p', (line) => {
        expect(parseExerciseLine(line)).toEqual([]);
    });

    test('KNOWN AMBIGUOUS: stray prose words containing numbers get swept in as noise reps (documented limitation, fixed up in the review UI)', () => {
        expect(parseExerciseLine('bench press 90kg 4 3, 3 and 1 after 10 sec pause')).toEqual([
            { exerciseRaw: 'bench press', weight: 90, reps: 4 },
            { exerciseRaw: 'bench press', weight: 90, reps: 3 },
            { exerciseRaw: 'bench press', weight: 90, reps: 3 },
            { exerciseRaw: 'bench press', weight: 90, reps: 1 },
            { exerciseRaw: 'bench press', weight: 90, reps: 10 },
        ]);
    });

    test('KNOWN AMBIGUOUS: "N*M" is always read as sets*reps, even when the user meant it the other way round', () => {
        expect(parseExerciseLine('Dumbbel bench press 24kg 15*3')).toEqual([
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
            { exerciseRaw: 'Dumbbel bench press', weight: 24, reps: 3 },
        ]);
    });
});

describe('parseWhatsappExerciseText', () => {
    const REAL_WHATSAPP_DUMP = `[21:18, 24/06/2026] dimas🤓: Today
Dumbell bench press 30kg 11,13,12
Shoulders 8kg
Pullups 8,8,8
Dips 15,15,15
Lunges 8kg 8,8,6
Bench rows 18 3*10
Bench angle curl 12kg 8,8,6
[22:43, 28/06/2026] dimas🤓: bench press 80kg 5,5 (not to hard)
Shoulders 10kg 6,7
Pullups 10kg 5,5
Dips 30kg 5 35kg 5
Bench rows 22 2*10
Bench angle curl 14kg 6,7
[09:02, 03/07/2026] dimas🤓: bench press 80kg 5, 82.5kg 5 (not to hard)
Shoulders 10kg 7,7
Pullups 10kg 5,5
Dips 30kg 5 30kg 5
Bench rows 22 2*10
Bench angle curl 14kg 6,7
[23:05, 06/07/2026] dimas🤓: bench press 85kg 2 85kg 3 87jg 3 87kg 5
Shoulders 10kg 10,10,10
Pullups 15kg 5,5
Dips 30kg 5 40kg 5
Bench rows 24 2*7
Bench angle curl 16kg 6,7
[23:49, 09/07/2026] dimas🤓: Dumbbel bench press 32 10,12
Shoulders 8kg 13,15
Pullups 9kg 7,6
Dips 9kg 15,15
Bench rows 20 2*10
Bench angle curl 14kg 8,8
[22:03, 11/07/2026] dimas🤓: Dumbbel bench press 24kg 15*3
Shoulders 7kg 15,16,15
Pullups b 9,10,8
Dips b 20,16,
Bench rows 14kg 15,14,14
Lunges 7kg 2*12
Bench angle curl 12kg 12,10,9
[22:20, 14/07/2026] dimas🤓: bench press 90kg 4 3, 3 and 1 after 10 sec pause
Shoulders 12kg 5,6,6
Pullups 17.5 4,4,5
Dips 40kg 5,5,5
Bench rows 26 5,6,7
Bench angle curl 18kg 4,5,4
[21:11, 16/07/2026] dimas🤓: Dumbbell bench press 72kg 10,10,10
Shoulders 10kg 6,8,9
Pullups 10kg 4,6 b 8
Dips 20kg 10,10,10
Seated calf raises 20kg 8,8,8
Bench rows 20kg 10,10,10
Bench angle curl 14kg 8,9,10
Leg extension 15kg 12,12,10
[23:24, 20/07/2026] dimas🤓: bench press 90kg 3*5
Shoulders 12kg 5,7,7
Pullups 17.5 3*5
Dips 40kg 5 42.5 5,5
Bench rows 26 6,7
Bench angle curl 18kg 6,5,5
[07:31, 23/07/2026] dimas🤓: Dumbbell bench press 32 12,11,11
Shoulders 10kg 10,10,9
Pullups 8kg 7,7,7
Dips 20kg 10,10,10
Seated calf raises 25kg 8,8,8
Bench rows 20kg 10,10,10
Bench angle curl 14kg 8,8
Leg extension 15kg 12,2
[21:54, 25/07/2026] dimas🤓: bench press 57.5kg 17,16,16
Shoulders 8kg 9,10,
Pullups  13,8,9
Dips 18,20,17
Seated calf raises 25kg 15, 30kg 13,10
Lunges 7kg 14,14
Bench rows 14kg 16,15,15
Bench angle curl 12kg 9,9,9
Leg extension 15kg 14
Leg raise 20kg 15,15
[22:51, 27/07/2026] dimas🤓: bench press 92kg 3*4
Shoulders 12kg 7,7,6
Pullups 20kg 3, 17.5kg 4, 15
Dips 30kg 10,10,10
Bench rows 26 8,8,7
Bench angle curl 18kg 5,4
Seated calf raise 40 10,10,10
Leg extension 22.5 11,11,11
Seated leg curl 25kg 12,12
[21:15, 30/07/2026] dimas🤓: Bench dumbell 34kg 10,10,8
Lunges 10 10,10,10
Pullups 7.5 8,7,6
Shoulders 8kg 10,15,15
Dips 20kg
Bench rows
Leg extension 20kg 15, 30 kg 14, 40kg 14 , 60kg 12
Calf raise 40 12,12,12
Leg curls`;

    test('assigns every set the date of the most recent [HH:MM, DD/MM/YYYY] header', () => {
        const entries = parseWhatsappExerciseText(REAL_WHATSAPP_DUMP);
        const dates = [...new Set(entries.map((entry) => entry.date))];

        expect(dates).toEqual([
            '2026-06-24', '2026-06-28', '2026-07-03', '2026-07-06', '2026-07-09',
            '2026-07-11', '2026-07-14', '2026-07-16', '2026-07-20', '2026-07-23',
            '2026-07-25', '2026-07-27', '2026-07-30',
        ]);
    });

    test('parses the first day fully, including the exercise embedded in the header line of the next message', () => {
        const entries = parseWhatsappExerciseText(REAL_WHATSAPP_DUMP);
        const day1 = entries.filter((entry) => entry.date === '2026-06-24');

        expect(day1.map((entry) => entry.exerciseRaw)).toEqual([
            'Dumbell bench press', 'Dumbell bench press', 'Dumbell bench press',
            'Pullups', 'Pullups', 'Pullups',
            'Dips', 'Dips', 'Dips',
            'Lunges', 'Lunges', 'Lunges',
            'Bench rows', 'Bench rows', 'Bench rows',
            'Bench angle curl', 'Bench angle curl', 'Bench angle curl',
        ]);
        // "Shoulders 8kg" (weight, no reps) has nothing usable and is dropped.
        expect(day1.some((entry) => entry.exerciseRaw === 'Shoulders')).toBe(false);

        const day2FirstLine = entries.find((entry) => entry.date === '2026-06-28');
        expect(day2FirstLine).toMatchObject({ exerciseRaw: 'bench press', weight: 80, reps: 5 });
    });

    test('trailing comma and double space noise do not break parsing', () => {
        const entries = parseWhatsappExerciseText(REAL_WHATSAPP_DUMP);
        const day = entries.filter((entry) => entry.date === '2026-07-11');

        const dips = day.filter((entry) => entry.exerciseRaw === 'Dips');
        expect(dips).toEqual([
            { date: '2026-07-11', exerciseRaw: 'Dips', weight: null, reps: 20, sourceLine: 'Dips b 20,16,' },
            { date: '2026-07-11', exerciseRaw: 'Dips', weight: null, reps: 16, sourceLine: 'Dips b 20,16,' },
        ]);

        const pullupsNoWeight = entries.find((entry) => entry.date === '2026-07-25' && entry.exerciseRaw === 'Pullups');
        expect(pullupsNoWeight).toMatchObject({ weight: null, reps: 13 });
    });

    test('lines with only a weight and no reps, or no numbers at all, are omitted (last day: "Dips 20kg", "Bench rows", "Leg curls")', () => {
        const entries = parseWhatsappExerciseText(REAL_WHATSAPP_DUMP);
        const lastDay = entries.filter((entry) => entry.date === '2026-07-30');

        expect(lastDay.some((entry) => entry.sourceLine === 'Dips 20kg')).toBe(false);
        expect(lastDay.some((entry) => entry.sourceLine === 'Bench rows')).toBe(false);
        expect(lastDay.some((entry) => entry.sourceLine === 'Leg curls')).toBe(false);
        expect(lastDay.some((entry) => entry.exerciseRaw === 'Leg extension')).toBe(true);
    });

    test('returns an empty array for empty/non-string input', () => {
        expect(parseWhatsappExerciseText('')).toEqual([]);
        expect(parseWhatsappExerciseText(undefined)).toEqual([]);
        expect(parseWhatsappExerciseText(null)).toEqual([]);
    });

    test('lines before any header are ignored', () => {
        const entries = parseWhatsappExerciseText('Bench press 50kg 10,10\n[10:00, 01/01/2026] me: Squats 60kg 5,5');
        expect(entries).toHaveLength(2);
        expect(entries.every((entry) => entry.exerciseRaw === 'Squats')).toBe(true);
    });
});
