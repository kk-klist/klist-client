import { beforeEach, describe, expect, it, vi } from 'vitest';
import { client } from '@/shared/api/client';
import { sendChatAudioQuery, sendChatQuery } from './assistApi';

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
    expect(body.get('language')).toBe('ko');
    expect(body.get('audio')).toMatchObject({ name: 'voice.webm', type: 'audio/webm' });
  });

  it('영어 음성 요청에 language를 포함한다', async () => {
    client.post.mockResolvedValue({ answer: 'Hello' });
    await sendChatAudioQuery({
      sessionId: 'session-1',
      audio: new File(['voice'], 'voice.webm'),
      language: 'en',
    });
    expect(client.post.mock.calls[0][1].get('language')).toBe('en');
  });

  it.each(['ko', 'en'])('텍스트 요청에 %s 언어를 포함한다', async (language) => {
    client.post.mockResolvedValue({ answer: 'Hello' });
    await sendChatQuery({ sessionId: 'session-1', message: 'Seoul', language });
    expect(client.post).toHaveBeenCalledWith('/api/v1/chat/query', {
      sessionId: 'session-1',
      message: 'Seoul',
      language,
    });
  });

  it('언어를 생략한 텍스트 요청은 ko를 사용한다', async () => {
    client.post.mockResolvedValue({});
    await sendChatQuery({ sessionId: 'session-1', message: 'Seoul' });
    expect(client.post.mock.calls[0][1].language).toBe('ko');
  });
});
