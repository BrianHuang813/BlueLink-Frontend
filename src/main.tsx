import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { queryClient } from './services/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import '@mysten/dapp-kit/dist/index.css';
import { Config } from './lib/config';

const networkName = Config.SUI_NETWORK || 'devnet';
const rpcUrl = Config.SUI_RPC_URL || 'https://fullnode.devnet.sui.io:443';

const { networkConfig } = createNetworkConfig({
  [networkName]: { url: rpcUrl },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={networkName as any}>
        <WalletProvider>
          <App />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
