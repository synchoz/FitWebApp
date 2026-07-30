function toUserDto(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        address: user.address,
        phonenumber: user.phonenumber,
        height: user.height,
        weight: user.weight,
        age: user.age,
        gender: user.gender,
        imagelink: user.imagelink,
    };
}

module.exports = { toUserDto };
