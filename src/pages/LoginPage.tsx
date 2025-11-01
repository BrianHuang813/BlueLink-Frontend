import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, useSignPersonalMessage, ConnectButton } from '@mysten/dapp-kit';
import { getAuthChallenge, verifySignature } from '../lib/api';

type UserRole = 'buyer' | 'issuer';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signMessage } = useSignPersonalMessage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');

  const handleLogin = async () => {
    if (!currentAccount?.address) {
      setError('請先連接錢包');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: 取得挑戰訊息
      console.log('Getting auth challenge...');
      const challenge = await getAuthChallenge(currentAccount.address);
      console.log('Challenge received:', challenge);

      // Step 2: 簽署挑戰訊息
      console.log('Signing message...');
      const signResult = await signMessage({
        message: new TextEncoder().encode(challenge.message),
      });
      console.log('Message signed');

      // Step 3: 驗證簽名並建立 Session（包含角色）
      console.log('Verifying signature with role:', selectedRole);
      await verifySignature(
        currentAccount.address,
        signResult.signature,
        challenge.nonce,
        selectedRole
      );
      console.log('Signature verified, session created');

      // Step 4: 儲存使用者資料到 localStorage
      const user = {
        wallet_address: currentAccount.address,
        role: selectedRole,
        logged_in_at: new Date().toISOString(),
      };
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User data saved to localStorage:', user);

      // 觸發自定義事件通知 Header 更新
      window.dispatchEvent(new Event('userLoggedIn'));
      console.log('Dispatched userLoggedIn event');

      // Step 5: 導向主頁
      console.log('Redirecting to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : '登入失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            歡迎來到 BlueLink
          </h1>
          <p className="text-gray-600">
            使用您的 Sui 錢包登入
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {!currentAccount ? (
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                請先連接您的 Sui 錢包
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
              <div className="text-sm text-gray-500 mt-4">
                提示：確保已安裝 Sui 錢包擴充套件
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>已連接錢包：</strong>
                </p>
                <p className="text-xs text-gray-600 font-mono break-all">
                  {currentAccount.address}
                </p>
              </div>

              {/* 角色選擇 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  選擇您的身份
                </label>
                <div className="space-y-3">
                  <div
                    onClick={() => setSelectedRole('buyer')}
                    className={`
                      relative border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${selectedRole === 'buyer' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name="role"
                          value="buyer"
                          checked={selectedRole === 'buyer'}
                          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900">投資者 (Buyer)</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          購買債券、參與項目投資、獲取收益
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedRole('issuer')}
                    className={`
                      relative border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${selectedRole === 'issuer' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                      }
                    `}
                  >
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="radio"
                          name="role"
                          value="issuer"
                          checked={selectedRole === 'issuer'}
                          onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900">發行者 (Issuer)</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          發行債券、籌集資金、管理項目
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-2">
                  首次登入時選擇的身份將無法更改，請謹慎選擇
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 
                         disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors
                         font-semibold"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    登入中...
                  </span>
                ) : (
                  '簽署訊息並登入'
                )}
              </button>

              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>點擊後會要求您簽署一個訊息以驗證身份</p>
                <p>這不會花費任何 Gas 費用</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
