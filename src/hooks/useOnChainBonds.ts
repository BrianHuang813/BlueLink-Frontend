/**
 * Custom Hook for fetching user's bonds directly from chain
 * This is the primary source for user's own assets
 */

import { useState, useEffect, useCallback } from 'react';
import { getUserIssuedBonds, getUserBondTokens } from '../lib/sui';

interface UseOnChainBondsResult {
  issuedBonds: any[];
  bondTokens: any[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useOnChainBonds(
  userAddress: string | undefined,
  pollInterval = 15000
): UseOnChainBondsResult {
  const [issuedBonds, setIssuedBonds] = useState<any[]>([]);
  const [bondTokens, setBondTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userAddress) {
      setIssuedBonds([]);
      setBondTokens([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching on-chain data for:', userAddress);
      
      // Fetch both issued bonds and owned tokens in parallel
      const [issued, tokens] = await Promise.all([
        getUserIssuedBonds(userAddress),
        getUserBondTokens(userAddress),
      ]);

      console.log('Issued bonds:', issued);
      console.log('Bond tokens:', tokens);

      setIssuedBonds(issued);
      setBondTokens(tokens);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch on-chain bonds:', err);
      setError(err instanceof Error ? err.message : '無法載入鏈上數據');
      setIssuedBonds([]);
      setBondTokens([]);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling
  useEffect(() => {
    if (pollInterval <= 0 || !userAddress) return;

    const interval = setInterval(() => {
      fetchData();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, userAddress, fetchData]);

  return {
    issuedBonds,
    bondTokens,
    loading,
    error,
    refetch: fetchData,
  };
}
