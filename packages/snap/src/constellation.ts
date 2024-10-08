import { dag4 } from '@stardust-collective/dag4';
import { MetagraphNetworkInfo } from '@stardust-collective/dag4-network';
import { transferByNetwork } from './dag4js';
import { Account, Asset, Balance, Config, Metagraph, NetworkInfo, Networks, WalletSnapState } from './types';
import { SnapState } from './state';
import { convertUnitsToToken } from './utils';

const CONSTELLATION_PROXY = 'https://constellation-snap-api.glitch.me';
const metagraphsData = require('./metagraphs.json');

// configuration
dag4.di.useFetchHttpClient(fetch);

export async function getCurrentMetamaskAccount(): Promise<string> {
  const accounts = (await ethereum.request({
    method: 'eth_requestAccounts',
  })) as string[];
  return accounts[0] ?? '';
}

export function connectNetwork(networkName: string) {
  switch (networkName.toLowerCase()) {
    case 'testnet':
      dag4.account.connect({
        networkVersion: '2.0',
        testnet: true,
      });
      break;
    case 'mainnet':
      dag4.account.connect({
        networkVersion: '2.0',
        testnet: false,
      });
      break;
    case 'integrationnet':
      dag4.account.connect(
        {
          id: 'integration2',
          networkVersion: '2.0',
          beUrl: 'https://be-integrationnet.constellationnetwork.io',
          l0Url: 'https://l0-lb-integrationnet.constellationnetwork.io',
          l1Url: 'https://l1-lb-integrationnet.constellationnetwork.io',
        },
        false,
      );
      break;

    default:
      break;
  }

  let dag4NetworkInfo = dag4.network.getNetwork();

  return {
    id: dag4NetworkInfo.id,
    beUrl: dag4NetworkInfo.beUrl,
    l0Url: dag4NetworkInfo.l0Url,
    l1Url: dag4NetworkInfo.l1Url,
    lbUrl: dag4NetworkInfo.lbUrl,
    testnet: dag4NetworkInfo.testnet,

    name: networkName,
  } as NetworkInfo;
}

export async function login(evmAddress: string) {
  const entropy = await snap.request({
    method: 'snap_getEntropy',
    params: {
      version: 1,
      salt: evmAddress,
    },
  });
  const pk = entropy.substring(2);
  dag4.account.loginPrivateKey(pk);
}

export async function getWallet() {
  const wallet = await SnapState.getState();
  return wallet;
}

export async function createWallet(network: string = 'integrationnet') {
  let wallet = await getWallet();
  if (wallet === null) {
    const evmAddress = await getCurrentMetamaskAccount();
    await login(evmAddress);

    // create wallet state
    wallet = {
      account: { evmAddress, address: dag4.account.address },
      config: {
        network: network,
      },
    } as WalletSnapState;
    await SnapState.updateState(wallet);
  }

  return wallet;
}

export async function updateWallet(wallet: WalletSnapState) {
  return await SnapState.updateState(wallet);
}

export async function getBalance(network: string): Promise<Balance> {
  const res = {
    balance: '0',
    balanceUsd: '0',
    assets: [],
  } as Balance;

  const wallet = await getWallet();
  if (wallet) {
    connectNetwork(network);

    let balance = await _getAddressBalance(wallet.account.address);
    const dagPrice = await getDAGPrice();

    const assets: Asset[] = [
      {
        id: 'dag',
        name: 'Constellation',
        symbol: 'DAG',
        icon: 'https://stargazer-assets.s3.us-east-2.amazonaws.com/logos/dag.png',
        price: dagPrice.toString(),
        amount: convertUnitsToToken(balance.toString()),
      },
    ];

    // const metagraphs = await getMetagraphs(wallet.config.network);
    const metagraphs = metagraphsData[network];
    for (let i = 0; i < metagraphs.length; i++) {
      const metagraph = metagraphs[i] as Metagraph;
      if (metagraph) {
        // get token balance
        let tokenBalance = '0';
        if (metagraph.metagraphNodes.l0.url && metagraph.metagraphNodes.cl1.url) {
          tokenBalance = await _getTokenBalance(
            wallet.config.network,
            wallet.account.address,
            metagraph.metagraphId,
            metagraph.metagraphNodes.l0.url,
            metagraph.metagraphNodes.cl1.url,
          );
        }

        assets.push({
          id: metagraph.metagraphId,
          name: metagraph.metagraphName,
          symbol: metagraph.metagraphSymbol,
          icon: metagraph.metagraphIcon,
          amount: tokenBalance,
          price: '0',
        });
      }
    }

    // TODO: need to calculate total balance
    res.balance = convertUnitsToToken(balance.toString());
    res.balanceUsd = (dagPrice * Number(res.balance)).toString();
    res.assets = assets;
  }

  return res;
}

