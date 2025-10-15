// Customer Chat Page
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import CustomerChatInterface from '../components/chat/CustomerChatInterface';
import { useAuth } from '../context/AuthProvider';
import SEO from '../components/SEO';
import { canonicalForPath } from '../utils/seo';

// Simple protected route component
const ProtectedChat: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-4">Please sign in with Google to access your chat room.</p>
          <button
            onClick={() => window.location.href = '/admin'} 
            className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-deep"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const ChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  if (!roomId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Chat Room | Global XT Limited" description="Private chat room." noindex canonical={canonicalForPath(`/chat/${roomId}`)} />
      {/* Clean Chat Interface - No Navigation */}
      <ProtectedChat>
        <CustomerChatInterface roomId={roomId} className="h-screen" />
      </ProtectedChat>
    </div>
  );
};

// Simple Chat Sign-in Page
export const ChatSignInPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      if (roomId) {
        window.location.href = `/chat/${roomId}`;
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <SEO title="Chat Sign In | Global XT Limited" description="Access your chat room." noindex canonical={canonicalForPath(`/chat/signin/${roomId ?? ''}`)} />
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-brand-primary to-brand-lime rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">GXT</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Your Chat Room</h1>
        <p className="text-gray-600 mb-6">
          Sign in with Google to continue the conversation
        </p>
        
        <button
          onClick={handleSignIn}
          className="bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-deep transition-colors mb-4"
        >
          Sign In with Google
        </button>
        
        <div className="text-center mt-6">
          <a 
            href="/" 
            className="text-sm text-brand-primary hover:text-brand-deep transition-colors"
          >
            ← Back to Global XT Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
