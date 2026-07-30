const { isValidImageBuffer } = require('./imageSignature');

describe('isValidImageBuffer', () => {
    test('accepts a JPEG signature', () => {
        const buffer = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(20)]);
        expect(isValidImageBuffer(buffer)).toBe(true);
    });

    test('accepts a PNG signature', () => {
        const buffer = Buffer.concat([
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
            Buffer.alloc(20),
        ]);
        expect(isValidImageBuffer(buffer)).toBe(true);
    });

    test('accepts a WEBP signature', () => {
        const buffer = Buffer.concat([
            Buffer.from('RIFF'),
            Buffer.alloc(4),
            Buffer.from('WEBP'),
            Buffer.alloc(10),
        ]);
        expect(isValidImageBuffer(buffer)).toBe(true);
    });

    test.each([
        [undefined],
        [null],
        ['not-a-buffer'],
        [Buffer.alloc(5)],
        [Buffer.concat([Buffer.from('<html'), Buffer.alloc(20)])],
    ])('rejects %p', (value) => {
        expect(isValidImageBuffer(value)).toBe(false);
    });
});
