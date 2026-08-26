// ImgBB Upload Service
// API Endpoint: https://api.imgbb.com/1/upload

const IMGBB_LOCAL_KEY_STORAGE = 'vmk_imgbb_api_key_v1';

export interface ImgbbUploadResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb?: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium?: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url?: string;
  };
  success: boolean;
  status: number;
}

export function getSavedImgbbKey(): string {
  try {
    const custom = localStorage.getItem(IMGBB_LOCAL_KEY_STORAGE);
    if (custom && custom.trim()) return custom.trim();
  } catch {
    // Ignore storage read error
  }
  return '';
}

export function saveImgbbKey(key: string): void {
  try {
    if (key && key.trim()) {
      localStorage.setItem(IMGBB_LOCAL_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(IMGBB_LOCAL_KEY_STORAGE);
    }
  } catch {
    // Ignore storage write error
  }
}

/**
 * Convert a File object or blob to a base64 string
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Resize and compress image to keep base64 performant
 */
export async function compressImage(file: File, maxWidth = 400, maxHeight = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } else {
        fileToBase64(file).then(resolve);
      }
    };
    img.onerror = () => {
      fileToBase64(file).then(resolve);
    };
    img.src = url;
  });
}

/**
 * Upload an image File or Base64 string to ImgBB using API: https://api.imgbb.com/1/upload
 * If API key is missing or invalid, gracefully returns compressed local Data-URL so UI never fails.
 */
export async function uploadImageToImgbb(
  fileOrBase64: File | string,
  fileName?: string,
  customApiKey?: string
): Promise<{ url: string; displayUrl: string; thumbUrl?: string; isLocalFallback?: boolean; raw?: any }> {
  // Obtain base64 string
  let base64Data = '';
  if (typeof fileOrBase64 === 'string') {
    base64Data = fileOrBase64;
  } else {
    try {
      base64Data = await compressImage(fileOrBase64);
    } catch {
      base64Data = await fileToBase64(fileOrBase64);
    }
  }

  const apiKey = (customApiKey !== undefined ? customApiKey : getSavedImgbbKey()).trim();

  // If no API key is set, use the local data URL directly
  if (!apiKey) {
    return {
      url: base64Data,
      displayUrl: base64Data,
      thumbUrl: base64Data,
      isLocalFallback: true,
      raw: { source: 'local_storage', message: 'Saved as local base64 data URL' },
    };
  }

  // Extract clean base64 payload without prefix for ImgBB API
  let rawBase64Only = base64Data;
  if (base64Data.includes('base64,')) {
    rawBase64Only = base64Data.split('base64,')[1];
  }

  // Attempt 1: Call Backend Proxy endpoint (/api/upload-imgbb)
  try {
    const proxyRes = await fetch('/api/upload-imgbb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: rawBase64Only,
        name: fileName || 'user_profile',
        key: apiKey,
      }),
    });

    if (proxyRes.ok) {
      const result = await proxyRes.json();
      if (result.success && result.data) {
        return {
          url: result.data.url,
          displayUrl: result.data.display_url || result.data.url,
          thumbUrl: result.data.thumb?.url || result.data.display_url || result.data.url,
          isLocalFallback: false,
          raw: result,
        };
      } else if (result.error) {
        console.warn('[ImgBB Server Notice]:', result.error);
      }
    }
  } catch (proxyErr) {
    console.warn('[ImgBB Proxy network issue, attempting direct]:', proxyErr);
  }

  // Attempt 2: Direct Client POST to https://api.imgbb.com/1/upload
  try {
    const formData = new FormData();
    formData.append('image', rawBase64Only);
    if (fileName) {
      formData.append('name', fileName);
    }

    const targetUrl = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`;
    const directRes = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
    });

    if (directRes.ok) {
      const data: ImgbbUploadResponse = await directRes.json();
      if (data.success && data.data) {
        return {
          url: data.data.url,
          displayUrl: data.data.display_url || data.data.url,
          thumbUrl: data.data.thumb?.url || data.data.display_url || data.data.url,
          isLocalFallback: false,
          raw: data,
        };
      }
    } else {
      const errText = await directRes.text();
      console.warn('[ImgBB Direct Upload status]:', directRes.status, errText);
    }
  } catch (directErr) {
    console.warn('[ImgBB Direct Upload warning]:', directErr);
  }

  // Graceful Fallback: Return optimized local Data URL so profile creation never fails
  return {
    url: base64Data,
    displayUrl: base64Data,
    thumbUrl: base64Data,
    isLocalFallback: true,
    raw: { source: 'local_storage_fallback' },
  };
}

