const { isValidEmail, isPositiveNumber, isValidDate, isStrongPassword } = require('./validators');

describe('isValidEmail', () => {
    test('accepts a well-formed email', () => {
        expect(isValidEmail('a@b.com')).toBe(true);
    });

    test.each([
        [undefined],
        [null],
        [123],
        ['not-an-email'],
        ['missing@domain'],
        ['@missing-local.com'],
        ['has space@b.com'],
    ])('rejects %p', (value) => {
        expect(isValidEmail(value)).toBe(false);
    });
});

describe('isPositiveNumber', () => {
    test.each([
        [1, true],
        ['1', true],
        [0.5, true],
        [0, false],
        [-1, false],
        ['abc', false],
        [undefined, false],
        [null, false],
        [Infinity, false],
        [NaN, false],
    ])('isPositiveNumber(%p) === %p', (value, expected) => {
        expect(isPositiveNumber(value)).toBe(expected);
    });
});

describe('isValidDate', () => {
    test.each([
        ['2026-01-01', true],
        ['not-a-date', false],
        [undefined, false],
        [null, false],
        [12345, false],
    ])('isValidDate(%p) === %p', (value, expected) => {
        expect(isValidDate(value)).toBe(expected);
    });
});

describe('isStrongPassword', () => {
    test.each([
        ['abcd1234', true],
        ['Passw0rd!', true],
        ['short1', false],
        ['alllettersnodigits', false],
        ['12345678', false],
        [undefined, false],
        [null, false],
        [12345678, false],
    ])('isStrongPassword(%p) === %p', (value, expected) => {
        expect(isStrongPassword(value)).toBe(expected);
    });
});
