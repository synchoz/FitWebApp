function parsePagination(query, { defaultLimit = 100, maxLimit = 500 } = {}) {
    const rawPage = Number(query.page);
    const rawLimit = Number(query.limit);

    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isInteger(rawLimit) && rawLimit > 0
        ? Math.min(rawLimit, maxLimit)
        : defaultLimit;

    return { page, limit, offset: (page - 1) * limit };
}

module.exports = { parsePagination };
