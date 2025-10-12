interface DropboxUploadResult {
  url: string;
  publicId?: string;
  resourceType?: string;
  fileName?: string;
  fileSize?: number;
}

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
};

const getFileType = (file: File): string => {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('video/')) {
    return 'video';
  } else if (file.type.startsWith('audio/')) {
    return 'audio';
  } else {
    return 'document';
  }
};

export const uploadFileToDropbox = async (file: File): Promise<DropboxUploadResult> => {
  console.log('📤 Starting direct Dropbox file upload (no backend):', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    isAudio: file.type.startsWith('audio/'),
    resourceType: getFileType(file)
  });

  // Direct client-side upload to Dropbox (no backend required!)
  return await uploadToDropboxDirect(file);
};

// Direct client-side upload to Dropbox (NO BACKEND NEEDED!)
const uploadToDropboxDirect = async (file: File): Promise<DropboxUploadResult> => {
  const accessToken = import.meta.env.VITE_DROPBOX_ACCESS_TOKEN;
  
  console.log('🔑 Token validation:');
  console.log('- Token exists:', !!accessToken);
  console.log('- Token length:', accessToken?.length || 0);
  console.log('- Token format:', accessToken?.startsWith('sl.') ? 'Valid format' : 'Invalid format');
  console.log('- Token prefix:', accessToken ? accessToken.substring(0, 20) + '...' : 'None');
  console.log('- Environment check:', {
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV
  });
  
  if (!accessToken) {
    throw new Error('❌ Dropbox access token not configured. Please add VITE_DROPBOX_ACCESS_TOKEN to your .env.local file.');
  }
  
  if (!accessToken.startsWith('sl.')) {
    throw new Error('❌ Invalid Dropbox access token format. Token should start with "sl."');
  }
  
  // Test token validity first
  console.log('🗺 Testing Dropbox API connection...');
  console.log('🗺 Request details:');
  console.log('- URL: https://api.dropboxapi.com/2/users/get_current_account');
  console.log('- Method: POST');
  console.log('- Authorization header:', `Bearer ${accessToken.substring(0, 20)}...`);
  console.log('- Content-Type: none (no body, no content-type)');
  console.log('- Body: null');
  
  try {
    const testResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
      // No body and no Content-Type header for endpoints that don't expect JSON
    });
    
    console.log('📊 API Response status:', testResponse.status);
    console.log('📊 API Response headers:', Object.fromEntries(testResponse.headers.entries()));
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ Token validation failed:');
      console.error('- Status:', testResponse.status);
      console.error('- Status text:', testResponse.statusText);
      console.error('- Response:', errorText);
      
      // Try to parse error details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('- Parsed error:', errorJson);
      } catch (e) {
        console.error('- Raw error (not JSON):', errorText);
      }
      
      // Specific error handling
      if (testResponse.status === 400) {
        throw new Error('Dropbox API Error 400: Bad Request. The token format may be invalid or the request is malformed.');
      } else if (testResponse.status === 401) {
        throw new Error('Dropbox API Error 401: Invalid or expired access token.');
      } else {
        throw new Error(`Dropbox API Error ${testResponse.status}: ${testResponse.statusText}`);
      }
    }
    
    const accountInfo = await testResponse.json();
    console.log('✅ Token valid - Account:', accountInfo.name?.display_name);
  } catch (error) {
    console.error('❌ Failed to validate Dropbox token:', error);
    throw new Error('Failed to connect to Dropbox. Please check your internet connection and token.');
  }

  try {
    // Check file size (Dropbox upload endpoint has 150MB limit)
    const maxSize = 150 * 1024 * 1024; // 150MB
    if (file.size > maxSize) {
      throw new Error(`❌ File too large. Maximum size is 150MB, got ${Math.round(file.size / 1024 / 1024)}MB`);
    }
    
    // Generate organized file path by type
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileType = getFileType(file);
    const filePath = `/global-xt-uploads/${fileType}/${timestamp}_${sanitizedFileName}`;

    console.log('📁 Uploading to path:', filePath);
    console.log(`📁 File size check: ${Math.round(file.size / 1024)}KB (limit: 150MB)`);

    // Read file as ArrayBuffer for upload
    const fileBuffer = await readFileAsArrayBuffer(file);
    
    if (fileBuffer.byteLength !== file.size) {
      console.warn('⚠️ File size mismatch:', file.size, 'vs', fileBuffer.byteLength);
    }

    // Step 1: Upload file directly to Dropbox
    console.log('🔄 Making upload request to Dropbox...');
    console.log('- URL: https://content.dropboxapi.com/2/files/upload');
    console.log('- File size:', fileBuffer.byteLength, 'bytes');
    console.log('- Authorization header length:', `Bearer ${accessToken}`.length);
    
    const uploadResponse = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: filePath,
          mode: 'add',
          autorename: true
        }),
        'Content-Type': 'application/octet-stream'
      },
      body: fileBuffer
    });

    console.log('📊 Upload response status:', uploadResponse.status);
    console.log('📊 Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Dropbox upload failed with status:', uploadResponse.status);
      console.error('❌ Error response:', errorText);
      
      // Try to parse the error for more details
      let errorDetails = 'Unknown error';
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.error_summary || errorJson.error || errorText;
        console.error('❌ Parsed error details:', errorJson);
      } catch (e) {
        errorDetails = errorText;
      }
      
      // Common error messages
      if (uploadResponse.status === 401) {
        throw new Error('❌ Dropbox authentication failed. Please check your access token.');
      } else if (uploadResponse.status === 403) {
        throw new Error('❌ Dropbox access forbidden. Please check your app permissions.');
      } else if (uploadResponse.status === 409) {
        throw new Error('❌ Dropbox conflict error. File may already exist or path is invalid.');
      } else {
        throw new Error(`Dropbox upload failed (${uploadResponse.status}): ${errorDetails}`);
      }
    }

    const uploadResult = await uploadResponse.json();
    console.log('📁 File uploaded successfully:', {
      path: uploadResult.path_display,
      size: uploadResult.size,
      id: uploadResult.id
    });

    // Step 2: Create shareable link (try multiple methods)
    let directUrl: string;
    let shareableUrl: string;
    
    console.log('🔗 Creating shareable link...');
    
    // Method 1: Try to create a regular shared link first
    try {
      const shareResponse = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: uploadResult.path_display,
          settings: {
            // Don't specify visibility to avoid permission issues
          }
        })
      });

      if (shareResponse.ok) {
        const shareResult = await shareResponse.json();
        shareableUrl = shareResult.url;
        // Convert to direct download/view URL
        directUrl = shareableUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '?raw=1');
        console.log('✅ Shared link created:', shareableUrl);
        console.log('📥 Direct access URL:', directUrl);
      } else {
        throw new Error('Primary sharing method failed');
      }
    } catch (shareError) {
      console.warn('⚠️ Primary sharing failed, trying alternative method...');
      
      // Method 2: Try to get existing links or create without settings
      try {
        const listLinksResponse = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            path: uploadResult.path_display
          })
        });
        
        if (listLinksResponse.ok) {
          const linksResult = await listLinksResponse.json();
          if (linksResult.links && linksResult.links.length > 0) {
            shareableUrl = linksResult.links[0].url;
            directUrl = shareableUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '?raw=1');
            console.log('✅ Found existing shared link:', shareableUrl);
          } else {
            throw new Error('No existing links found');
          }
        } else {
          throw new Error('List links failed');
        }
      } catch (listError) {
        console.warn('⚠️ Alternative sharing failed, using temporary URL...');
        // Method 3: Create a temporary download link
        try {
          const tempLinkResponse = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              path: uploadResult.path_display
            })
          });
          
          if (tempLinkResponse.ok) {
            const tempResult = await tempLinkResponse.json();
            directUrl = tempResult.link;
            shareableUrl = directUrl;
            console.log('✅ Temporary link created:', directUrl);
          } else {
            throw new Error('Temporary link creation failed');
          }
        } catch (tempError) {
          console.error('❌ All sharing methods failed, using file path as identifier');
          // Fallback: just use the Dropbox path - files will still be accessible via Dropbox
          directUrl = `dropbox:${uploadResult.path_display}`;
          shareableUrl = directUrl;
        }
      }
    }

    const result: DropboxUploadResult = {
      url: directUrl,
      publicId: uploadResult.path_display,
      resourceType: fileType,
      fileName: file.name,
      fileSize: file.size
    };

    console.log('✅ Dropbox upload completed successfully:', {
      fileName: file.name,
      downloadUrl: directUrl,
      dropboxPath: uploadResult.path_display
    });

    return result;

  } catch (error) {
    console.error('❌ Dropbox upload failed:', error);
    throw new Error(`Dropbox upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export type { DropboxUploadResult };