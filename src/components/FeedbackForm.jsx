import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addFeedbackWithSentiment } from '../redux/feedbackSlice';
import { toast } from 'react-toastify';
import { Send, AlertCircle } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { analyzeSentiment, predictPoliticalSpectrum } from '../utils/nlpUtils';

const SUBMISSION_LIMIT = 10;
const SUBMISSION_WINDOW = 3600000; // 1 hour in milliseconds

const FeedbackForm = () => {
  const dispatch = useDispatch();
  const [ feedback, setFeedback ] = useState( '' );
  const [ politicalSpectrum, setPoliticalSpectrum ] = useState( '' );
  const [ predictedSpectrum, setPredictedSpectrum ] = useState( '' );
  const [ honeypot, setHoneypot ] = useState( '' );
  const [ isSubmitting, setIsSubmitting ] = useState( false );
  const recaptchaRef = useRef( null );

  const getSubmissionHistory = () => {
    const history = localStorage.getItem( 'feedbackSubmissions' );
    return history ? JSON.parse( history ) : [];
  };

  const updateSubmissionHistory = () => {
    const now = Date.now();
    const updatedHistory = getSubmissionHistory().filter(
      ( timestamp ) => now - timestamp < SUBMISSION_WINDOW
    );
    updatedHistory.push( now );
    localStorage.setItem( 'feedbackSubmissions', JSON.stringify( updatedHistory ) );
  };

  const isRateLimited = () => {
    const history = getSubmissionHistory().filter(
      ( timestamp ) => Date.now() - timestamp < SUBMISSION_WINDOW
    );
    return history.length >= SUBMISSION_LIMIT;
  };

  const validateInput = () => {
    if ( feedback.length < 10 ) {
      toast.error( 'Feedback must be at least 10 characters long.' );
      return false;
    }
    if ( feedback.length > 10000 ) {
      toast.error( 'Feedback must not exceed 10000 characters.' );
      return false;
    }
    if ( honeypot ) {
      console.warn( 'Potential spam detected.' );
      toast.error( 'An error occurred.' );
      return false;
    }
    if ( containsSuspiciousPatterns( feedback ) ) {
      toast.error( 'Your feedback contains invalid content.' );
      return false;
    }
    return true;
  };

  const containsSuspiciousPatterns = ( text ) => {
    const spamPatterns = [
      /<[^>]*>/g, // HTML tags
      /\b(https?:\/\/|www\.)\S+/gi, // URLs
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
      /(.)\1{4,}/g, // Repeated characters
    ];
    return spamPatterns.some( ( pattern ) => pattern.test( text ) );
  };

  const handleSubmit = async ( e ) => {
    e.preventDefault();
    if ( isSubmitting ) return;
    if ( isRateLimited() ) {
      toast.error( 'You have reached the submission limit. Please try again later.' );
      return;
    }
    if ( !validateInput() ) return;

    try {
      setIsSubmitting( true );

      const recaptchaValue = await recaptchaRef.current?.executeAsync();
      if ( !recaptchaValue ) {
        toast.error( 'Please complete the reCAPTCHA verification.' );
        return;
      }

      const { spectrum: predictedSpectrum, confidence } = await predictPoliticalSpectrum( feedback.trim() );
      const sentiment = await analyzeSentiment( feedback.trim() );

      const response = await fetch( '/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {
          feedback: feedback.trim(),
          politicalSpectrum,
          predictedSpectrum,
          sentiment: {
            score: sentiment.score,
            magnitude: sentiment.magnitude,
            confidence: sentiment.confidence,
          },
          source: 'feedback-form',
          recaptchaToken: recaptchaValue,
        } ),
      } );

      if ( !response.ok ) {
        throw new Error( 'Failed to submit feedback. Please try again.' );
      }

      const savedFeedback = await response.json();
      dispatch( addFeedbackWithSentiment( savedFeedback ) );  // Update Redux with new entry
      updateSubmissionHistory();
      toast.success( 'Feedback submitted successfully!' );

      // Reset form fields
      setFeedback( '' );
      setPoliticalSpectrum( '' );
      setPredictedSpectrum( predictedSpectrum );
      recaptchaRef.current?.reset();

    } catch ( error ) {
      console.error( 'Error submitting feedback:', error );
      toast.error( error.message || 'An unexpected error occurred.' );
    } finally {
      setIsSubmitting( false );
    }
  };

  return (
    <form onSubmit={ handleSubmit } className="space-y-4">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          value={ honeypot }
          onChange={ ( e ) => setHoneypot( e.target.value ) }
          tabIndex={ -1 }
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
          Your Feedback
        </label>
        <textarea
          id="feedback"
          rows={ 4 }
          value={ feedback }
          onChange={ ( e ) => setFeedback( e.target.value ) }
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Share your thoughts..."
          maxLength={ 10000 }
        />
        <div className="text-xs text-gray-500 text-right">{ feedback.length }/10000</div>
      </div>

      <div>
        <label htmlFor="spectrum" className="block text-sm font-medium text-gray-700">
          You are...
        </label>
        <select
          id="spectrum"
          value={ politicalSpectrum }
          onChange={ ( e ) => setPoliticalSpectrum( e.target.value ) }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select Position (optional)</option>
          <option value="far-left">Far Left</option>
          <option value="left">Left</option>
          <option value="center-left">Center Left</option>
          <option value="center">Center</option>
          <option value="center-right">Center Right</option>
          <option value="right">Right</option>
          <option value="far-right">Far Right</option>
        </select>
      </div>
      <div className="text-sm text-gray-500 flex items-start space-x-2">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p>
          To prevent abuse, there is a limit of { SUBMISSION_LIMIT } submissions per hour. Please
          ensure your feedback is thoughtful and respectful.
        </p>
      </div>

      <ReCAPTCHA
        ref={ recaptchaRef }
        size="invisible"
        sitekey={ process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY }
      />

      <button
        type="submit"
        disabled={ isSubmitting }
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="h-4 w-4 mr-2" />
        { isSubmitting ? 'Submitting...' : 'Submit Feedback' }
      </button>

      { predictedSpectrum && (
        <div className="mt-4 text-center text-green-600 font-medium">
          Predicted Spectrum: <span>{ predictedSpectrum }</span>
        </div>
      ) }
    </form>
  );
};

export default FeedbackForm;