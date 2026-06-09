// src/features/shop/ui/ProductDescription/ProductDescription.tsx

import styles from './ProductDescription.module.css';
import { buildProductDescriptionViewModel } from '../../service/productDescriptionViewModel';

import type { Product } from '../../model/types';

type Props = {
  product: Product;
};

export const ProductDescription = ({ product }: Props) => {
  const viewModel = buildProductDescriptionViewModel(product);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Описание</h2>

      <p className={styles.summary}>{viewModel.summary}</p>

      <div className={styles.sections}>
        {viewModel.sections.map((section) => (
          <section key={section.title} className={styles.block}>
            <h3 className={styles.subtitle}>{section.title}</h3>

            {section.items && section.items.length > 0 ? (
              <ul className={styles.list}>
                {section.items.map((item) => (
                  <li key={item} className={styles.listItem}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}

            {section.text ? <p className={styles.text}>{section.text}</p> : null}
          </section>
        ))}
      </div>
    </section>
  );
};
