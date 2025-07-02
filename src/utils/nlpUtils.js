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
      'tax the rich', 'tax', 'the', 'rich',
      'soak the rich', 'soak',
      'wealth tax', 'wealth',
      'climate justice', 'climate', 'justice',
      'environmental justice', 'environmental',
      'defund the police', 'defund', 'the', 'police',
      'abolish the police', 'abolish',
      'end police funding', 'end', 'police', 'funding',
      'abolish capitalism', 'capitalism',
      'smash capitalism', 'smash',
      'no to private enterprise', 'private', 'enterprise',
      'end private prisons', 'prisons',
      'prison abolition', 'prison', 'abolition',
      'close for-profit prisons', 'close', 'for-profit',
      'solidarity forever', 'solidarity', 'forever',
      'worker solidarity', 'worker',
      'union power', 'union', 'power',
      'worker revolution', 'revolution',
      'proletarian revolution', 'proletarian',
      'global workers uprising', 'global', 'workers', 'uprising',
      'class struggle', 'class', 'struggle',
      'rich vs. poor', 'vs.', 'poor',
      'bottom-up power', 'bottom-up',
      'redistribute wealth', 'redistribute',
      'wealth redistribution', 'redistribution',
      'equal share of resources', 'equal', 'share', 'resources',
      'dismantle patriarchy', 'dismantle', 'patriarchy',
      'gender liberation', 'gender', 'liberation',
      'end patriarchal systems', 'patriarchal', 'systems',
      'seize the means', 'seize', 'means',
      'take the means of production', 'take', 'production',
      'power to the people', 'people',
      'mass empowerment', 'mass', 'empowerment',
      'organize the masses', 'organize', 'masses',
      'mass organization', 'organization',
      'grassroots uprising', 'grassroots',
      'revolution now', 'now',
      'immediate uprising', 'immediate',
      'overthrow the system', 'overthrow', 'system',
      'systemic oppression', 'systemic', 'oppression',
      'institutional oppression', 'institutional',
      'smash the state', 'state',
      'tear down the state', 'tear', 'down',
      'anti-imperialism', 'imperialism',
      'no empire', 'empire',
      'end foreign domination', 'foreign', 'domination',
      'people’s liberation', 'people’s',
      'liberate the people', 'liberate',
      'workers of the world', 'world',
      'international proletariat', 'international',
      'direct action', 'direct', 'action',
      'take direct action', 'take'
    ],
    contextual: [ 'wealth redistribution', 'state ownership', 'planned economy' ],
    weight: 1.0
  },

  // Left
  'left': {
    keywords: [
      'universal healthcare', 'universal', 'healthcare',
      'single payer healthcare', 'single', 'payer',
      'income inequality', 'income', 'inequality',
      'wealth gap', 'gap',
      'economic disparity', 'economic', 'disparity',
      'affordable housing', 'affordable', 'housing',
      'housing for all', 'for', 'all',
      'green new deal', 'green', 'new', 'deal',
      'environmental overhaul', 'environmental', 'overhaul',
      'fight racism', 'fight', 'racism',
      'combat racism', 'combat',
      'anti-racist policies', 'anti-racist', 'policies',
      'women’s rights', 'women’s', 'rights',
      'gender equality', 'gender', 'equality',
      'lgbtq+ rights', 'lgbtq+',
      'queer liberation', 'queer', 'liberation',
      'living wage', 'living', 'wage',
      'fair wage', 'fair',
      'minimum decent wage', 'minimum', 'decent',
      'social justice', 'social',
      'fairness for all', 'fairness',
      'corporate accountability', 'corporate', 'accountability',
      'hold corporations accountable', 'hold', 'corporations',
      'climate action', 'action',
      'act on climate change', 'act', 'change',
      'protect medicare', 'protect', 'medicare',
      'save medicare', 'save',
      'expand social safety net', 'expand', 'social', 'safety', 'net',
      'strengthen social programs', 'strengthen', 'programs',
      'stop voter suppression', 'stop', 'voter', 'suppression',
      'end voter disenfranchisement', 'disenfranchisement',
      'fund public schools', 'fund', 'public', 'schools',
      'invest in education', 'invest', 'education',
      'raise minimum wage', 'raise', 'minimum',
      'increase base pay', 'increase', 'base', 'pay',
      'clean energy jobs', 'clean', 'energy', 'jobs',
      'renewable energy employment', 'renewable', 'employment',
      'protect reproductive rights', 'reproductive',
      'defend abortion access', 'defend', 'abortion', 'access',
      'end discrimination', 'discrimination',
      'fight bias', 'bias',
      'community investment', 'community', 'investment'
    ],
    contextual: [ 'social programs', 'public services', 'environmental protection' ],
    weight: 0.50
  },

  // Center-Left
  'center-left': {
    keywords: [
      'common sense', 'common', 'sense',
      'practical solutions', 'practical', 'solutions',
      'bipartisan',
      'cross-party cooperation', 'cross-party', 'cooperation',
      'balanced approach', 'balanced', 'approach',
      'well-rounded policy', 'well-rounded', 'policy',
      'moderate',
      'centrist leanings', 'centrist', 'leanings',
      'incremental change', 'incremental',
      'step-by-step reform', 'step-by-step', 'step', 'by', 'reform',
      'working families', 'working', 'families',
      'family-focused policy', 'family-focused',
      'bridge divides', 'bridge', 'divides',
      'close partisan gaps', 'close', 'partisan', 'gaps',
      'pragmatic solutions', 'pragmatic',
      'real-world fixes', 'real-world', 'fixes',
      'responsible spending', 'responsible', 'spending',
      'fiscally cautious', 'fiscally', 'cautious',
      'public-private partnership', 'public-private', 'partnership',
      'govt-business collaboration', 'govt-business', 'collaboration',
      'fiscal prudence', 'prudent', 'prudent',
      'budget discipline', 'budget', 'discipline',
      'evidence-based policy', 'evidence-based',
      'data-driven decisions', 'data-driven', 'decisions',
      'smart regulation', 'smart', 'regulation',
      'centrist coalition', 'coalition',
      'broad alliance', 'broad', 'alliance',
      'across the aisle', 'across', 'aisle',
      'bipartisan support', 'support',
      'consensus building', 'consensus', 'building',
      'steady progress', 'steady', 'progress',
      'gradual improvement', 'gradual', 'improvement',
      'middle path', 'middle', 'path',
      'third way', 'third', 'way',
      'thoughtful reform', 'thoughtful',
      'considered change', 'considered',
      'inclusive growth', 'inclusive', 'growth',
      'growth for all', 'for', 'all'
    ],
    contextual: [ 'mixed economy', 'regulated markets', 'social safety net' ],
    weight: 0.25
  },

  // Center
  'center': {
    keywords: [
      'neutral', 'impartial', 'objective', 'unbiased', 'balanced', 'equitable',
      'nonpartisan', 'apolitical', 'status quo', 'steady hand', 'calm leadership',
      'middle ground', 'common ground', 'centrist', 'moderate stance',
      'equilibrium', 'stability', 'clear-eyed', 'measured response',
      'straight talk', 'fact-based', 'sound judgment', 'good sense',
      'fair-minded', 'moderation', 'restraint', 'pragmatic', 'realistic',
      'reliable governance'
    ],
    contextual: [ 'common ground', 'practical solutions', 'middle way' ],
    weight: 0.00
  },

  // Center-Right
  'center-right': {
    keywords: [
      '#MAGA', 'Trump', 'Donald Trump', 'Make America Great Again', 'MAGA',
      '#AmericaFirst', 'AmericaFirst',
      'balanced budget', 'balanced', 'budget',
      'fiscal responsibility', 'fiscal', 'responsibility',
      'budget responsibility',
      'market reform', 'market', 'reform',
      'economic liberalization', 'economic', 'liberalization',
      'strong defense', 'strong', 'defense',
      'robust military', 'robust', 'military',
      'tax cuts', 'tax', 'cuts',
      'lower taxes', 'lower', 'taxes',
      'limit government', 'limit', 'government',
      'small government', 'small',
      'free enterprise', 'free', 'enterprise',
      'entrepreneurial freedom', 'entrepreneurial', 'freedom',
      'personal responsibility', 'personal',
      'individual liberty', 'individual', 'liberty',
      'economic growth', 'growth',
      'growth economy', 'economy',
      'prudent regulation', 'prudent', 'regulation',
      'limited oversight', 'limited', 'oversight',
      'public safety', 'public', 'safety',
      'lawful order', 'lawful', 'order',
      'border enforcement', 'border', 'enforcement',
      'secure borders', 'secure', 'borders',
      'small businesses', 'businesses', 'small',
      'mom-and-pop shops', 'mom-and-pop', 'shops',
      'job creators', 'job', 'creators',
      'employers first', 'employers', 'first',
      'property rights', 'property', 'rights',
      'entrepreneurship', 'startup culture', 'startup', 'culture',
      'sound money', 'sound', 'money',
      'monetary stability', 'monetary', 'stability',
      'reduce red tape', 'reduce', 'red', 'tape',
      'cut bureaucracy', 'cut', 'bureaucracy',
      'lawful immigration', 'lawful', 'immigration'
    ],
    contextual: [ 'free enterprise', 'limited government', 'personal responsibility' ],
    weight: -0.25
  },


  // Right
  'right': {
    keywords: [
      'traditional values', 'traditional', 'values',
      'Trump', 'Donald Trump',
      'conservative values', 'conservative',
      'family values', 'family',
      'family first', 'first',
      'patriotism', 'patriotism',
      'love of country', 'love', 'country',
      'law and order', 'law', 'order',
      'tough on crime', 'tough', 'crime',
      '#2A', '2A',
      'second amendment', 'second', 'amendment',
      'gun rights', 'gun', 'rights',
      'border security', 'border', 'security',
      'secure borders', 'secure', 'borders',
      'small government', 'small', 'government',
      'limited govt', 'limited', 'govt',
      'personal freedom', 'personal', 'freedom',
      'self-reliance', 'self', 'reliance',
      'rule of law', 'rule', 'law',
      'legal order', 'legal', 'order',
      'American exceptionalism', 'American', 'exceptionalism',
      'US exceptionalism', 'US',
      'pro-life', 'pro', 'life',
      'anti-abortion', 'anti', 'abortion',
      'school choice', 'school', 'choice',
      'education vouchers', 'education', 'vouchers',
      'religious freedom', 'religious',
      'faith liberties', 'faith', 'liberties',
      'military strength', 'military', 'strength',
      'support our troops', 'support', 'troops',
      'back the troops', 'back',
      'patriotic duty', 'patriotic', 'duty',
      'civic duty', 'civic',
      'guard the constitution', 'guard', 'constitution',
      'defend the constitution', 'defend',
      'hard work pays', 'hard', 'work', 'pays',
      'work ethic', 'ethic',
      'secure the homeland', 'homeland', 'secure',
      'homeland security', 'security',
      'veteran support', 'veteran', 'support',
      'honor veterans', 'honor', 'veterans'
    ],
    contextual: [ 'free market', 'individual rights', 'small government' ],
    weight: -0.50
  },


  // Far-Right
  'far-right': {
    keywords: [
      'Trump', 'Donald Trump',
      '#whitegenocide', 'white genocide', 'white', 'genocide',
      '#whitelivesmatter', 'white lives matter', 'lives', 'matter',
      '#bloodandsoil', 'blood and soil', 'blood', 'soil',
      '#GreatReplacement', 'great replacement', 'great', 'replacement',
      'white nationalism', 'white', 'nationalism',
      'white supremacist', 'supremacist',
      'race war', 'race', 'war',
      'ethnic cleansing', 'ethnic', 'cleansing',
      'racial purity', 'racial', 'purity',
      'globalist conspiracy', 'globalist', 'conspiracy',
      'drain the swamp', 'drain', 'the', 'swamp',
      'end the deep state', 'end', 'deep', 'state',
      'build the wall', 'build', 'the', 'wall',
      'take back the nation', 'take', 'back', 'nation',
      'Christian nationalism', 'Christian', 'nationalism',
      'right wing death squad', 'right', 'wing', 'death', 'squad',
      'militia movement', 'militia', 'movement',
      'armed patriots', 'armed', 'patriots',
      'insurrection',
      'uprising',
      'stop the steal', 'stop', 'steal',
      'election was stolen', 'election', 'was', 'stolen',
      'cultural marxism', 'cultural', 'marxism',
      'white identity', 'identity',
      'racial hierarchy', 'hierarchy', 'aryan', 'aryan supremacy', 'white pride', 'white power',
      'whites will prevail', 'whites', 'prevail', 'superior race', 'master race', 'pure bloodline'
    ],
    contextual: [ 'national identity', 'cultural preservation', 'law and order' ],
    weight: -1.00
  },

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
      sentimentLabel: "[]"
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
      sentimentLabel: "#ERR"
    };
  }
}

