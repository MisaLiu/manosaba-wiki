import type { ComponentChild } from 'preact';

type MCUIProps = {
  children: ComponentChild,
};

export const MCUI = ({
  children
}: MCUIProps) => {
  return (
    <div
      class={[
        'relative',
        'inline-block',
        'bg-[#4f4f4f]',
        'text-[#c8c8c8]',
        'p-6px',
        'border-2px',
        'border-top',
        'border-t-[#666666]',
        'border-l-[#666666]',
        'border-r-[#222222]',
        'border-b-[#222222]',
        'outline-1px',
        'outline-black',
        'rounded-2px'
      ].join(' ')}
    >
      {children}
    </div>
  )
};
