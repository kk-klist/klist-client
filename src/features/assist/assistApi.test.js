import { beforeEach, describe, expect, it, vi } from 'vitest';
import { client } from '@/shared/api/client';
import { sendChatAudioQuery } from './assistApi';

vi.mock('@/shared/api/client', () => ({
  client: { post: vi.fn() },
}));

describe('sendChatAudioQuery', () => {
  beforeEach(() => vi.clearAllMocks());

  it('음성 파일과 세션 ID를 multipart 폼으로 전송한다', async () => {
    const audio = new File(['voice'], 'voice.webm', { type: 'audio/webm' });
    const response = { transcription: '홍대 맛집 알려줘', answer: '좋아요.' };
    client.post.mockResolvedValue(response);

    await expect(sendChatAudioQuery({ sessionId: 'session-1', audio })).resolves.toEqual(response);

    const [url, body] = client.post.mock.calls[0];
    expect(url).toBe('/api/v1/chat/query/audio');
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('sessionId')).toBe('session-1');
    expect(body.get('audio')).toMatchObject({ name: 'voice.webm', type: 'audio/webm' });
  });
});
