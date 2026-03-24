// src/features/specialists-search/ui/SpecialistsSearchPageContent.tsx

import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";


import { SERVICES } from "@/shared/config/services";
import type { ServiceId } from "@/shared/config/services";
import { useAppNavigate } from '@/shared/lib/navigation/useAppNavigate';

import { SpecialistsSearchStore } from "../model/specialistsSearchStore";
import { FiltersPanel } from "./FiltersPanel/FiltersPanel";
import { MapView } from "./MapView/MapView";
import { SortBar } from "./SortBar/SortBar";
import { SpecialistsList } from "./SpecialistsList/SpecialistsList";
import styles from "./SpecialistsSearchPageContent.module.css";

function isServiceId(v: string | null): v is ServiceId {
  if (!v) return false;
  return SERVICES.some((s) => s.id === v);
}

export const SpecialistsSearchPageContent = observer(() => {
  const [params] = useSearchParams();
  const navigate = useAppNavigate();

  const store = useMemo(() => new SpecialistsSearchStore(), []);

  // 1) грузим специалистов один раз
  useEffect(() => {
    store.load();
  }, [store]);

  // 2) реагируем на смену ?service=... (в т.ч. из header)
  useEffect(() => {
    const raw = params.get("service");
    store.updateFilters({ serviceId: isServiceId(raw) ? raw : "any" });
  }, [params, store]);

  const onOpenSpecialist = (id: string) => {
    store.persist(window.scrollY);
    navigate(`/specialists/${id}`, { state: { from: "/services" } });
  };

  return (
    <div className={styles.layout}>
      <div className={styles.left}>
        <FiltersPanel store={store} />

        <div className={styles.foundLine}>
          Найдено <span className={styles.foundCount}>{store.foundCount}</span>{" "}
          специалистов
        </div>

        <SortBar store={store} />

        {store.viewMode === "list" ? (
          <SpecialistsList store={store} onOpenSpecialist={onOpenSpecialist} />
        ) : (
          <MapView store={store} onOpenSpecialist={onOpenSpecialist} />
        )}
      </div>
    </div>
  );
});
