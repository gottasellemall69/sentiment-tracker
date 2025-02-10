import React, { useState, useEffect, useMemo } from 'react';
import { Filter, Download } from 'lucide-react';

const AdminPanel = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/getfeedback');
        if (!response.ok) {
          throw new Error(`Error fetching feedback: ${response.statusText}`);
        }
        const data = await response.json();
        setFeedback(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const filteredFeedback = useMemo(() => {
    return feedback?.filter((item) =>
      item.politicalSpectrum.toLowerCase().includes(filter?.toLowerCase()) ||
      item.feedback.toLowerCase().includes(filter?.toLowerCase())
    ).sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      return b.sentiment.score - a.sentiment.score;
    });
  }, [feedback, filter, sortBy]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading feedback data...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 h-[500px] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Feedback</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Spectrum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Sentiment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Confidence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Top Words</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Source</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFeedback?.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.feedback}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <strong>User:</strong> {item.politicalSpectrum || "N/A"}<br />
                  <strong>Predicted:</strong> {item.predictedSpectrum || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.sentiment?.score > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.sentiment?.score?.toFixed(2) || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.sentiment?.confidence !== undefined ? (item.sentiment.confidence * 100).toFixed(1) + "%" : "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.sentiment?.topWords?.join(', ') || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {item.source}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
