// src/features/shop/ui/ProductDescription/ProductDescription.tsx
import type { Product } from '../../model/types';

import styles from './ProductDescription.module.css';

type Props = {
    product: Product;
};

export const ProductDescription = ({ product }: Props) => {
    return (
        <section className={styles.section}>
            <h2 className={styles.title}>Описание</h2>
            <p className={styles.text}>{product.description}</p>
        </section>
    );
};