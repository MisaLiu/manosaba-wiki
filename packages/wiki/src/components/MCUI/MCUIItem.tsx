import { Tooltip } from '../Tooltip/Tooltip';
import { getTexturePathFromKey, handleTextureFailed } from '../../utils';
import type { RichTextDocument } from '@manosaba/types';
import { MCRichText } from '../MCRichText/MCRichText';

type MCUIItemProps = {
  name: string,
  textureKey: string,
  descriptionRich?: RichTextDocument,
  onClick?: () => void,
};

export const MCUIItem = ({
  name,
  textureKey,
  descriptionRich,
}: MCUIItemProps) => {
  return (
    <Tooltip
      tooltip={
        <>
          <div>{name}</div>
          {descriptionRich && (
            <MCRichText document={descriptionRich} />
          )}
        </>
      }
    >
      <img
        src={getTexturePathFromKey(textureKey)}
        onError={handleTextureFailed}
        class={[
          'w-32px',
          'h-32px',
        ].join(' ')}
      />
    </Tooltip>
  );
}
