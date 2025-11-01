import { useState, useEffect } from 'react';
import { getBondTokensByOwner, getBondTokensByProject } from '../lib/api';
import { BondToken } from '../types';

/**
 * Hook to fetch bond tokens owned by a specific address
 */
export function useBondTokensByOwner(owner: string | undefined, limit: number = 10) {
  const [tokens, setTokens] = useState<BondToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner) {
      setTokens([]);
      setLoading(false);
      return;
    }

    const fetchTokens = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBondTokensByOwner(owner, limit);
        // Ensure data is an array
        setTokens(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch bond tokens:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bond tokens');
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [owner, limit]);

  return { tokens, loading, error, refetch: () => {} };
}

/**
 * Hook to fetch bond tokens for a specific project
 */
export function useBondTokensByProject(projectId: string | undefined, limit: number = 10) {
  const [tokens, setTokens] = useState<BondToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setTokens([]);
      setLoading(false);
      return;
    }

    const fetchTokens = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBondTokensByProject(projectId, limit);
        // Ensure data is an array
        setTokens(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch bond tokens:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bond tokens');
        setTokens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [projectId, limit]);

  return { tokens, loading, error, refetch: () => {} };
}
