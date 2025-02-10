import clientPromise from '../../utils/mongoClient';
import axios from 'axios';
import { analyzeSentiment, predictPoliticalSpectrum } from '../../utils/nlpUtils';

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db('sentimentTracker');
      const collection = db.collection('feedback');

      // Parse request body
      const { feedback, recaptchaToken, politicalSpectrum, predictedSpectrum, timestamp, source } = req.body;

      if (!feedback || feedback.length < 10 || feedback.length > 10000) {
        return res.status(400).json({ success: false, error: 'Invalid feedback length' });
      }

      if (source !== 'uploaded' && !recaptchaToken) {
        return res.status(400).json({ success: false, error: 'ReCAPTCHA token is required' });
      }

      // ReCAPTCHA verification (only for non-uploaded feedback)
      if (source !== 'uploaded') {
        const recaptchaResponse = await axios.post(
          'https://www.google.com/recaptcha/api/siteverify',
          null,
          { params: { secret: RECAPTCHA_SECRET_KEY, response: recaptchaToken } }
        );

        if (!recaptchaResponse.data.success) {
          return res.status(400).json({ success: false, error: 'Invalid ReCAPTCHA' });
        }
      }

      // **Sentiment Analysis & Political Spectrum Prediction**
      const sentimentAnalysis = await analyzeSentiment(feedback);
      const spectrumAnalysis = await predictPoliticalSpectrum(feedback);


// Construct document using the predicted spectrum from the form if provided
const document = {
  feedback: feedback.trim(),
  politicalSpectrum: politicalSpectrum?.trim() || spectrumAnalysis.spectrum,
  predictedSpectrum: predictedSpectrum || spectrumAnalysis.spectrum,  // Use passed predictedSpectrum if available
  sentiment: {
    score: sentimentAnalysis.score,
    magnitude: sentimentAnalysis.magnitude,
    confidence: sentimentAnalysis.confidence,
    topWords: sentimentAnalysis.topWords,
  },
  timestamp: timestamp || new Date(),
  source: source || "feedback-form",
};


      // Insert into MongoDB
      const result = await collection.insertOne(document);

      res.status(201).json({ success: true, insertedId: result.insertedId, feedback: document });
    } catch (error) {
      console.error('Error inserting document:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
