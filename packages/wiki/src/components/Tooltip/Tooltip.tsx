import { useRef, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import type { ComponentChild, TargetedMouseEvent } from 'preact';

type CursorPosition = {
  x: number,
  y: number,
}

type TooltipProps = {
  children: ComponentChild,
  tooltip: ComponentChild,
}

export const Tooltip = ({
  children,
  tooltip,
}: TooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [ show, setShow ] = useState<boolean>(false);
  const [ pos, setPos ] = useState<CursorPosition>({ x: 0, y: 0 });

  const handlePointerMove = (e: TargetedMouseEvent<HTMLSpanElement>) => {
    const tooltipDom = tooltipRef.current;

    let resultX = e.clientX + 5;
    let resultY = e.clientY - 5;

    if (tooltipDom) {
      resultY -= tooltipDom.clientHeight;

      if ((resultX + tooltipDom.clientWidth) >= document.documentElement.clientWidth) {
        resultX = document.documentElement.clientWidth - tooltipDom.clientWidth;
      }

      if ((resultY + tooltipDom.clientHeight) >= document.documentElement.clientHeight) {
        resultY = document.documentElement.clientHeight - tooltipDom.clientHeight;
      }
    }

    if (resultX <= 0) resultX = 0;
    if (resultY <= 0) resultY = 0;

    setPos({ x: resultX, y: resultY});
  };

  const handlePointerEnter = (e: TargetedMouseEvent<HTMLSpanElement>) => {
    setShow(true);
    handlePointerMove(e);
  };

  return (
    <>
      <span
        class="cursor-help"
        onMouseEnter={(e) => handlePointerEnter(e)}
        onMouseLeave={() => setShow(false)}
        onMouseMove={(e) => handlePointerMove(e)}
      >
        {children}
      </span>
      {show && createPortal(
        <div
          class={[
            'tooltip',
            'fixed',
            'bg-gray-900',
            'border',
            'border-gray-600',
            'rounded-2',
            'shadow-md',
            'shadow-gray-900',
            'text-nowrap',
            'px-2',
            'py-1',
            'z-100',
            'pointer-events-none'
          ].join(' ')}
          style={{
            top: pos.y,
            left: pos.x,
          }}
          ref={tooltipRef}
        >
          {tooltip}
        </div>,
        document.body
      )}
    </>
  )
};
