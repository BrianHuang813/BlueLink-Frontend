/* 集中管理與驗證環境變數，完全對齊現有 .env.development 的鍵值 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const SUI_NETWORK = (import.meta.env.VITE_SUI_NETWORK as string | undefined) ?? 'devnet';
export const SUI_RPC_URL = import.meta.env.VITE_SUI_RPC_URL as string | undefined;
export const SUI_PACKAGE_ID = import.meta.env.VITE_SUI_PACKAGE_ID as string | undefined;
export const SUI_CLOCK_OBJECT_ID = import.meta.env.VITE_SUI_CLOCK_OBJECT_ID as string | undefined;
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK as string | undefined) === 'true';

function assertDefined(val: string | undefined, key: string) {
  if (!val || val.trim().length === 0) {
    if (import.meta.env.DEV) {
      console.error(`[config] ${key} 未設定，請確認 .env 檔案`);
    }
  }
}

assertDefined(API_BASE_URL, 'VITE_API_BASE_URL');
assertDefined(SUI_RPC_URL, 'VITE_SUI_RPC_URL');
assertDefined(SUI_PACKAGE_ID, 'VITE_SUI_PACKAGE_ID');
assertDefined(SUI_CLOCK_OBJECT_ID, 'VITE_SUI_CLOCK_OBJECT_ID');

export const Config = {
  API_BASE_URL,
  SUI_NETWORK,
  SUI_RPC_URL,
  SUI_PACKAGE_ID,
  SUI_CLOCK_OBJECT_ID,
  USE_MOCK,
} as const;
