import { useCallback, useEffect, useRef, useState } from 'react';

type AudioRecorderOptions = {
  onRecordingComplete?: (file: File) => void;
  maxSizeBytes?: number;
};

type AudioRecorderResult = {
  isRecording: boolean;
  recordingError: string | null;
  startRecording: () => Promise<void>;
  finishRecording: () => void;
  cancelRecording: () => void;
  resetRecordingError: () => void;
};

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MIME_TYPE_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg'
];

const getFileExtension = (mimeType: string) => {
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4')) return 'm4a';
  if (mimeType.includes('mpeg')) return 'mp3';
  if (mimeType.includes('wav')) return 'wav';
  return 'webm';
};

export const useAudioRecorder = (
  options: AudioRecorderOptions = {}
): AudioRecorderResult => {
  const { onRecordingComplete, maxSizeBytes = DEFAULT_MAX_SIZE_BYTES } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingMimeTypeRef = useRef('');
  const shouldSaveRecordingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    recordingMimeTypeRef.current = '';
    shouldSaveRecordingRef.current = false;
    setIsRecording(false);
  }, []);

  const getSupportedMimeType = useCallback(() => {
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
      return '';
    }

    return MIME_TYPE_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  }, []);

  const startRecording = useCallback(async () => {
    setRecordingError(null);

    if (isRecording) {
      return;
    }

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setRecordingError('Audio recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      shouldSaveRecordingRef.current = false;
      recordingMimeTypeRef.current = mimeType || recorder.mimeType || 'audio/webm';

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error('Audio recorder error:', event);
        setRecordingError('An error occurred while recording audio.');
      };

      recorder.onstop = () => {
        const shouldSave = shouldSaveRecordingRef.current;
        const chunks = audioChunksRef.current.slice();
        const mime = recordingMimeTypeRef.current;

        cleanup();
        setIsRecording(false);

        if (!shouldSave || chunks.length === 0) {
          return;
        }

        const blobMimeType = mime || recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: blobMimeType });
        const extension = getFileExtension(blobMimeType || blob.type);
        const fileName = `chat-recording-${Date.now()}.${extension}`;
        const file = new File([blob], fileName, { type: blob.type || blobMimeType });

        if (file.size > maxSizeBytes) {
          const maxSizeMb = Math.round(maxSizeBytes / (1024 * 1024));
          setRecordingError(`Audio recording is too large. Limit is ${maxSizeMb}MB.`);
          return;
        }

        onRecordingComplete?.(file);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setRecordingError('Could not start audio recording. Please check microphone permissions.');
      cleanup();
    }
  }, [cleanup, getSupportedMimeType, isRecording, maxSizeBytes, onRecordingComplete]);

  const finishRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      return;
    }

    shouldSaveRecordingRef.current = true;
    if (recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      cleanup();
    }
    setIsRecording(false);
  }, [cleanup]);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) {
      cleanup();
      setRecordingError(null);
      return;
    }

    shouldSaveRecordingRef.current = false;
    if (recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      cleanup();
    }

    setRecordingError(null);
    setIsRecording(false);
  }, [cleanup]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.error('Error stopping recorder on unmount:', error);
        }
      }
      cleanup();
    };
  }, [cleanup]);

  const resetRecordingError = useCallback(() => {
    setRecordingError(null);
  }, []);

  return {
    isRecording,
    recordingError,
    startRecording,
    finishRecording,
    cancelRecording,
    resetRecordingError
  };
};

