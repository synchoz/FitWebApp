const exerciseService = require('./exerciseService');
const { parseWhatsappExerciseText } = require('../utils/whatsappExerciseParser');

function normalize(value) {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function levenshteinDistance(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i += 1) {
        matrix[i][0] = i;
    }
    for (let j = 0; j <= b.length; j += 1) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= a.length; i += 1) {
        for (let j = 1; j <= b.length; j += 1) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost,
            );
        }
    }
    return matrix[a.length][b.length];
}

// Exact (case-insensitive) match first, then a conservative typo-tolerant fallback
// (e.g. "Dumbell bench press" -> "Dumbbell Bench Press"). Word-order differences
// ("Bench dumbell" vs "Dumbbell Bench Press") won't match - that's expected, the
// user picks the right catalog entry by hand in the review grid.
function findMatchingExercise(exerciseRaw, catalog) {
    const normalizedRaw = normalize(exerciseRaw);

    const exact = catalog.find((item) => normalize(item.exercise) === normalizedRaw);
    if (exact) {
        return exact.exercise;
    }

    let best = null;
    let bestDistance = Infinity;
    catalog.forEach((item) => {
        const distance = levenshteinDistance(normalizedRaw, normalize(item.exercise));
        if (distance < bestDistance) {
            bestDistance = distance;
            best = item.exercise;
        }
    });

    const threshold = Math.max(2, Math.floor(normalizedRaw.length * 0.25));
    return best !== null && bestDistance <= threshold ? best : null;
}

async function previewWhatsappImport(text) {
    const entries = parseWhatsappExerciseText(text);
    const catalog = await exerciseService.getExercisesList();

    return entries.map((entry) => ({
        date: entry.date,
        exerciseRaw: entry.exerciseRaw,
        matchedExercise: findMatchingExercise(entry.exerciseRaw, catalog),
        weight: entry.weight,
        reps: entry.reps,
        sourceLine: entry.sourceLine,
    }));
}

module.exports = { previewWhatsappImport, findMatchingExercise };
