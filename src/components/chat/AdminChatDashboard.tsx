// Admin Chat Dashboard - WhatsApp Style Interface
import React, { useState, useEffect, useRef } from 'react';
import type { ChatRoom, Message } from '../../types/chat';
import { chatService, presenceService } from '../../services/chatService';
import { useAuth } from '../../context/AuthProvider';
import { isAdminEmail } from '../../config/chat';
import FileAttachment from './FileAttachment';
import ImageModal from './ImageModal';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

// Get admin emails from configuration
const isAdmin = (email: string) => isAdminEmail(email);

interface AdminChatDashboardProps {
  className?: string;
}

const AdminChatDashboard: React.FC<AdminChatDashboardProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const userIsAdmin = user?.email ? isAdmin(user.email) : false;
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  // const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [notifications, setNotifications] = useState<string[]>([]);
  const [customerOnlineStatus, setCustomerOnlineStatus] = useState<Record<string, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; fileName: string } | null>(null);
  const [pendingUploads, setPendingUploads] = useState<Array<{ id: string; fileName: string; fileSize: number; fileType: string; senderType: 'customer' | 'admin'; startedAt: Date }>>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Subscribe to all chat rooms
  useEffect(() => {
    if (!userIsAdmin) return;

    const unsubscribe = chatService.subscribeToAdminRooms((updatedRooms) => {
      // Sort rooms by last activity (most recent first)
      const sortedRooms = updatedRooms.sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
      
      // Check for new messages and show notifications
      sortedRooms.forEach(room => {
        const existingRoom = rooms.find(r => r.id === room.id);
        if (existingRoom && room.lastMessage && 
            (!existingRoom.lastMessage || 
             room.lastMessage.timestamp > existingRoom.lastMessage.timestamp)) {
          // New message in existing room
          if (room.lastMessage.senderType === 'customer' && activeRoom?.id !== room.id) {
            addNotification(`New message from ${room.customerName}`);
          }
        }
      });
      
      setRooms(sortedRooms);
      setLoading(false);
      
      // Subscribe to customer presence for each room
      sortedRooms.forEach(room => {
        const unsubscribe = presenceService.subscribeToUserPresence(
          room.customerEmail,
          (isOnline) => {
            setCustomerOnlineStatus(prev => ({
              ...prev,
              [room.customerEmail]: isOnline
            }));
          }
        );
        
        // Store unsubscribe function for cleanup (in a real app you'd want to manage these better)
        return () => unsubscribe();
      });
    });

    return unsubscribe;
  }, [userIsAdmin, rooms, activeRoom]);

  // Subscribe to messages for active room
  useEffect(() => {
    if (!activeRoom) {
      setMessages([]);
      return;
    }

    const unsubscribe = chatService.subscribeToMessages(activeRoom.id, (roomMessages) => {
      setMessages(roomMessages);
      
      // Mark admin messages as read
      const unreadMessages = roomMessages
        .filter(msg => !msg.read && msg.senderType === 'customer')
        .map(msg => msg.id);
      
      if (unreadMessages.length > 0) {
        chatService.markMessagesAsRead(activeRoom.id, unreadMessages);
      }
    });

    return unsubscribe;
  }, [activeRoom]);

  // Set admin presence
  useEffect(() => {
    if (user?.email) {
      presenceService.setUserOnline(user.email, activeRoom?.id);
      
      return () => {
        if (user?.email) {
          presenceService.setUserOffline(user.email);
        }
      };
    }
  }, [user, activeRoom]);

  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 5000);
  };

  const handleSelectRoom = (room: ChatRoom) => {
    setActiveRoom(room);
    // Move selected room to top
    setRooms(prev => {
      const otherRooms = prev.filter(r => r.id !== room.id);
      return [room, ...otherRooms];
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || !user) return;

    setSending(true);
    try {
      await chatService.sendMessage(
        activeRoom.id,
        newMessage.trim(),
        {
          email: user.email!,
          name: user.displayName || 'Admin',
          isAdmin: true
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('📁 Admin - File selected:', file?.name, file?.type, file?.size);
    
    resetRecordingError();
    if (isRecording) {
      cancelRecording();
    }
    
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.log('❌ Admin - File too large:', file.size);
        alert('File size must be less than 10MB');
        return;
      }
      console.log('✅ Admin - File accepted, setting selectedFile');
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    console.log('Admin - handleFileUpload called');

    if (!selectedFile || !activeRoom || !user) {
      console.log('Admin - Upload cancelled - missing requirements');
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
        senderType: 'admin',
        startedAt: new Date()
      }
    ]);

    resetRecordingError();
    setUploading(true);
    try {
      console.log('Admin - Calling chatService.sendFileMessage...');
      await chatService.sendFileMessage(
        activeRoom.id,
        selectedFile,
        {
          email: user.email!,
          name: user.displayName || 'Admin',
          isAdmin: true
        }
      );

      console.log('Admin - File uploaded successfully');
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

  const formatLastMessageTime = (timestamp: Date) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return messageTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPendingFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(units.length - 1, bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0);
    const value = bytes / Math.pow(1024, exponent);
    return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
  };

  const renderPendingUpload = (upload: { id: string; fileName: string; fileSize: number; fileType: string; senderType: 'customer' | 'admin'; startedAt: Date }) => {
    const isAdminUpload = upload.senderType === 'admin';
    return (
      <div key={upload.id} className={`flex mb-4 ${isAdminUpload ? 'justify-start' : 'justify-end'}`}>
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
    const isAdmin = message.senderType === 'admin';
    const isEnquiry = message.messageType === 'enquiry';
    const isFile = message.messageType === 'file';

    return (
      <div
        key={message.id}
        className={`flex mb-4 ${isAdmin ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`${isEnquiry ? 'w-full' : 'max-w-xs lg:max-w-md xl:max-w-lg'} px-4 py-2 rounded-2xl ${
            isEnquiry
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
              : isAdmin && !isFile
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
              className={`text-sm ${isAdmin && !isEnquiry ? 'text-white' : 'text-gray-800'}`}
              dangerouslySetInnerHTML={{ __html: renderRichText(message.content) }}
            />
          )}
          
          <div className={`text-xs mt-2 ${isAdmin ? 'text-right' : 'text-left'} ${isAdmin && !isEnquiry && !isFile ? 'text-white/70' : 'text-gray-400'}`} style={{ fontSize: '10px' }}>
            {formatMessageTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You need admin privileges to access the chat dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-gray-100 ${className}`}>
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-brand-primary text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in"
            >
              {notification}
            </div>
          ))}
        </div>
      )}

      {/* Sidebar - Contact List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">💬 Customer Chats</h2>
          <p className="text-sm text-gray-600">{rooms.length} conversation{rooms.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations loaded</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">If you're seeing Firebase index errors in console:</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
                  <p className="text-yellow-800 font-medium mb-1">🔧 Firebase Setup Required</p>
                  <p className="text-yellow-700 text-xs mb-2">
                    Create Firebase indexes to load conversations
                  </p>
                  <p className="text-yellow-700 text-xs">
                    See: <code className="bg-yellow-100 px-1 rounded">FIREBASE_INDEXES_MANUAL_SETUP.md</code>
                  </p>
                </div>
                <p className="text-gray-500 text-xs mt-3">
                  Once indexes are created, conversations will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    activeRoom?.id === room.id ? 'bg-brand-primary/5 border-r-4 border-brand-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {room.customerName}
                          </h3>
                          <div className={`w-2 h-2 rounded-full ${customerOnlineStatus[room.customerEmail] ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {room.lastMessage && formatLastMessageTime(room.lastMessage.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{room.customerEmail}</p>
                        {customerOnlineStatus[room.customerEmail] && (
                          <span className="text-xs text-green-600 font-medium">Online</span>
                        )}
                      </div>
                      {room.lastMessage && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {room.lastMessage.senderType === 'admin' ? 'You: ' : ''}
                          {room.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Unread indicator */}
                  {room.lastMessage?.senderType === 'customer' && (
                    <div className="w-2 h-2 bg-brand-primary rounded-full mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!activeRoom ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a customer from the sidebar to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{activeRoom.customerName}</h3>
                  <p className="text-sm text-gray-600">{activeRoom.customerEmail}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Enquirer since {formatEnquirerSinceDate(new Date(activeRoom.createdAt))}</p>
                  <div className="flex items-center justify-end space-x-1 text-sm text-gray-500">
                    <div className={`w-2 h-2 rounded-full ${customerOnlineStatus[activeRoom.customerEmail] ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span>{customerOnlineStatus[activeRoom.customerEmail] ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="text-4xl mb-2">👋</div>
                  <p>Start the conversation with {activeRoom.customerName}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(renderMessage)}
                  {pendingUploads.map(renderPendingUpload)}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
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
                        <span>Send File</span>
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
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${activeRoom.customerName}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  disabled={sending || uploading}
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
                  className="px-3 py-2 text-gray-500 hover:text-brand-primary hover:bg-gray-50 rounded-full transition-colors disabled:opacity-50"
                  title="Upload file"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                <button
                  onClick={handleStartRecording}
                  disabled={uploading || isRecording}
                  className="px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
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
                  className="px-6 py-2 bg-brand-primary text-white rounded-full hover:bg-brand-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? '⌛' : '📤'}
                </button>
              </div>
            </div>
          </>
        )}
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

export default AdminChatDashboard;
















