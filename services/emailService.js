const nodemailer = require('nodemailer');
const smtpSettings = require('../models/smtpSettings');

const createTransporter = async () => {
    const settings = await smtpSettings.getSmtpSettings();
    return nodemailer.createTransport({
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        auth: {
            user: settings.username,
            pass: settings.password,
        },
    });
};

const sendEmail = async (to, subject, text) => {
    const transporter = await createTransporter();
    const settings = await smtpSettings.getSmtpSettings();
    const mailOptions = {
        from: `"${settings.from_name}" <${settings.from_email}>`,
        to,
        subject,
        text,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendEmail,
};
