import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFeedback } from '../redux/feedbackSlice';
import { Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import { addFeedbackWithSentiment } from '../redux/feedbackSlice';
import { analyzeChatLog } from '../utils/chatLogUtils';
import { analyzeSentiment, predictPoliticalSpectrum } from '../utils/nlpUtils';

const ChatLogUploader = () => {
  const dispatch = useDispatch();
  const feedback = useSelector((state) => state.feedback.entries);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const text = e.target?.result;
        const messages = await analyzeChatLog(text);
        const newFeedbackEntries = [];
        
        for (const message of messages) {
          const { spectrum: predictedSpectrum } = await predictPoliticalSpectrum(message.content);
          const sentiment = await analyzeSentiment(message.content);
          const feedbackEntry = {
            feedback: message.content,
            politicalSpectrum: message.spectrum || predictedSpectrum,
            predictedSpectrum,
            sentiment,
            timestamp: message.timestamp,
            source: 'uploaded',
          };

          await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackEntry),
          });

          newFeedbackEntries.push(feedbackEntry);
        }

        dispatch(setFeedback([...feedback, ...newFeedbackEntries]));
        toast.success(`Successfully analyzed ${messages.length} messages`);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing chat log:', error);
      toast.error('Error processing chat log');
    }
  }, [dispatch, feedback]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Upload Chat Logs</h2>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">TXT, JSON, or CSV files</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".txt,.json,.csv"
            onChange={handleFileUpload}
          />
        </label>
      </div>
    </div>
  );
};

export default ChatLogUploader;
