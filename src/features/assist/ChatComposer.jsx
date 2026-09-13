import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { ASSIST_LOCALE } from './assistLocale';
import { AudioInput } from './AudioInput';
import { createChatQuerySchema } from './assistSchemas';

export function ChatComposer({
  language = 'ko',
  disabled,
  isWaiting,
  suggestion,
  onSuggestionUsed,
  onSend,
  onAudio,
}) {
  const text = ASSIST_LOCALE[language];
  const form = useForm({
    resolver: zodResolver(createChatQuerySchema(language)),
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

  useEffect(() => {
    if (form.formState.errors.query) void form.trigger('query');
  }, [language, form]);

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
          placeholder={text.placeholder}
          aria-label={text.input}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              form.handleSubmit(handleSubmit)();
            }
          }}
        />
        <AudioInput language={language} disabled={disabled || isWaiting} onAudio={onAudio} />
        <Button
          type="submit"
          size="icon-lg"
          disabled={disabled || isWaiting}
          aria-label={text.send}
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
