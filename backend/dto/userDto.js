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
        role: user.role,
    };
}

function toUserSummaryDto(user) {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
    };
}

function toUserSummaryListDto(users) {
    return users.map(toUserSummaryDto);
}

module.exports = { toUserDto, toUserSummaryDto, toUserSummaryListDto };
