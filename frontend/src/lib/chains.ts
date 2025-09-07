import { Chain } from 'viem';

export const kaiaTestnet = {
  id: 1001,
  name: 'Kaia Testnet (Kairos)',
  nativeCurrency: {
    decimals: 18,
    name: 'KAIA',
    symbol: 'KAIA',
  },
  rpcUrls: {
    default: {
      http: ['https://public-en-kairos.node.kaia.io'],
    },
    public: {
      http: ['https://public-en-kairos.node.kaia.io'],
    },
  },
  blockExplorers: {
    default: { name: 'Kaiascope Testnet', url: 'https://kairos.kaiascope.com' },
  },
  testnet: true,
} as const satisfies Chain;