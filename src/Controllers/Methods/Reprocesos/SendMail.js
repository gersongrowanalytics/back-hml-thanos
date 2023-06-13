controller = {}
require('dotenv').config()
const fs = require('fs')
const nodemailer = require("nodemailer")
const handlebars = require('handlebars')

controller.MetSendMail = async (url_mail, from_mail, to_mail, subject_mail, data_mail) => {
    let transporter = nodemailer.createTransport({
        host: process.env.HOST_MAIL,
        port: process.env.PORT_MAIL,
        secure: true,
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.PASS_MAIL,
        },
    })

    handlebars.registerHelper('isEqual', function(a, b, opts) {
        return a == b ? opts.fn(this) : opts.inverse(this);
    })

    const html = fs.readFileSync(url_mail, 'utf8')
    const template = handlebars.compile(html)
    const renderedTemplate = template({data_mail})

    await transporter.sendMail({
        from: from_mail,
        to: [to_mail, 'Jazmin.Laguna@grow-analytics.com.pe'],
        subject: subject_mail,
        html: renderedTemplate,
    }).catch((e) => {
        console.log(e)
    })
}

module.exports = controller