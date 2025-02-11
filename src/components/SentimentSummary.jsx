import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFeedback, selectFeedback } from "../redux/feedbackSlice";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const SentimentSummary = () => {
  const dispatch = useDispatch();
  const feedback = useSelector(selectFeedback);

  // Fetch feedback if Redux store is empty
  useEffect(() => {
    if (feedback.length === 0) {
      const fetchFeedback = async () => {
        try {
          const response = await fetch("/api/getfeedback");
          if (!response.ok) throw new Error("Error fetching feedback");
          const data = await response.json();
          dispatch(setFeedback(data));
        } catch (error) {
          console.error("Error loading feedback:", error);
        }
      };
      fetchFeedback();
    }
  }, [dispatch, feedback.length]);

  // Group feedback by spectrum
  const summaryData = feedback.reduce((acc, { politicalSpectrum, predictedSpectrum, sentiment, source }) => {
    // Prefer politicalSpectrum if valid, else fallback to predictedSpectrum
    const spectrum = (politicalSpectrum && politicalSpectrum !== "N/A")
      ? politicalSpectrum
      : predictedSpectrum || 'unspecified';

    if (!acc[spectrum]) acc[spectrum] = { count: 0, totalSentiment: 0, sources: {} };
    acc[spectrum].count++;
    acc[spectrum].totalSentiment += sentiment.score;

    // Track the source of feedback (e.g., 'feedback-form', 'uploaded')
    acc[spectrum].sources[source] = (acc[spectrum].sources[source] || 0) + 1;

    return acc;
  }, {});

  // Calculate overall sentiment
  const totalFeedback = feedback.length;
  const totalSentiment = feedback.reduce((acc, { sentiment }) => acc + sentiment.score, 0);
  const avgOverallSentiment = totalFeedback ? totalSentiment / totalFeedback : 0;

  // Get sentiment label based on average sentiment
  const getSentimentLabel = (avgSentiment) => {
    if (avgSentiment > 0.5) return "strongly positive";
    if (avgSentiment > 0.3) return "moderately positive";
    if (avgSentiment > 0.1) return "slightly positive";
    if (avgSentiment < -0.5) return "strongly negative";
    if (avgSentiment < -0.3) return "moderately negative";
    if (avgSentiment < -0.1) return "slightly negative";
    return "neutral";
  };

  // Get sentiment icon based on the score
  const getSentimentIcon = (score) => {
    if (score > 0.1) return <TrendingUp className="w-5 h-5" />;
    if (score < -0.1) return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  // Get sentiment color for styling
  const getSentimentColor = (score) => {
    if (score > 0.1) return "text-green-600";
    if (score < -0.1) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Sentiment Summary by Group</h2>

      {/* Overall Sentiment Summary */}
      <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
        <h3 className="text-lg font-semibold">Overall Sentiment:</h3>
        <div className={`flex items-center ${getSentimentColor(avgOverallSentiment)}`}>
          {getSentimentIcon(avgOverallSentiment)}
          <span className="ml-2 text-lg">{getSentimentLabel(avgOverallSentiment)} ({avgOverallSentiment.toFixed(2)})</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">Total responses: {totalFeedback}</p>
      </div>

      {/* Grouped Sentiment by Political Spectrum */}
      {Object.keys(summaryData).length === 0 ? (
        <p className="text-gray-500">No data available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(summaryData).map(([spectrum, data]) => {
            const avgSentiment = data.totalSentiment / data.count;
            const sentimentLabel = getSentimentLabel(avgSentiment);

            return (
              <div key={spectrum} className="border rounded-lg p-4 w-fit">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg capitalize">{spectrum.replace(/-/g, " ")}</h3>
                  <div className={`flex items-center ${getSentimentColor(avgSentiment)}`}>
                    {getSentimentIcon(avgSentiment)}
                    <span className="ml-1">{avgSentiment.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  This group is feeling <span className="font-medium">{sentimentLabel}</span> overall.
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  Total responses: {data.count}
                </div>

                {/* Source Breakdown */}
                <div className="mt-2 text-sm text-gray-500">
                  <strong>Sources:</strong>
                  <ul className="list-disc pl-5">
                    {Object.entries(data.sources).map(([source, count]) => (
                      <li key={source}>{source}: {count}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SentimentSummary;
