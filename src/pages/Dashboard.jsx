"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import FeedbackChart from '../components/FeedbackChart';
import SentimentSummary from '../components/SentimentSummary';
import ChatLogUploader from '../components/ChatLogUploader';
import AdminPanel from '../components/AdminPanel';


export default function Dashboard() {
  const isAdmin = false;
  const router = useRouter();
  const [ user, setUser ] = useState( null );
  const dispatch = useDispatch();
  const [ feedback, setFeedback ] = useState( [ {} ] );
  const [ loading, setLoading ] = useState( true );
  const [ error, setError ] = useState( null );

  // Fetch feedback data from the API
  useEffect( () => {
    const fetchFeedback = async () => {
      try {
        setLoading( true );
        const response = await fetch( '/api/getfeedback' );
        if ( !response.ok ) {
          throw new Error( `Error fetching feedback: ${ response.statusText }` );
        }
        const data = await response.json();
        setFeedback( data );
      } catch ( err ) {
        setError( err.message );
      } finally {
        setLoading( false );
      }
    };

    fetchFeedback();
  }, [ dispatch ] );

  // Handle loading and error states
  if ( loading ) {
    return <p className="text-center text-gray-500">Loading feedback data...</p>;
  }

  if ( error ) {
    return <p className="text-center text-red-500">Error: { error }</p>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sentiment Analysis Dashboard</h1>



      </div>
      <div className="mb-6 w-full">
        <ChatLogUploader />
      </div>

      <div className=' mx-auto flex flex-wrap max-w-7xl'>
        <div className="grid grid-cols-1 gap-6 w-full">
          <div className='h-auto'>
            <FeedbackChart />
          </div>
          <div className="mt-6">
            <SentimentSummary />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <AdminPanel
          feedback={ feedback }
        />
      </div>
    </div>
  );
}
