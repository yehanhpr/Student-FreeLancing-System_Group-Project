import transporter from "../configs/mailer.js"

export const sendOtpEmail = async (to, otp, name) => {
    await transporter.sendMail({
        from: `"Insider Jobs" <${process.env.SMTP_USER}>`,
        to,
        subject: "Verify your email",
        text: `Hello ${name}, your OTP is ${otp}. It expires in 10 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Email Verification</h2>
                <p>Hello ${name},</p>
                <p>Your 6-digit OTP is:</p>
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 16px 0;">
                    ${otp}
                </div>
                <p>This OTP expires in 10 minutes.</p>
            </div>
        `,
    });
}

