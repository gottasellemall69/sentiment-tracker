import * as tf from '@tensorflow/tfjs';
import { pipeline } from '@xenova/transformers';
import Sentiment from 'sentiment';

const sentiment = new Sentiment();
let textClassificationPipeline = null;
let sentimentPipeline = null;
let isInitializing = false;

export async function initializeModels() {
  if ( textClassificationPipeline || sentimentPipeline || isInitializing ) return;
  isInitializing = true;

  try {
    await tf.ready();
    if ( tf.getBackend() !== 'cpu' ) {
      await tf.setBackend( 'cpu' );
    }

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

    const lexicalSentiment = sentiment.analyze( text );
    const lexicalScore = lexicalSentiment.score / Math.max( lexicalSentiment.tokens.length, 1 );

    const topWords = lexicalSentiment.words.length > 0
      ? lexicalSentiment.words.slice( 0, 5 )
      : text.split( ' ' ).filter( word => word.length > 3 ).slice( 0, 3 );

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

    const finalScore = ( lexicalScore * 0.4 + transformerScore * 0.6 );
    const normalizedScore = Math.max( Math.min( finalScore, 1 ), -1 );

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

export async function predictPoliticalSpectrum( text ) {
  if ( !text?.trim() ) {
    return { spectrum: 'center', confidence: 0 };
  }

  const lowercaseText = text.toLowerCase();
  const words = lowercaseText.split( /\s+/ );

  try {
    if ( textClassificationPipeline ) {
      try {
        const result = await textClassificationPipeline( text, { truncation: true } );
        const transformerConfidence = result[ 0 ].score;

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

    let categoryScores = Object.entries( POLITICAL_CATEGORIES ).map( ( [ category, data ] ) => {
      let score = 0;

      data.keywords.forEach( keyword => {
        const keywordWords = keyword.toLowerCase().split( /\s+/ );
        if ( keywordWords.length === 1 ) {
          const matches = words.filter( word => word === keyword ).length;
          score += matches * data.weight;
        } else {
          if ( lowercaseText.includes( keyword ) ) {
            score += data.weight * 1.5;
          }
        }
      } );

      data.contextual.forEach( context => {
        if ( lowercaseText.includes( context.toLowerCase() ) ) {
          score += data.weight * 0.8;
        }
      } );

      return { category, score };
    } );

    categoryScores.sort( ( a, b ) => b.score - a.score );
    const highestScore = categoryScores[ 0 ];
    const secondHighestScore = categoryScores[ 1 ];

    const scoreDifference = highestScore.score - secondHighestScore.score;
    const confidence = Math.min( Math.max( scoreDifference * 0.3, 0.1 ), 1 );

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

( async () => {
  try {
    await initializeModels();
  } catch ( error ) {
    console.warn( 'Initial model load failed, will retry on first use:', error );
  }
})();