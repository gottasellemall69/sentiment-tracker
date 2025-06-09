import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyzeSentiment, predictPoliticalSpectrum } from '../utils/nlpUtils';

const initialState = {
  entries: [],
  loading: false,
  error: null,
};

export const addFeedbackWithSentiment = createAsyncThunk(
  'feedback/addFeedbackWithSentiment',
  async ( feedbackData, { rejectWithValue } ) => {
    try {
      // 1) Sentiment analysis
      const sentiment = await analyzeSentiment( feedbackData.feedback );
      const confidence = sentiment.confidence ?? 0;

      // 2) Political spectrum prediction
      const {
        spectrum: predictedSpectrum,
        confidence: spectrumConfidence,
        politicalScore
      } = await predictPoliticalSpectrum( feedbackData.feedback );

      // Return the result with the sentiment analysis
      return {
        ...feedbackData,
        predictedSpectrum,
        politicalScore,
        spectrumConfidence,
        sentiment: {
          score: sentiment.score,
          magnitude: sentiment.magnitude,
          confidence,
          sentimentLabel: sentiment.sentimentLabel,
          topWords: sentiment.topWords
        },
        timestamp: Date.now(),
      };
    } catch ( error ) {
      // Handle errors gracefully
      return rejectWithValue( error.message || 'Failed to analyze sentiment' );
    }
  }
);

const feedbackSlice = createSlice( {
  name: 'feedback',
  initialState,
  reducers: {
    setFeedback( state, action ) {
      state.entries = action.payload;
    },
    clearFeedback: ( state ) => {
      state.entries = [];
    },
  },
  extraReducers: ( builder ) => {
    builder
      .addCase( addFeedbackWithSentiment.pending, state => {
        state.loading = true;
        state.error = null;
      } )
      .addCase( addFeedbackWithSentiment.fulfilled, ( state, action ) => {
        state.entries.push( action.payload );
        state.loading = false;
      } )
      .addCase( addFeedbackWithSentiment.rejected, ( state, action ) => {
        state.error = action.payload || 'An error occurred';
        state.loading = false;
      } );
  }
} );

export const { setFeedback, clearFeedback } = feedbackSlice.actions;
export const selectFeedback = state => state.feedback.entries;
export default feedbackSlice.reducer;