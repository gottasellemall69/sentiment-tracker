import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyzeSentiment } from '../utils/nlpUtils';

const initialState = {
  entries: [],
  loading: false,
  error: null,
};

export const addFeedbackWithSentiment = createAsyncThunk(
  'feedback/addFeedbackWithSentiment',
  async (feedbackData, { rejectWithValue }) => {
    try {
      // Call the sentiment analysis function
      const sentiment = await analyzeSentiment(feedbackData.feedback);

      // Ensure confidence is set, if missing default to 0
      const confidence = sentiment.confidence !== undefined ? sentiment.confidence : 0;

      // Return the result with the sentiment analysis
      return {
        ...feedbackData,
        predictedSpectrum: sentiment.politicalSpectrum, // Use sentiment.politicalSpectrum instead of analysis
        sentiment: {
          score: sentiment.score,
          magnitude: sentiment.magnitude,
          confidence: confidence,  // Ensure confidence is included
        },
        timestamp: Date.now(),
      };
    } catch (error) {
      // Handle errors gracefully
      return rejectWithValue(error.message || 'Failed to analyze sentiment');
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    setFeedback(state, action) {
      state.entries = action.payload;
    },
    clearFeedback: (state) => {
      state.entries = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addFeedbackWithSentiment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFeedbackWithSentiment.fulfilled, (state, action) => {
        state.entries.push(action.payload);
        state.loading = false;
      })
      .addCase(addFeedbackWithSentiment.rejected, (state, action) => {
        state.error = action.payload || 'An error occurred';
        state.loading = false;
      });
  },
});

export const { setFeedback, clearFeedback } = feedbackSlice.actions;
export const selectFeedback = (state) => state.feedback.entries;
export default feedbackSlice.reducer;
