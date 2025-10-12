from pathlib import Path
import re
path = Path('src/services/dropboxUploadService.ts')
text = path.read_text(encoding='utf-8')
text = text.replace('?? Starting Dropbox file upload:', '[dropbox] Starting Dropbox file upload:')
text = text.replace('?? Attempting Dropbox upload via:', '[dropbox] Attempting Dropbox upload via:')
text = text.replace('?? Dropbox upload successful:', '[dropbox] Dropbox upload successful:')
text = text.replace('? Dropbox upload failed:', '[dropbox] upload failed:')
text = text.replace('? Dropbox upload error:', '[dropbox] upload error:')
text = text.replace('? Dropbox response missing URL:', '[dropbox] response missing URL:')
text = text.replace('? Dropbox share link creation failed:', '[dropbox] share link creation failed:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Attempting client-side Dropbox upload...', '[dropbox] Attempting client-side Dropbox upload...')
text = text.replace('?? File uploaded to Dropbox:', '[dropbox] File uploaded to Dropbox:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')
text = text.replace('?? Shareable link created:', '[dropbox] shareable link created:')

pattern = r"export const uploadFileToDropbox = async \(file: File\): Promise<DropboxUploadResult> => \{[\s\S]*?throw lastErr \|\| new Error\('Dropbox upload failed via all methods'\);\n\};"
match = re.search(pattern, text)
if not match:
    raise SystemExit('uploadFileToDropbox block not found')
new_block = "export const uploadFileToDropbox = async (file: File): Promise<DropboxUploadResult> => {\n  const directToken = import.meta.env.VITE_DROPBOX_ACCESS_TOKEN as string | undefined;\n  if (directToken) {\n    try {\n      return await uploadToDropboxDirect(file, directToken);\n    } catch (directError) {\n      console.warn('[dropbox] Direct upload with client token failed, falling back to API route', directError);\n    }\n  }\n\n  console.log('[dropbox] Starting Dropbox file upload:', {\n    fileName: file.name,\n    fileType: file.type,\n    fileSize: file.size,\n    isAudio: file.type.startswith('audio/'),\n    resourceType: getFileType(file)\n  });\n\n  const envBase = (import.meta.env.VITE_UPLOAD_API_BASE as string | undefined) || '';\n  const inferredBase = API_CONFIG?.BASE_URL || '';\n  const uploadCandidates = [\n    envBase ? `${envBase.replace(/\\/$/, '')}/api/dropbox-upload` : '',\n    inferredBase ? `${inferredBase.replace(/\\/$/, '')}/api/dropbox-upload` : '',\n    '/api/dropbox-upload',\n    'http://localhost:3001/api/dropbox-upload'\n  ].filter(Boolean);\n\n  let lastErr: any = null;\n  let dataUrl: string | null = null;\n\n  for (const url of uploadCandidates) {\n    try {\n      if (!dataUrl) {\n        dataUrl = await readFileAsDataUrl(file);\n      }\n\n      console.log(`[dropbox] Attempting Dropbox upload via: ${url}`);\n\n      const resp = await fetch(url, {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({\n          fileName: file.name,\n          fileData: dataUrl,\n          fileSize: file.size,\n          fileType: file.type,\n          resourceType: getFileType(file)\n        })\n      });\n\n      if (!resp.ok) {\n        const errorText = await resp.text();\n        console.warn(`[dropbox] upload failed via ${url}: ${resp.status} ${errorText}`);\n        lastErr = new Error(`Dropbox upload failed: ${resp.status} ${resp.statusText}`);\n        continue;\n      }\n\n      const json = await resp.json();\n      if (json.url || json.shareableUrl) {\n        const result: DropboxUploadResult = {\n          url: json.url || json.shareableUrl,\n          publicId: json.id || json.path_display,\n          resourceType: getFileType(file),\n          fileName: file.name,\n          fileSize: file.size\n        };\n\n        console.log('[dropbox] Dropbox upload successful:', {\n          fileName: file.name,\n          url: result.url,\n          resourceType: result.resourceType,\n          publicId: result.publicId\n        });\n\n        return result;\n      }\n\n      console.warn('[dropbox] response missing URL:', json);\n      lastErr = new Error('Dropbox response missing URL');\n    } catch (err) {\n      console.error('[dropbox] upload error:', err);\n      lastErr = err;\n    }\n  }\n\n  try {\n    console.log('[dropbox] Attempting client-side Dropbox upload...');\n    return await uploadToDropboxDirect(file);\n  } catch (clientErr) {\n    console.error('[dropbox] Direct Dropbox upload failed:', clientErr);\n    lastErr = clientErr;\n  }\n\n  throw lastErr || new Error('Dropbox upload failed via all methods');\n};"
text = text[:match.start()] + new_block + text[match.end():]
text = text.replace("const uploadToDropboxDirect = async (file: File): Promise<DropboxUploadResult> => {\n  const accessToken = import.meta.env.VITE_DROPBOX_ACCESS_TOKEN;", "const uploadToDropboxDirect = async (file: File, directToken?: string): Promise<DropboxUploadResult> => {\n  const accessToken = directToken || import.meta.env.VITE_DROPBOX_ACCESS_TOKEN;")
path.write_text(text, encoding='utf-8')
