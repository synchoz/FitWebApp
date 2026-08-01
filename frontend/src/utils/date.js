// Local calendar date as YYYY-MM-DD (matches native <input type="date">),
// adjusted for timezone offset so it doesn't fall back a day for users east of UTC.
export function todayIso() {
    const now = new Date();
    const localMidnight = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localMidnight.toISOString().slice(0, 10);
}
