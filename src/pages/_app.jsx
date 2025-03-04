import '../styles/globals.css';
import { Provider } from 'react-redux';
import { useStore } from '../redux/store';
import { FacebookProvider } from 'react-facebook';
import { ToastContainer } from 'react-toastify';
import Navigation from '../components/Navigation';
import 'react-toastify/dist/ReactToastify.css';

export default function App( { Component, pageProps } ) {
  const store = useStore( pageProps.initialReduxState );

  return (
    <Provider store={ store }>
      <FacebookProvider appId={ process.env.FACEBOOK_APP_ID }>
        <div className="min-h-screen bg-gray-100">
          <Navigation />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Component { ...pageProps } />
          </main>
        </div>
        <ToastContainer position="bottom-right" />
      </FacebookProvider>
    </Provider>
  );
}
