import React, { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Link } from 'react-router-dom';
import { useOnChainBonds } from '../hooks/useOnChainBonds';
import { useUserProfile } from '../hooks/useUserProfile';
import RedeemBondModal from '../components/RedeemBondModal';
import WithdrawFundsModal from '../components/WithdrawFundsModal';

const DashboardPage: React.FC = () => {
  const [view, setView] = useState<'issuer' | 'investor'>('investor');

  const currentAccount = useCurrentAccount();
  const { profile } = useUserProfile();
  
  // Fetch bonds directly from chain
  const { 
    issuedBonds, 
    bondTokens, 
    loading, 
    error, 
    refetch 
  } = useOnChainBonds(currentAccount?.address, 15000); // Poll every 15s

  // Manual refresh function
  const handleRefresh = async () => {
    await refetch();
  };

  // Loading and Wallet Connection states
  if (!currentAccount) {
    return (
      <div className="max-w-4xl mx-auto text-center bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-yellow-800 mb-2">請先連接錢包</h2>
        <p className="text-yellow-700">連接錢包後，您可以在此查看您建立的項目和捐贈記錄。</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-lg">正在載入儀表板數據...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 text-lg">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">我的儀表板</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="刷新數據"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">用戶資訊</h2>
        <div className="space-y-2">
          <div><span className="font-medium">角色：</span>{profile?.role === 'issuer' ? '發行者' : profile?.role === 'buyer' ? '購買者' : profile?.role === 'admin' ? '管理員' : '未知'}</div>
          <div><span className="font-medium">錢包地址：</span><div className="font-mono text-xs break-all mt-1">{currentAccount.address}</div></div>
        </div>
      </div>

      {/* Conditional Rendering based on user role */}
      {profile?.role === 'issuer' ? (
        // 發行者只看到他們發行的債券
        <>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              我發行的債券 ({loading ? '...' : issuedBonds.length})
            </h2>
            <div className="text-sm text-blue-600">🔗 來自鏈上數據</div>
          </div>
          <IssuerDashboard bonds={issuedBonds} />
        </>
      ) : profile?.role === 'buyer' ? (
        // 購買者只看到他們持有的債券
        <>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              我持有的債券 ({loading ? '...' : bondTokens.length})
            </h2>
            <div className="text-sm text-blue-600">🔗 來自鏈上數據</div>
          </div>
          <InvestorDashboard tokens={bondTokens} loading={loading} />
        </>
      ) : profile?.role === 'admin' ? (
        // 管理員可以看到兩個視圖
        <>
          {/* View Switcher for Admin */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6">
                <button
                  onClick={() => setView('issuer')}
                  className={`px-3 py-2 font-medium text-sm rounded-t-md ${view === 'issuer' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  我發行的債券 ({loading ? '...' : issuedBonds.length})
                </button>
                <button
                  onClick={() => setView('investor')}
                  className={`px-3 py-2 font-medium text-sm rounded-t-md ${view === 'investor' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  我持有的債券 ({loading ? '...' : bondTokens.length})
                </button>
              </nav>
            </div>
          </div>
          {view === 'issuer' ? (
            <IssuerDashboard bonds={issuedBonds} />
          ) : (
            <InvestorDashboard tokens={bondTokens} loading={loading} />
          )}
        </>
      ) : null}
    
      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
        <strong>錢包地址：</strong>
        <div className="font-mono text-xs mt-1 break-all">{currentAccount.address}</div>
      </div>
    </div>
  );
};

// Issuer View Component
const IssuerDashboard: React.FC<{ bonds: any[] }> = ({ bonds }) => {
  const [selectedBond, setSelectedBond] = React.useState<any>(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = React.useState(false);
  
  if (bonds.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">您尚未發行任何債券</h3>
        <p className="text-gray-600 mb-6">開始創建您的第一個債券項目</p>
        <Link to="/create" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block mt-4">
          創建債券項目
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b"><h2 className="text-xl font-semibold">我發行的債券</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">債券名稱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">總金額</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">已募集</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">已發行 Token</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">利率</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">到期日</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bonds.map((bond, index) => {
              // Handle both on-chain and database formats
              const bondName = bond.bond_name || bond.bondName || '未命名';
              const totalAmount = Number(bond.total_amount || bond.totalAmount || 0);
              const amountRaised = Number(bond.amount_raised || bond.amountRaised || 0);
              const tokensIssued = Number(bond.tokens_issued || bond.tokensIssued || 0);
              const tokensRedeemed = Number(bond.tokens_redeemed || bond.tokensRedeemed || 0);
              const annualRate = Number(bond.annual_interest_rate || bond.annualInterestRate || 0);
              const maturityDate = bond.maturity_date || bond.maturityDate;
              const active = bond.active ?? true;
              
              return (
                <tr key={bond.objectId || bond.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{bondName}</td>
                  <td className="px-6 py-4 text-sm">{(totalAmount / 1000000000).toFixed(2)} SUI</td>
                  <td className="px-6 py-4 text-sm">
                    <div>{(amountRaised / 1000000000).toFixed(2)} SUI</div>
                    <div className="text-xs text-gray-500">
                      {totalAmount > 0 ? ((amountRaised / totalAmount) * 100).toFixed(1) : 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>{tokensIssued}</div>
                    <div className="text-xs text-gray-500">已贖回: {tokensRedeemed}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{(annualRate / 100).toFixed(2)}%</td>
                  <td className="px-6 py-4 text-sm">
                    {maturityDate ? new Date(Number(maturityDate)).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {active ? '有效' : '已關閉'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {amountRaised > 0 && (
                      <button
                        onClick={() => {
                          setSelectedBond(bond);
                          setIsWithdrawModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                      >
                        提取資金
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <WithdrawFundsModal
        bond={selectedBond}
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setSelectedBond(null);
        }}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};

// Investor View Component
const InvestorDashboard: React.FC<{ tokens: any[]; loading: boolean }> = ({ tokens, loading }) => {
  const [selectedToken, setSelectedToken] = React.useState<any>(null);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = React.useState(false);
  
  if (loading) {
    return <div className="text-center py-16">載入中...</div>;
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">💼</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">還沒有購買任何債券</h3>
        <p className="text-gray-600 mb-6">開始投資您的第一個債券</p>
        <Link to="/bonds" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block mt-4">
          瀏覽債券市場
        </Link>
      </div>
    );
  }

  // Handle both on-chain and database formats
  const totalAmount = tokens.reduce((sum: number, t) => {
    const amount = Number(t.amount || 0);
    return sum + (amount / 1000000000);
  }, 0);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">�</div>
            <div>
              <div className="text-2xl font-bold text-green-600">{totalAmount.toFixed(2)} SUI</div>
              <div className="text-sm text-gray-600">持有總金額</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📜</div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{tokens.length}</div>
              <div className="text-sm text-gray-600">持有債券數</div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b"><h2 className="text-xl font-semibold">我的債券</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">債券名稱 / 編號</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">持有金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">到期日</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokens.map((token, index) => {
                // Handle both on-chain and database formats
                const bondName = token.bond_name || token.bondName || '未命名債券';
                const tokenNumber = token.token_number || token.tokenNumber || index;
                const amount = Number(token.amount || 0);
                const maturityDate = token.maturity_date || token.maturityDate;
                const redeemed = token.redeemed || token.is_redeemed || false;
                
                const isMatured = maturityDate && new Date(Number(maturityDate)) <= new Date();
                
                return (
                  <tr key={token.objectId || token.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">
                      <div>{bondName}</div>
                      <div className="text-xs text-gray-400">#{tokenNumber}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm text-green-600">
                      {(amount / 1000000000).toFixed(4)} SUI
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {maturityDate ? new Date(Number(maturityDate)).toLocaleDateString() : 'N/A'}
                      {isMatured && !redeemed && (
                        <div className="text-xs text-green-600 mt-1">✓ 可贖回</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${redeemed ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                        {redeemed ? '已贖回' : '持有中'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!redeemed && (
                        <button
                          onClick={() => {
                            setSelectedToken(token);
                            setIsRedeemModalOpen(true);
                          }}
                          disabled={!isMatured}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            isMatured
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isMatured ? '贖回' : '未到期'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <RedeemBondModal
        bondToken={selectedToken}
        isOpen={isRedeemModalOpen}
        onClose={() => {
          setIsRedeemModalOpen(false);
          setSelectedToken(null);
        }}
        onSuccess={() => {
          // Refresh will be handled by the polling in useOnChainBonds
          window.location.reload();
        }}
      />
    </>
  );
};

export default DashboardPage;
