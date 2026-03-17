// src/features/shop/ui/ProductDescription/ProductDescription.tsx
import styles from './ProductDescription.module.css';

import type { Product } from '../../model/types';


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