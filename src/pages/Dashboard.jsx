"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { setFeedback } from '../redux/feedbackSlice';
import { auth } from '../config/firebase'; // Firebase authentication
import { onAuthStateChanged } from 'firebase/auth';
import FeedbackChart from '../components/FeedbackChart';
import SentimentSummary from '../components/SentimentSummary';
import FacebookIntegration from '../components/FacebookIntegration';
import ChatLogUploader from '../components/ChatLogUploader';
import AdminPanel from '../components/AdminPanel';

 const NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL = process.env.NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL;

export default function Dashboard() {
  const isAdmin = false;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();
  const [feedback, setFeedback] = useState([{}]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Fetch feedback data from the API
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
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || currentUser.email !== NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL) {  
        router.push("/"); // Redirect non-admin users to the homepage
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  // Handle loading and error states
  if (loading) {
    return <p className="text-center text-gray-500">Loading feedback data...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sentiment Analysis Dashboard</h1>



     </div>
        <div className="mb-6 w-full">
            <ChatLogUploader />
          </div>
          
       <div className=' mx-auto flex flex-wrap max-w-7xl'><div className="grid grid-cols-1 gap-6 w-full">
        <div>
          <FeedbackChart />
        </div>
          <div className="mt-6">
            <SentimentSummary />
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="mt-8">
          <AdminPanel
            feedback={feedback}
          />
        </div>
      )}      
    </div>
  );
}
