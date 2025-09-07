import nodemailer from "nodemailer";
import { EmailOptions } from "@/types";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  // Send trusted contact notification
  async sendTrustedContactNotification(
    contactEmail: string,
    userName: string,
    message: string,
    language: string = "en"
  ): Promise<boolean> {
    const templates = {
      en: {
        subject: "Lucidify - Trusted Contact Notification",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">Lucidify Mental Health App</h2>
            <p>Hello,</p>
            <p>You have been set as a trusted contact for <strong>${userName}</strong> on the Lucidify mental health app.</p>
            <p><strong>Message from ${userName}:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;">${message}</p>
            </div>
            <p>If you have any concerns about ${userName}'s wellbeing, please reach out to them or consider contacting a mental health professional.</p>
            <p>Best regards,<br>The Lucidify Team</p>
          </div>
        `,
      },
      si: {
        subject: "Lucidify - විශ්වාසදායක සම්බන්ධතා දැනුම්දීම",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">Lucidify මානසික සෞඛ්‍ය යෙදුම</h2>
            <p>ආයුබෝවන්,</p>
            <p>Lucidify මානසික සෞඛ්‍ය යෙදුමේ <strong>${userName}</strong> සඳහා ඔබ විශ්වාසදායක සම්බන්ධතාවක් ලෙස සැකසී ඇත.</p>
            <p><strong>${userName} වෙතින් පණිවිඩය:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;">${message}</p>
            </div>
            <p>${userName} හි යහපැවැත්ම ගැන ඔබට කිසියම් සැකයක් ඇත්නම්, කරුණාකර ඔවුන් හා සම්බන්ධ වන්න හෝ මානසික සෞඛ්‍ය වෘත්තිකයෙකු හා සම්බන්ධ වන්න.</p>
            <p>සුභ පැතුම්,<br>Lucidify කණ්ඩායම</p>
          </div>
        `,
      },
      ta: {
        subject: "Lucidify - நம்பகமான தொடர்பு அறிவிப்பு",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">Lucidify மனநல பயன்பாடு</h2>
            <p>வணக்கம்,</p>
            <p>Lucidify மனநல பயன்பாட்டில் <strong>${userName}</strong> க்கு நீங்கள் நம்பகமான தொடர்பாக அமைக்கப்பட்டுள்ளீர்கள்.</p>
            <p><strong>${userName} இலிருந்து செய்தி:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;">${message}</p>
            </div>
            <p>${userName} இன் நல்வாழ்வு குறித்து உங்களுக்கு எந்த கவலையும் இருந்தால், தயவுசெய்து அவர்களிடம் தொடர்பு கொள்ளுங்கள் அல்லது மனநல வல்லுநரை அணுகுங்கள்.</p>
            <p>அன்புடன்,<br>Lucidify குழு</p>
          </div>
        `,
      },
    };

    const template =
      templates[language as keyof typeof templates] || templates.en;

    return await this.sendEmail({
      to: contactEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  // Send welcome email
  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
    language: string = "en"
  ): Promise<boolean> {
    const templates = {
      en: {
        subject: "Welcome to Lucidify - Your Mental Health Journey Starts Here",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">Welcome to Lucidify!</h2>
            <p>Hello ${userName},</p>
            <p>Welcome to Lucidify, your AI-powered mental health companion designed specifically for young adults in Sri Lanka.</p>
            <p>Here's what you can do with Lucidify:</p>
            <ul>
              <li>Track your daily mood and emotions</li>
              <li>Write in your personal journal with AI-powered prompts</li>
              <li>Chat with our AI assistant for mental health support</li>
              <li>Practice 8-minute wellness sessions</li>
              <li>Discover personalized coping strategies</li>
            </ul>
            <p>Your mental health journey starts now. Remember, it's okay to not be okay, and we're here to support you every step of the way.</p>
            <p>Best regards,<br>The Lucidify Team</p>
          </div>
        `,
      },
      si: {
        subject:
          "Lucidify වෙත සාදරයෙන් පිළිගනිමු - ඔබේ මානසික සෞඛ්‍ය ගමන ආරම්භ වේ",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">Lucidify වෙත සාදරයෙන් පිළිගනිමු!</h2>
            <p>ආයුබෝවන් ${userName},</p>
            <p>Lucidify වෙත සාදරයෙන් පිළිගනිමු, ශ්‍රී ලංකාවේ තරුණ වැඩිහිටියන් සඳහා විශේෂයෙන් සැලසුම් කරන ලද AI-බලගැන්වූ මානසික සෞඛ්‍ය සහයකයා.</p>
            <p>Lucidify සමඟ ඔබට කළ හැකි දේ:</p>
            <ul>
              <li>ඔබේ දෛනික මනෝභාවය සහ චිත්තවේග ට්‍රැක් කරන්න</li>
              <li>AI-බලගැන්වූ ප්‍රොම්ප්ට් සමඟ ඔබේ පුද්ගලික ජර්නලයේ ලියන්න</li>
              <li>මානසික සෞඛ්‍ය සහය සඳහා අපගේ AI සහායකයා සමඟ කතා කරන්න</li>
              <li>මිනිත්තු 8 ක යහපැවැත්මේ සැසි පුරුදු කරන්න</li>
              <li>පුද්ගලීකරණය කරන ලද මුහුණ දීමේ උපායන් සොයා ගන්න</li>
            </ul>
            <p>ඔබේ මානසික සෞඛ්‍ය ගමන දැන් ආරම්භ වේ. මතක තබා ගන්න, හොඳ නොවීම හොඳය, සහ අපි ඔබේ සෑම පියවරකදීම සහාය වීමට මෙහි සිටිමු.</p>
            <p>සුභ පැතුම්,<br>Lucidify කණ්ඩායම</p>
          </div>
        `,
      },
      ta: {
        subject:
          "Lucidify க்கு வரவேற்கிறோம் - உங்கள் மனநல பயணம் இங்கே தொடங்குகிறது",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">Lucidify க்கு வரவேற்கிறோம்!</h2>
            <p>வணக்கம் ${userName},</p>
            <p>Lucidify க்கு வரவேற்கிறோம், இலங்கையின் இளம் வயதினருக்காக குறிப்பாக வடிவமைக்கப்பட்ட AI-இயக்கப்பட்ட மனநல துணை.</p>
            <p>Lucidify உடன் நீங்கள் செய்யக்கூடியவை:</p>
            <ul>
              <li>உங்கள் தினசரி மனநிலை மற்றும் உணர்வுகளை கண்காணிக்கவும்</li>
              <li>AI-இயக்கப்பட்ட கேள்விகளுடன் உங்கள் தனிப்பட்ட பத்திரிகையில் எழுதுங்கள்</li>
              <li>மனநல ஆதரவுக்காக எங்கள் AI உதவியாளருடன் பேசுங்கள்</li>
              <li>8 நிமிட நல்வாழ்வு அமர்வுகளை பயிற்சி செய்யுங்கள்</li>
              <li>தனிப்பயனாக்கப்பட்ட சமாளிக்கும் உத்திகளை கண்டறியுங்கள்</li>
            </ul>
            <p>உங்கள் மனநல பயணம் இப்போது தொடங்குகிறது. நினைவில் கொள்ளுங்கள், நன்றாக இல்லாதது சரி, மற்றும் நாங்கள் உங்கள் ஒவ்வொரு படியிலும் ஆதரவளிக்க இங்கே இருக்கிறோம்.</p>
            <p>அன்புடன்,<br>Lucidify குழு</p>
          </div>
        `,
      },
    };

    const template =
      templates[language as keyof typeof templates] || templates.en;

    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string,
    language: string = "en"
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const templates = {
      en: {
        subject: "Lucidify - Password Reset Request",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password for your Lucidify account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>The Lucidify Team</p>
          </div>
        `,
      },
      si: {
        subject: "Lucidify - මුරපදය යළි සැකසීමේ ඉල්ලීම",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">මුරපදය යළි සැකසීමේ ඉල්ලීම</h2>
            <p>ආයුබෝවන්,</p>
            <p>ඔබේ Lucidify ගිණුම සඳහා මුරපදය යළි සැකසීමට ඔබ ඉල්ලා ඇත.</p>
            <p>ඔබේ මුරපදය යළි සැකසීමට පහත බොත්තම ක්ලික් කරන්න:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">මුරපදය යළි සැකසීම</a>
            </div>
            <p>බොත්තම ක්‍රියා නොකරන්නේ නම්, මෙම සබැඳිය ඔබේ බ්‍රවුසරයට පිටපත් කර අලවන්න:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>ආරක්ෂණ හේතූන් මත මෙම සබැඳිය පැය 1 කින් කල් ඉකුත් වේ.</p>
            <p>ඔබ මෙම මුරපදය යළි සැකසීම ඉල්ලා නොසිටියේ නම්, කරුණාකර මෙම ඊමේල් නොසලකා හරින්න.</p>
            <p>සුභ පැතුම්,<br>Lucidify කණ්ඩායම</p>
          </div>
        `,
      },
      ta: {
        subject: "Lucidify - கடவுச்சொல் மீட்டமைப்பு கோரிக்கை",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">கடவுச்சொல் மீட்டமைப்பு கோரிக்கை</h2>
            <p>வணக்கம்,</p>
            <p>உங்கள் Lucidify கணக்கிற்கான கடவுச்சொல்லை மீட்டமைக்க நீங்கள் கோரியுள்ளீர்கள்.</p>
            <p>உங்கள் கடவுச்சொல்லை மீட்டமைக்க கீழே உள்ள பொத்தானை கிளிக் செய்யுங்கள்:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">கடவுச்சொல் மீட்டமைக்க</a>
            </div>
            <p>பொத்தான் வேலை செய்யவில்லை என்றால், இந்த இணைப்பை உங்கள் உலாவியில் நகலெடுத்து ஒட்டவும்:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>பாதுகாப்பு காரணங்களுக்காக இந்த இணைப்பு 1 மணி நேரத்தில் காலாவதியாகும்.</p>
            <p>இந்த கடவுச்சொல் மீட்டமைப்பை நீங்கள் கோரவில்லை என்றால், தயவுசெய்து இந்த மின்னஞ்சலை புறக்கணிக்கவும்.</p>
            <p>அன்புடன்,<br>Lucidify குழு</p>
          </div>
        `,
      },
    };

    const template =
      templates[language as keyof typeof templates] || templates.en;

    return await this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });
  }
}

export default new EmailService();
