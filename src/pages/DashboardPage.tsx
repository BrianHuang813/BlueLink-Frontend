import React, { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Link } from 'react-router-dom';
import { bondService, bondTokenService } from '../services/api';
import { Bond, BondToken } from '../types';

const DashboardPage: React.FC = () => {
  const [view, setView] = useState<'issuer' | 'investor'>('issuer');

  const [issuedBonds, setIssuedBonds] = useState<Bond[]>([]);
  const [ownedTokens, setOwnedTokens] = useState<BondToken[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentAccount = useCurrentAccount();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentAccount) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [allBonds, tokensData] = await Promise.all([
          bondService.getAllBonds(),
          bondTokenService.getBondTokensByOwner(currentAccount.address)
        ]);
        
        const userBonds = allBonds.filter(b => b.issuer_address === currentAccount.address);
        setIssuedBonds(userBonds);
        setOwnedTokens(tokensData);

      } catch (err) {
        setError('無法載入儀表板數據');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentAccount]);

  // Loading and Wallet Connection states
  if (!currentAccount) {
    return (
      <div className="max-w-4xl mx-auto text-center bg-yellow-50 border border-yellow-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-yellow-800 mb-2">請先連接錢包</h2>
        <p className="text-yellow-700">連接錢包後，您可以在此查看您發行的債券和持有的債券代幣。</p>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">我的儀表板</h1>

      {/* View Switcher */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => setView('issuer')}
              className={`px-3 py-2 font-medium text-sm rounded-t-md ${view === 'issuer' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              我發行的債券 ({issuedBonds.length})
            </button>
            <button
              onClick={() => setView('investor')}
              className={`px-3 py-2 font-medium text-sm rounded-t-md ${view === 'investor' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              我持有的債券代幣 ({ownedTokens.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Conditional Rendering based on view */}
      {view === 'issuer' ? <IssuerDashboard bonds={issuedBonds} /> : <InvestorDashboard tokens={ownedTokens} />}
    
      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
        <strong>錢包地址：</strong>
        <div className="font-mono text-xs mt-1 break-all">{currentAccount.address}</div>
      </div>
    </div>
  );
};

// Issuer View Component
const IssuerDashboard: React.FC<{ bonds: Bond[] }> = ({ bonds }) => {
  if (bonds.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">您尚未發行任何債券</h3>
        <Link to="/create" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block mt-4">
          發行第一個債券
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b"><h2 className="text-xl font-semibold">我發行的債券</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {bonds.map(b => <IssuerBondCard key={b.on_chain_id} bond={b} />)}
      </div>
    </div>
  );
};

// Investor View Component
const InvestorDashboard: React.FC<{ tokens: BondToken[] }> = ({ tokens }) => {
  if (tokens.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">還沒有持有任何債券代幣</h3>
        <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block mt-4">
          探索債券
        </Link>
      </div>
    );
  }

  const totalInvested = tokens.reduce((sum, t) => sum + (t.amount / 1000000000), 0);
  const activeTokens = tokens.filter(t => !t.is_redeemed).length;

  return (
    <>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center"><div className="text-3xl mr-4">💰</div><div>
              <div className="text-2xl font-bold text-blue-600">{totalInvested.toFixed(2)} SUI</div>
              <div className="text-sm text-gray-600">總投資金額</div></div></div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center"><div className="text-3xl mr-4">🎫</div><div>
              <div className="text-2xl font-bold text-green-600">{tokens.length}</div>
              <div className="text-sm text-gray-600">持有的債券代幣</div></div></div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center"><div className="text-3xl mr-4">✅</div><div>
              <div className="text-2xl font-bold text-purple-600">{activeTokens}</div>
              <div className="text-sm text-gray-600">未贖回代幣</div></div></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b"><h2 className="text-xl font-semibold">債券代幣列表</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">代幣 ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">債券名稱</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">投資金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">年利率</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">到期日</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">狀態</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tokens.map((t) => (
                <tr key={t.on_chain_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">{t.on_chain_id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm">{t.bond_name}</td>
                  <td className="px-6 py-4 font-bold text-sm text-blue-600">{(t.amount / 1000000000).toFixed(4)} SUI</td>
                  <td className="px-6 py-4 text-sm">{(t.annual_interest_rate / 100).toFixed(2)}%</td>
                  <td className="px-6 py-4 text-sm">{new Date(t.maturity_date).toLocaleDateString('zh-TW')}</td>
                  <td className="px-6 py-4">
                    {t.is_redeemed ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">已贖回</span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">持有中</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// Simple card for the issued bonds list
const IssuerBondCard: React.FC<{ bond: Bond }> = ({ bond }) => {
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  const totalAmount = bond.total_amount / 1000000000;
  const amountRaised = bond.amount_raised / 1000000000;
  const progress = totalAmount > 0 ? (amountRaised / totalAmount) * 100 : 0;
  const raisedFunds = bond.raised_funds_balance / 1000000000;
  const redemptionPool = bond.redemption_pool_balance / 1000000000;

  const handleWithdraw = () => {
    if (raisedFunds <= 0) {
      alert("沒有可提取的資金。");
      return;
    }
    
    setIsWithdrawing(true);
    
    const tx = new Transaction();
    const amountToWithdraw = Math.floor(raisedFunds * 1000000000); // Convert to MIST
    
    // =======================================================================
    // TODO: 將 '0x0' 替換為真實 Package ID
    // 例如: target: '0x123abc...def::blue_link::withdraw_raised_funds'
    // =======================================================================
    tx.moveCall({
      target: '0x0::blue_link::withdraw_raised_funds', // Replace with actual package address
      arguments: [
        tx.object(bond.on_chain_id),
        tx.pure.u64(amountToWithdraw),
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result: any) => {
          console.log('Withdraw successful:', result);
          alert('資金提取成功！頁面將會刷新以更新數據。');
          window.location.reload();
        },
        onError: (error: any) => {
          console.error('Withdraw failed:', error);
          alert('資金提取失敗，請重試。');
        },
        onSettled: () => {
          setIsWithdrawing(false);
        }
      }
    );
  };

  const handlePauseResume = () => {
    setIsPausing(true);
    
    const tx = new Transaction();
    
    // =======================================================================
    // TODO: 將 '0x0' 替換為真實 Package ID
    // =======================================================================
    tx.moveCall({
      target: bond.active ? '0x0::blue_link::pause_sale' : '0x0::blue_link::resume_sale',
      arguments: [
        tx.object(bond.on_chain_id),
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result: any) => {
          console.log('Pause/Resume successful:', result);
          alert(bond.active ? '已暫停銷售' : '已恢復銷售');
          window.location.reload();
        },
        onError: (error: any) => {
          console.error('Pause/Resume failed:', error);
          alert('操作失敗，請重試。');
        },
        onSettled: () => {
          setIsPausing(false);
        }
      }
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="font-bold truncate">{bond.bond_name}</h4>
      <p className="text-xs text-gray-500 font-mono mb-3">ID: {bond.on_chain_id.substring(0, 12)}...</p>
      <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
        <div>
          <span className="text-gray-600">年利率：</span>
          <span className="font-bold">{(bond.annual_interest_rate / 100).toFixed(2)}%</span>
        </div>
        <div>
          <span className="text-gray-600">代幣數：</span>
          <span className="font-bold">{bond.tokens_issued}</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
      </div>
      <p className="text-xs text-right mb-2">{progress.toFixed(1)}% ({amountRaised.toFixed(2)} / {totalAmount.toFixed(2)} SUI)</p>
      <div className="text-xs space-y-1 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-600">募集資金池：</span>
          <span className="font-bold text-green-600">{raisedFunds.toFixed(2)} SUI</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">贖回資金池：</span>
          <span className="font-bold text-purple-600">{redemptionPool.toFixed(2)} SUI</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">狀態：</span>
          <span className={`font-bold ${bond.active ? 'text-green-600' : 'text-gray-600'}`}>
            {bond.active ? '募集中' : '已暫停'}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <Link to={`/project/${bond.id}`} className="w-full text-center bg-white border border-gray-300 text-sm px-3 py-1 rounded-md hover:bg-gray-100 block">查看詳情</Link>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleWithdraw}
            disabled={isWithdrawing || raisedFunds === 0} 
            className="text-center bg-blue-500 text-white text-xs px-2 py-1 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isWithdrawing ? '處理中...' : '提取資金'}
          </button>
          <button 
            onClick={handlePauseResume}
            disabled={isPausing} 
            className="text-center bg-yellow-500 text-white text-xs px-2 py-1 rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPausing ? '處理中...' : (bond.active ? '暫停' : '恢復')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
