/**
 * BondMarketplacePage
 * Main page for browsing and purchasing bonds
 */

import React, { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useBonds } from '../hooks/useBonds';
import { Bond } from '../types';
import BondCard from '../components/BondCard';
import BuyBondModal from '../components/BuyBondModal';
import { parseTransactionError } from '../lib/sui';
// TODO: Import buyBondTokenTx when implementing full transaction flow
// import { buyBondTokenTx } from '../lib/sui';

const BondMarketplacePage: React.FC = () => {
  const currentAccount = useCurrentAccount();
  const { bonds, loading, error, refetch } = useBonds(15000); // Poll every 15s
  const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'matured'>('all');
  const [sortBy, setSortBy] = useState<'interest' | 'maturity' | 'progress'>('interest');

  // Handle buy bond click
  const handleBuyClick = (bond: Bond) => {
    if (!currentAccount) {
      alert('請先連接錢包');
      return;
    }
    setSelectedBond(bond);
    setIsModalOpen(true);
  };

  // Handle bond purchase
  const handleBuyConfirm = async (bondId: string, amount: number) => {
    if (!currentAccount) {
      alert('請先連接錢包');
      return;
    }

    try {
      // This is a simplified version - you'll need to integrate with @mysten/dapp-kit
      // to actually sign and execute the transaction
      console.log('Purchasing bond:', { bondId, amount });
      
      // Example transaction (you'll need to implement the actual signing)
      // const tx = buyBondTokenTx({
      //   bondProjectId: bondId,
      //   amount: amount,
      //   payment: suiCoin, // You'll need to get this from wallet
      // });
      
      // await signAndExecuteTransactionBlock({ transactionBlock: tx });
      
      // Show success message
      alert('購買成功！交易已提交至區塊鏈');
      
      // Refresh bonds data
      await refetch();
      
    } catch (error) {
      console.error('Purchase failed:', error);
      const { message } = parseTransactionError(error);
      alert(`購買失敗: ${message}`);
    }
  };

  // Filter bonds
  const filteredBonds = bonds.filter((bond) => {
    if (filter === 'active') return bond.active && !bond.redeemable;
    if (filter === 'matured') return bond.redeemable;
    return true;
  });

  // Sort bonds
  const sortedBonds = [...filteredBonds].sort((a, b) => {
    switch (sortBy) {
      case 'interest':
        return b.annual_interest_rate - a.annual_interest_rate;
      case 'maturity':
        return new Date(a.maturity_date).getTime() - new Date(b.maturity_date).getTime();
      case 'progress':
        const progressA = (a.amount_raised / a.total_amount) * 100;
        const progressB = (b.amount_raised / b.total_amount) * 100;
        return progressB - progressA;
      default:
        return 0;
    }
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">正在載入債券市場...</p>
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
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          債券市場
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          透過區塊鏈技術投資債券，享受透明、安全的固定收益投資體驗
        </p>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">{bonds.length}</div>
            <div className="text-blue-100 text-sm">總債券數</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">
              {bonds.filter((b) => b.active).length}
            </div>
            <div className="text-blue-100 text-sm">活躍債券</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-1">
              {bonds.filter((b) => b.redeemable).length}
            </div>
            <div className="text-blue-100 text-sm">可贖回債券</div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">篩選:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              進行中
            </button>
            <button
              onClick={() => setFilter('matured')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'matured'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已到期
            </button>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">排序:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="interest">利率 (高到低)</option>
            <option value="maturity">到期日 (近到遠)</option>
            <option value="progress">募資進度</option>
          </select>
        </div>
      </div>

      {/* Bonds Grid */}
      {sortedBonds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {filter === 'all' ? '目前沒有債券' : '沒有符合條件的債券'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? '債券發行方可以建立新的債券項目'
              : '請嘗試其他篩選條件'}
          </p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              查看全部債券
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedBonds.map((bond) => (
              <BondCard key={bond.id} bond={bond} onBuy={handleBuyClick} />
            ))}
          </div>

          {/* Refresh Info */}
          <div className="text-center text-sm text-gray-500">
            <p>數據每 15 秒自動更新 | 上次更新: {new Date().toLocaleTimeString('zh-TW')}</p>
          </div>
        </>
      )}

      {/* Buy Bond Modal */}
      <BuyBondModal
        bond={selectedBond}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBond(null);
        }}
        onConfirm={handleBuyConfirm}
      />

      {/* Connect Wallet Prompt */}
      {!currentAccount && (
        <div className="fixed bottom-6 right-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg p-4 max-w-sm">
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">
              連接錢包以購買
            </h4>
            <p className="text-sm text-yellow-800">
              請在頁面頂部連接您的 Sui 錢包以開始購買債券
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BondMarketplacePage;
