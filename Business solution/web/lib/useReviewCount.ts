'use client';
import { useEffect, useState } from 'react';
import { api } from './api';
import { useStore } from './store';

export function useReviewCount() {
  const { activeBusiness } = useStore();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!activeBusiness) return;
    let cancelled = false;
    api.listReceipts(activeBusiness.id, 'needs_review').then((rows: any[]) => { if (!cancelled) setCount(rows.length); }).catch(() => {});
    return () => { cancelled = true; };
  }, [activeBusiness]);
  return count;
}
