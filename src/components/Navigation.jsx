import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Activity, BarChart2, MessageSquarePlus } from 'lucide-react';
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_FIREBASE_ADMIN_EMAIL;

const Navigation = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isActive = (path) => {
    return router.pathname === path ? 'bg-blue-800' : '';
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/" passHref
              className="flex items-center text-white">
              <Activity className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold">Sentiment Tracker</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/" passHref
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors ${isActive('/')}`}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Submit Opinion
            </Link>
            <span>
              <Link
                    href="/dashboard" passHref
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors ${isActive('/feedback')}`}
                  >
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
              {user && (

                <>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                  >
                    Logout
                  </button>
                </>
              )}
            </span>
            </div>

          </div>
        </div>
    </nav>
    
  );
};

export default Navigation;
