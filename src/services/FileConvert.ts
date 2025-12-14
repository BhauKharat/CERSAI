export function base64ToFile(base64: string, filename?: string): File {
  const [meta, data] = base64.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] || 'application/octet-stream';

  // Guess extension from mime
  const ext = mime.split('/')[1] || 'bin';
  const safeName = filename || `file_${Date.now()}.${ext}`;

  const binary = atob(data);
  const len = binary.length;
  const u8arr = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    u8arr[i] = binary.charCodeAt(i);
  }
  const file = new File([u8arr], safeName, { type: mime });
  return file;
}
