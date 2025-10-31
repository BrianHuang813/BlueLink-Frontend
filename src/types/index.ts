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
  id: number;
  on_chain_id: string;
  issuer_name: string;
  bond_name: string;
  total_amount: number;       // MIST
  amount_raised: number;      // MIST
  annual_interest_rate: number; // basis points
  maturity_date: string;      // YYYY-MM-DD
  active: boolean;
  redeemable: boolean;
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
  id: string;
  bond_project_id: string;
  owner: string;
  amount: string;
  purchase_date: number;
  redeemed: boolean;
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
