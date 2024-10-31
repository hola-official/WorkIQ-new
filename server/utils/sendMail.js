const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");
const dotenv = require("dotenv");
dotenv.config();

let config = {
	service: "gmail",
	host: "smtp.gmail.com",
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD,
	},
};

let transporter = nodemailer.createTransport(config);

const sendMail = async (options) => {
    const { email, subject, template, data } = options;

	// get the path to the email template file
	const templatePath = path.join(__dirname, '../mails', template);

	// render the email template with EJS
	const html = await ejs.renderFile(templatePath, data);

	const mailOptions = {
		from: process.env.EMAIL,
		to: email,
		subject,
		html,
	};

	await transporter.sendMail(mailOptions);
}

module.exports = {sendMail}