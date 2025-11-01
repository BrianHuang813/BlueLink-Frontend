/**
 * RedeemBondModal Component
 * Modal for redeeming matured bond tokens
 */

import React, { useState } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { notifyBackendAboutTransaction } from '../lib/sui';

interface RedeemBondModalProps {
  bondToken: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RedeemBondModal: React.FC<RedeemBondModalProps> = ({
  bondToken,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isRedeeming, setIsRedeeming] = useState(false);

  if (!isOpen || !bondToken) return null;

  const bondName = bondToken.bond_name || bondToken.bondName || '未命名債券';
  const amount = Number(bondToken.amount || 0);
  const annualRate = Number(bondToken.annual_interest_rate || bondToken.annualInterestRate || 0);
  const maturityDate = bondToken.maturity_date || bondToken.maturityDate;
  const tokenNumber = bondToken.token_number || bondToken.tokenNumber || 0;
  
  // Calculate redemption amount (principal + interest)
  const principal = amount / 1000000000;
  const interest = principal * (annualRate / 10000);
  const totalRedemption = principal + interest;

  const handleRedeem = async () => {
    setIsRedeeming(true);
    try {
      const txb = new Transaction();
      
      // Call redeem_bond_token function
      txb.moveCall({
        target: `${import.meta.env.VITE_SUI_PACKAGE_ID}::blue_link::redeem_bond_token`,
        arguments: [
          txb.object(bondToken.bond_project_id || bondToken.bondProjectId),
          txb.object(bondToken.objectId || bondToken.id),
          txb.object('0x6'), // Clock object ID
        ],
      });

      signAndExecute(
        { transaction: txb },
        {
          onSuccess: async (result: any) => {
            console.log('Redemption successful:', result);
            
            // Notify backend
            try {
              await notifyBackendAboutTransaction(result.digest, 'bond_redeemed');
              console.log('Backend notified about redemption');
            } catch (err) {
              console.warn('Failed to notify backend:', err);
            }
            
            alert(
              '贖回成功！\n\n' +
              `您已贖回 ${totalRedemption.toFixed(4)} SUI\n` +
              '資金已返回到您的錢包。'
            );
            
            onSuccess();
            onClose();
          },
          onError: (error: any) => {
            console.error('Redemption failed:', error);
            alert('贖回失敗，請重試');
          }
        }
      );
    } catch (error) {
      console.error('Error creating redemption transaction:', error);
      alert('建立交易失敗，請重試');
    } finally {
      setIsRedeeming(false);
    }
  };

  const isMatured = maturityDate && new Date(Number(maturityDate)) <= new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">贖回債券</h2>
            <p className="text-sm text-gray-600 mt-1">{bondName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={isRedeeming}
          >
            ×
          </button>
        </div>

        {/* Token Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">代幣編號</span>
            <span className="font-mono font-medium text-gray-800">#{tokenNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">本金</span>
            <span className="font-medium text-gray-800">{principal.toFixed(4)} SUI</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">利息</span>
            <span className="font-medium text-green-600">+{interest.toFixed(4)} SUI</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">年利率</span>
            <span className="font-medium text-gray-800">{(annualRate / 100).toFixed(2)}%</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
            <span className="text-gray-600">到期日</span>
            <span className="font-medium text-gray-800">
              {maturityDate ? new Date(Number(maturityDate)).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Redemption Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">贖回摘要</h4>
          <div className="flex justify-between items-center">
            <span className="text-blue-700">您將收到</span>
            <span className="text-2xl font-bold text-blue-900">
              {totalRedemption.toFixed(4)} SUI
            </span>
          </div>
        </div>

        {/* Status Check */}
        {!isMatured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ 此債券尚未到期，無法贖回。請等待到期日後再贖回。
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            disabled={isRedeeming}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleRedeem}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={isRedeeming || !isMatured}
          >
            {isRedeeming ? '處理中...' : '確認贖回'}
          </button>
        </div>

        {/* Warning */}
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-800">
            提醒：贖回後此債券代幣將被銷毀，資金將返回到您的錢包。此操作不可撤銷。
          </p>
        </div>
      </div>
    </div>
  );
};

export default RedeemBondModal;
