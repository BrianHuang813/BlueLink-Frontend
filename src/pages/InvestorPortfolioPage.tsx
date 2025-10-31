/**
 * InvestorPortfolioPage
 * Display investor's bond token portfolio with redemption functionality
 */

import React, { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useBondTokens } from '../hooks/useBondTokens';
import { BondToken } from '../types';
import BondTokenCard from '../components/BondTokenCard';
import { parseTransactionError } from '../lib/sui';
import { mistToSui, formatSuiAmount, calculateRedemptionAmount } from '../lib/utils';

const InvestorPortfolioPage: React.FC = () => {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { tokens, loading, error, refetch } = useBondTokens(
    currentAccount?.address,
    15000 // Poll every 15s
  );
  const [filter, setFilter] = useState<'all' | 'active' | 'matured' | 'redeemed'>('all');

  // Handle token redemption
  const handleRedeem = async (token: BondToken) => {
    if (!currentAccount) {
      alert('請先連接錢包');
      return;
    }

    const confirmRedeem = window.confirm(
      `確定要贖回此債券代幣嗎？\n您將收到 ${formatSuiAmount(
        mistToSui(
          calculateRedemptionAmount(
            token.amount,
            token.annual_interest_rate,
            token.purchase_date,
            token.maturity_date
          )
        )
      )} SUI`
    );

    if (!confirmRedeem) return;

    try {
      // Create transaction to redeem bond token
      const tx = new Transaction();

      // Call redeem_bond_token
      tx.moveCall({
        target: `${import.meta.env.VITE_SUI_PACKAGE_ID}::blue_link::redeem_bond_token`,
        arguments: [
          tx.object(token.project_id),
          tx.object(token.on_chain_id),
          tx.object('0x6'), // Clock object
        ],
      });

      // Sign and execute transaction
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Redemption successful:', result);
            alert('贖回成功！資金已轉入您的錢包');
            // Refresh tokens data
            refetch();
          },
          onError: (error) => {
            console.error('Redemption failed:', error);
            const { message } = parseTransactionError(error);
            alert(`贖回失敗: ${message}`);
          },
        }
      );
    } catch (error) {
      console.error('Transaction creation failed:', error);
      const { message } = parseTransactionError(error);
      alert(`交易建立失敗: ${message}`);
    }
  };

  // Calculate portfolio statistics
  const now = Date.now();
  const activeTokens = tokens.filter((t) => !t.is_redeemed && t.maturity_date > now);
  const maturedTokens = tokens.filter((t) => !t.is_redeemed && t.maturity_date <= now);
  const redeemedTokens = tokens.filter((t) => t.is_redeemed);

  const totalInvested = tokens
    .filter((t) => !t.is_redeemed)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalInvestedSui = mistToSui(totalInvested);

  const totalExpectedReturns = tokens
    .filter((t) => !t.is_redeemed)
    .reduce(
      (sum, t) =>
        sum +
        calculateRedemptionAmount(
          t.amount,
          t.annual_interest_rate,
          t.purchase_date,
          t.maturity_date
        ),
      0
    );
  const totalExpectedReturnsSui = mistToSui(totalExpectedReturns);
  const totalExpectedInterestSui = totalExpectedReturnsSui - totalInvestedSui;

  // Filter tokens
  const filteredTokens = tokens.filter((token) => {
    if (filter === 'active') return !token.is_redeemed && token.maturity_date > now;
    if (filter === 'matured') return !token.is_redeemed && token.maturity_date <= now;
    if (filter === 'redeemed') return token.is_redeemed;
    return true;
  });

  // Wallet connection check
  if (!currentAccount) {
    return (
      <div className="max-w-4xl mx-auto text-center bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <div className="text-6xl mb-4">🔌</div>
        <h2 className="text-2xl font-bold text-yellow-800 mb-2">請先連接錢包</h2>
        <p className="text-yellow-700">
          連接錢包後，您可以查看您持有的債券代幣並進行贖回操作
        </p>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">正在載入您的投資組合...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <h3 className="text-xl font-semibold text-red-800 mb-2">載入失敗</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">我的投資組合</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          管理您的債券代幣投資，追蹤收益並贖回到期債券
        </p>
      </div>

      {/* Portfolio Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{tokens.length}</div>
            <div className="text-blue-100 text-sm">總代幣數</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">
              {formatSuiAmount(totalInvestedSui)}
            </div>
            <div className="text-blue-100 text-sm">投資總額 (SUI)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">
              +{formatSuiAmount(totalExpectedInterestSui)}
            </div>
            <div className="text-blue-100 text-sm">預計利息 (SUI)</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{maturedTokens.length}</div>
            <div className="text-blue-100 text-sm">可贖回代幣</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">篩選:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部 ({tokens.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            進行中 ({activeTokens.length})
          </button>
          <button
            onClick={() => setFilter('matured')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'matured'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            可贖回 ({maturedTokens.length})
          </button>
          <button
            onClick={() => setFilter('redeemed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'redeemed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            已贖回 ({redeemedTokens.length})
          </button>
        </div>
      </div>

      {/* Tokens Grid */}
      {filteredTokens.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <div className="text-6xl mb-4">💎</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {filter === 'all' ? '還沒有債券代幣' : '沒有符合條件的債券代幣'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? '前往債券市場購買您的第一個債券代幣'
              : '請嘗試其他篩選條件'}
          </p>
          {filter === 'all' ? (
            <a
              href="/bonds"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              前往債券市場
            </a>
          ) : (
            <button
              onClick={() => setFilter('all')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              查看全部代幣
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredTokens.map((token) => (
              <BondTokenCard key={token.id} token={token} onRedeem={handleRedeem} />
            ))}
          </div>

          {/* Refresh Info */}
          <div className="text-center text-sm text-gray-500">
            <p>
              數據每 15 秒自動更新 | 上次更新: {new Date().toLocaleTimeString('zh-TW')}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default InvestorPortfolioPage;
