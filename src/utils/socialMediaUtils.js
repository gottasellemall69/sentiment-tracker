import { analyzeSentiment } from '../utils/nlpUtils';

export async function analyzeFacebookPost(post) {
  const sentiment = await analyzeSentiment(post);
  return {
    platform: 'facebook',
    content: post,
    sentiment,
    timestamp: Date.now(),
  };
}
