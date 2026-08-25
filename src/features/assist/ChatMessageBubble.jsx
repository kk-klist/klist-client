import { cn } from '@/shared/utils/cn';

const STATUS_LABEL = {
  NO_RESULT: '검색 결과 없음',
  UNSUPPORTED: '지원하지 않는 질문',
  CLARIFICATION_REQUIRED: '추가 정보 필요',
};

export function ChatMessageBubble({ message, onSuggestion }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'max-w-[85%] break-words rounded-card px-4 py-3 text-[14px] leading-relaxed',
        isUser
          ? 'ml-auto rounded-br-md bg-primary font-semibold text-white'
          : 'rounded-tl-md border border-line bg-white shadow-card',
      )}
    >
      {!isUser && STATUS_LABEL[message.status] && (
        <p className="mb-1 text-[11px] font-bold text-muted-foreground">
          {STATUS_LABEL[message.status]}
        </p>
      )}
      <p className="whitespace-pre-wrap">{message.content}</p>
      {!isUser && message.suggestions?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {message.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="kb-chip px-3 py-1.5 text-left text-[12px]"
              onClick={() => onSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
