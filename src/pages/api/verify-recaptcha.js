import express from 'express';
import { post } from 'axios';
const app = express();

app.post('/verify-feedback', async (req, res) => {
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
        return res.status(400).json({ message: 'Token is missing' });
    }

    try {
        const response = await post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: recaptchaToken
            }
        });

        if (response.data.success && response.data.score >= 0.5) {
            // Proceed with the feedback processing
            res.status(200).json({ message: 'Feedback accepted' });
        } else {
            res.status(400).json({ message: 'Failed reCAPTCHA verification' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});