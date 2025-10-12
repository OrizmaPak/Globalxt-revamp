// Simple Dropbox test that can be run in browser console
export const testDropboxConnection = async () => {
  console.log('🧪 Testing Dropbox connection...');
  
  // Debug environment variables
  console.log('🔍 Environment debug:');
  console.log('- All env vars starting with VITE_:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
  console.log('- NODE_ENV:', import.meta.env.NODE_ENV);
  console.log('- MODE:', import.meta.env.MODE);
  console.log('- DEV:', import.meta.env.DEV);
  
  // Get token from environment
  const token = import.meta.env.VITE_DROPBOX_ACCESS_TOKEN;
  
  console.log('🔑 Token check:');
  console.log('- Token exists:', !!token);
  console.log('- Token type:', typeof token);
  console.log('- Token length:', token?.length || 0);
  
  if (!token) {
    console.error('❌ No access token found in environment variables');
    console.error('Make sure VITE_DROPBOX_ACCESS_TOKEN is in .env.local');
    return;
  }
  
  if (typeof token !== 'string') {
    console.error('❌ Token is not a string:', typeof token);
    return;
  }
  
  console.log('✅ Token found, length:', token.length);
  console.log('✅ Token starts with:', token.substring(0, 10) + '...');
  console.log('✅ Token ends with:', '...' + token.substring(token.length - 10));
  
  try {
    // Test basic API connection
    const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
      // No body and no Content-Type header for this endpoint
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connection successful!');
      console.log('👤 Account:', data.name?.display_name);
      console.log('📧 Email:', data.email);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Connection failed:', response.status, error);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
};

export const testSimpleUpload = async () => {
  console.log('🧪 Testing simple file upload...');
  
  const token = import.meta.env.VITE_DROPBOX_ACCESS_TOKEN;
  
  if (!token) {
    console.error('❌ No access token found');
    return;
  }
  
  try {
    // Create a tiny test file
    const content = 'Hello from Dropbox test!';
    const file = new Blob([content], { type: 'text/plain' });
    const path = `/test-${Date.now()}.txt`;
    
    console.log('📤 Uploading test file to:', path);
    
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: path,
          mode: 'add',
          autorename: true
        }),
        'Content-Type': 'application/octet-stream'
      },
      body: file
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload successful!');
      console.log('📁 File path:', result.path_display);
      console.log('📊 File size:', result.size, 'bytes');
      return result;
    } else {
      const error = await response.text();
      console.error('❌ Upload failed:', response.status, error);
      try {
        const errorObj = JSON.parse(error);
        console.error('📋 Error details:', errorObj);
      } catch (e) {
        // Error text is not JSON
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    return false;
  }
};

// Export for console access
if (typeof window !== 'undefined') {
  (window as any).testDropboxConnection = testDropboxConnection;
  (window as any).testSimpleUpload = testSimpleUpload;
}