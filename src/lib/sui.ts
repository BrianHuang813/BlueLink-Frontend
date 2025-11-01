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
  bondName: string;
  totalAmount: number; // in MIST
  annualInterestRate: number; // in basis points
  maturityDate: number; // timestamp in ms
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::create_bond_project`,
    arguments: [
      tx.pure.string(params.bondName),
      tx.pure.u64(params.totalAmount),
      tx.pure.u64(params.annualInterestRate),
      tx.pure.u64(params.maturityDate),
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
  amount: number; // in MIST
  payment: any; // SUI coin object
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::buy_bond_rwa_tokens`,
    arguments: [
      tx.object(params.bondProjectId),
      tx.pure.u64(params.amount),
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
  adminCap: string;
  payment: any; // SUI coin object
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::deposit_redemption_funds`,
    arguments: [
      tx.object(params.bondProjectId),
      tx.object(params.adminCap),
      params.payment,
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
  adminCap: string;
  amount: number; // in MIST
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::withdraw_raised_funds`,
    arguments: [
      tx.object(params.bondProjectId),
      tx.object(params.adminCap),
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
  adminCap: string;
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::pause_sale`,
    arguments: [tx.object(params.bondProjectId), tx.object(params.adminCap)],
  });

  return tx;
}

/**
 * Resume bond sale (issuer only)
 */
export function resumeSaleTx(params: {
  bondProjectId: string;
  adminCap: string;
}): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::resume_sale`,
    arguments: [tx.object(params.bondProjectId), tx.object(params.adminCap)],
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
    issuerName: result.issuerName || '',
    bondImageUrl: result.bondImageUrl || '',
    tokenImageUrl: result.tokenImageUrl || '',
    totalAmount: result.totalAmount || '0',
    amountRaised: result.amountRaised || '0',
    amountRedeemed: result.amountRedeemed || '0',
    tokensIssued: result.tokensIssued || '0',
    tokensRedeemed: result.tokensRedeemed || '0',
    annualInterestRate: result.annualInterestRate || 0,
    maturityDate: result.maturityDate || 0,
    issueDate: result.issueDate || 0,
    active: result.active || false,
    redeemable: result.redeemable || false,
    metadataUrl: result.metadataUrl || '',
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
 * Get objects owned by address filtered by type
 */
export async function getOwnedObjectsByType(
  address: string,
  objectType: string
): Promise<any[]> {
  try {
    const objects = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: objectType,
      },
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });

    return objects.data || [];
  } catch (error) {
    console.error('Error fetching owned objects:', error);
    return [];
  }
}

/**
 * Get BondProject objects owned by user (as issuer)
 * Returns BondProject objects where user is the issuer
 */
export async function getUserIssuedBonds(
  userAddress: string
): Promise<any[]> {
  try {
    // Query for BondProject objects
    const bondProjectType = `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::BondProject`;
    const objects = await getOwnedObjectsByType(userAddress, bondProjectType);
    
    console.log('User issued bonds (raw):', objects);
    
    // Filter and parse bond projects
    const bonds = objects
      .filter(obj => obj.data?.content)
      .map(obj => {
        const content = obj.data.content as any;
        return {
          objectId: obj.data.objectId,
          ...content.fields,
        };
      });

    return bonds;
  } catch (error) {
    console.error('Error fetching user issued bonds:', error);
    return [];
  }
}

/**
 * Get BondToken objects owned by user (as investor)
 * Returns BondToken NFTs owned by the user
 */
export async function getUserBondTokens(
  userAddress: string
): Promise<any[]> {
  try {
    // Query for BondToken objects
    const bondTokenType = `${CONTRACT_INFO.packageId}::${CONTRACT_INFO.module}::BondToken`;
    const objects = await getOwnedObjectsByType(userAddress, bondTokenType);
    
    console.log('User bond tokens (raw):', objects);
    
    // Parse bond tokens
    const tokens = objects
      .filter(obj => obj.data?.content)
      .map(obj => {
        const content = obj.data.content as any;
        return {
          objectId: obj.data.objectId,
          ...content.fields,
        };
      });

    return tokens;
  } catch (error) {
    console.error('Error fetching user bond tokens:', error);
    return [];
  }
}

/**
 * Get all BondProject objects from the chain
 * Note: This might be expensive for large datasets
 * For marketplace listing, prefer using backend API
 */
export async function getAllBondProjects(): Promise<any[]> {
  try {
    // This is a simplified version - in production you might want to:
    // 1. Query events instead
    // 2. Use a backend indexer
    // 3. Implement pagination
    
    // Note: queryEvents or dynamic field queries might be more efficient
    // This is a basic implementation
    console.warn('getAllBondProjects: Consider using backend API for better performance');
    
    // TODO: Implement event-based querying when needed
    // For now, rely on backend API for marketplace
    return [];
  } catch (error) {
    console.error('Error fetching all bond projects:', error);
    return [];
  }
}

/**
 * Notify backend about on-chain transaction
 * Backend will index the object from chain
 */
export async function notifyBackendAboutTransaction(
  transactionDigest: string,
  eventType: 'bond_created' | 'bond_purchased' | 'bond_redeemed' | 'funds_withdrawn' | 'redemption_deposited'
): Promise<void> {
  try {
    // This would call your backend API
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/bonds/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        transaction_digest: transactionDigest,
        event_type: eventType,
      }),
    });

    if (!response.ok) {
      console.error('Failed to notify backend:', await response.text());
    }
  } catch (error) {
    console.error('Error notifying backend:', error);
    // Don't throw - this is non-critical
  }
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
