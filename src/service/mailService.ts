import nodemailer from "nodemailer";

class MailService {
  private transporter: nodemailer.Transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendActivationMail(email: string, activationLink: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Activate your account",
      text: "",
      html: `
        <div>
          <h1>
            To activate, follow the link
          </h1>
          <a href="${activationLink}">${activationLink}</a>
        </div>
      `,
    });
  }
}

export const mailService = new MailService();
