/**
 * BondTokenCard Component
 * Displays a bond token NFT with investment details and redemption status
 */

import React from 'react';
import { BondToken } from '../types';
import {
  mistToSui,
  formatInterestRate,
  formatSuiAmount,
  formatDate,
  calculateRedemptionAmount,
  calculateExpectedInterest,
} from '../lib/utils';

interface BondTokenCardProps {
  token: BondToken;
  onRedeem?: (token: BondToken) => void;
}

const BondTokenCard: React.FC<BondTokenCardProps> = ({ token, onRedeem }) => {
  const amountSui = mistToSui(token.amount);
  const redemptionAmount = calculateRedemptionAmount(
    token.amount,
    token.annual_interest_rate,
    token.purchase_date,
    token.maturity_date
  );
  const redemptionSui = mistToSui(redemptionAmount);
  const expectedInterest = calculateExpectedInterest(
    token.amount,
    token.annual_interest_rate,
    token.purchase_date,
    token.maturity_date
  );
  const expectedInterestSui = mistToSui(expectedInterest);

  const now = Date.now();
  const isMatured = now >= token.maturity_date;
  const isRedeemable = isMatured && !token.is_redeemed;

  // Calculate days until maturity or days since purchase if matured
  const daysUntilMaturity = isMatured
    ? 0
    : Math.ceil((token.maturity_date - now) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* Header with Token Image */}
      <div className="flex items-center gap-4 mb-4">
        {token.token_image_url && (
          <img
            src={token.token_image_url}
            alt={token.bond_name}
            className="w-16 h-16 rounded-lg object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" fill="%234F46E5"/%3E%3Ctext x="32" y="36" font-family="Arial" font-size="24" fill="white" text-anchor="middle"%3E💎%3C/text%3E%3C/svg%3E';
            }}
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
            {token.bond_name}
          </h3>
          <p className="text-sm text-gray-600">代幣 #{token.token_number}</p>
        </div>
        {token.is_redeemed && (
          <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
            已贖回
          </span>
        )}
        {isRedeemable && (
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            可贖回
          </span>
        )}
      </div>

      {/* Investment Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">投資金額</span>
          <span className="text-lg font-bold text-blue-600">
            {formatSuiAmount(amountSui)} SUI
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">年利率</span>
          <span className="text-sm font-semibold text-green-600">
            {formatInterestRate(token.annual_interest_rate)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">購買日期</span>
          <span className="text-sm font-medium text-gray-800">
            {formatDate(token.purchase_date)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">到期日</span>
          <span className="text-sm font-medium text-gray-800">
            {formatDate(token.maturity_date)}
          </span>
        </div>

        {!isMatured && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">剩餘天數</span>
            <span className="text-sm font-medium text-blue-600">
              {daysUntilMaturity} 天
            </span>
          </div>
        )}
      </div>

      {/* Returns Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">預計利息</span>
            <span className="text-sm font-semibold text-green-700">
              +{formatSuiAmount(expectedInterestSui)} SUI
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-green-200">
            <span className="text-sm font-semibold text-gray-800">贖回金額</span>
            <span className="text-lg font-bold text-green-700">
              {formatSuiAmount(redemptionSui)} SUI
            </span>
          </div>
        </div>
      </div>

      {/* Redeem Button */}
      {!token.is_redeemed && (
        <button
          onClick={() => onRedeem?.(token)}
          disabled={!isRedeemable}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            isRedeemable
              ? 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isRedeemable ? '贖回債券' : `${daysUntilMaturity} 天後可贖回`}
        </button>
      )}

      {/* On-chain ID (for debug) */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 truncate">
          鏈上 ID: {token.on_chain_id}
        </p>
      </div>
    </div>
  );
};

export default BondTokenCard;
