import nodemailer from "nodemailer";
import dotenv from "dotenv"
dotenv.config()

// create a transporter 
const sendEmail = async options => {
  // creating a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.MAILHOST,
        port: process.env.MAILPORT,
        secure: false,
        auth:{
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS
        }
    })
    try {
  await transporter.verify();
  console.log("Server is ready to take our messages");
} catch (err) {
  console.error("Verification failed:", err);
}
// define the email options and send mail
const info = await transporter.sendMail({
    from:`Gabriel Christian <${process.env.MAILFROM}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
});

}

export default sendEmail

