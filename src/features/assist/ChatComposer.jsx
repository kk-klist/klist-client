import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mic, Send } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { chatQuerySchema } from './assistSchemas';

export function ChatComposer({ disabled, isWaiting, suggestion, onSuggestionUsed, onSend }) {
  const form = useForm({
    resolver: zodResolver(chatQuerySchema),
    defaultValues: { query: '' },
  });
  const query = useWatch({ control: form.control, name: 'query' });

  useEffect(() => {
    if (!suggestion) return;
    form.setValue('query', suggestion, { shouldValidate: true });
    form.setFocus('query');
    onSuggestionUsed();
  }, [form, onSuggestionUsed, suggestion]);

  async function handleSubmit(values) {
    const sent = await onSend(values.query.trim());
    if (sent) form.reset();
  }

  const error = form.formState.errors.query?.message;

  return (
    <form
      className="shrink-0 border-t border-line bg-white px-5 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex items-end gap-1.5 rounded-card bg-primary-soft py-1.5 pl-4 pr-1.5">
        <textarea
          {...form.register('query')}
          rows={1}
          maxLength={4000}
          disabled={disabled || isWaiting}
          className="max-h-28 min-h-10 flex-1 resize-none bg-transparent py-2 text-[14px] outline-none placeholder:text-muted2"
          placeholder="Ask K-Buddy anything…"
          aria-label="질문 입력"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              form.handleSubmit(handleSubmit)();
            }
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          disabled
          aria-label="음성 입력 (준비 중)"
          title="음성 입력은 준비 중입니다."
        >
          <Mic />
        </Button>
        <Button
          type="submit"
          size="icon-lg"
          disabled={disabled || isWaiting}
          aria-label="질문 전송"
        >
          {isWaiting ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>
      <div className="mt-1 flex min-h-4 justify-between px-2 text-[11px]">
        <span className="text-destructive">{error}</span>
        <span className="text-muted2">{query.length}/4000</span>
      </div>
    </form>
  );
}
