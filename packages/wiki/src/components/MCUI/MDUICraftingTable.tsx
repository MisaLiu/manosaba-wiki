import { Tooltip } from '../Tooltip/Tooltip';
import { MCUI } from './MCUI';
import { MCUIInput } from './MCUIInput';
import type { ComponentChild } from 'preact';

type MCUICraftingTableProps = {
  inputs: (ComponentChild | null | undefined)[],
  output: ComponentChild,
  shapeless?: boolean
};

const SHAPELESS_ORDER = [4, 3, 5, 1, 7, 0, 2, 6, 8];

const getShapelessSlot = (filledCount: number, index: number): number | null => {
  if (index >= filledCount) return null
  return SHAPELESS_ORDER[index]
};

export const MCUICraftingTable = ({
  inputs,
  output,
  shapeless
}: MCUICraftingTableProps) => {
  const slots = Array(9).fill(null);
  const usedInputs = inputs.filter(Boolean);
  const filledCount = Math.min(usedInputs.length, 9);

  if (shapeless) {
    for (let i = 0; i < filledCount; i++) {
      const slot = getShapelessSlot(filledCount, i);
      if (slot !== null) slots[slot] = usedInputs[i];
    }
  } else {
    for (let i = 0; i < usedInputs.length; i++) {
      slots[i] = usedInputs[i];
    }
  }

  return (
    <MCUI>
      <div
        class="flex flex-nowrap items-center-safe gap-2"
      >
        <div
          class="grid grid-rows-3 grid-cols-3"
        >
          {slots.map((input) => (
            <MCUIInput>{input}</MCUIInput>
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
