import { useState } from 'react';

import styles from './OrdersServicesSection.module.css';

type Props = {
  orderId: string;
  loading: boolean;
  onSubmit: (payload: {
    rating: number;
    comment: string;
    photos: string[];
  }) => void;
};

export const ReviewForm = ({ loading, onSubmit }: Props) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const next: string[] = [];

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      next.push(url);
    });

    setPhotos((prev) => [...prev, ...next]);
  };

  return (
    <div className={styles.reviewBox}>
      <div className={styles.reviewTitle}>Оставить отзыв</div>

      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className={styles.select}
      >
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <textarea
        className={styles.textarea}
        placeholder="Комментарий"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} />

      <div className={styles.preview}>
        {photos.map((p, i) => (
          <img key={i} src={p} className={styles.previewImg} />
        ))}
      </div>

      <button
        className={styles.primaryButton}
        disabled={loading || !comment.trim()}
        onClick={() =>
          onSubmit({
            rating,
            comment,
            photos,
          })
        }
      >
        Отправить отзыв
      </button>
    </div>
  );
};