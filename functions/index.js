/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import { https } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import logger from "firebase-functions/logger";
import { post } from "axios";

export const verifyRecaptcha = https.onRequest(async (req, res) => {
    const { token } = req.body;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    try {
        const response = await post(
            `https://www.google.com/recaptcha/api/siteverify`,
            {},
            {
                params: {
                    secret: secretKey,
                    response: token,
                },
            }
        );

        const { success, score } = response.data;

        if (success && score > 0.5) {
            res.status(200).send({ success: true });
        } else {
            res.status(400).send({ success: false });
        }
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});
