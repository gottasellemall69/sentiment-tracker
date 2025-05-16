import * as tf from '@tensorflow/tfjs';
import { pipeline } from '@xenova/transformers';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();
let textClassificationPipeline = null;
let sentimentPipeline = null;
let isInitializing = false;

// Initialize NLP Models
export async function initializeModels() {
  if ( textClassificationPipeline || sentimentPipeline || isInitializing ) return;
  isInitializing = true;

  try {
    await tf.ready();
    if ( tf.getBackend() !== 'cpu' ) {
      await tf.setBackend( 'cpu' );
    }

    // Initialize both pipelines with specific models
    textClassificationPipeline = await pipeline(
      'sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
      dtype: 'q4'
    } );
    sentimentPipeline = await pipeline(
      'sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', {
      dtype: 'q4'
    } );

    console.log( 'NLP models initialized successfully' );
  } catch ( error ) {
    console.error( 'Error initializing NLP models:', error );
    textClassificationPipeline = null;
    sentimentPipeline = null;
  } finally {
    isInitializing = false;
  }
}

// Political spectrum categories with weighted keywords and contextual rules
const POLITICAL_CATEGORIES = {
  'far-left': {
    keywords: [ 'revolution', 'socialism', 'communist', 'abolish', 'collective', 'workers rights', 'class struggle' ],
    contextual: [ 'wealth redistribution', 'state ownership', 'planned economy' ],
    weight: 1.0
  },
  'left': {
    keywords: [ 'progressive', 'welfare', 'regulation', 'equality', 'reform', 'workers', 'unions' ],
    contextual: [ 'social programs', 'public services', 'environmental protection' ],
    weight: 1.0
  },
  'center-left': {
    keywords: [ 'liberal', 'public option', 'social', 'healthcare', 'education' ],
    contextual: [ 'mixed economy', 'regulated markets', 'social safety net' ],
    weight: 1.0
  },
  'center': {
    keywords: [ 'moderate', 'compromise', 'balance', 'bipartisan', 'pragmatic' ],
    contextual: [ 'common ground', 'practical solutions', 'middle way' ],
    weight: 1.0
  },
  'center-right': {
    keywords: [ 'conservative', 'tradition', 'market', 'fiscal', 'values' ],
    contextual: [ 'free enterprise', 'limited government', 'personal responsibility' ],
    weight: 1.0
  },
  'right': {
    keywords: [ 'freedom', 'liberty', 'deregulation', 'privatize', 'tax cuts' ],
    contextual: [ 'free market', 'individual rights', 'small government' ],
    weight: 1.0
  },
  'far-right': {
    keywords: [ 'nationalist', 'sovereignty', 'patriot', 'traditional', 'strong' ],
    contextual: [ 'national identity', 'cultural preservation', 'law and order' ],
    weight: 1.0
  }
};

