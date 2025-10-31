/**
 * Custom Hook for Bond Token Data Management
 * Handles fetching bond tokens owned by the user
 */

import { useState, useEffect, useCallback } from 'react';
import { BondToken } from '../types';
import { getBondTokensByOwner } from '../lib/api';

interface UseBondTokensResult {
  tokens: BondToken[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBondTokens(
  ownerAddress: string | undefined,
  pollInterval = 15000
): UseBondTokensResult {
  const [tokens, setTokens] = useState<BondToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    if (!ownerAddress) {
      setTokens([]);
      setLoading(false);
      return;
    }

    try {
      const data = await getBondTokensByOwner(ownerAddress);
      setTokens(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch bond tokens:', err);
      setError(err instanceof Error ? err.message : '無法載入債券代幣');
    } finally {
      setLoading(false);
    }
  }, [ownerAddress]);

  // Initial fetch
  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // Polling
  useEffect(() => {
    if (pollInterval <= 0 || !ownerAddress) return;

    const interval = setInterval(() => {
      fetchTokens();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, ownerAddress, fetchTokens]);

  return {
    tokens,
    loading,
    error,
    refetch: fetchTokens,
  };
}
