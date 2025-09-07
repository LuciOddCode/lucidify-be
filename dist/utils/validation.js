"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSignupData = exports.validateConfirmPassword = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    const errors = [];
    if (!password) {
        errors.push('Password is required');
        return { isValid: false, errors };
    }
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
};
exports.validatePassword = validatePassword;
const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
        return { isValid: false, error: 'Please confirm your password' };
    }
    if (password !== confirmPassword) {
        return { isValid: false, error: 'Passwords do not match' };
    }
    return { isValid: true };
};
exports.validateConfirmPassword = validateConfirmPassword;
const validateSignupData = (data) => {
    const errors = {};
    if (!data.email) {
        errors.email = 'Email is required';
    }
    else if (!(0, exports.validateEmail)(data.email)) {
        errors.email = 'Please enter a valid email address';
    }
    const passwordValidation = (0, exports.validatePassword)(data.password);
    if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0];
    }
    const confirmPasswordValidation = (0, exports.validateConfirmPassword)(data.password, data.confirmPassword);
    if (!confirmPasswordValidation.isValid) {
        errors.confirmPassword = confirmPasswordValidation.error;
    }
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
exports.validateSignupData = validateSignupData;
//# sourceMappingURL=validation.js.map