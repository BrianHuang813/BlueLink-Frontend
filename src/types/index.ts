export interface Project {
  id: string;
  creator: string;
  name: string;
  description: string;
  funding_goal: string;
  total_raised: string;
  donor_count: string;
}

export interface DonationReceipt {
  id: string;
  project_id: string;
  donor: string;
  amount: string;
}

export interface CreateProjectForm {
  name: string;
  description: string;
  funding_goal: number;
}

export interface DonationForm {
  amount: number;
}

// Bond-related types for BlueLink
export interface Bond {
  // 後端數據庫字段
  id: number;
  on_chain_id: string;
  issuer_address: string;
  issuer_name: string;
  bond_name: string;
  bond_image_url: string;
  token_image_url: string;
  total_amount: number;         // u64 (MIST)
  amount_raised: number;        // u64 (MIST)
  amount_redeemed: number;      // u64 (MIST)
  tokens_issued: number;        // u64
  tokens_redeemed: number;      // u64
  annual_interest_rate: number; // u64 (basis points)
  maturity_date: string;        // u64 (Unix timestamp) - 後端轉為 ISO string
  issue_date: string;           // u64 (Unix timestamp) - 後端轉為 ISO string
  active: boolean;
  redeemable: boolean;
  metadata_url: string;
  created_at: string;
  updated_at: string;
}

export interface BondProjectInfo {
  // 鏈上讀取的數據結構
  bondName: string;
  issuer: string;
  issuerName: string;
  bondImageUrl: string;
  tokenImageUrl: string;
  totalAmount: string;
  amountRaised: string;
  amountRedeemed: string;
  tokensIssued: string;
  tokensRedeemed: string;
  annualInterestRate: number;
  maturityDate: number;         // Unix timestamp
  issueDate: number;            // Unix timestamp
  active: boolean;
  redeemable: boolean;
  metadataUrl: string;
}

export interface BondToken {
  // 後端數據庫字段
  id: number;
  on_chain_id: string;
  bond_project_id: string;
  bond_name: string;
  token_image_url: string;
  token_number: number;         // u64
  owner: string;
  amount: number;               // u64 (MIST)
  purchase_date: number;        // u64 (Unix timestamp in seconds)
  maturity_date: number;        // u64 (Unix timestamp in seconds)
  annual_interest_rate: number; // u64 (basis points)
  redeemed: boolean;            // is_redeemed
  created_at: string;
  updated_at: string;
}

// Full profile with extended information
export interface FullUserProfile extends UserProfile {
  issuer_name?: string;
  issuer_description?: string;
  total_bonds_issued?: number;
  total_bonds_purchased?: number;
}

export interface AuthChallenge {
  nonce: string;
  message: string;
}

export interface UserProfile {
  wallet_address: string;
  role: 'buyer' | 'issuer' | 'admin';
  created_at: string;
  session_expires_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
