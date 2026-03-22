//src/features/orders/ui/RepeatProductOrderButton.tsx

import { observer } from 'mobx-react-lite';
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { canRepeatProductOrder } from '../model/productOrderRepeat';
import { productOrdersRepeatStore } from '../model/productOrdersRepeatStore';

import styles from './RepeatProductOrderButton.module.css';

import type { RepeatableProductOrder } from '../model/productOrderRepeat';

type Props = {
  order: RepeatableProductOrder;
  className?: string;
};

export const RepeatProductOrderButton = observer(
  ({ order, className }: Props) => {
    const navigate = useAppNavigate();


    const isRepeating = productOrdersRepeatStore.isRepeating(order.id);
    const error = productOrdersRepeatStore.getError(order.id);
    const canRepeat = canRepeatProductOrder(order);

    const handleClick = async (): Promise<void> => {
      if (!canRepeat || isRepeating) {
        return;
      }

      await productOrdersRepeatStore.repeatOrder(order, navigate);
    };

    return (
      <div>
        <button
          type="button"
          className={className ?? styles.button}
          onClick={handleClick}
          disabled={!canRepeat || isRepeating}
        >
          {isRepeating ? 'Повторяем...' : 'Повторить заказ'}
        </button>

        {error ? <div className={styles.error}>{error}</div> : null}
      </div>
    );
  },
);