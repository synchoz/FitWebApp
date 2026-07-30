const { toWeightDto, toWeightListDto } = require('./weightDto');

test('toWeightDto maps the expected fields', () => {
    const weightLog = { id: 1, weight: 80, logdate: '2026-01-01', userid: 5 };

    expect(toWeightDto(weightLog)).toEqual({ id: 1, weight: 80, logdate: '2026-01-01' });
});

test('toWeightListDto maps every entry', () => {
    const logs = [
        { id: 1, weight: 80, logdate: '2026-01-01', userid: 5 },
        { id: 2, weight: 79, logdate: '2026-01-02', userid: 5 },
    ];

    expect(toWeightListDto(logs)).toEqual([
        { id: 1, weight: 80, logdate: '2026-01-01' },
        { id: 2, weight: 79, logdate: '2026-01-02' },
    ]);
});
