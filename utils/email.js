const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Jogeshwar Singh <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        //send real emails if in production -SendGrid
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid',    //this is a predefined service
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Send the actual email
    async send(template, subject) {
        // 1) Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: convert(html)   //convert html to text --new way as older function is deprecated
        };

        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset() {
        await this.send(
            'passwordReset',
            'Your password reset token (valid for only 10 minutes)'
        );
    }
}

// const sendEmail = async options => {
//     // 1) Create a transporter
//     // service to send the email -eg) like we have gmail
//     const transporter = nodemailer.createTransport({
//         // service: 'Gmail',     //there are other popular ones also here
//         // we wont use gmail here as it is not good for production app as there is a limit and u may be marked as spammer

//         // we use MAIL TRAP here
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }

//         // if we do for gmail --Activate in gmail "less secure app" option
//     });

//     // 2) Define the email options
//     const mailOptions = {
//         from: 'Jogeshwar Singh <hello@gmail.com>',
//         to: options.email,      //options object is the argument passed to this function
//         subject: options.subject,
//         text: options.message
//         // html:
//     };

//     // 3) Actually send the email
//     await transporter.sendMail(mailOptions);
// };
