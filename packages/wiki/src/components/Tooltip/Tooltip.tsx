import { useRef, useState } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import type { ComponentChild, TargetedPointerEvent } from 'preact';

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

  const handlePointerMove = (e: TargetedPointerEvent<HTMLSpanElement>) => {
    if (e.pointerType !== 'touch') return setPos({ x: e.clientX + 10, y: e.clientY + 10 });
    
    const tooltipDom = tooltipRef.current;
    setPos({ x: e.clientX, y: e.clientY - (tooltipDom?.clientHeight ?? 30) - 30 });
  };

  const handlePointerEnter = (e: TargetedPointerEvent<HTMLSpanElement>) => {
    setShow(true);
    handlePointerMove(e);
  };

  return (
    <>
      <span
        class="cursor-help"
        onPointerEnter={(e) => handlePointerEnter(e)}
        onPointerLeave={() => setShow(false)}
        onPointerMove={(e) => handlePointerMove(e)}
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
