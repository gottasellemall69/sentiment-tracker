import React, { useEffect } from 'react';
import { FacebookProvider, LoginButton, useProfile } from 'react-facebook';
import { useDispatch } from 'react-redux';
import { addFeedbackWithSentiment } from '../redux/feedbackSlice';
import { analyzeFacebookPost } from '../utils/socialMediaUtils';

const FacebookIntegration = ({ appId }) => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useProfile();

  useEffect(() => {
    if (profile) {
      // Fetch and analyze user's posts when profile is available
      fetchAndAnalyzePosts();
    }
  }, [profile]);

  const fetchAndAnalyzePosts = async () => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me/posts?access_token=${profile?.accessToken}`
      );
      const data = await response.json();
      
      for (const post of data.data) {
        if (post.message) {
          const analyzedPost = await analyzeFacebookPost(post.message);
          dispatch(addFeedbackWithSentiment({
            feedback: post.message,
            source: 'facebook',
            sentiment: analyzedPost.sentiment,
            timestamp: new Date(post.created_time).getTime(),
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching Facebook posts:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Facebook Integration</h2>
      {!profile ? (
        <LoginButton
          scope="public_profile,user_posts"
          onSuccess={(response) => {
            console.log('Login success:', response);
          }}
          onError={(error) => {
            console.error('Login failed:', error);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Connect Facebook
        </LoginButton>
      ) : (
        <div>
          <p className="text-green-600 mb-2">✓ Connected as {profile.name}</p>
          <button
            onClick={fetchAndAnalyzePosts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Analyze Recent Posts
          </button>
        </div>
      )}
    </div>
  );
};

export default FacebookIntegration;
