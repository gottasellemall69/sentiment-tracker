import clientPromise from '../../utils/mongoClient';
import axios from 'axios';

export default async (req, res) => {
    if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('sentimentTracker');
      const collection = db.collection('feedback');

       // Fetch documents from the feedback collection
       const feedbackData = await collection.find({}).toArray();
       res.status(200).json(feedbackData);
    } catch (error) {
      res.status(500).json({ error: 'Unable to fetch feedback data: ' + error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};