import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { PageHeader } from '@/shared/components/PageHeader';
import { ChatComposer } from './ChatComposer';
import { ChatMessageBubble } from './ChatMessageBubble';
import { useAssistChat } from './useAssistChat';

const SUGGESTIONS = ['K-pop spots near me', 'Where to eat tteokbokki?', 'Plan my day in Hongdae'];

export default function AssistPage() {
  const chat = useAssistChat();
  const [suggestion, setSuggestion] = useState('');
  const messagesEndRef = useRef(null);
  const clearSuggestion = useCallback(() => setSuggestion(''), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages, chat.isWaiting]);

  return (
    <div className="mx-auto flex h-full max-w-[520px] flex-col">
      {/* 헤더 (고정) */}
      <div className="shrink-0 border-b border-line px-5 pb-3 pt-[calc(14px+env(safe-area-inset-top))]">
        <PageHeader title="K-Buddy" subtitle="● Online · AI travel assistant" />
      </div>

      {!chat.sessionId ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-5 py-8 text-center">
          <span className="kb-logo h-16 w-16 text-2xl">🤖</span>
          <div>
            <h2 className="kb-section">K-Buddy와 대화해 보세요</h2>
            <p className="mt-2 text-[14px] text-muted-foreground">
              K-컬처 장소와 여행에 관해 무엇이든 물어보세요.
            </p>
          </div>
          {chat.createError && <ErrorMessage message={chat.createError.message} />}
          <Button size="lg" disabled={chat.isCreating} onClick={chat.startNewChat}>
            {chat.isCreating && <Loader2 className="animate-spin" />}새 대화 시작
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" role="log" aria-live="polite">
            <Bubble>Annyeong! 👋 K-pop, K-drama, K-food, K-beauty 여행지를 추천해 드릴게요.</Bubble>
            {chat.messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} onSuggestion={setSuggestion} />
            ))}
            {chat.isWaiting && (
              <Bubble>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />{' '}
                  {chat.isTranscribing ? '녹음을 글로 변환하고 있어요…' : '답변을 준비하고 있어요…'}
                </span>
              </Bubble>
            )}
            {chat.sessionExpired && (
              <div className="kb-card space-y-3 p-4 text-center">
                <p className="text-[14px] font-bold">대화 세션이 만료되었어요.</p>
                <Button size="sm" onClick={chat.startNewChat} disabled={chat.isCreating}>
                  새 대화 시작
                </Button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!chat.sessionExpired && (
            <>
              {chat.messages.length === 0 && (
                <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-5 pb-2">
                  {SUGGESTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="kb-chip"
                      onClick={() => setSuggestion(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
              <ChatComposer
                disabled={!chat.sessionId}
                isWaiting={chat.isWaiting}
                suggestion={suggestion}
                onSuggestionUsed={clearSuggestion}
                onSend={chat.sendMessage}
                onAudio={chat.sendAudio}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

// 봇 말풍선 (흰 카드, 왼쪽 꼬리)
function Bubble({ children }) {
  return (
    <div className="max-w-[85%] rounded-card rounded-tl-md border border-line bg-white px-4 py-3 text-[14px] leading-relaxed shadow-card">
      {children}
    </div>
  );
}
