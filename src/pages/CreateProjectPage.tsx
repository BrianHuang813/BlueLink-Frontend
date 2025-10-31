import React, { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { CreateBondForm } from '../types';

const CreateProjectPage: React.FC = () => {
  const [form, setForm] = useState<CreateBondForm>({
    issuer_name: '',
    bond_name: '',
    bond_image_url: '',
    token_image_url: '',
    total_amount: 0,
    annual_interest_rate: 0,
    maturity_date: '',
    metadata_url: '',
  });
  const [creating, setCreating] = useState(false);

  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: ['total_amount', 'annual_interest_rate'].includes(name) 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAccount || !form.bond_name || !form.issuer_name || form.total_amount <= 0) {
      return;
    }

    setCreating(true);
    try {
      const totalAmountMist = Math.floor(form.total_amount * 1000000000); // Convert SUI to MIST
      const maturityTimestamp = new Date(form.maturity_date).getTime(); // Convert to timestamp
      
      const tx = new Transaction();
      
      // =======================================================================
      // TODO: 將 '0x0' 替換為真實 Package ID
      // 例如: target: '0x123abc...def::blue_link::create_bond_project'
      // =======================================================================
      tx.moveCall({
        target: '0x0::blue_link::create_bond_project', // Replace with actual package address
        arguments: [
          tx.pure.string(form.issuer_name),
          tx.pure.string(form.bond_name),
          tx.pure.string(form.bond_image_url || ''),
          tx.pure.string(form.token_image_url || ''),
          tx.pure.u64(totalAmountMist),
          tx.pure.u64(form.annual_interest_rate),
          tx.pure.u64(maturityTimestamp),
          tx.pure.string(form.metadata_url || ''),
          tx.object('0x6'), // Clock object
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result: any) => {
            console.log('Bond project created successfully:', result);
            alert('債券項目建立成功！');
            setForm({
              issuer_name: '',
              bond_name: '',
              bond_image_url: '',
              token_image_url: '',
              total_amount: 0,
              annual_interest_rate: 0,
              maturity_date: '',
              metadata_url: '',
            });
          },
          onError: (error: any) => {
            console.error('Bond project creation failed:', error);
            alert('債券項目建立失敗，請重試');
          }
        }
      );
    } catch (err) {
      console.error('Error creating bond project transaction:', err);
      alert('建立交易失敗，請重試');
    } finally {
      setCreating(false);
    }
  };

  if (!currentAccount) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">
            需要連接錢包
          </h2>
          <p className="text-yellow-700 mb-4">
            請先連接您的 Sui 錢包以建立項目
          </p>
          <p className="text-sm text-yellow-600">
            連接錢包後，您可以建立自己的永續發展項目並開始募款
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            建立新藍色債券
          </h1>
          <p className="text-gray-600">
            在 BlueLink 平台上發布您的藍色債券項目
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="issuer_name" className="block text-sm font-medium text-gray-700 mb-2">
              發行機構名稱 *
            </label>
            <input
              type="text"
              id="issuer_name"
              name="issuer_name"
              value={form.issuer_name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入發行機構名稱"
            />
          </div>

          <div>
            <label htmlFor="bond_name" className="block text-sm font-medium text-gray-700 mb-2">
              債券名稱 *
            </label>
            <input
              type="text"
              id="bond_name"
              name="bond_name"
              value={form.bond_name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入您的債券名稱"
            />
          </div>

          <div>
            <label htmlFor="bond_image_url" className="block text-sm font-medium text-gray-700 mb-2">
              債券圖片 URL
            </label>
            <input
              type="url"
              id="bond_image_url"
              name="bond_image_url"
              value={form.bond_image_url}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/bond-image.jpg"
            />
          </div>

          <div>
            <label htmlFor="token_image_url" className="block text-sm font-medium text-gray-700 mb-2">
              NFT 代幣圖片 URL
            </label>
            <input
              type="url"
              id="token_image_url"
              name="token_image_url"
              value={form.token_image_url}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/token-image.jpg"
            />
          </div>

          <div>
            <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700 mb-2">
              募集總額 (SUI) *
            </label>
            <input
              type="number"
              id="total_amount"
              name="total_amount"
              value={form.total_amount || ''}
              onChange={handleInputChange}
              required
              min="1"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入募集總額"
            />
          </div>

          <div>
            <label htmlFor="annual_interest_rate" className="block text-sm font-medium text-gray-700 mb-2">
              年利率 (%) *
            </label>
            <input
              type="number"
              id="annual_interest_rate"
              name="annual_interest_rate"
              value={form.annual_interest_rate || ''}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：5.00 代表 5%"
            />
            <p className="text-sm text-gray-500 mt-1">
              輸入百分比值，例如 5 代表 5% 年利率
            </p>
          </div>

          <div>
            <label htmlFor="maturity_date" className="block text-sm font-medium text-gray-700 mb-2">
              到期日 *
            </label>
            <input
              type="date"
              id="maturity_date"
              name="maturity_date"
              value={form.maturity_date}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="metadata_url" className="block text-sm font-medium text-gray-700 mb-2">
              完整元數據 URL (Arweave)
            </label>
            <input
              type="url"
              id="metadata_url"
              name="metadata_url"
              value={form.metadata_url}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://arweave.net/..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">📋 建立須知</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 債券建立後基本資訊無法修改</li>
              <li>• 所有資金流向都會在區塊鏈上公開記錄</li>
              <li>• 您可以提取已募集的資金</li>
              <li>• 投資者將收到債券 NFT 作為憑證</li>
              <li>• 到期時需存入本金+利息以供贖回</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={creating || !form.bond_name || !form.issuer_name || form.total_amount <= 0 || !form.maturity_date}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? '正在建立債券...' : '建立債券'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <strong>目前的錢包地址：</strong>
            <div className="font-mono text-xs mt-1 break-all">
              {currentAccount.address}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
