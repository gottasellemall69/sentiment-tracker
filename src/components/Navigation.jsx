import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Activity, BarChart2, MessageSquarePlus } from 'lucide-react';
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navigation = () => {
  const router = useRouter();
  const [ user, setUser ] = useState( null );
  const adminEmail = process.env.NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL; // ✅ Use direct variable

  useEffect( () => {
    const unsubscribe = onAuthStateChanged( auth, ( currentUser ) => {
      console.log( "Navigation - Current User:", currentUser );
      console.log( "Admin Email from env:", adminEmail );

      if ( currentUser && currentUser.email === adminEmail ) {
        setUser( currentUser );
      } else {
        setUser( null );
      }
    } );

    return () => unsubscribe();
  }, [] );

  const handleLogout = async () => {
    try {
      await signOut( auth );
      router.push( "/login" );
    } catch ( error ) {
      console.error( "Error logging out:", error );
    }
  };


  const isActive = ( path ) => {
    return router.pathname === path ? 'bg-blue-800' : '';
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a
              href="/"
              rel="noopener noreferrer"
              className="flex items-center text-white">
              <Activity className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">Sentiment Tracker</span>
            </a>
          </div>
          <div className="flex space-x-4">
            <a
              href="/"
              rel="noopener noreferrer"
              className={ `flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors ${ isActive( '/' ) }` }
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Submit Opinion
            </a>
            <span>
              <a
                href="/Dashboard"
                rel="noopener noreferrer"
                className={ `flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors ${ isActive( '/Dashboard' ) }` }
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Admin Dashboard
              </a>

            </span>
            { user && (

              <span>
                <button
                  onClick={ handleLogout }
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Logout
                </button>
              </span>
            ) }
          </div>

        </div>
      </div>
    </nav>

  );
};

export default Navigation;
