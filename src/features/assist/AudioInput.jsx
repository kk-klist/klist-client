import { useEffect, useRef, useState } from 'react';
import { FileAudio, Mic, Square } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ASSIST_LOCALE } from './assistLocale';
import { toast } from '@/shared/utils/toast';

const ACCEPTED_AUDIO_TYPES = 'audio/*,.m4a,.mp3,.wav,.webm,.ogg';

export function AudioInput({ disabled, onAudio, language = 'ko' }) {
  const text = ASSIST_LOCALE[language];
  const onAudioRef = useRef(onAudio);
  useEffect(() => {
    onAudioRef.current = onAudio;
  }, [onAudio]);
  const [isRecording, setIsRecording] = useState(false);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);

  useEffect(
    () => () => {
      if (recorderRef.current) {
        recorderRef.current.onstop = null;
        if (recorderRef.current.state !== 'inactive') recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function startRecording() {
    if (!globalThis.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
      toast.error(text.recordingUnsupported);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = ({ data }) => data.size > 0 && chunksRef.current.push(data);
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm';
        const file = new File(chunksRef.current, 'recording.webm', { type });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setIsRecording(false);
        if (file.size > 0) onAudioRef.current(file);
      };
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
        toast.error(text.microphoneDenied);
      } else {
        toast.error(text.recordingFailed);
      }
    }
  }

  function toggleRecording() {
    if (isRecording) recorderRef.current?.stop();
    else startRecording();
  }

  function selectFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) onAudio(file);
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        disabled={disabled}
        aria-label={isRecording ? text.recordStop : text.recordStart}
        title={isRecording ? text.recordStop : text.record}
        onClick={toggleRecording}
      >
        {isRecording ? <Square className="fill-current text-destructive" /> : <Mic />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        disabled={disabled || isRecording}
        aria-label={text.file}
        title={text.file}
        onClick={() => fileInputRef.current?.click()}
      >
        <FileAudio />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_AUDIO_TYPES}
        className="hidden"
        tabIndex={-1}
        onChange={selectFile}
      />
    </>
  );
}
