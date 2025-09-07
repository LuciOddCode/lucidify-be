import { EmailOptions } from "../types";
declare class EmailService {
    private transporter;
    constructor();
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendTrustedContactNotification(contactEmail: string, userName: string, message: string, language?: string): Promise<boolean>;
    sendWelcomeEmail(userEmail: string, userName: string, language?: string): Promise<boolean>;
    sendPasswordResetEmail(userEmail: string, resetToken: string, language?: string): Promise<boolean>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=emailService.d.ts.map