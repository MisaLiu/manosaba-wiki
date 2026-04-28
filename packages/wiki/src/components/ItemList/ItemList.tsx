import { useItemStore } from '../../store/item';
import { ItemCard } from './ItemCard';
import './style.css';

export const ItemList = () => {
  const items = useItemStore(e => e.items);

  return (
    <div class="item-list">
      {items.map((item) => (
        <ItemCard item={item} key={item.id} />
      ))}
    </div>
  )
};
