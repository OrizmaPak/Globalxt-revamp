// Customer Chat Interface
import React, { useState, useEffect, useRef } from 'react';
import type { ChatRoom, Message } from '../../types/chat';
import { chatService, presenceService } from '../../services/chatService';
import { useAuth } from '../../context/AuthProvider';
import { getAdminEmails, isAdminEmail, getCompanyEmail } from '../../config/chat';
import FileAttachment from './FileAttachment';
import ImageModal from './ImageModal';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

interface CustomerChatInterfaceProps {
  roomId: string;
  className?: string;
}

const CustomerChatInterface: React.FC<CustomerChatInterfaceProps> = ({ 
  roomId, 
  className = '' 
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const isAuthenticated = !!user;
  const [accessDenied, setAccessDenied] = useState(false);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; fileName: string } | null>(null);
  const [pendingUploads, setPendingUploads] = useState<Array<{ id: string; fileName: string; fileSize: number; fileType: string; senderType: 'customer' | 'admin'; startedAt: Date }>>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isRecording,
    recordingError,
    startRecording,
    finishRecording,
    cancelRecording,
    resetRecordingError
  } = useAudioRecorder({
    onRecordingComplete: (file) => {
      setSelectedFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  });

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingUploads]);

  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setAudioPreviewUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    setAudioPreviewUrl(null);
  }, [selectedFile]);

  // Load chat room
  useEffect(() => {
    const loadRoom = async () => {
      try {
        const chatRoom = await chatService.getChatRoom(roomId);
        if (!chatRoom) {
          setError('Chat room not found');
          return;
        }
        
        // Check if user has access to this room
        if (user?.email && !chatRoom.participants.includes(user.email) && !isAdminEmail(user.email)) {
          setAccessDenied(true);
          return;
        }
        
        setRoom(chatRoom);
      } catch (err) {
        console.error('Error loading chat room:', err);
        setError('Failed to load chat room');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && roomId) {
      loadRoom();
    }
  }, [roomId, user, isAuthenticated]);

  // Subscribe to messages
  useEffect(() => {
    if (!room) return;

    const unsubscribe = chatService.subscribeToMessages(room.id, (roomMessages) => {
      setMessages(roomMessages);
      
      // Mark customer's own messages as read
      const unreadMessages = roomMessages
        .filter(msg => !msg.read && msg.senderType === 'admin')
        .map(msg => msg.id);
      
      if (unreadMessages.length > 0) {
        chatService.markMessagesAsRead(room.id, unreadMessages);
      }
    });

    return unsubscribe;
  }, [room]);

  // Set customer presence and subscribe to admin presence
  useEffect(() => {
    if (user?.email && room) {
      presenceService.setUserOnline(user.email, room.id);
      
      // Subscribe to admin online status (first admin email)
      const adminEmails = getAdminEmails();
      const primaryAdminEmail = adminEmails[0]; // Use first admin email for presence
      const unsubscribeAdminPresence = presenceService.subscribeToUserPresence(
        primaryAdminEmail,
        (isOnline) => setAdminOnline(isOnline)
      );
      
      return () => {
        if (user?.email) {
          presenceService.setUserOffline(user.email);
        }
        unsubscribeAdminPresence();
      };
    }
  }, [user, room]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !room || !user || !isAuthenticated) return;

    setSending(true);
    try {
      await chatService.sendMessage(
        room.id,
        newMessage.trim(),
        {
          email: user.email!,
          name: user.displayName || 'Customer',
          isAdmin: false
        }
      );

      setNewMessage('');
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('📁 File selected:', file?.name, file?.type, file?.size);
    
    resetRecordingError();
    if (isRecording) {
      cancelRecording();
    }
    
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.log('❌ File too large:', file.size);
        alert('File size must be less than 10MB');
        return;
      }
      console.log('✅ File accepted, setting selectedFile');
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    console.log('handleFileUpload called');
    console.log('selectedFile:', selectedFile?.name);
    console.log('room:', room?.id);
    console.log('user:', user?.email);
    console.log('isAuthenticated:', isAuthenticated);

    resetRecordingError();



    if (!selectedFile || !room || !user || !isAuthenticated) {
      console.log('Upload cancelled - missing requirements');
      return;
    }

    const pendingId = `pending-${Date.now()}`;
    setPendingUploads((prev) => [
      ...prev,
      {
        id: pendingId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        senderType: 'customer',
        startedAt: new Date()
      }
    ]);

    setUploading(true);
    try {
      console.log('Calling chatService.sendFileMessage...');
      await chatService.sendFileMessage(
        room.id,
        selectedFile,
        {
          email: user.email!,
          name: user.displayName || 'Customer',
          isAdmin: false
        }
      );

      console.log('File uploaded successfully');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setPendingUploads((prev) => prev.filter((upload) => upload.id != pendingId));
    } catch (error) {
      setPendingUploads((prev) => prev.filter((upload) => upload.id != pendingId));
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleStartRecording = async () => {
    if (selectedFile) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }

    await startRecording();
  };

  const handleFinishRecording = () => {
    finishRecording();
  };

  const handleCancelRecording = () => {
    cancelRecording();
  };


  // Convert markdown-style text to rich HTML
  const renderRichText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold** -> <strong>
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic* -> <em>
      .replace(/\n/g, '<br>'); // newlines -> <br>
  };

  // Format date to "10th October, 2025" style
  const formatEnquirerSinceDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    const suffix = day % 10 === 1 && day !== 11 ? 'st' :
                   day % 10 === 2 && day !== 12 ? 'nd' :
                   day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    
    return `${day}${suffix} ${month}, ${year}`;
  };

  const handleImageClick = (imageUrl: string, fileName: string) => {
    setSelectedImage({ url: imageUrl, fileName });
    setImageModalOpen(true);
  };

  const handleImageDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    
    if (now.toDateString() === messageTime.toDateString()) {
      return messageTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return messageTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatPendingFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(units.length - 1, bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0);
    const value = bytes / Math.pow(1024, exponent);
    return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
  };

  const renderPendingUpload = (upload: { id: string; fileName: string; fileSize: number; fileType: string; senderType: 'customer' | 'admin'; startedAt: Date }) => {
    const isCustomer = upload.senderType === 'customer';
    return (
      <div key={upload.id} className={`flex mb-4 ${isCustomer ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl border border-dashed border-gray-300 bg-white">
          <div className="text-sm font-medium text-gray-900 truncate" title={upload.fileName}>
            {upload.fileName}
          </div>
          <div className="text-xs text-gray-500">{formatPendingFileSize(upload.fileSize)}</div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mt-2">
            <span className="inline-flex h-3 w-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" aria-hidden="true"></span>
            <span>Uploading...</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMessage = (message: Message) => {
    const isCustomer = message.senderType === 'customer';
    const isEnquiry = message.messageType === 'enquiry';
    const isFile = message.messageType === 'file';

    return (
      <div
        key={message.id}
        className={`flex mb-4 ${isCustomer ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`${isEnquiry ? 'w-full' : 'max-w-xs lg:max-w-md xl:max-w-lg'} px-4 py-2 rounded-2xl ${
            isEnquiry
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
              : isCustomer && !isFile
              ? 'bg-gradient-to-r from-brand-primary to-brand-lime text-white'
              : 'bg-white border border-gray-200 shadow-sm'
          }`}
        >
          {isEnquiry && (
            <div className="mb-3 -mx-4 -mt-2">
              <div className="bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white px-4 py-2 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-transparent"></div>
                <span className="relative inline-flex items-center text-sm font-semibold tracking-wide">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                  NEW PRODUCT ENQUIRY
                </span>
              </div>
            </div>
          )}
          
          {!isCustomer && !isEnquiry && !isFile && (
            <div className="text-xs text-gray-600 mb-1 font-medium">
              Global XT Team
            </div>
          )}
          
          {isFile && message.fileData ? (
            <FileAttachment
              fileName={message.fileData.fileName}
              fileSize={message.fileData.fileSize}
              fileType={message.fileData.fileType}
              fileUrl={message.fileData.fileUrl}
              thumbnailUrl={message.fileData.thumbnailUrl}
              onImageClick={() => handleImageClick(message.fileData!.fileUrl, message.fileData!.fileName)}
            />
          ) : (
            <div 
              className={`text-sm ${isCustomer && !isEnquiry ? 'text-white' : 'text-gray-800'}`}
              dangerouslySetInnerHTML={{ __html: renderRichText(message.content) }}
            />
          )}
          
          <div className={`text-xs mt-2 ${isCustomer ? 'text-right' : 'text-left'} ${isCustomer && !isEnquiry && !isFile ? 'text-white/70' : 'text-gray-400'}`} style={{ fontSize: '10px' }}>
            {formatMessageTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-brand-primary to-brand-lime rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Sign In Required</h3>
          <p className="text-gray-600 mb-6">Please sign in with the Google account you used when making your enquiry to access this chat room.</p>
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-xl px-6 py-3 text-gray-700 hover:border-brand-primary hover:bg-gray-50 transition-colors mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          <p className="text-sm text-gray-500">
            Don't have access? Contact us at {getCompanyEmail()}
          </p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-900 mb-3">Access Denied</h3>
          <p className="text-gray-600 mb-4">You don't have access to this chat room.</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Currently signed in as:</p>
            <p className="font-semibold text-gray-900">{user?.email}</p>
          </div>
          <p className="text-gray-600 mb-6">Please sign in with the Google account you used when making your enquiry.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-xl px-6 py-3 text-gray-700 hover:border-brand-primary hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with different account
            </button>
            <button
              onClick={signOutUser}
              className="w-full px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign out current account
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Need help? Contact us at {getCompanyEmail()}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chat Room Not Found</h3>
          <p className="text-gray-600">The requested chat room could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-brand-primary to-brand-lime rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">GXT</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{room.customerName}</h2>
              <p className="text-sm text-gray-600">{room.customerEmail}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Enquirer since {formatEnquirerSinceDate(new Date(room.createdAt))}</p>
            <div className="flex items-center justify-end space-x-1 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${adminOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              <span>{adminOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-4">🌾</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Welcome to Global XT!</h3>
            <p>Your enquiry has been received. Our team will respond shortly.</p>
            <p className="text-sm mt-2">Feel free to ask any questions about our agricultural products.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map(renderMessage)}
            {pendingUploads.map(renderPendingUpload)}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          {recordingError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
              {recordingError}
            </div>
          )}

          {isRecording && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 5a3 3 0 016 0v4a3 3 0 11-6 0V5z" />
                    <path d="M5 9a5 5 0 0010 0h1a1 1 0 110 2h-3.035A3.5 3.5 0 0111 15.446V17h2a1 1 0 110 2H7a1 1 0 110-2h2v-1.554A3.5 3.5 0 016.035 11H3a1 1 0 110-2h1z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-700">Recording...</p>
                  <p className="text-xs text-red-500">Speak now and tap stop when you're done.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFinishRecording}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop
                </button>
                <button
                  onClick={handleCancelRecording}
                  className="px-3 py-1.5 text-red-600 text-xs hover:text-red-700 border border-transparent hover:border-red-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* File Upload Preview */}
          {selectedFile && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  {selectedFile.type.startsWith('audio/') && audioPreviewUrl && (
                    <audio
                      controls
                      src={audioPreviewUrl}
                      className="mt-2 w-full max-w-xs"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleFileUpload}
                  disabled={uploading || isRecording}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-1"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span>Send File</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    resetRecordingError();
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="px-2 py-1.5 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <div className="flex space-x-3">
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
              disabled={sending || uploading}
              maxLength={2000}
            />
            
            {/* File Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,audio/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isRecording}
              className="px-4 py-3 text-gray-500 hover:text-brand-primary hover:bg-gray-50 rounded-full transition-colors disabled:opacity-50 flex items-center"
              title="Upload file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <button
              onClick={handleStartRecording}
              disabled={uploading || isRecording}
              className="px-4 py-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 flex items-center"
              title="Record audio message"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 5a3 3 0 016 0v4a3 3 0 11-6 0V5z" />
                <path d="M5 9a5 5 0 0010 0h1a1 1 0 110 2h-3.035A3.5 3.5 0 0111 15.446V17h2a1 1 0 110 2H7a1 1 0 110-2h2v-1.554A3.5 3.5 0 016.035 11H3a1 1 0 110-2h1z" />
              </svg>
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending || uploading || isRecording}
              className="px-6 py-3 bg-brand-primary text-white rounded-full hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Sending...</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Send</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
          
          {newMessage.length > 1800 && (
            <div className="text-xs text-gray-500 mt-1 text-right">
              {newMessage.length}/2000 characters
            </div>
          )}
        </div>
      </div>

      {/* Powered by footer */}
      <div className="bg-gray-100 px-4 py-2 text-center">
        <p className="text-xs text-gray-500">
          💬 Powered by Global XT Customer Chat • 
          <span className="ml-1">🔒 Your messages are secure</span>
        </p>
      </div>
      
      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={imageModalOpen}
          onClose={() => {
            setImageModalOpen(false);
            setSelectedImage(null);
          }}
          imageUrl={selectedImage.url}
          fileName={selectedImage.fileName}
          onDownload={() => handleImageDownload(selectedImage.url, selectedImage.fileName)}
        />
      )}
    </div>
  );
};

export default CustomerChatInterface;





















