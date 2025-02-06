import * as tf from '@tensorflow/tfjs';
import { pipeline } from '@xenova/transformers';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();
let textClassificationPipeline = null;
let sentimentPipeline = null;
let isInitializing = false;

// Initialize NLP Models
export async function initializeModels() {
  if (textClassificationPipeline || sentimentPipeline || isInitializing) return;
  isInitializing = true;

  try {
    await tf.ready();
    if (tf.getBackend() !== 'cpu') {
      await tf.setBackend('cpu');
    }

    textClassificationPipeline = await pipeline('text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
    sentimentPipeline = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');

    console.log('NLP models initialized successfully');
  } catch (error) {
    console.error('Error initializing NLP models:', error);
    textClassificationPipeline = null;
    sentimentPipeline = null;
  } finally {
    isInitializing = false;
  }
}

// Improved Sentiment Analysis Function
export async function analyzeSentiment(text) {
  if (!text?.trim()) {
    return { score: 0, magnitude: 0, topWords: [], confidence: 0, sentimentLabel: "neutral" };
  }

  try {
    if (!textClassificationPipeline || !sentimentPipeline) {
      await initializeModels();
    }

    // Step 1: Lexical-Based Sentiment Analysis
    const lexicalSentiment = sentiment.analyze(text);
    let lexicalScore = lexicalSentiment.score / Math.max(lexicalSentiment.tokens.length, 1);

    // Extract top contributing words (ensure at least 1 word)
    let topWords = lexicalSentiment.words.slice(0, 5);
    if (topWords.length === 0) {
      topWords = text.split(' ').slice(0, 3); // Fallback: Use first 3 words
    }

    // Step 2: Transformer-Based Sentiment Analysis
    let transformerScore = 0;
    let confidence = 0;
    let sentimentLabel = "neutral";

    if (sentimentPipeline) {
      try {
        const result = await sentimentPipeline(text, { truncation: true });
        transformerScore = result[0].label === 'POSITIVE' ? result[0].score : -result[0].score;
        confidence = result[0].score;
        sentimentLabel = result[0].label.toLowerCase();
      } catch (error) {
        console.warn('Transformer sentiment analysis failed:', error);
      }
    }

    // Step 3: Weighted Average for Final Score
    const finalSentimentScore = (lexicalScore * 0.3 + transformerScore * 0.7);
    const normalizedScore = Math.max(Math.min(finalSentimentScore, 1), -1);

    // Step 4: Detect Neutral Sentiment
    if (Math.abs(normalizedScore) < 0.1) {
      sentimentLabel = "neutral";
    }

    return {
      score: normalizedScore,
      magnitude: Math.abs(normalizedScore),
      topWords,
      confidence: Math.max(confidence, 0.01),
      sentimentLabel
    };
  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    return { score: {}, magnitude: {}, topWords: [], confidence: {}, sentimentLabel: "neutral" };
  }
}

// Improved Political Spectrum Prediction
const POLITICAL_CATEGORIES = {
  'far-left': { keywords: ['revolution', 'socialism', 'communist', 'abolish', 'collective', 'undocumented immigrant', 'immigration', 'MAGA', 'nazi'], weight: 1.0 },
  'left': { keywords: ['progressive', 'welfare', 'regulation', 'equality', 'reform', 'undocumented immigrant', 'immigration',], weight: 0.6 },
  'center-left': { keywords: ['liberal', 'public', 'social', 'healthcare', 'education', 'undocumented immigrant', 'immigration',], weight: 0.3 },
  'center': { keywords: ['moderate', 'compromise', 'balance', 'bipartisan', 'pragmatic'], weight: 0.0 },
  'center-right': { keywords: ['conservative', 'tradition', 'market', 'fiscal', 'values', 'illegal alien', 'invasion', 'border war'], weight: -0.3 },
  'right': { keywords: ['freedom', 'liberty', 'deregulation', 'privatize', 'tax cuts', 'illegal alien', 'invasion', 'border war'], weight: -0.6 },
  'far-right': { keywords: ['nationalist', 'sovereignty', 'patriot', 'traditional', 'strong', 'illegal alien', 'invasion', 'border war', 'the Libs', 'Dems', 'MAGA', 'fascist'], weight: -1.0 },
};

export async function predictPoliticalSpectrum(text) {
  const lowercaseText = text.toLowerCase();
  
  let scores = Object.entries(POLITICAL_CATEGORIES).map(([category, data]) => {
    let score = data.keywords.reduce((acc, keyword) => {
      const matchCount = lowercaseText.split(keyword.toLowerCase()).length - 1; // Count occurrences
      return acc + matchCount * data.weight;
    }, 0);
    return { category, score };
  });

  // Find the highest scoring category
  scores.sort((a, b) => b.score - a.score);
  let highestScore = scores[0];

  // If no strong matches, use transformer classification
  if (highestScore.score === 0 && textClassificationPipeline) {
    try {
      const result = await textClassificationPipeline(text, { topk: 1, truncation: true });
      const sentiment = result[0].label;
      const confidence = result[0].score;

      return {
        spectrum: sentiment === 'POSITIVE' ? 'center-right' : 'center-left',
        confidence
      };
    } catch (error) {
      console.warn('Transformer classification failed:', error);
    }
  }

  return {
    spectrum: highestScore.score !== 0 ? highestScore.category : 'center',
    confidence: Math.min(Math.abs(highestScore.score), 1)
  };
}

// Initialize models on load
(async () => {
  await initializeModels();
})();
