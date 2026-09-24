const RECORDING_EXTENSIONS = {
  'audio/mp4': 'mp4',
  'video/mp4': 'mp4',
  'audio/webm': 'webm',
  'video/webm': 'webm',
  'audio/x-m4a': 'm4a',
};

export function getRecordingFilename(type) {
  const mimeType = type.split(';')[0].trim().toLowerCase();
  const extension = RECORDING_EXTENSIONS[mimeType];
  return extension ? `recording.${extension}` : null;
}
