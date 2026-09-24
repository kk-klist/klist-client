import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from '@/shared/utils/toast';
import { AudioInput } from './AudioInput';

vi.mock('@/shared/utils/toast', () => ({ toast: { error: vi.fn() } }));

describe('AudioInput', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    delete globalThis.MediaRecorder;
  });

  it.each([
    ['audio/mp4', 'audio/mp4', 'recording.mp4'],
    ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4;codecs=mp4a.40.2', 'recording.mp4'],
    ['video/mp4', 'video/mp4', 'recording.mp4'],
    ['audio/webm;codecs=opus', 'audio/webm;codecs=opus', 'recording.webm'],
    ['', 'audio/mp4', 'recording.mp4'],
    ['audio/mp4', '', 'recording.mp4'],
    ['audio/webm', 'audio/mp4', 'recording.mp4'],
    ['', '', null],
    ['audio/ogg', 'audio/ogg', null],
  ])(
    '녹음 MIME %s와 청크 MIME %s를 파일 형식에 반영한다',
    async (recorderType, chunkType, filename) => {
      const stopTrack = vi.fn();
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] }),
        },
      });
      vi.stubGlobal(
        'MediaRecorder',
        class {
          state = 'inactive';
          mimeType = recorderType;
          start() {
            this.state = 'recording';
          }
          stop() {
            this.state = 'inactive';
            this.ondataavailable({ data: new Blob(['voice'], { type: chunkType }) });
            this.onstop?.();
          }
        },
      );
      const user = userEvent.setup();
      const onAudio = vi.fn();
      render(<AudioInput onAudio={onAudio} />);
      await user.click(screen.getByRole('button', { name: '음성 녹음 시작' }));
      await user.click(await screen.findByRole('button', { name: '녹음 중지 및 전송' }));
      expect(stopTrack).toHaveBeenCalledTimes(1);
      if (filename) {
        expect(onAudio).toHaveBeenCalledTimes(1);
        expect(onAudio.mock.calls[0][0]).toMatchObject({
          name: filename,
          type: chunkType || recorderType,
          size: 5,
        });
      } else {
        expect(onAudio).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalled();
      }
    },
  );

  it('녹음 미지원 환경을 안내한다', async () => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
    render(<AudioInput disabled={false} onAudio={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: '음성 녹음 시작' }));

    expect(toast.error).toHaveBeenCalledWith(
      '이 브라우저에서는 음성 녹음을 지원하지 않아요. 텍스트로 질문해 주세요.',
    );
  });

  it('마이크 권한 거부를 안내한다', async () => {
    globalThis.MediaRecorder = vi.fn();
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue({ name: 'NotAllowedError' }) },
    });
    render(<AudioInput disabled={false} onAudio={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: '음성 녹음 시작' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        '마이크 권한이 거부되었어요. 브라우저 설정에서 권한을 허용해 주세요.',
      ),
    );
  });
});
