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
    delete globalThis.MediaRecorder;
  });

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
