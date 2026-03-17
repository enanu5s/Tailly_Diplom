//src/pages/services/ui/ServicesPage.tsx

import { SpecialistsSearchPageContent } from '@/features/specialists-search';

import styles from './ServicesPage.module.css';

export function ServicesPage() {
  return (
    <div className={styles.page}>
      <SpecialistsSearchPageContent />
    </div>
  );
}