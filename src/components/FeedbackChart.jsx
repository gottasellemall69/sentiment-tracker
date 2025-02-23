import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { setFeedback, selectFeedback } from '../redux/feedbackSlice';

ChartJS.register( CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend );

const FeedbackChart = () => {
  const dispatch = useDispatch();
  const feedback = useSelector( selectFeedback );
  console.log( 'Feedback entries:', feedback );

  useEffect( () => {
    if ( feedback.length === 0 ) {
      const fetchFeedback = async () => {
        try {
          const response = await fetch( '/api/getfeedback' );
          if ( !response.ok ) throw new Error( `Error fetching feedback` );
          const data = await response.json();
          dispatch( setFeedback( data ) );
        } catch ( error ) {
          console.error( "Error loading feedback:", error );
        }
      };
      fetchFeedback();
    }
  }, [ dispatch, feedback ] );

  // Ensure feedback is an array before reducing
  const groupedData = feedback.reduce( ( acc, { politicalSpectrum, predictedSpectrum, sentiment } ) => {
    const spectrum = politicalSpectrum || predictedSpectrum || 'unspecified';
    if ( !acc[ spectrum ] ) acc[ spectrum ] = { count: 0, totalSentiment: 0 };
    acc[ spectrum ].count++;
    acc[ spectrum ].totalSentiment += sentiment.score;
    return acc;
  }, {} );


  const data = {
    labels: Object.keys( groupedData ),
    datasets: [
      {
        label: 'Number of Responses',
        data: Object.values( groupedData ).map( ( item ) => item.count ),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Average Sentiment',
        data: Object.values( groupedData ).map( ( item ) =>
          item.count > 0 ? item.totalSentiment / item.count : 0
        ),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Feedback Analysis by Political Spectrum' },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-7xl mx-auto h-[300px]">
      <h2 className="text-xl font-bold mb-4">Sentiment Analysis</h2>
      <Bar className='mx-auto w-full' data={ data } options={ options } />
    </div>
  );
};

export default FeedbackChart;
