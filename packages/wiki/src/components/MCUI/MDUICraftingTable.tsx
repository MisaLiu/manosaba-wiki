import { Tooltip } from '../Tooltip/Tooltip';
import { MCUI } from './MCUI';
import { MCUIInput } from './MCUIInput';
import type { ComponentChild } from 'preact';

type MCUICraftingTableProps = {
  inputs: (ComponentChild | null | undefined)[],
  output: ComponentChild,
  shapeless?: boolean
};

export const MCUICraftingTable = ({
  inputs,
  output,
  shapeless
}: MCUICraftingTableProps) => {
  const inputSlots = Array(9).fill(null).map((_, i) => i);

  return (
    <MCUI>
      <div
        class="flex flex-nowrap items-center-safe gap-2"
      >
        <div
          class="grid grid-rows-3 grid-cols-3"
        >
          {inputSlots.map((i) => (
            <MCUIInput>{inputs[i]}</MCUIInput>
          ))}
        </div>
        <div>
          <img
            src="gui/arrow_small.png"
            style={{
              imageRendering: 'pixelated'
            }}
          />
        </div>
        <div>
          <MCUIInput large>{output}</MCUIInput>
        </div>
      </div>

      {shapeless && (
        <Tooltip
          tooltip={
            <>无序配方</>
          }
        >
          <img
            src="gui/layout_shapeless.png"
            class={[
              'absolute',
              'top-0',
              'right-0',
              'm-5px'
            ].join(' ')}
            style={{
              imageRendering: 'pixelated'
            }}
          />
        </Tooltip>
      )}
    </MCUI>
  );
};
