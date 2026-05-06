import { Tooltip } from '../Tooltip/Tooltip';
import { MCUI } from './MCUI';
import { MCUIInput } from './MCUIInput';
import type { ComponentChild } from 'preact';

type MCUICampfireProps = {
  input: ComponentChild,
  output: ComponentChild,
  timeCost?: number,
};

export const MCUICampfire = ({
  input,
  output,
  timeCost
}: MCUICampfireProps) => {
  return (
    <MCUI>
      <div
        class="flex flex-nowrap items-center-safe gap-4"
      >
        <div>
          <MCUIInput>{input}</MCUIInput>
        </div>
        <div
          class="flex flex-nowrap flex-col items-center-safe gap-2"
        >
          <div>
            <Tooltip
              tooltip={
                <>用营火加热</>
              }
            >
              <img
                src="https://assets.mcasset.cloud/1.21.10/assets/minecraft/textures/item/campfire.png"
                class={[
                  'w-32px',
                  'h-32px'
                ].join(' ')}
              />
            </Tooltip>
          </div>
          <img
            src="gui/arrow_large_full.png"
          />
          {timeCost && (
            <div
              class={[
                'h-32px',
                'text-sm'
              ].join(' ')}
            >
              {timeCost} 秒
            </div>
          )}
        </div>
        <div>
          <MCUIInput large>{output}</MCUIInput>
        </div>
      </div>
    </MCUI>
  );
};
