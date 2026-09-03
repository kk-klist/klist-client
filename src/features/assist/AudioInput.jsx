import { useEffect, useRef, useState } from 'react';
import { FileAudio, Mic, Square } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from '@/shared/utils/toast';

const ACCEPTED_AUDIO_TYPES = 'audio/*,.m4a,.mp3,.wav,.webm,.ogg';

export function AudioInput({ disabled, onAudio }) {
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
      toast.error('이 브라우저에서는 음성 녹음을 지원하지 않아요. 음성 파일을 선택해 주세요.');
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
        if (file.size > 0) onAudio(file);
      };
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
        toast.error('마이크 권한이 거부되었어요. 브라우저 설정에서 권한을 허용해 주세요.');
      } else {
        toast.error('녹음을 시작하지 못했어요. 마이크 연결 상태를 확인해 주세요.');
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
        aria-label={isRecording ? '녹음 중지 및 전송' : '음성 녹음 시작'}
        title={isRecording ? '녹음 중지 및 전송' : '음성 녹음'}
        onClick={toggleRecording}
      >
        {isRecording ? <Square className="fill-current text-destructive" /> : <Mic />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        disabled={disabled || isRecording}
        aria-label="음성 파일 선택"
        title="음성 파일 선택"
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