export async function transferDag(toAddress: string, amount: string, fee: string) {
  const wallet = await getWallet();
  if (wallet) {
    connectNetwork(wallet.config.network);

    const pk = await getPrivateKey();
    dag4.account.loginPrivateKey(pk);

    const pendingTx = await transferByNetwork(dag4.network, toAddress, Number(amount), Number(fee));
    return pendingTx;
  }

  return null;
}

export async function transferToken(metagraphId: string, toAddress: string, amount: string, fee: string) {
  const wallet = await getWallet();
  if (wallet) {
    connectNetwork(wallet.config.network);

    const pk = await getPrivateKey();
    dag4.account.loginPrivateKey(pk);

    const metagraphClient = createMetagraphClient(wallet.config.network, metagraphId);

    const pendingTx = await transferByNetwork(metagraphClient.networkInstance, toAddress, Number(amount), Number(fee));
    return pendingTx;
  }

  return null;
}

export async function getPrivateKey() {
  const evmAddress = await getCurrentMetamaskAccount();

  const entropy = await snap.request({
    method: 'snap_getEntropy',
    params: {
      version: 1,
      salt: evmAddress,
    },
  });

  const pk = entropy.substring(2);
  return pk;
}

export function getMetagraph(network: string, metagraphId: string) {
  const metagraph = (metagraphsData[network] as Metagraph[]).find((m) => m.metagraphId == metagraphId);
  return metagraph;
}

function createMetagraphClient(network: string, metagraphId: string) {
  const l0Url = `${CONSTELLATION_PROXY}/metagraph/${network}/l0.url/${metagraphId}`;
  const l1Url = `${CONSTELLATION_PROXY}/metagraph/${network}/cl1.url/${metagraphId}`;
  const metagraphClient = dag4.account.createMetagraphTokenClient({
    l0Url: l0Url,
    l1Url: l1Url,
  } as MetagraphNetworkInfo);

  return metagraphClient;
}

async function _getTokenBalance(network: string, address: string, metagraphId: string, l0Url: string, l1Url: string) {
  try {
    const metagraphClient = createMetagraphClient(network, metagraphId);
    const res = await metagraphClient.getBalanceFor(address);
    return res.toString() || '0';
  } catch (error) {
    return '0';
  }
}

async function _getAddressBalance(address: string) {
  let balance = '0';

  try {
    const getAddressBalanceRes = await dag4.network.getAddressBalance(address);
    balance = getAddressBalanceRes.balance.toString();
  } catch (error) {
    try {
      // try to get from api
      const addrBalanceRes = await fetch(`${dag4.network.config().beUrl}/addresses/${address}/balance`);
      const addrBalanceData = await addrBalanceRes.json();
      balance = addrBalanceData.data.balance;
    } catch (error) {}
  }

  return balance;
}

async function getDAGPrice() {
  const url = `${CONSTELLATION_PROXY}/price?cmcId=2868`;
  const res = await fetch(url);
  if (res.status !== 200) {
    throw new Error(`Status ${res.status}`);
  }

  const data = await res.json();
  return data?.quote.USD.price || 0;
}
