// Debug script to test Dropbox upload
export const debugDropboxUpload = async () => {
  console.log('🔍 Starting Dropbox upload debug...');
  
  // Check environment variables
  const accessToken = import.meta.env.VITE_DROPBOX_ACCESS_TOKEN;
  console.log('📝 Environment check:');
  console.log('- Access token exists:', !!accessToken);
  console.log('- Access token length:', accessToken?.length || 0);
  console.log('- Access token starts with:', accessToken?.substring(0, 10) + '...' || 'Not found');
  
  if (!accessToken) {
    console.error('❌ VITE_DROPBOX_ACCESS_TOKEN not found in environment');
    console.log('💡 Make sure your .env.local file contains:');
    console.log('VITE_DROPBOX_ACCESS_TOKEN=your_token_here');
    return;
  }
  
  // Test Dropbox API connection
  console.log('🌐 Testing Dropbox API connection...');
  
  try {
    // Test account info endpoint
    const accountResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
      // No body and no Content-Type header for this endpoint
    });
    
    if (accountResponse.ok) {
      const accountInfo = await accountResponse.json();
      console.log('✅ Dropbox API connection successful!');
      console.log('👤 Account:', {
        name: accountInfo.name?.display_name,
        email: accountInfo.email,
        account_id: accountInfo.account_id
      });
    } else {
      const errorText = await accountResponse.text();
      console.error('❌ Dropbox API connection failed:', accountResponse.status, errorText);
      return;
    }
  } catch (error) {
    console.error('❌ Network error connecting to Dropbox:', error);
    return;
  }
  
  // Test file upload with a small test file
  console.log('📤 Testing file upload...');
  
  try {
    // Create a small test file
    const testContent = 'This is a test file for Dropbox upload debug';
    const testFile = new File([testContent], 'debug-test.txt', { type: 'text/plain' });
    
    console.log('📁 Test file created:', {
      name: testFile.name,
      size: testFile.size,
      type: testFile.type
    });
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await testFile.arrayBuffer();
    console.log('🔄 File converted to ArrayBuffer:', arrayBuffer.byteLength, 'bytes');
    
    // Upload file to Dropbox
    const uploadPath = `/global-xt-uploads/debug/test-${Date.now()}.txt`;
    console.log('📍 Upload path:', uploadPath);
    
    const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: uploadPath,
          mode: 'add',
          autorename: true
        }),
        'Content-Type': 'application/octet-stream'
      },
      body: arrayBuffer
    });
    
    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      console.log('✅ File upload successful!');
      console.log('📄 Upload result:', {
        path: uploadResult.path_display,
        size: uploadResult.size,
        id: uploadResult.id
      });
      
      // Test creating shareable link
      console.log('🔗 Testing shareable link creation...');
      
      const shareResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: uploadResult.path_display,
          settings: {
            requested_visibility: 'public'
          }
        })
      });
      
      if (shareResponse.ok) {
        const shareResult = await shareResponse.json();
        const directUrl = shareResult.url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
        
        console.log('✅ Shareable link created successfully!');
        console.log('🌐 Share URL:', shareResult.url);
        console.log('📥 Direct download URL:', directUrl);
        
        console.log('🎉 All tests passed! Dropbox integration is working correctly.');
        
      } else {
        const shareError = await shareResponse.text();
        console.error('❌ Share link creation failed:', shareResponse.status, shareError);
      }
      
    } else {
      const uploadError = await uploadResponse.text();
      console.error('❌ File upload failed:', uploadResponse.status, uploadError);
      
      // Try to parse error details
      try {
        const errorJson = JSON.parse(uploadError);
        console.error('📋 Error details:', errorJson);
      } catch (e) {
        console.error('📋 Raw error:', uploadError);
      }
    }
    
  } catch (error) {
    console.error('❌ Upload test error:', error);
  }
  
  console.log('🔚 Debug complete!');
};

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).debugDropboxUpload = debugDropboxUpload;
}