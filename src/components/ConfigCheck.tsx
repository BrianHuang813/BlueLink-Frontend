/**
 * ConfigCheck Component
 * 開發環境下顯示當前配置狀態
 */

import { useEffect } from 'react';

export function ConfigCheck() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      const config = {
        mode: import.meta.env.MODE,
        apiUrl: import.meta.env.VITE_API_BASE_URL,
        suiNetwork: import.meta.env.VITE_SUI_NETWORK,
        suiRpc: import.meta.env.VITE_SUI_RPC_URL,
        packageId: import.meta.env.VITE_SUI_PACKAGE_ID,
        useMock: import.meta.env.VITE_USE_MOCK,
      };

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('BlueLink Configuration Status');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Environment:', config.mode);
      console.log('API URL:', config.apiUrl || 'Not set');
      console.log('Sui Network:', config.suiNetwork || 'Not set');
      console.log('Sui RPC:', config.suiRpc || 'Not set');
      console.log('Package ID:', config.packageId || 'Not set (required for transactions)');
      console.log('Use Mock Data:', config.useMock || 'false');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (!config.packageId) {
        console.warn('Warning: VITE_SUI_PACKAGE_ID is not set!');
        console.warn('Please add it to your .env.development file');
      }
    }
  }, []);

  // 只在開發環境顯示
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  const config = {
    apiUrl: import.meta.env.VITE_API_BASE_URL,
    suiNetwork: import.meta.env.VITE_SUI_NETWORK,
    packageId: import.meta.env.VITE_SUI_PACKAGE_ID,
  };

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg text-xs max-w-xs z-50 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">Dev Config</h3>
        <span className="text-green-400 text-xs">
          {import.meta.env.MODE}
        </span>
      </div>
      <div className="space-y-1 text-gray-300">
        <div className="flex items-start gap-2">
          <span className={config.apiUrl ? 'text-green-400' : 'text-red-400'}>
            {config.apiUrl ? '✓' : '✗'}
          </span>
          <div className="flex-1">
            <div className="text-gray-400 text-[10px]">API</div>
            <div className="truncate">{config.apiUrl || 'Not set'}</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className={config.suiNetwork ? 'text-green-400' : 'text-red-400'}>
            {config.suiNetwork ? '✓' : '✗'}
          </span>
          <div className="flex-1">
            <div className="text-gray-400 text-[10px]">Network</div>
            <div>{config.suiNetwork || 'Not set'}</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className={config.packageId ? 'text-green-400' : 'text-yellow-400'}>
            {config.packageId ? '✓' : '!'}
          </span>
          <div className="flex-1">
            <div className="text-gray-400 text-[10px]">Package</div>
            <div className="truncate">
              {config.packageId ? `${config.packageId.slice(0, 8)}...` : 'Not set'}
            </div>
          </div>
        </div>
      </div>
      {!config.packageId && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <p className="text-yellow-400 text-[10px]">
            Add VITE_SUI_PACKAGE_ID to .env
          </p>
        </div>
      )}
    </div>
  );
}
