import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { notifyBackendAboutTransaction } from '../lib/sui';

interface CreateBondForm {
  issuerName: string;
  bondName: string;
  bondImageUrl: string;
  tokenImageUrl: string;
  totalAmount: number;
  annualInterestRate: number;
  maturityDate: string;
  metadataUrl: string;
}

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateBondForm>({
    issuerName: '',
    bondName: '',
    bondImageUrl: '',
    tokenImageUrl: '',
    totalAmount: 0,
    annualInterestRate: 0,
    maturityDate: '',
    metadataUrl: '',
  });
  const [creating, setCreating] = useState(false);

  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'totalAmount' || name === 'annualInterestRate' 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (
      !currentAccount ||
      !form.issuerName ||
      !form.bondName ||
      form.totalAmount <= 0 ||
      form.annualInterestRate <= 0 ||
      !form.maturityDate
    ) {
      alert('請填寫所有必填欄位');
      return;
    }

    setCreating(true);
    try {
      // Convert inputs to contract format
      const totalAmountMist = form.totalAmount * 1000000000; // Convert SUI to MIST
      const interestRateBasisPoints = Math.round(form.annualInterestRate * 100); // Convert percentage to basis points
      const maturityTimestamp = new Date(form.maturityDate).getTime(); // Convert to Unix timestamp in ms

      // Validation
      if (maturityTimestamp <= Date.now()) {
        alert('到期日必須在未來');
        setCreating(false);
        return;
      }

      const txb = new Transaction();
      
      // Call create_bond_project function
      txb.moveCall({
        target: `${import.meta.env.VITE_SUI_PACKAGE_ID}::blue_link::create_bond_project`,
        arguments: [
          txb.pure.string(form.issuerName),
          txb.pure.string(form.bondName),
          txb.pure.string(form.bondImageUrl || ''),
          txb.pure.string(form.tokenImageUrl || ''),
          txb.pure.u64(totalAmountMist),
          txb.pure.u64(interestRateBasisPoints),
          txb.pure.u64(maturityTimestamp),
          txb.pure.string(form.metadataUrl || ''),
          txb.object('0x6'), // Clock object ID
        ],
      });

      signAndExecute(
        { transaction: txb },
        {
          onSuccess: async (result: any) => {
            console.log('Bond project created successfully:', result);
            console.log('Transaction digest:', result.digest);
            
            // Notify backend to index this transaction
            try {
              await notifyBackendAboutTransaction(result.digest, 'bond_created');
              console.log('Backend notified successfully');
            } catch (err) {
              console.warn('Failed to notify backend, but transaction succeeded:', err);
            }
            
            // Show success message
            alert(
              '債券專案創建成功！\n\n' +
              '交易已提交到區塊鏈。\n' +
              '數據將從鏈上直接顯示。\n' +
              '即將跳轉到您的儀表板...'
            );
            
            // Clear form
            setForm({
              issuerName: '',
              bondName: '',
              bondImageUrl: '',
              tokenImageUrl: '',
              totalAmount: 0,
              annualInterestRate: 0,
              maturityDate: '',
              metadataUrl: '',
            });
            
            // Navigate to dashboard
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          },
          onError: (error: any) => {
            console.error('Bond creation failed:', error);
            alert('債券專案創建失敗，請重試');
          }
        }
      );
    } catch (err) {
      console.error('Error creating bond transaction:', err);
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
            請先連接您的 Sui 錢包以創建債券專案
          </p>
          <p className="text-sm text-yellow-600">
            連接錢包後，您可以發行自己的債券專案並開始融資
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
            創建債券專案
          </h1>
          <p className="text-gray-600">
            在 BlueLink 平台上發行您的債券專案
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="issuerName" className="block text-sm font-medium text-gray-700 mb-2">
              發行機構名稱 *
            </label>
            <input
              type="text"
              id="issuerName"
              name="issuerName"
              value={form.issuerName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入發行機構名稱"
            />
          </div>

          <div>
            <label htmlFor="bondName" className="block text-sm font-medium text-gray-700 mb-2">
              債券名稱 *
            </label>
            <input
              type="text"
              id="bondName"
              name="bondName"
              value={form.bondName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入債券名稱"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bondImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                債券圖片 URL
              </label>
              <input
                type="url"
                id="bondImageUrl"
                name="bondImageUrl"
                value={form.bondImageUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div>
              <label htmlFor="tokenImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                代幣圖片 URL
              </label>
              <input
                type="url"
                id="tokenImageUrl"
                name="tokenImageUrl"
                value={form.tokenImageUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-2">
              總發行金額 (SUI) *
            </label>
            <input
              type="number"
              id="totalAmount"
              name="totalAmount"
              value={form.totalAmount || ''}
              onChange={handleInputChange}
              required
              min="1"
              step="0.1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="輸入總發行金額"
            />
            <p className="text-sm text-gray-500 mt-1">
              設定債券的總發行金額，以 SUI 代幣計算
            </p>
          </div>

          <div>
            <label htmlFor="annualInterestRate" className="block text-sm font-medium text-gray-700 mb-2">
              年化利率 (%) *
            </label>
            <input
              type="number"
              id="annualInterestRate"
              name="annualInterestRate"
              value={form.annualInterestRate || ''}
              onChange={handleInputChange}
              required
              min="0.01"
              max="100"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如: 5.5"
            />
            <p className="text-sm text-gray-500 mt-1">
              設定債券的年化利率，例如 5.5 代表 5.5%
            </p>
          </div>

          <div>
            <label htmlFor="maturityDate" className="block text-sm font-medium text-gray-700 mb-2">
              到期日 *
            </label>
            <input
              type="date"
              id="maturityDate"
              name="maturityDate"
              value={form.maturityDate}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              設定債券的到期日期
            </p>
          </div>

          <div>
            <label htmlFor="metadataUrl" className="block text-sm font-medium text-gray-700 mb-2">
              元數據 URL
            </label>
            <input
              type="url"
              id="metadataUrl"
              name="metadataUrl"
              value={form.metadataUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
            <p className="text-sm text-gray-500 mt-1">
              可選：債券的額外元數據 URL
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">📋 創建須知</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 債券創建後基本資訊將無法修改</li>
              <li>• 所有交易都會在區塊鏈上公開記錄</li>
              <li>• 投資者購買後將獲得 NFT 代幣憑證</li>
              <li>• 到期後投資者可贖回本金及利息</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={
              creating ||
              !form.issuerName ||
              !form.bondName ||
              form.totalAmount <= 0 ||
              form.annualInterestRate <= 0 ||
              !form.maturityDate
            }
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? '正在創建債券專案...' : '創建債券專案'}
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
