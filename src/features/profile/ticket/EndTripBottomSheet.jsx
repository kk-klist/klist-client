import { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Calendar } from '@/shared/components/ui/calendar';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { fetchPeriodCheck, useTicketsQuery, useCreateTicketMutation } from './ticketApi';

function toLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function EndTripBottomSheet({ open, onOpenChange }) {
  const [range, setRange] = useState(undefined);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tickets = [] } = useTicketsQuery();
  const { mutateAsync: createTicket } = useCreateTicketMutation();

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const disabled = useMemo(() => {
    const matchers = [{ after: today }];
    tickets.forEach((ticket) => {
      matchers.push({ from: toLocalDate(ticket.startDate), to: toLocalDate(ticket.endDate) });
    });
    if (range?.from && !range?.to) {
      const nearestStart = tickets
        .map((t) => toLocalDate(t.startDate))
        .filter((d) => d > range.from)
        .sort((a, b) => a.getTime() - b.getTime())[0];
      if (nearestStart) {
        const cap = new Date(nearestStart);
        cap.setDate(cap.getDate() - 1);
        matchers.push({ after: cap });
      }
    }
    return matchers;
  }, [today, tickets, range]);

  function handleClose() {
    setRange(undefined);
    setErrorMessage('');
    setShowEmptyAlert(false);
    onOpenChange(false);
  }

  async function submitCreate(startDate, endDate) {
    try {
      await createTicket({ startDate, endDate });
      handleClose();
    } catch (err) {
      if (err.code === 'TICKET_DATE_OVERLAP') {
        setRange(undefined);
      }
      setErrorMessage(err.message ?? '오류가 발생했습니다.');
    }
  }

  async function handleConfirm() {
    if (!range?.from || !range?.to) return;
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const startDate = formatDate(range.from);
      const endDate = formatDate(range.to);
      const result = await fetchPeriodCheck(startDate, endDate);
      if (result.completedCount === 0) {
        setShowEmptyAlert(true);
        return;
      }
      await submitCreate(startDate, endDate);
    } catch (err) {
      setErrorMessage(err.message ?? '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEmptyConfirm() {
    setShowEmptyAlert(false);
    if (!range?.from || !range?.to) return;
    setIsSubmitting(true);
    try {
      await submitCreate(formatDate(range.from), formatDate(range.to));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose();
        }}
      >
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="mx-auto max-w-[560px] rounded-t-2xl px-0 pb-8"
        >
          <SheetHeader className="px-5 pb-2">
            <SheetTitle>여행 기간 선택</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center gap-4 px-4">
            <Calendar mode="range" selected={range} onSelect={setRange} disabled={disabled} />
            {errorMessage && (
              <p className="w-full text-center text-sm text-destructive">{errorMessage}</p>
            )}
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                취소
              </Button>
              <Button
                className="flex-1"
                disabled={!range?.from || !range?.to || isSubmitting}
                onClick={handleConfirm}
              >
                확인
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showEmptyAlert} onOpenChange={setShowEmptyAlert}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>이 기간에 완료된 버킷리스트가 없어요</DialogTitle>
            <DialogDescription>버킷리스트 없이 티켓을 만들까요?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmptyAlert(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button onClick={handleEmptyConfirm} disabled={isSubmitting}>
              티켓 만들기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
