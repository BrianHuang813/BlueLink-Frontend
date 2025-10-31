import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { bondService } from '../services/api';
import { Bond } from '../types';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bond, setBond] = useState<Bond | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [purchasing, setPurchasing] = useState(false);

  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  useEffect(() => {
    const fetchBond = async () => {
      if (!id) return;
      
      try {
        const bondData = await bondService.getBond(id);
        setBond(bondData);
      } catch (err) {
        setError('無法載入債券詳情');
        console.error('Error fetching bond:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBond();
  }, [id]);

  const handlePurchase = async () => {
    if (!bond || !currentAccount || !purchaseAmount) return;

    setPurchasing(true);
    try {
      const amount = parseFloat(purchaseAmount) * 1000000000; // Convert SUI to MIST
      
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [amount]);
      
      // =======================================================================
      // TODO: 將 '0x0' 替換部署後的真實 Package ID
      // 例如: target: '0x123abc...def::blue_link::buy_bond_rwa_tokens'
      // =======================================================================
      tx.moveCall({
        target: '0x0::blue_link::buy_bond_rwa_tokens', // Replace with actual package address
        arguments: [
          tx.object(bond.on_chain_id),
          coin,
          tx.object('0x6'), // Clock object
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('Purchase successful:', result);
            setPurchaseAmount('');
            // Refresh bond data
            window.location.reload();
          },
          onError: (error: any) => {
            console.error('Purchase failed:', error);
            alert('購買失敗，請重試');
          }
        }
      );
    } catch (err) {
      console.error('Error creating purchase transaction:', err);
      alert('建立交易失敗，請重試');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">正在載入債券詳情...</div>
      </div>
    );
  }

  if (error || !bond) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-red-600 text-lg">{error || '債券不存在'}</div>
      </div>
    );
  }

  const totalAmount = bond.total_amount / 1000000000;
  const amountRaised = bond.amount_raised / 1000000000;
  const progressPercentage = totalAmount > 0 ? (amountRaised / totalAmount) * 100 : 0;
  const interestRate = (bond.annual_interest_rate / 100).toFixed(2); // Convert basis points to percentage

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {bond.bond_image_url && (
          <img src={bond.bond_image_url} alt={bond.bond_name} className="w-full h-64 object-cover" />
        )}
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{bond.bond_name}</h1>
              <p className="text-gray-600 mt-1">發行機構：{bond.issuer_name}</p>
            </div>
            <div className="text-sm text-gray-500">
              債券 ID: {bond.on_chain_id.substring(0, 8)}...
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">年利率</div>
              <div className="text-2xl font-bold text-blue-600">{interestRate}%</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">到期日</div>
              <div className="text-lg font-bold text-green-600">
                {new Date(bond.maturity_date).toLocaleDateString('zh-TW')}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">發行日</div>
              <div className="text-lg font-bold text-purple-600">
                {new Date(bond.issue_date).toLocaleDateString('zh-TW')}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">狀態</div>
              <div className="text-lg font-bold text-yellow-600">
                {bond.active ? '募集中' : '已結束'}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">募集進度</h2>
              <span className="text-lg font-bold text-blue-600">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {amountRaised.toFixed(2)} SUI
                </div>
                <div className="text-sm text-gray-600">已募集</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {totalAmount.toFixed(2)} SUI
                </div>
                <div className="text-sm text-gray-600">募集總額</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bond.tokens_issued}
                </div>
                <div className="text-sm text-gray-600">已發行代幣</div>
              </div>
            </div>
          </div>

          {currentAccount && bond.active ? (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">購買債券</h3>
              <div className="flex space-x-4">
                <input
                  type="number"
                  placeholder="輸入購買金額 (SUI)"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                  min="0.1"
                />
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || !purchaseAmount || parseFloat(purchaseAmount) <= 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? '處理中...' : '購買'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                最少購買 0.1 SUI。您將獲得債券 NFT 代幣作為憑證。
              </p>
              <p className="text-sm text-blue-600 mt-1">
                💰 到期時可獲得本金 + {interestRate}% 年利率的利息
              </p>
            </div>
          ) : !currentAccount ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 mb-4">請連接錢包以購買債券</p>
              <div className="text-sm text-yellow-700">
                連接錢包後，您可以直接在此頁面購買債券
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">此債券已停止募集</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-2">發行機構</h3>
            <div className="text-sm text-gray-600">
              <p className="font-semibold">{bond.issuer_name}</p>
              <p className="font-mono text-xs mt-1">{bond.issuer_address}</p>
            </div>
          </div>

          {bond.metadata_url && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a 
                href={bond.metadata_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                📄 查看完整元數據
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
