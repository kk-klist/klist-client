import { Component } from 'react';

import { Button } from '@/shared/components/ui/button';

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">예상치 못한 오류가 발생했습니다.</p>
          <Button onClick={() => window.location.reload()}>새로고침</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
