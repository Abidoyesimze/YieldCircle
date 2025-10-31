'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { kaiaTestnet } from '../../lib/chains';
import { http } from 'viem';

// Create a client
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.reown.com
const projectId = 'a69043ecf4dca5c34a5e70fdfeac4558';

// 2. Set up Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [kaiaTestnet],
  ssr: true,
  transports: {
    [kaiaTestnet.id]: http(),
  },
});

// 3. Create AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: [kaiaTestnet],
  projectId,
  metadata: {
    name: 'YieldCircle',
    description: 'Transform your traditional savings circles into DeFi-powered investment groups',
    url: 'https://yield-circle.vercel.app',
    icons: ['https://yield-circle.vercel.app/favicon.ico']
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#14b8a6',
    '--w3m-border-radius-master': '6px',
  },
  features: {
    analytics: true,
    email: false,
    socials: [],
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}