export async function predictPoliticalSpectrum( text ) {
  if ( !text?.trim() ) {
    return { spectrum: 'center', confidence: 0.0, politicalScore: POLITICAL_SENTIMENT_SCALE[ 'center' ] };
  }

  const lowercaseText = text.toLowerCase();
  const words = lowercaseText.split( /\s+/ );

  try {
    const categoryScores = Object.entries( POLITICAL_CATEGORIES ).map( ( [ category, data ] ) => {
      let score = 0;

      Array.isArray( data.keywords ) && data.keywords.forEach( keyword => {
        const kw = keyword.toLowerCase();
        if ( kw.includes( ' ' ) ) {
          if ( lowercaseText.includes( kw ) ) score += data.weight * 1.5;
        } else {
          score += words.filter( w => w === kw ).length * data.weight;
        }
      } );

      Array.isArray( data.contextual ) && data.contextual.forEach( ctx => {
        if ( lowercaseText.includes( ctx.toLowerCase() ) ) {
          score += data.weight * 0.8;
        }
      } );

      return { category, score };
    } );

    // **SORT BY ABSOLUTE** score so strong negatives (far-right) win
    categoryScores.sort( ( a, b ) => Math.abs( b.score ) - Math.abs( a.score ) );
    const [ highest, second ] = categoryScores;
    const diff = Math.abs( highest.score ) - Math.abs( second?.score || 0 );
    const confidence = Math.min( Math.max( diff * 0.3, 0.1 ), 1 );

    if ( Math.abs( highest.score ) < 0.2 ) {
      return { spectrum: 'center', confidence: 0.3, politicalScore: POLITICAL_SENTIMENT_SCALE[ 'center' ] };
    }

    return {
      spectrum: highest.category,
      confidence,
      politicalScore: POLITICAL_SENTIMENT_SCALE[ highest.category ]
    };
  } catch ( error ) {
    console.error( 'Political spectrum prediction failed:', error );
    return { spectrum: 'center', confidence: 0.1, politicalScore: POLITICAL_SENTIMENT_SCALE[ 'center' ] };
  }
}



( async () => {
  try {
    await initializeModels();
  } catch ( error ) {
    console.warn( 'Initial model load failed, will retry on first use:', error );
  }
} )();