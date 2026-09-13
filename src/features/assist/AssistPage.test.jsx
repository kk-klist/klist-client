import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { client } from '@/shared/api/client';
import AssistPage from './AssistPage';

vi.mock('@/shared/api/client', () => ({ client: { post: vi.fn() } }));
vi.mock('@/shared/utils/toast', () => ({ toast: { error: vi.fn() } }));

describe('AssistPage language', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Element.prototype.scrollIntoView = vi.fn();
    client.post.mockImplementation(async (url) => {
      if (url.endsWith('/sessions')) return { sessionId: 'session-1' };
      return {
        answer: 'Visit Gyeongbokgung.\nEnjoy Seoul!',
        suggestions: ['Tell me more'],
        status: 'COMPLETED',
      };
    });
  });
  afterEach(cleanup);

  function renderChat() {
    return render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
      >
        <AssistPage />
      </QueryClientProvider>,
    );
  }

  it('기본 ko 요청 후 en 전환 시 세션과 메시지를 유지하고 답변 및 suggestions를 그대로 표시한다', async () => {
    const user = userEvent.setup();
    renderChat();
    expect(screen.getByRole('button', { name: 'KO' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: '새 대화 시작' }));
    await user.type(await screen.findByRole('textbox'), '서울 추천');
    await user.click(screen.getByRole('button', { name: '질문 전송' }));
    await waitFor(() =>
      expect(client.post).toHaveBeenCalledWith('/api/v1/chat/query', {
        sessionId: 'session-1',
        message: '서울 추천',
        language: 'ko',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Ask K-Buddy anything…');
    expect(screen.getByText('서울 추천')).toBeInTheDocument();
    expect(screen.getByText('Visit Gyeongbokgung. Enjoy Seoul!')).toHaveTextContent(
      'Visit Gyeongbokgung. Enjoy Seoul!',
    );
    await user.click(screen.getByRole('button', { name: 'Tell me more' }));
    expect(screen.getByRole('textbox')).toHaveValue('Tell me more');
    await user.click(screen.getByRole('button', { name: 'Send question' }));
    await waitFor(() =>
      expect(client.post).toHaveBeenCalledWith('/api/v1/chat/query', {
        sessionId: 'session-1',
        message: 'Tell me more',
        language: 'en',
      }),
    );
    expect(client.post.mock.calls.filter(([url]) => url.endsWith('/sessions'))).toHaveLength(1);
  });

  it('영어 안내, 검증 오류와 음성 요청에 선택한 언어를 적용한다', async () => {
    const user = userEvent.setup();
    const { container } = renderChat();
    await user.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByText('Chat with K-Buddy')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start a new chat' }));
    await user.click(await screen.findByRole('button', { name: 'Send question' }));
    expect(await screen.findByText('Please enter a question.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'KO' }));
    expect(await screen.findByText('질문을 입력해주세요.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'EN' }));
    const audio = new File(['voice'], 'voice.webm', { type: 'audio/webm' });
    fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [audio] } });
    await waitFor(() => {
      const call = client.post.mock.calls.find(([url]) => url.endsWith('/audio'));
      expect(call[1].get('language')).toBe('en');
      expect(call[1].get('sessionId')).toBe('session-1');
    });
  });
});
