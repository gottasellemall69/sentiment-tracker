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

export const POLITICAL_CATEGORIES = {
  // Far-Left
  'far-left': {
    keywords: [
      'tax the rich', 'soak the rich', 'wealth tax',
      'climate justice', 'environmental justice',
      'defund the police', 'abolish the police', 'end police funding',
      'abolish capitalism', 'smash capitalism', 'no to private enterprise',
      'end private prisons', 'prison abolition', 'close for-profit prisons',
      'solidarity forever', 'worker solidarity', 'union power',
      'worker revolution', 'proletarian revolution', 'global workers uprising',
      'class struggle', 'rich vs. poor', 'bottom-up power',
      'redistribute wealth', 'wealth redistribution', 'equal share of resources',
      'dismantle patriarchy', 'gender liberation', 'end patriarchal systems',
      'seize the means', 'take the means of production',
      'power to the people', 'people power', 'mass empowerment',
      'organize the masses', 'mass organization', 'grassroots uprising',
      'revolution now', 'immediate uprising', 'overthrow the system',
      'systemic oppression', 'institutional oppression',
      'smash the state', 'tear down the state',
      'anti-imperialism', 'no empire', 'end foreign domination',
      'people’s liberation', 'liberate the people',
      'workers of the world', 'international proletariat',
      'direct action', 'take direct action'
    ],
    contextual: [ 'wealth redistribution', 'state ownership', 'planned economy' ],
    weight: 1.0
  },

  // Left
  'left': {
    keywords: [
      'universal healthcare', 'single payer healthcare',
      'income inequality', 'wealth gap', 'economic disparity',
      'affordable housing', 'housing for all',
      'green new deal', 'environmental overhaul',
      'fight racism', 'combat racism', 'anti-racist policies',
      'women’s rights', 'gender equality',
      'lgbtq+ rights', 'queer liberation',
      'living wage', 'fair wage', 'minimum decent wage',
      'social justice', 'fairness for all',
      'corporate accountability', 'hold corporations accountable',
      'climate action', 'act on climate change',
      'protect medicare', 'save medicare',
      'expand social safety net', 'strengthen social programs',
      'stop voter suppression', 'end voter disenfranchisement',
      'fund public schools', 'invest in education',
      'raise minimum wage', 'increase base pay',
      'clean energy jobs', 'renewable energy employment',
      'protect reproductive rights', 'defend abortion access',
      'end discrimination', 'fight bias',
      'community investment', 'invest in communities'
    ],
    contextual: [ 'social programs', 'public services', 'environmental protection' ],
    weight: 1.0
  },

  // Center-Left
  'center-left': {
    keywords: [
      'common sense', 'practical solutions',
      'bipartisan', 'cross-party cooperation',
      'balanced approach', 'well-rounded policy',
      'moderate', 'centrist leanings',
      'incremental change', 'step-by-step reform',
      'working families', 'family-focused policy',
      'bridge divides', 'close partisan gaps',
      'pragmatic solutions', 'real-world fixes',
      'responsible spending', 'fiscally cautious',
      'public-private partnership', 'govt-business collaboration',
      'fiscal prudence', 'budget discipline',
      'evidence-based policy', 'data-driven decisions',
      'smart regulation', 'targeted oversight',
      'centrist coalition', 'broad alliance',
      'across the aisle', 'bipartisan support',
      'consensus building', 'finding middle ground',
      'steady progress', 'gradual improvement',
      'middle path', 'third way',
      'thoughtful reform', 'considered change',
      'inclusive growth', 'growth for all'
    ],
    contextual: [ 'mixed economy', 'regulated markets', 'social safety net' ],
    weight: 1.0
  },

  // Center
  'center': {
    keywords: [
      'neutral', 'impartial',
      'objective', 'unbiased',
      'balanced', 'equitable',
      'nonpartisan', 'apolitical',
      'status quo', 'existing order',
      'steady hand', 'calm leadership',
      'middle ground', 'common ground',
      'centrist', 'moderate stance',
      'equilibrium', 'stability',
      'clear-eyed', 'level-headed',
      'measured response', 'calm reaction',
      'no spin', 'straight talk',
      'fact-based', 'evidence-first',
      'sound judgment', 'good sense',
      'unbiased', 'fair-minded',
      'moderation', 'restraint',
      'pragmatic', 'realistic',
      'steady leadership', 'reliable governance'
    ],
    contextual: [ 'common ground', 'practical solutions', 'middle way' ],
    weight: 1.0
  },

  // Center-Right
  'center-right': {
    keywords: [
      'fiscal responsibility', 'budget responsibility',
      'market reform', 'economic liberalization',
      'strong defense', 'robust military',
      'tax cuts', 'lower taxes',
      'limit government', 'shrink govt',
      'free enterprise', 'entrepreneurial freedom',
      'individual liberty', 'personal freedom',
      'economic growth', 'growth economy',
      'prudent regulation', 'limited oversight',
      'public safety', 'lawful order',
      'small businesses', 'mom-and-pop shops',
      'job creators', 'employers first',
      'balanced budget', 'budget balance',
      'defense spending', 'defense investment',
      'secure borders', 'border enforcement',
      'property rights', 'private property',
      'entrepreneurship', 'startup culture',
      'sound money', 'monetary stability',
      'reduce red tape', 'cut bureaucracy',
      'lawful immigration', 'legal immigration'
    ],
    contextual: [ 'free enterprise', 'limited government', 'personal responsibility' ],
    weight: 1.0
  },

  // Right
  'right': {
    keywords: [
      'traditional values', 'conservative values',
      'family values', 'family first',
      'patriotism', 'love of country',
      'law and order', 'tough on crime',
      'second amendment', 'gun rights',
      'border security', 'secure borders',
      'small government', 'limited govt',
      'personal responsibility', 'self-reliance',
      'rule of law', 'legal order',
      'American exceptionalism', 'US exceptionalism',
      'pro-life', 'anti-abortion',
      'school choice', 'education vouchers',
      'military strength', 'strong armed forces',
      'support our troops', 'back the troops',
      'patriotic duty', 'civic duty',
      'guard the constitution', 'defend the constitution',
      'religious freedom', 'faith liberties',
      'hard work pays', 'work ethic',
      'secure the homeland', 'homeland security',
      'veteran support', 'honor veterans'
    ],
    contextual: [ 'free market', 'individual rights', 'small government' ],
    weight: 1.0
  },
  // Far-Right
  'far-right': {
    keywords: [
      'blood and soil', 'racial purity',
      'great replacement', 'population replacement myth',
      'white nationalism', 'white supremacist',
      'globalist conspiracy', 'elite puppet masters',
      'anti-semitic', 'jewish conspiracy',
      'reclaim our country', 'take back the nation',
      'sovereignty over wall', 'build the wall',
      'cultural purity', 'ethnic purity',
      'militia movement', 'armed civilian groups',
      'state’s rights', 'nullification',
      'end the deep state', 'drain the swamp',
      'traitors in high places', 'elites are traitors',
      'patriot militias', 'armed patriots',
      'guns aren’t the problem', '2nd amendment absolutism',
      'national revival', 'national rebirth',
      'racial hierarchy', 'superior race',
      'pure bloodline', 'bloodline purity',
      'uprising now', 'insurrection now',
      'ethnic cleansing', 'purge the undesirables'
    ],
    contextual: [ 'national identity', 'cultural preservation', 'law and order' ],
    weight: 1.0
  }
};

