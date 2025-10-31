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

// Bond-related types for BlueLink (matching backend models)
export interface Bond {
  id: number;
  on_chain_id: string;
  issuer_address: string;
  issuer_name: string;
  bond_name: string;
  bond_image_url: string;
  token_image_url: string;
  metadata_url: string;
  total_amount: number;              // MIST
  amount_raised: number;             // MIST
  amount_redeemed: number;           // MIST
  tokens_issued: number;
  tokens_redeemed: number;
  annual_interest_rate: number;      // basis points (e.g., 500 = 5%)
  maturity_date: string;             // YYYY-MM-DD
  issue_date: string;                // YYYY-MM-DD
  active: boolean;
  redeemable: boolean;
  raised_funds_balance: number;      // MIST
  redemption_pool_balance: number;   // MIST
  created_at: string;
  updated_at: string;
}

export interface BondProjectInfo {
  bondName: string;
  issuer: string;
  totalAmount: string;
  amountRaised: string;
  annualInterestRate: number;
  maturityDate: number;
  active: boolean;
}

export interface BondToken {
  id: number;
  on_chain_id: string;
  project_id: string;
  bond_name: string;
  token_image_url: string;
  maturity_date: number;             // timestamp ms
  annual_interest_rate: number;      // basis points
  token_number: number;
  owner: string;
  amount: number;                    // MIST
  purchase_date: number;             // timestamp ms
  is_redeemed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBondForm {
  issuer_name: string;
  bond_name: string;
  bond_image_url: string;
  token_image_url: string;
  total_amount: number;              // in SUI (will convert to MIST)
  annual_interest_rate: number;      // percentage (will convert to basis points)
  maturity_date: string;             // YYYY-MM-DD
  metadata_url: string;
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
