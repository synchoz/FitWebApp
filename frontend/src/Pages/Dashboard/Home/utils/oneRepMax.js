// Epley formula: 1RM = weight * (1 + reps / 30). Preferred over Brzycki here
// because Brzycki diverges (and goes negative) as reps approaches 37, while
// Epley stays well-behaved across the higher rep ranges people actually log.
const EPLEY_REP_DIVISOR = 30;

export function estimateOneRepMax(weight, reps) {
    if (weight === null || weight === undefined || !reps || reps <= 0) {
        return null;
    }
    return weight * (1 + reps / EPLEY_REP_DIVISOR);
}

// Only exercises with at least one weighted set have a meaningful 1RM
// (bodyweight-only exercises like Pull-Up are excluded from the picker).
export function getLoggedExerciseNames(sets) {
    const names = new Set();
    sets.forEach((set) => {
        if (set.exercise && set.weight !== null && set.weight !== undefined) {
            names.add(set.exercise);
        }
    });
    return [...names].sort();
}

// Best (highest) estimated 1RM per day for one exercise, chronological.
export function buildDailyBestOneRepMax(sets, exerciseName) {
    const bestByDate = new Map();

    sets
        .filter((set) => set.exercise === exerciseName)
        .forEach((set) => {
            const oneRepMax = estimateOneRepMax(set.weight, set.reps);
            if (oneRepMax === null) {
                return;
            }
            const current = bestByDate.get(set.logdate);
            if (current === undefined || oneRepMax > current) {
                bestByDate.set(set.logdate, oneRepMax);
            }
        });

    return [...bestByDate.entries()]
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([logdate, oneRepMax]) => ({ logdate, oneRepMax: Math.round(oneRepMax * 10) / 10 }));
}

// logdate is a plain "YYYY-MM-DD" DATEONLY string; build the Date from its
// parts instead of `new Date(logdate)` to avoid UTC-parsing shifting the
// displayed day for users behind UTC.
export function formatLogDate(logdate) {
    const [year, month, day] = logdate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
