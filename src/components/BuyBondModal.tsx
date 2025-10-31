/**
 * BuyBondModal Component
 * Modal for purchasing bond tokens
 */

import React, { useState } from 'react';
import { Bond } from '../types';
import {
  mistToSui,
  formatInterestRate,
  formatSuiAmount,
  formatDateString,
} from '../lib/utils';

interface BuyBondModalProps {
  bond: Bond | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bondId: string, amount: number) => Promise<void>;
}

const BuyBondModal: React.FC<BuyBondModalProps> = ({
  bond,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !bond) return null;

  const totalAmountSui = mistToSui(bond.total_amount);
  const raisedAmountSui = mistToSui(bond.amount_raised);
  const availableSui = totalAmountSui - raisedAmountSui;
  const amountNum = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amountNum <= 0 || amountNum > availableSui) {
      alert('請輸入有效的購買金額');
      return;
    }

    setIsLoading(true);
    try {
      // Pass amount in SUI, the handler will convert to MIST
      await onConfirm(bond.on_chain_id, amountNum);
      setAmount('');
      onClose();
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(availableSui.toString());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">購買債券</h2>
            <p className="text-sm text-gray-600 mt-1">{bond.bond_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Bond Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">發行方</span>
            <span className="font-medium text-gray-800">{bond.issuer_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">年利率</span>
            <span className="font-semibold text-green-600">
              {formatInterestRate(bond.annual_interest_rate)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">到期日</span>
            <span className="font-medium text-gray-800">
              {formatDateString(bond.maturity_date)}
            </span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
            <span className="text-gray-600">可購買額度</span>
            <span className="font-semibold text-blue-600">
              {formatSuiAmount(availableSui)} SUI
            </span>
          </div>
        </div>

        {/* Amount Input Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              購買金額 (SUI)
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.000000001"
                min="0"
                max={availableSui}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={handleMaxClick}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-700"
                disabled={isLoading}
              >
                最大
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              最小: 0.01 SUI | 最大: {formatSuiAmount(availableSui)} SUI
            </p>
          </div>

          {/* Summary */}
          {amountNum > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">購買摘要</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">購買金額</span>
                  <span className="font-medium text-blue-900">
                    {formatSuiAmount(amountNum)} SUI
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">到期收益</span>
                  <span className="font-medium text-blue-900">
                    {formatSuiAmount(
                      amountNum * (1 + bond.annual_interest_rate / 10000)
                    )}{' '}
                    SUI
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-300">
                  <span className="text-blue-700 font-semibold">預計獲利</span>
                  <span className="font-bold text-green-600">
                    +{formatSuiAmount(amountNum * (bond.annual_interest_rate / 10000))}{' '}
                    SUI
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={isLoading || amountNum <= 0 || amountNum > availableSui}
            >
              {isLoading ? '處理中...' : '確認購買'}
            </button>
          </div>
        </form>

        {/* Warning */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            購買前請確認：債券為區塊鏈資產，交易一旦完成無法撤銷。請確保您了解相關風險。
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyBondModal;
