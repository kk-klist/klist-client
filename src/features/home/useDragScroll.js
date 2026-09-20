import { useCallback } from 'react';

const DRAG_THRESHOLD_PX = 5;

/**
 * 가로 스크롤 영역을 마우스 드래그로도 넘길 수 있게 해주는 ref 콜백.
 * 터치는 브라우저 기본 스크롤이 처리하므로 마우스 이벤트만 다룬다.
 * 드래그로 판정된 뒤 이어지는 click은 막아서, 카드를 넘기다 상세가 열리지 않게 한다.
 * 스크롤 영역이 조건부로 렌더되어도 붙도록 useEffect 대신 ref 콜백(cleanup 반환)을 쓴다.
 */
export function useDragScroll() {
  return useCallback((el) => {
    if (!el) return undefined;

    let startX = 0;
    let startScrollLeft = 0;
    let dragged = false;

    const onMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      if (!dragged && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return;
      dragged = true;
      el.scrollLeft = startScrollLeft - deltaX;
    };

    const stopDragging = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stopDragging);
    };

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      dragged = false;
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', stopDragging);
    };

    const onClickCapture = (e) => {
      if (!dragged) return;
      dragged = false;
      e.stopPropagation();
      e.preventDefault();
    };

    // 이미지/링크의 브라우저 기본 드래그(고스트 이미지)가 스크롤 드래그를 가로채지 않게 한다.
    const onDragStart = (e) => e.preventDefault();

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('click', onClickCapture, true);
    el.addEventListener('dragstart', onDragStart);

    return () => {
      stopDragging();
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('click', onClickCapture, true);
      el.removeEventListener('dragstart', onDragStart);
    };
  }, []);
}
