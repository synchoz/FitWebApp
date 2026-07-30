const { toUserDto } = require('./userDto');

test('maps public user fields and never leaks the password hash', () => {
    const user = {
        id: 1,
        username: 'jdoe',
        email: 'jdoe@example.com',
        hash: 'super-secret-bcrypt-hash',
        fullname: 'John Doe',
        address: '123 Main St',
        phonenumber: '5551234',
        height: 180,
        weight: 80,
        age: 30,
        gender: 'male',
        imagelink: 'https://example.com/img.png',
    };

    const dto = toUserDto(user);

    expect(dto).toEqual({
        id: 1,
        username: 'jdoe',
        email: 'jdoe@example.com',
        fullname: 'John Doe',
        address: '123 Main St',
        phonenumber: '5551234',
        height: 180,
        weight: 80,
        age: 30,
        gender: 'male',
        imagelink: 'https://example.com/img.png',
    });
    expect(dto.hash).toBeUndefined();
});
