import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useDragScroll } from './useDragScroll';

function ScrollRow({ onCardClick }) {
  const dragScrollRef = useDragScroll();
  return (
    <div ref={dragScrollRef} data-testid="row">
      <button type="button" onClick={onCardClick}>
        card
      </button>
    </div>
  );
}

function dragRow(row, { from, to }) {
  fireEvent.mouseDown(row, { button: 0, clientX: from });
  fireEvent.mouseMove(window, { clientX: to });
  fireEvent.mouseUp(window, { clientX: to });
}

describe('useDragScroll', () => {
  afterEach(() => {
    cleanup();
  });

  it('마우스로 왼쪽으로 끌면 그만큼 오른쪽으로 스크롤된다', () => {
    render(<ScrollRow onCardClick={vi.fn()} />);
    const row = screen.getByTestId('row');

    dragRow(row, { from: 200, to: 120 });

    expect(row.scrollLeft).toBe(80);
  });

  it('마우스를 뗀 뒤에는 움직여도 스크롤되지 않는다', () => {
    render(<ScrollRow onCardClick={vi.fn()} />);
    const row = screen.getByTestId('row');

    dragRow(row, { from: 200, to: 120 });
    fireEvent.mouseMove(window, { clientX: 0 });

    expect(row.scrollLeft).toBe(80);
  });

  it('드래그한 직후의 click은 카드 클릭으로 처리하지 않는다', () => {
    const onCardClick = vi.fn();
    render(<ScrollRow onCardClick={onCardClick} />);

    dragRow(screen.getByTestId('row'), { from: 200, to: 120 });
    fireEvent.click(screen.getByText('card'));

    expect(onCardClick).not.toHaveBeenCalled();
  });

  it('드래그 뒤 다음 클릭은 정상적으로 카드 클릭이 된다', () => {
    const onCardClick = vi.fn();
    render(<ScrollRow onCardClick={onCardClick} />);

    dragRow(screen.getByTestId('row'), { from: 200, to: 120 });
    fireEvent.click(screen.getByText('card'));
    fireEvent.click(screen.getByText('card'));

    expect(onCardClick).toHaveBeenCalledTimes(1);
  });

  it('거의 움직이지 않은 클릭은 드래그가 아니라 카드 클릭이다', () => {
    const onCardClick = vi.fn();
    render(<ScrollRow onCardClick={onCardClick} />);
    const row = screen.getByTestId('row');

    dragRow(row, { from: 200, to: 198 });
    fireEvent.click(screen.getByText('card'));

    expect(row.scrollLeft).toBe(0);
    expect(onCardClick).toHaveBeenCalledTimes(1);
  });
});
