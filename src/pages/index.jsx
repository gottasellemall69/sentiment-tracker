import Link from 'next/link';
import { BarChart2 } from 'lucide-react';
import FeedbackForm from '../components/FeedbackForm';



export default function FeedbackPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Submit Your Feedback</h1>
        
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-6">
          Your feedback helps us understand sentiment across different political perspectives. 
          All responses are anonymous and will be used for analysis purposes only.
        </p>
        <FeedbackForm />
      </div>
    </div>
  );
}
