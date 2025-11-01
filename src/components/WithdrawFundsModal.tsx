/**
 * WithdrawFundsModal Component
 * Modal for bond issuers to withdraw raised funds
 */

import React, { useState } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { notifyBackendAboutTransaction } from '../lib/sui';

interface WithdrawFundsModalProps {
  bond: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WithdrawFundsModal: React.FC<WithdrawFundsModalProps> = ({
  bond,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  if (!isOpen || !bond) return null;

  const bondName = bond.bond_name || bond.bondName || '未命名債券';
  const amountRaised = Number(bond.amount_raised || bond.amountRaised || 0);
  const availableBalance = amountRaised / 1000000000; // Convert from MIST to SUI

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      alert('請輸入有效的提取金額');
      return;
    }

    const amount = Number(withdrawAmount);
    if (amount > availableBalance) {
      alert('提取金額超過可用餘額');
      return;
    }

    setIsWithdrawing(true);
    try {
      const txb = new Transaction();
      
      // Convert SUI to MIST (multiply by 1_000_000_000)
      const amountInMist = Math.floor(amount * 1000000000);
      
      // Call withdraw_raised_funds function
      // Note: You'll need the admin_cap object ID for authorization
      // This should be stored when the bond was created
      txb.moveCall({
        target: `${import.meta.env.VITE_SUI_PACKAGE_ID}::blue_link::withdraw_raised_funds`,
        arguments: [
          txb.object(bond.objectId || bond.id), // bond_project_id
          txb.object(bond.admin_cap_id || bond.adminCapId), // admin_cap
          txb.pure.u64(amountInMist), // amount to withdraw
        ],
      });

      signAndExecute(
        { transaction: txb },
        {
          onSuccess: async (result: any) => {
            console.log('Withdrawal successful:', result);
            
            // Notify backend
            try {
              await notifyBackendAboutTransaction(result.digest, 'funds_withdrawn');
              console.log('Backend notified about withdrawal');
            } catch (err) {
              console.warn('Failed to notify backend:', err);
            }
            
            alert(
              '提取成功！\n\n' +
              `已提取 ${amount.toFixed(4)} SUI\n` +
              '資金已轉入您的錢包。'
            );
            
            onSuccess();
            onClose();
            setWithdrawAmount('');
          },
          onError: (error: any) => {
            console.error('Withdrawal failed:', error);
            alert('提取失敗: ' + (error.message || '請重試'));
          }
        }
      );
    } catch (error) {
      console.error('Error creating withdrawal transaction:', error);
      alert('建立交易失敗，請重試');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">提取募集資金</h2>
            <p className="text-sm text-gray-600 mt-1">{bondName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isWithdrawing}
          >
            ×
          </button>
        </div>

        {/* Available Balance */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-blue-700">可用餘額</span>
            <span className="text-2xl font-bold text-blue-900">
              {availableBalance.toFixed(4)} SUI
            </span>
          </div>
          <div className="text-xs text-blue-600">
            來自投資者購買債券的資金
          </div>
        </div>

        {/* Withdraw Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            提取金額 (SUI)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              min="0"
              max={availableBalance}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="請輸入金額"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isWithdrawing}
            />
            <button
              type="button"
              onClick={() => setWithdrawAmount(availableBalance.toString())}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              disabled={isWithdrawing}
            >
              最大
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            最大可提取: {availableBalance.toFixed(4)} SUI
          </div>
        </div>

        {/* Withdrawal Info */}
        {withdrawAmount && Number(withdrawAmount) > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-green-900 mb-2">提取摘要</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">提取金額</span>
                <span className="font-semibold text-green-900">
                  {Number(withdrawAmount).toFixed(4)} SUI
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">剩餘餘額</span>
                <span className="font-semibold text-green-900">
                  {(availableBalance - Number(withdrawAmount)).toFixed(4)} SUI
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
            disabled={isWithdrawing}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleWithdraw}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={isWithdrawing || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > availableBalance}
          >
            {isWithdrawing ? '處理中...' : '確認提取'}
          </button>
        </div>

        {/* Warning */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            ⚠️ 提示：提取資金後,請確保為債券到期預留足夠的資金用於償還投資者本金和利息。
          </p>
        </div>
      </div>
    </div>
  );
};

export default WithdrawFundsModal;
