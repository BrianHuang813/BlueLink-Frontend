/**
 * BondCard Component
 * Displays a bond in card format with key information and buy action
 */

import React, { useState, useEffect } from 'react';
import { Bond, UserProfile } from '../types';
import {
  mistToSui,
  formatInterestRate,
  calculateProgress,
  formatDateString,
  formatSuiAmount,
  daysUntilMaturity,
} from '../lib/utils';

interface BondCardProps {
  bond: Bond;
  onBuy: (bond: Bond) => void;
}

const BondCard: React.FC<BondCardProps> = ({ bond, onBuy }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        setCurrentUser(JSON.parse(userJson));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  const totalAmountSui = mistToSui(bond.total_amount);
  const raisedAmountSui = mistToSui(bond.amount_raised);
  const progress = calculateProgress(bond.amount_raised, bond.total_amount);
  const daysLeft = daysUntilMaturity(bond.maturity_date);
  const isMatured = daysLeft === 0;
  
  // Check if current user is the issuer of this bond
  const isIssuer = currentUser?.wallet_address.toLowerCase() === bond.issuer_address.toLowerCase();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
            {bond.bond_name}
          </h3>
          {!bond.active && (
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
              已暫停
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          發行方: <span className="font-medium">{bond.issuer_name}</span>
        </p>
      </div>

      {/* Key Metrics */}
      <div className="space-y-3 mb-4">
        {/* Interest Rate */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">年利率</span>
          <span className="text-lg font-bold text-green-600">
            {formatInterestRate(bond.annual_interest_rate)}
          </span>
        </div>

        {/* Total Amount */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">總募資額</span>
          <span className="text-sm font-semibold text-gray-800">
            {formatSuiAmount(totalAmountSui)} SUI
          </span>
        </div>

        {/* Maturity Date */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">到期日</span>
          <span className="text-sm font-medium text-gray-800">
            {formatDateString(bond.maturity_date)}
          </span>
        </div>

        {/* Days Until Maturity */}
        {!isMatured && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">剩餘天數</span>
            <span className="text-sm font-medium text-blue-600">
              {daysLeft} 天
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">募資進度</span>
          <span className="font-semibold text-gray-800">
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-500">
          <span>{formatSuiAmount(raisedAmountSui)} SUI</span>
          <span>{formatSuiAmount(totalAmountSui)} SUI</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        {bond.redeemable && (
          <div className="bg-green-50 border border-green-200 rounded-md p-2">
            <p className="text-xs text-green-700 text-center font-medium">
              ✓ 可贖回
            </p>
          </div>
        )}
        {isMatured && !bond.redeemable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
            <p className="text-xs text-yellow-700 text-center font-medium">
              已到期
            </p>
          </div>
        )}
      </div>

      {/* Buy Button */}
      {isIssuer ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg py-3 px-4">
          <p className="text-center text-sm text-blue-700 font-medium">
            您是此債券的發行方
          </p>
        </div>
      ) : currentUser?.role === 'issuer' ? (
        <div className="bg-gray-100 border border-gray-300 rounded-lg py-3 px-4">
          <p className="text-center text-sm text-gray-600 font-medium">
            發行方無法購買債券
          </p>
        </div>
      ) : (
        <button
          onClick={() => onBuy(bond)}
          disabled={!bond.active || progress >= 100}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            bond.active && progress < 100
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {!bond.active
            ? '銷售已暫停'
            : progress >= 100
            ? '已售罄'
            : '購買債券'}
        </button>
      )}

      {/* On-chain ID (for debug) */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 truncate">
          鏈上 ID: {bond.on_chain_id}
        </p>
      </div>
    </div>
  );
};

export default BondCard;
