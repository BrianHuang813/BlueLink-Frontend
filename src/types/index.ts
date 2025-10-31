// Bond Project data model (matches Backend Bond schema)
export interface Bond {
  id: number;
  on_chain_id: string;
  issuer_address: string;
  issuer_name: string;
  bond_name: string;
  bond_image_url: string;
  token_image_url: string;
  metadata_url: string;
  total_amount: number; // in MIST
  amount_raised: number; // in MIST
  amount_redeemed: number; // in MIST
  tokens_issued: number;
  tokens_redeemed: number;
  annual_interest_rate: number; // in basis points (e.g., 500 = 5%)
  maturity_date: string; // ISO date string
  issue_date: string; // ISO date string
  active: boolean;
  redeemable: boolean;
  raised_funds_balance: number; // in MIST
  redemption_pool_balance: number; // in MIST
  created_at: string;
  updated_at: string;
}

// Bond Token NFT data model (matches Backend BondToken schema)
export interface BondToken {
  id: number;
  on_chain_id: string;
  project_id: string;
  bond_name: string;
  token_image_url: string;
  maturity_date: number; // timestamp in ms
  annual_interest_rate: number; // in basis points
  token_number: number;
  owner: string;
  amount: number; // in MIST
  purchase_date: number; // timestamp in ms
  is_redeemed: boolean;
  created_at: string;
  updated_at: string;
}

// User data models
export interface User {
  id: number;
  wallet_address: string;
  role: string;
  institution_name?: string;
  name?: string;
  timezone?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  wallet_address: string;
  name?: string;
  role: string;
  timezone?: string;
  language?: string;
}

// Forms
export interface CreateBondForm {
  issuer_name: string;
  bond_name: string;
  bond_image_url: string;
  token_image_url: string;
  total_amount: number;
  annual_interest_rate: number;
  maturity_date: string;
  metadata_url: string;
}

export interface PurchaseBondForm {
  amount: number;
}

// Legacy aliases for backward compatibility
export type Project = Bond;
export type DonationReceipt = BondToken;
export type CreateProjectForm = CreateBondForm;
export type DonationForm = PurchaseBondForm;
