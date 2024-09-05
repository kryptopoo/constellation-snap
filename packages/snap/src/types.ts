export type NetworkInfo = {
  id: string;
  beUrl?: string;
  lbUrl?: string;
  l0Url?: string;
  l1Url?: string;
  networkVersion?: string;
  testnet?: boolean;
};

export enum Networks {
  TestNet,
  MainNet,
  IntegrationNet,
}

export type WalletSnapState = {
  account: Account;
  config: Config;
};

export type Config = {
  network: string;
};

export type Account = {
  evmAddress: string;
  address: string;
};

export type Balance = {
  balance: string;
  balanceUsd: string;
  assets: Asset[];
};

export type Asset = {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  price: string;
  address?: string;
  decimals?: number;
  icon?: string;
};

export type Metagraph = {
  metagraphId: string;
  metagraphName: string;
  metagraphDescription: string;
  metagraphIcon: string;
  metagraphSymbol: string;
  metagraphSiteUrl: string;
  metagraphFeesWalletAddress: string;
  metagraphStakingWalletAddress: string;
  metagraphNodes: {
    l0: {
      url: string;
      nodes: number;
    };
    cl1: {
      url: string;
      nodes: number;
    };
    dl1: {
      url: string;
      nodes: number;
    };
  };
};
