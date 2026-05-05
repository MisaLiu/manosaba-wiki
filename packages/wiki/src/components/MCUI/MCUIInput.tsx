import type { ComponentChild } from 'preact';

type MCUIInputProps = {
  children: ComponentChild,
  large?: boolean
};

export const MCUIInput = ({
  children,
  large
}: MCUIInputProps) => {
  return (
    <span
      class={[
        'inline-block',
        (!large ? 'w-36px' : 'w-52px'),
        (!large ? 'h-36px' : 'h-52px'),
        (!large ? '' : 'p-8px'),
        'bg-[#383838]',
        'text-[16px]',
        'leading-[1]',
        'text-left',
        'border-2px',
        'border-t-[#161616]',
        'border-l-[#161616]',
        'border-r-[#606060]',
        'border-b-[#606060]',
        'align-bottom',
        'box-border'
      ].join(' ')}
    >
      {children}
    </span>
  );
};
