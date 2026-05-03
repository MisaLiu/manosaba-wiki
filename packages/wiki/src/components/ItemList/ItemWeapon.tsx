import { getLocationName } from '../../const';
import type { WeaponInfo, WeaponSpawnCount } from '@manosaba/types';

type ItemWeaponPropertyProps = {
  info: WeaponSpawnCount;
}

const ItemWeaponProperty = ({ info }: ItemWeaponPropertyProps) => {
  if (info.mode === 'all') return (
    <div class="text-gray-200">所有点位皆会刷新</div>
  );

  if (info.fixed !== (void 0)) return (
    <div>
      每局固定刷新&nbsp;
      <span class="text-gray-200">{info.fixed}</span>&nbsp;
      把
    </div>
  );

  const {
    below10,
    above10
  } = info;

  return (
    <div>
      每局随机刷新&nbsp;
      {below10 && (
        <>
          <span class="text-gray-200">{below10[0] === below10[1] ? below10[0] : `${below10[0]}~${below10[1]}`}</span>&nbsp;
          把
        </>
      )}
      {below10 && above10 && (<> / </>)}
      {above10 && (
        <>
          <span class="text-gray-200">{above10[0] === above10[1] ? above10[0] : `${above10[0]}~${above10[1]}`}</span>&nbsp;
          把
        </>
      )}
    </div>
  )
};

type ItemWeaponProps = {
  info: WeaponInfo,
};

export const ItemWeapon = ({
  info
}: ItemWeaponProps) => {
  return (
    <div class="pt-2 text-gray-400">
      <div>
        {
          info.cost === 2 ? (<span class="text-green-500">绿色</span>) :
          info.cost === 3 ? (<span class="text-blue-500">蓝色</span>) :
          info.cost === 4 ? (<span class="text-purple-400">紫色</span>) :
          info.cost === 5 ? (<span class="text-yellow-600">橙色</span>) :
          (<span class="text-gray-200">{info.cost}</span>)
        }&nbsp;
        等级武器
      </div>
      
      {(info.durability > 0 || info.damageType) && (
        <div>
          {info.durability > 0 && (
            <>可以使用 <span class="text-gray-200">{info.durability}</span> 次</>
          )}
          {(info.durability > 0 && info.damageType) && <>，</>}
          {info.damageType && (
            <>
              会造成&nbsp;
              <span class="text-gray-200">
                {info.damageType === 'sharp' ? '锐器' : '钝器'}
              </span>&nbsp;
              伤害
            </>
          )}
        </div>
      )}

      <ItemWeaponProperty info={info.spawnCount} />


      <div>
        <div>可刷新点位：</div>
        {Object.keys(info.rooms).map((roomId) => (
          <div class="ml-4">
            <span class="text-gray-200">{getLocationName(roomId)}</span>&nbsp;
            中有&nbsp;
            <span class="text-gray-200">{info.rooms[roomId]}</span> 个
          </div>
        ))}
      </div>
    </div>
  )
};
