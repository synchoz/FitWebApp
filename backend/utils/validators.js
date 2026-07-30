const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
    return typeof email === 'string' && EMAIL_RE.test(email);
}

function isPositiveNumber(value) {
    const num = Number(value);
    return Number.isFinite(num) && num > 0;
}

function isValidDate(value) {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isStrongPassword(value) {
    return typeof value === 'string'
        && value.length >= 8
        && /[a-zA-Z]/.test(value)
        && /[0-9]/.test(value);
}

module.exports = { isValidEmail, isPositiveNumber, isValidDate, isStrongPassword };
