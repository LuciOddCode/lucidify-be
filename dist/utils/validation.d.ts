export declare const validateEmail: (email: string) => boolean;
export declare const validatePassword: (password: string) => {
    isValid: boolean;
    errors: string[];
};
export declare const validateConfirmPassword: (password: string, confirmPassword: string) => {
    isValid: boolean;
    error?: string;
};
export declare const validateSignupData: (data: {
    email: string;
    password: string;
    confirmPassword: string;
}) => {
    isValid: boolean;
    errors: {
        [key: string]: string;
    };
};
//# sourceMappingURL=validation.d.ts.map