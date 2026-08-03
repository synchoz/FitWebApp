const WEIGHT_TIMES_RE = /^(\d+(?:\.\d+)?)\*(\d+(?:\.\d+)?)$/;
const WEIGHT_KG_RE = /^(\d+(?:\.\d+)?)kg$/i;
const BODYWEIGHT_RE = /^(b|bw)$/i;
const WEIGHT_TYPO_RE = /^(\d+(?:\.\d+)?)[a-zA-Z]{1,3}$/;
const PLAIN_NUMBER_RE = /^\d+(?:\.\d+)?$/;
// WhatsApp's own "copy message" format isn't consistent across app versions/locales:
// some show "[HH:MM, DD/MM/YYYY]" (time first, with year), others "[DD/MM, HH:MM]"
// (date first, no year) - support both orders, with seconds and/or year optional.
const HEADER_RE = /^\[(?:(?<hourA>\d{1,2}):(?<minuteA>\d{2})(?::\d{2})?,\s*(?<dayA>\d{1,2})\/(?<monthA>\d{1,2})(?:\/(?<yearA>\d{2,4}))?|(?<dayB>\d{1,2})\/(?<monthB>\d{1,2})(?:\/(?<yearB>\d{2,4}))?,\s*(?<hourB>\d{1,2}):(?<minuteB>\d{2})(?::\d{2})?)\]\s*[^:]*:\s?(?<rest>.*)$/;
// Where the exercise name ends and set data begins: the first digit, OR a standalone
// "b"/"bw" bodyweight marker if that comes first (e.g. "Dips b 20,16,").
const DATA_START_RE = /\d|\b(?:b|bw)\b/i;

const UNSET_WEIGHT = Symbol('unset-weight');

function normalizeRemainder(remainder) {
    return remainder.replace(/(\d+(?:\.\d+)?)\s+([kK][gG])\b/g, '$1$2');
}

// The header format WhatsApp shows without a year (e.g. "[27/07, 22:51]") is used for
// recent messages, so the current year is the best available guess for it.
function resolveYear(yearRaw) {
    if (!yearRaw) {
        return String(new Date().getFullYear());
    }
    return yearRaw.length === 2 ? String(2000 + Number(yearRaw)) : yearRaw;
}

function isMultiValueChunk(chunk) {
    if (!chunk) {
        return false;
    }
    if (WEIGHT_TIMES_RE.test(chunk)) {
        return true;
    }
    const parts = chunk.split(',').map((part) => part.trim()).filter(Boolean);
    return parts.length > 1;
}

/**
 * Best-effort parse of a single exercise line into sets. Free-text shorthand is
 * inherently ambiguous in places (see whatsappExerciseParser.test.js for documented
 * edge cases) - this is intentionally a heuristic, not a guaranteed-correct parser;
 * the caller is expected to let a human review the result.
 */
function parseExerciseLine(content) {
    const cleaned = content.replace(/\([^)]*\)/g, ' ');
    const startMatch = cleaned.match(DATA_START_RE);
    if (!startMatch) {
        return [];
    }

    const exerciseRaw = cleaned.slice(0, startMatch.index).replace(/\s+/g, ' ').trim();
    if (!exerciseRaw) {
        return [];
    }

    const remainder = normalizeRemainder(cleaned.slice(startMatch.index));
    const chunks = remainder.trim().split(/\s+/).filter(Boolean);

    let currentWeight = UNSET_WEIGHT;
    const sets = [];

    chunks.forEach((chunk, index) => {
        const timesMatch = chunk.match(WEIGHT_TIMES_RE);
        if (timesMatch) {
            const numSets = Number(timesMatch[1]);
            const reps = Number(timesMatch[2]);
            for (let i = 0; i < numSets; i += 1) {
                sets.push({ weight: currentWeight === UNSET_WEIGHT ? null : currentWeight, reps });
            }
            return;
        }

        const kgMatch = chunk.match(WEIGHT_KG_RE);
        if (kgMatch) {
            currentWeight = Number(kgMatch[1]);
            return;
        }

        if (BODYWEIGHT_RE.test(chunk)) {
            currentWeight = null;
            return;
        }

        const typoMatch = chunk.match(WEIGHT_TYPO_RE);
        if (typoMatch) {
            currentWeight = Number(typoMatch[1]);
            return;
        }

        const parts = chunk.split(',').map((part) => part.trim()).filter((part) => PLAIN_NUMBER_RE.test(part));
        if (parts.length === 0) {
            return;
        }

        if (parts.length === 1 && isMultiValueChunk(chunks[index + 1])) {
            currentWeight = Number(parts[0]);
            return;
        }

        parts.forEach((part) => {
            sets.push({ weight: currentWeight === UNSET_WEIGHT ? null : currentWeight, reps: Number(part) });
        });
    });

    return sets
        .filter((set) => Number.isInteger(set.reps) && set.reps > 0)
        .filter((set) => set.weight === null || (Number.isFinite(set.weight) && set.weight > 0))
        .map((set) => ({ exerciseRaw, weight: set.weight, reps: set.reps }));
}

/**
 * Parses a pasted WhatsApp chat export (or a manually copied handful of messages)
 * into one entry per logged set. Each `[HH:MM, DD/MM/YYYY]` or `[DD/MM, HH:MM]`
 * header line (year and seconds optional) establishes the date for itself and every
 * following line, until the next header.
 */
function parseWhatsappExerciseText(text) {
    if (typeof text !== 'string') {
        return [];
    }

    const lines = text.split(/\r?\n/);
    let currentDate = null;
    const entries = [];

    lines.forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line) {
            return;
        }

        let content = line;
        const headerMatch = line.match(HEADER_RE);
        if (headerMatch) {
            const g = headerMatch.groups;
            const day = g.dayA || g.dayB;
            const month = g.monthA || g.monthB;
            const year = resolveYear(g.yearA || g.yearB);
            currentDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            content = g.rest.trim();
        }

        if (!currentDate || !content) {
            return;
        }

        parseExerciseLine(content).forEach((set) => {
            entries.push({
                date: currentDate,
                exerciseRaw: set.exerciseRaw,
                weight: set.weight,
                reps: set.reps,
                sourceLine: line,
            });
        });
    });

    return entries;
}

module.exports = { parseWhatsappExerciseText, parseExerciseLine };
