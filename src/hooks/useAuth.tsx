// Authentication Hook with Firebase
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailLink,
  sendSignInLinkToEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  isSignInWithEmailLink
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { isAdminEmail } from '../config/chat';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailVerification: (email: string) => Promise<void>;
  completeEmailSignIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.email ? isAdminEmail(user.email) : false;
  const isAuthenticated = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Check if user is completing email sign in
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const email = window.localStorage.getItem('emailForSignIn');
      if (email) {
        completeEmailSignIn(email);
      }
    }

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmailVerification = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/complete?email=${encodeURIComponent(email)}`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save email to localStorage for the completion step
      window.localStorage.setItem('emailForSignIn', email);
      
      alert(`Verification email sent to ${email}. Please check your inbox and click the link to sign in.`);
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      setError(error.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const completeEmailSignIn = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      
      if (!isSignInWithEmailLink(auth, window.location.href)) {
        throw new Error('Invalid sign-in link');
      }

      await signInWithEmailLink(auth, email, window.location.href);
      
      // Clear the email from localStorage
      window.localStorage.removeItem('emailForSignIn');
      
      // Redirect to chat or home page
      window.history.replaceState({}, document.title, '/');
    } catch (error: any) {
      console.error('Email sign-in completion error:', error);
      setError(error.message || 'Failed to complete email sign-in');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign-out error:', error);
      setError(error.message || 'Failed to sign out');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    signInWithGoogle,
    signInWithEmailVerification,
    completeEmailSignIn,
    signOut,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Guard Components
interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Sign-in component
interface SignInComponentProps {
  onEmailSignIn?: (email: string) => void;
  className?: string;
  redirectTo?: string;
}

export const SignInComponent: React.FC<SignInComponentProps> = ({ 
  onEmailSignIn,
  className = '',
  redirectTo 
}) => {
  const { signInWithGoogle, signInWithEmailVerification, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setEmailLoading(true);
    try {
      await signInWithEmailVerification(email);
      if (onEmailSignIn) {
        onEmailSignIn(email);
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const isGmailEmail = (email: string) => {
    return email.toLowerCase().includes('@gmail.com');
  };

  return (
    <div className={`max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
        <p className="text-gray-600">Access your Global XT chat room</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Email Sign-In Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={emailLoading || !email}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
          >
            {emailLoading ? 'Sending verification email...' : 'Send Verification Email'}
          </button>
        </form>

        <div className="text-xs text-gray-500 text-center">
          {email && isGmailEmail(email) ? (
            <p>✨ Gmail users can also use the Google sign-in button above for faster access</p>
          ) : (
            <p>We'll send you a secure link to sign in without a password</p>
          )}
        </div>
      </div>
    </div>
  );
};