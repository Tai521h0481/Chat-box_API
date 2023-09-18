const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // assuming you have a Users model

const app = express();
app.use(express.json());

app.post('/create-user', async (req, res) => {
    const { Fullname, Email } = req.body;
    const Password = Email.split('@')[0].toLowerCase();

    try {
       
        let transporter = nodemailer.createTransport({
            service: 'hotmail',
            auth: {
                user: 'taikhoanlmng@outlook.com',
                pass: 'matkhau123'
            }
        });

        let mailOptions = {
            from: 'taikhoanlmng@outlook.com',
            to: Email,
            subject: 'Welcome to Our App',
            text: `Please click the link to login: http://localhost:3000/login/1234556666`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                res.status(500).json({ message: error.message });
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).json({ message: 'Email sent' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/login/:token', (req, res) => {
    jwt.verify(req.params.token, 'your-secret-key', function(err, decoded) {
        if (err) {
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        } else {
            // Log the user in
        }
    });
});

app.listen(3000, () => console.log('Server started on port 3000'));
