const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SG_API_KEY);

const sendWelcomeEmail = (email, name)=>{
    sgMail.send({
        from: 'babak@pia.com',
        to: email,
        subject: 'Congrats for joining us '+name,
        text: 'do you have any question? ask us!'
    })
};

const sendGoodbyeEmail = (email, name)=>{
    sgMail.send({
        from: 'babak@pia.com',
        to: email,
        subject: 'Goodbye dear '+name,
        text: 'did anything bother you? let us know!'
    })
};

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail,
};