/**
 * Custom Hook for Bond Data Management
 * Handles fetching bonds with polling and state management
 */

import { useState, useEffect, useCallback } from 'react';
import { Bond } from '../types';
import { getAllBonds } from '../lib/api';

interface UseBondsResult {
  bonds: Bond[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBonds(pollInterval = 10000): UseBondsResult {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBonds = useCallback(async () => {
    try {
      const data = await getAllBonds();
      setBonds(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch bonds:', err);
      setError(err instanceof Error ? err.message : '無法載入債券列表');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBonds();
  }, [fetchBonds]);

  // Polling
  useEffect(() => {
    if (pollInterval <= 0) return;

    const interval = setInterval(() => {
      fetchBonds();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, fetchBonds]);

  return {
    bonds,
    loading,
    error,
    refetch: fetchBonds,
  };
}
