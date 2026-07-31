export function required(value) {
    return value ? undefined : 'This field is required';
}

export function validEmail(value) {
    if (!value) return undefined;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'Enter a valid email address';
}

export function strongPassword(value) {
    if (!value) return undefined;
    const isLongEnough = value.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    return isLongEnough && hasLetter && hasNumber
        ? undefined
        : 'Password must be at least 8 characters and include a letter and a number';
}

export function runValidations(value, validations = []) {
    for (const validate of validations) {
        const error = validate(value);
        if (error) return error;
    }
    return undefined;
}
