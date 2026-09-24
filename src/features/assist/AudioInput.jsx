import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ASSIST_LOCALE } from './assistLocale';
import { toast } from '@/shared/utils/toast';

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
    </>
  );
}
