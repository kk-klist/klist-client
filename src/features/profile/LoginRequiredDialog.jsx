import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export function LoginRequiredDialog({ open, onOpenChange }) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>로그인이 필요한 기능이에요</DialogTitle>
          <DialogDescription>로그인하면 마이페이지를 이용할 수 있어요.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button onClick={() => navigate('/login')}>로그인하러 가기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
