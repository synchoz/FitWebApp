const { parsePagination } = require('./pagination');

test('defaults page to 1 and limit to defaultLimit when the query is empty', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 100, offset: 0 });
});

test('uses the given page and limit, computing the correct offset', () => {
    expect(parsePagination({ page: '3', limit: '20' })).toEqual({ page: 3, limit: 20, offset: 40 });
});

test('clamps a limit above maxLimit down to maxLimit', () => {
    expect(parsePagination({ limit: '9999' })).toEqual({ page: 1, limit: 500, offset: 0 });
});

test('falls back to defaults for non-positive or non-integer page/limit', () => {
    expect(parsePagination({ page: '-1', limit: '0' })).toEqual({ page: 1, limit: 100, offset: 0 });
    expect(parsePagination({ page: 'abc', limit: 'abc' })).toEqual({ page: 1, limit: 100, offset: 0 });
    expect(parsePagination({ page: '2.5', limit: '10.5' })).toEqual({ page: 1, limit: 100, offset: 0 });
});

test('respects custom defaultLimit/maxLimit options', () => {
    expect(parsePagination({}, { defaultLimit: 10, maxLimit: 50 })).toEqual({ page: 1, limit: 10, offset: 0 });
    expect(parsePagination({ limit: '100' }, { defaultLimit: 10, maxLimit: 50 })).toEqual({ page: 1, limit: 50, offset: 0 });
});
