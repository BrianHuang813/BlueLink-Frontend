/**
 * CreateBondPage
 * Page for issuers to create new bond projects
 */

import React, { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { CreateBondForm } from '../types';
import { suiToMist } from '../lib/utils';
import { parseTransactionError } from '../lib/sui';
import { useNavigate } from 'react-router-dom';

const CreateBondPage: React.FC = () => {
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
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'total_amount' || name === 'annual_interest_rate'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentAccount) {
      alert('請先連接錢包');
      return;
    }

    // Validation
    if (
      !form.issuer_name ||
      !form.bond_name ||
      !form.bond_image_url ||
      !form.token_image_url ||
      form.total_amount <= 0 ||
      form.annual_interest_rate <= 0 ||
      !form.maturity_date ||
      !form.metadata_url
    ) {
      alert('請填寫所有必填欄位');
      return;
    }

    // Check maturity date is in the future
    const maturityDateObj = new Date(form.maturity_date);
    if (maturityDateObj <= new Date()) {
      alert('到期日必須是未來的日期');
      return;
    }

    setCreating(true);

    try {
      // Convert values
      const totalAmountMist = suiToMist(form.total_amount);
      const annualInterestRateBps = Math.floor(form.annual_interest_rate * 100); // Convert percentage to basis points
      const maturityDateMs = maturityDateObj.getTime();

      const tx = new Transaction();

      // Call create_bond_project
      tx.moveCall({
        target: `${import.meta.env.VITE_SUI_PACKAGE_ID}::blue_link::create_bond_project`,
        arguments: [
          tx.pure.string(form.issuer_name),
          tx.pure.string(form.bond_name),
          tx.pure.string(form.bond_image_url),
          tx.pure.string(form.token_image_url),
          tx.pure.u64(totalAmountMist),
          tx.pure.u64(annualInterestRateBps),
          tx.pure.u64(maturityDateMs),
          tx.pure.string(form.metadata_url),
          tx.object('0x6'), // Clock object
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('Bond created successfully:', result);
            alert('債券項目建立成功！');
            // Reset form
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
            // Navigate to bonds page
            navigate('/bonds');
          },
          onError: (error) => {
            console.error('Bond creation failed:', error);
            const { message } = parseTransactionError(error);
            alert(`債券建立失敗: ${message}`);
          },
          onSettled: () => {
            setCreating(false);
          },
        }
      );
    } catch (err) {
      console.error('Error creating bond transaction:', err);
      alert('建立交易失敗，請重試');
      setCreating(false);
    }
  };

  if (!currentAccount) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">需要連接錢包</h2>
          <p className="text-yellow-700 mb-4">
            請先連接您的 Sui 錢包以建立債券項目
          </p>
          <p className="text-sm text-yellow-600">
            連接錢包後，您可以發行債券並開始募資
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">建立債券項目</h1>
          <p className="text-gray-600">
            發行債券為您的海洋保育或藍色經濟項目募資
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issuer Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">發行方資訊</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                發行方名稱 *
              </label>
              <input
                type="text"
                name="issuer_name"
                value={form.issuer_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：海洋保育基金會"
              />
            </div>
          </div>

          {/* Bond Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-900 mb-4">債券詳情</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  債券名稱 *
                </label>
                <input
                  type="text"
                  name="bond_name"
                  value={form.bond_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如：藍色海洋債券 2024"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    募資總額 (SUI) *
                  </label>
                  <input
                    type="number"
                    name="total_amount"
                    value={form.total_amount || ''}
                    onChange={handleInputChange}
                    required
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年利率 (%) *
                  </label>
                  <input
                    type="number"
                    name="annual_interest_rate"
                    value={form.annual_interest_rate || ''}
                    onChange={handleInputChange}
                    required
                    min="0.01"
                    max="100"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    例如：5.00 表示 5% 年利率
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  到期日 *
                </label>
                <input
                  type="date"
                  name="maturity_date"
                  value={form.maturity_date}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Media URLs */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-900 mb-4">
              圖片與元數據
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  債券專案圖片 URL *
                </label>
                <input
                  type="url"
                  name="bond_image_url"
                  value={form.bond_image_url}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/bond-image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  此圖片將顯示在債券市場頁面
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  代幣 NFT 圖片 URL *
                </label>
                <input
                  type="url"
                  name="token_image_url"
                  value={form.token_image_url}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/token-image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  此圖片將顯示在投資者的債券代幣 NFT 上
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  元數據 URL (Arweave) *
                </label>
                <input
                  type="url"
                  name="metadata_url"
                  value={form.metadata_url}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://arweave.net/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  存儲在 Arweave 上的完整項目元數據 JSON 文件
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              📋 發行須知
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 債券建立後部分資訊無法修改，請仔細確認</li>
              <li>• 募資成功後，您可以提取募集的資金</li>
              <li>• 到期前需要存入足夠的贖回資金（本金+利息）</li>
              <li>• 投資者到期後可以贖回本金和利息</li>
              <li>• 所有交易記錄都會在區塊鏈上公開</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/bonds')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {creating ? '建立中...' : '建立債券項目'}
            </button>
          </div>
        </form>

        {/* Debug Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <strong>目前錢包地址：</strong>
            <div className="font-mono text-xs mt-1 break-all">
              {currentAccount.address}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBondPage;
