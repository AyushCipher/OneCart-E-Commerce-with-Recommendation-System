import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, otp) => {
  await transporter.sendMail({
    from: `"OneCart Support" <${process.env.EMAIL}>`,
    to,
    subject: "Verify Your Email - OTP",
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px;background:#f4f6f8;">
        <h2 style="color:#333;">Email Verification</h2>
        <p>Your OTP to verify your email is:</p>
        <div style="font-size:24px;font-weight:bold;margin:20px auto;padding:15px;background:#3b82f6;color:white;text-align:center;border-radius:5px;width:fit-content;">
          ${otp}
        </div>
        <p>This code will expire in <strong>5 minutes</strong>. Please do not share it with others.</p>
        <p>Thank you,</p>
        <p><strong>OneCart Team</strong></p>
      </div>
    `,
  });
};

// Contact Form Email
export const sendContactMail = async (name, email, subject, message) => {
  await transporter.sendMail({
    from: `"OneCart Contact Form" <${process.env.EMAIL}>`,
    to: process.env.EMAIL, // Email to admin/company
    subject: `📩 Contact Form: ${subject}`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px;background:#f4f6f8;">
        <h2 style="color:#333;">New Contact Form Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
        <br/>
        <small>This email was sent via OneCart's contact form.</small>
      </div>
    `,
  });
};

export default sendMail;
