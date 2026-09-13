import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { PageHeader } from '@/shared/components/PageHeader';
import { ChatComposer } from './ChatComposer';
import { ChatMessageBubble } from './ChatMessageBubble';
import { useAssistChat } from './useAssistChat';

import { ASSIST_LOCALE } from './assistLocale';

export default function AssistPage() {
  const chat = useAssistChat();
  const text = ASSIST_LOCALE[chat.language];
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
        <PageHeader title="K-Buddy" subtitle={text.subtitle} />
        <div className="mt-3 flex gap-2" role="group" aria-label={text.language}>
          {['ko', 'en'].map((language) => (
            <Button
              key={language}
              type="button"
              size="sm"
              variant={chat.language === language ? 'default' : 'outline'}
              aria-pressed={chat.language === language}
              onClick={() => chat.setLanguage(language)}
            >
              {language.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {!chat.sessionId ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-5 py-8 text-center">
          <span className="kb-logo h-16 w-16 text-2xl">🤖</span>
          <div>
            <h2 className="kb-section">{text.welcome}</h2>
            <p className="mt-2 text-[14px] text-muted-foreground">{text.description}</p>
          </div>
          {chat.createError && <ErrorMessage message={chat.createError.message} />}
          <Button size="lg" disabled={chat.isCreating} onClick={chat.startNewChat}>
            {chat.isCreating && <Loader2 className="animate-spin" />}
            {text.start}
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" role="log" aria-live="polite">
            <Bubble>{text.greeting}</Bubble>
            {chat.messages.map((message) => (
              <ChatMessageBubble
                key={message.id}
                message={message}
                language={chat.language}
                onSuggestion={setSuggestion}
              />
            ))}
            {chat.isWaiting && (
              <Bubble>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />{' '}
                  {chat.isTranscribing ? text.transcribing : text.waiting}
                </span>
              </Bubble>
            )}
            {chat.sessionExpired && (
              <div className="kb-card space-y-3 p-4 text-center">
                <p className="text-[14px] font-bold">{text.expired}</p>
                <Button size="sm" onClick={chat.startNewChat} disabled={chat.isCreating}>
                  {text.start}
                </Button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!chat.sessionExpired && (
            <>
              {chat.messages.length === 0 && (
                <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-5 pb-2">
                  {text.suggestions.map((item) => (
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
                language={chat.language}
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