// Improved Sentiment Analysis Function
export async function analyzeSentiment( text ) {
  if ( !text?.trim() ) {
    return {
      score: 0,
      magnitude: 0,
      topWords: [],
      confidence: 0,
      sentimentLabel: "neutral"
    };
  }

  try {
    if ( !textClassificationPipeline || !sentimentPipeline ) {
      await initializeModels();
    }

    // Step 1: Lexical-Based Analysis
    const lexicalSentiment = sentiment.analyze( text );
    const lexicalScore = lexicalSentiment.score / Math.max( lexicalSentiment.tokens.length, 1 );

    // Extract significant words
    const topWords = lexicalSentiment.words.length > 0
      ? lexicalSentiment.words.slice( 0, 5 )
      : text.split( ' ' ).filter( word => word.length > 3 ).slice( 0, 3 );

    // Step 2: Transformer-Based Analysis
    let transformerScore = 0;
    let confidence = 0;
    let sentimentLabel = "neutral";

    if ( sentimentPipeline ) {
      try {
        const result = await sentimentPipeline( text, { truncation: true } );
        transformerScore = result[ 0 ].label === 'NEGATIVE' ? result[ 0 ].score : -result[ 0 ].score;
        confidence = result[ 0 ].score;
        sentimentLabel = result[ 0 ].label.toLowerCase();
      } catch ( error ) {
        console.warn( 'Transformer sentiment analysis failed:', error );
      }
    }

    // Step 3: Combined Analysis
    const finalScore = ( lexicalScore * 0.4 + transformerScore * 0.6 );
    const normalizedScore = Math.max( Math.min( finalScore, 1 ), -1 );

    // Step 4: Determine Final Sentiment
    if ( Math.abs( normalizedScore ) < 0.1 ) {
      sentimentLabel = "neutral";
    } else if ( normalizedScore > 0 ) {
      sentimentLabel = normalizedScore > 0.5 ? "very positive" : "positive";
    } else {
      sentimentLabel = normalizedScore < -0.5 ? "very negative" : "negative";
    }

    return {
      score: normalizedScore,
      magnitude: Math.abs( normalizedScore ),
      topWords,
      confidence: Math.max( confidence, Math.abs( normalizedScore ) ),
      sentimentLabel
    };
  } catch ( error ) {
    console.error( 'Sentiment analysis failed:', error );
    return {
      score: 0,
      magnitude: 0,
      topWords: [],
      confidence: 0,
      sentimentLabel: "neutral"
    };
  }
}

// Improved Political Spectrum Prediction
export async function predictPoliticalSpectrum( text ) {
  if ( !text?.trim() ) {
    return { spectrum: 'center', confidence: 0 };
  }

  const lowercaseText = text.toLowerCase();
  const words = lowercaseText.split( /\s+/ );

  try {
    // Step 1: Transformer-Based Classification
    if ( textClassificationPipeline ) {
      try {
        const result = await textClassificationPipeline( text, { truncation: true } );
        const transformerConfidence = result[ 0 ].score;

        // Only use transformer result if confidence is high
        if ( transformerConfidence > 0.8 ) {
          return {
            spectrum: result[ 0 ].label === 'NEGATIVE' ? 'right' : 'left',
            confidence: transformerConfidence
          };
        }
      } catch ( error ) {
        console.warn( 'Transformer classification failed:', error );
      }
    }

    // Step 2: Enhanced Keyword Analysis
    let categoryScores = Object.entries( POLITICAL_CATEGORIES ).map( ( [ category, data ] ) => {
      let score = 0;

      // Direct keyword matches
      data.keywords.forEach( keyword => {
        const keywordWords = keyword.toLowerCase().split( /\s+/ );
        if ( keywordWords.length === 1 ) {
          // Single word keyword
          const matches = words.filter( word => word === keyword ).length;
          score += matches * data.weight;
        } else {
          // Multi-word keyword
          if ( lowercaseText.includes( keyword ) ) {
            score += data.weight * 1.5; // Higher weight for phrase matches
          }
        }
      } );

      // Contextual analysis
      data.contextual.forEach( context => {
        if ( lowercaseText.includes( context.toLowerCase() ) ) {
          score += data.weight * 0.8;
        }
      } );

      return { category, score };
    } );

    // Sort by score and get the highest
    categoryScores.sort( ( a, b ) => b.score - a.score );
    const highestScore = categoryScores[ 0 ];
    const secondHighestScore = categoryScores[ 1 ];

    // Calculate confidence based on score difference
    const scoreDifference = highestScore.score - secondHighestScore.score;
    const confidence = Math.min( Math.max( scoreDifference * 0.3, 0.1 ), 1 );

    // Return center if no strong signals
    if ( highestScore.score < 0.2 ) {
      return { spectrum: 'center', confidence: 0.3 };
    }

    return {
      spectrum: highestScore.category,
      confidence
    };
  } catch ( error ) {
    console.error( 'Political spectrum prediction failed:', error );
    return { spectrum: 'center', confidence: 0.1 };
  }
}

// Initialize models on load
( async () => {
  try {
    await initializeModels();
  } catch ( error ) {
    console.warn( 'Initial model load failed, will retry on first use:', error );
  }
} )();