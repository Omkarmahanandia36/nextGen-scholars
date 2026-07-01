import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({ path: ".env.local" });

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

console.log("Email Config:");
console.log("EMAIL_USER:", user);
console.log("EMAIL_PASS length:", pass ? pass.length : 0);

if (!user || !pass) {
  console.error("EMAIL_USER or EMAIL_PASS not defined in .env.local");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass,
  },
});

async function main() {
  try {
    console.log("Verifying Nodemailer connection...");
    await transporter.verify();
    console.log("✅ Nodemailer connection successfully verified!");

    console.log("Sending test email to nextgenscholar02@gmail.com...");
    const info = await transporter.sendMail({
      from: user,
      to: "nextgenscholar02@gmail.com",
      subject: "Nodemailer Test Email",
      text: "This is a test email sent to verify Nodemailer credentials.",
      html: "<h3>Nodemailer Test Email</h3><p>This is a test email sent to verify Nodemailer credentials.</p>",
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (error: any) {
    console.error("❌ Failed to send email or verify connection:");
    console.error(error);
  }
}

main();