const POLITICAL_SENTIMENT_SCALE = {
  'far-left': 1.00,
  'left': 0.50,
  'center-left': 0.25,
  'center': 0.00,
  'center-right': -0.25,
  'right': -0.50,
  'far-right': -1.00,
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
    return { spectrum: 'center', confidence: 0, politicalScore: 0 };
  }

  const lowercaseText = text.toLowerCase();

  try {
    // 1) Transformer fallback
    if ( textClassificationPipeline ) {
      try {
        const result = await textClassificationPipeline( text, { truncation: true } );
        const top = result[ 0 ];
        if ( top.score > 0.8 ) {
          const spectrum = top.label === 'NEGATIVE' ? 'right' : 'left';
          return {
            spectrum,
            confidence: top.score,
            politicalScore: POLITICAL_SENTIMENT_SCALE[ spectrum ]
          };
        }
      } catch ( err ) {
        console.warn( 'Transformer classification failed:', err );
      }
    }

    // 2) Keyword/context scoring
    const words = lowercaseText.split( /\s+/ );
    const categoryScores = Object.entries( POLITICAL_CATEGORIES ).map( ( [ category, data ] ) => {
      let score = 0;
      data.keywords.forEach( keyword => {
        const kw = keyword.toLowerCase();
        if ( kw.includes( ' ' ) ) {
          if ( lowercaseText.includes( kw ) ) score += data.weight * 1.5;
        } else {
          score += words.filter( w => w === kw ).length * data.weight;
        }
      } );
      data.contextual.forEach( ctx => {
        if ( lowercaseText.includes( ctx.toLowerCase() ) ) {
          score += data.weight * 0.8;
        }
      } );
      return { category, score };
    } );

    categoryScores.sort( ( a, b ) => b.score - a.score );
    const [ highest, second ] = categoryScores;
    const diff = highest.score - ( second?.score || 0 );
    const confidence = Math.min( Math.max( diff * 0.3, 0.1 ), 1 );

    if ( highest.score < 0.2 ) {
      return { spectrum: 'center', confidence: 0.3, politicalScore: 0.00 };
    }

    return {
      spectrum: highest.category,
      confidence,
      politicalScore: POLITICAL_SENTIMENT_SCALE[ highest.category ]
    };
  } catch ( error ) {
    console.error( 'Political spectrum prediction failed:', error );
    return { spectrum: 'center', confidence: 0.1, politicalScore: 0.00 };
  }
}


( async () => {
  try {
    await initializeModels();
  } catch ( error ) {
    console.warn( 'Initial model load failed, will retry on first use:', error );
  }
} )();