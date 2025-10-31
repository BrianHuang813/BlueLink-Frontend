/**
 * Sui Blockchain Interaction Layer
 * Handles all on-chain operations for BlueLink bond contracts
 */

import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { BondProjectInfo } from '../types';

// 從環境變量讀取 Sui 配置
export const SUI_CONFIG = {
  network: import.meta.env.VITE_SUI_NETWORK || 'testnet',
  rpcUrl: import.meta.env.VITE_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
  packageId: import.meta.env.VITE_SUI_PACKAGE_ID || '',
  clockObjectId: import.meta.env.VITE_SUI_CLOCK_OBJECT_ID || '0x6',
};

// 開發環境顯示配置
if (import.meta.env.DEV) {
  console.log('Sui Configuration:', {
    network: SUI_CONFIG.network,
    rpcUrl: SUI_CONFIG.rpcUrl,
    packageId: SUI_CONFIG.packageId || 'Not set - please add VITE_SUI_PACKAGE_ID',
  });
}

// 驗證必要配置
if (!SUI_CONFIG.packageId) {
  console.warn('VITE_SUI_PACKAGE_ID is not set in .env file');
}

// 創建 Sui Client
export const suiClient = new SuiClient({ 
  url: SUI_CONFIG.rpcUrl 
});

// Contract configuration for Sui
export const CONTRACT_INFO = {
  packageId: SUI_CONFIG.packageId,
  module: 'blue_link',
  currency: '0x2::sui::SUI',
  clockObjectId: SUI_CONFIG.clockObjectId,
};

/**
 * Create a new bond project on-chain
 */
export function createBondProjectTx(params: {
  issuerName: string;
  bondName: string;
  bondImageUrl: string;
  tokenImageUrl: string;
  totalAmount: number; // in MIST
  annualInterestRate: number; // in basis points
  maturityDate: number; // timestamp in ms
  metadataUrl: string;
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::create_bond_project`,
    arguments: [
      tx.pure.string(params.issuerName),
      tx.pure.string(params.bondName),
      tx.pure.string(params.bondImageUrl),
      tx.pure.string(params.tokenImageUrl),
      tx.pure.u64(params.totalAmount),
      tx.pure.u64(params.annualInterestRate),
      tx.pure.u64(params.maturityDate),
      tx.pure.string(params.metadataUrl),
      tx.object(CONTRACT_INFO.clockObjectId),
    ],
  });

  return tx;
}

/**
 * Buy bond RWA tokens
 */
export function buyBondTokenTx(params: {
  bondProjectId: string;
  payment: any; // SUI coin object
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::buy_bond_rwa_tokens`,
    arguments: [
      tx.object(params.bondProjectId),
      params.payment,
      tx.object(CONTRACT_INFO.clockObjectId),
    ],
  });

  return tx;
}

/**
 * Deposit redemption funds (issuer only)
 */
export function depositRedemptionFundsTx(params: {
  bondProjectId: string;
  payment: any; // SUI coin object
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::deposit_redemption_funds`,
    arguments: [
      tx.object(params.bondProjectId),
      params.payment,
      tx.object(CONTRACT_INFO.clockObjectId),
    ],
  });

  return tx;
}

/**
 * Redeem bond token (investor only)
 */
export function redeemBondTokenTx(params: {
  bondProjectId: string;
  bondToken: string;
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::redeem_bond_token`,
    arguments: [
      tx.object(params.bondProjectId),
      tx.object(params.bondToken),
      tx.object(CONTRACT_INFO.clockObjectId),
    ],
  });

  return tx;
}

/**
 * Withdraw raised funds (issuer only)
 */
export function withdrawRaisedFundsTx(params: {
  bondProjectId: string;
  amount: number; // in MIST
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::withdraw_raised_funds`,
    arguments: [
      tx.object(params.bondProjectId),
      tx.pure.u64(params.amount),
    ],
  });

  return tx;
}

/**
 * Pause bond sale (issuer only)
 */
export function pauseSaleTx(params: {
  bondProjectId: string;
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::pause_sale`,
    arguments: [tx.object(params.bondProjectId)],
  });

  return tx;
}

/**
 * Resume bond sale (issuer only)
 */
export function resumeSaleTx(params: {
  bondProjectId: string;
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::resume_sale`,
    arguments: [tx.object(params.bondProjectId)],
  });

  return tx;
}

// ==================== Read Functions (devInspectTransactionBlock) ====================

/**
 * Get bond project info from chain
 */
export async function getBondProjectInfo(
  client: SuiClient,
  bondProjectId: string
): Promise<BondProjectInfo | null> {
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::get_bond_project_info`,
      arguments: [tx.object(bondProjectId)],
    });

    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });

    // Parse result (implementation depends on your contract's return structure)
    // This is a placeholder - adjust based on actual contract response
    if (result.results && result.results[0]) {
      // Parse the returned data
      return parseBondProjectInfo(result.results[0]);
    }

    return null;
  } catch (error) {
    console.error('Error fetching bond project info:', error);
    return null;
  }
}

/**
 * Check if bond is redeemable
 */
export async function isBondRedeemable(
  client: SuiClient,
  bondProjectId: string,
  bondTokenId: string
): Promise<boolean> {
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::is_bond_redeemable`,
      arguments: [
        tx.object(bondProjectId),
        tx.object(bondTokenId),
        tx.object(CONTRACT_INFO.clockObjectId),
      ],
    });

    const result = await client.devInspectTransactionBlock({
      transactionBlock: tx,
      sender: '0x0000000000000000000000000000000000000000000000000000000000000000',
    });

    // Parse boolean result
    return parseRedeemableResult(result);
  } catch (error) {
    console.error('Error checking if bond is redeemable:', error);
    return false;
  }
}

// ==================== Helper Functions ====================

/**
 * Parse bond project info from contract response
 * Adjust based on actual contract structure
 */
function parseBondProjectInfo(result: any): BondProjectInfo {
  // This is a placeholder implementation
  // Adjust based on your actual contract's return structure
  return {
    bondName: result.bondName || '',
    issuer: result.issuer || '',
    totalAmount: result.totalAmount || '0',
    amountRaised: result.amountRaised || '0',
    annualInterestRate: result.annualInterestRate || 0,
    maturityDate: result.maturityDate || 0,
    active: result.active || false,
  };
}

/**
 * Parse redeemable check result
 */
function parseRedeemableResult(result: any): boolean {
  // Placeholder - adjust based on actual response structure
  return result?.results?.[0]?.returnValues?.[0]?.[0] === 1;
}

/**
 * Handle transaction errors and extract error codes
 */
export function parseTransactionError(error: any): {
  code: number | null;
  message: string;
} {
  const match = error?.message?.match(/code (\d+)/);
  const code = match ? parseInt(match[1]) : null;

  const errorMessages: Record<number, string> = {
    400: '債券尚未到期',
    401: '您不是代幣擁有者',
    402: '贖回資金不足',
    403: '債券已被贖回',
    404: '債券項目不存在',
    405: '銷售已暫停',
    406: '銷售額度已滿',
  };

  return {
    code,
    message: code ? errorMessages[code] || '交易失敗' : '交易失敗',
  };
}
