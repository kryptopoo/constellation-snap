import type { OnHomePageHandler, OnInstallHandler, OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { Box, Text, Bold, Heading, Copyable, Row, Address } from '@metamask/snaps-sdk/jsx';

import {
  getWallet,
  getBalance,
  transferDag,
  transferToken,
  updateWallet,
  createWallet,
  connectNetwork,
  login,
  getMetagraph,
} from './constellation';
import { WalletSnapState } from './types';
import { capitalize } from './utils';
import { dag4 } from '@stardust-collective/dag4';

// configuration
dag4.di.useFetchHttpClient(fetch);

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  let wallet: WalletSnapState | null;
  const { network, address } = request?.params as { network: string; address: string };

  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Text>1</Text>
              <Text>
                Hello, <Bold>{origin}</Bold>!
              </Text>
              <Text>This custom confirmation is just for display purposes.</Text>
              <Text>But you can edit the snap source code to make it do something, if you want to!</Text>
            </Box>
          ),
        },
      });

    case 'changeNetwork':
      wallet = await getWallet();
      if (wallet === null) throw new Error('Wallet not found');

      wallet.config.network = network;
      await updateWallet(wallet);
      return wallet;

    case 'createWallet':
      wallet = await createWallet(network);
      return wallet;

    case 'getWallet':
      wallet = await getWallet();
      return wallet;

    case 'getBalance':
      const balance = await getBalance(network);
      return balance;

    case 'transfer':
      wallet = await getWallet();
      if (wallet === null) throw new Error('Wallet not found');

      const { toAddress, amount, fee, metagraphId } = request?.params as {
        toAddress: string;
        amount: string;
        fee: string;
        metagraphId: string;
      };

      const metagraph = getMetagraph(wallet.config.network, metagraphId);
      const symbol = metagraph ? metagraph.metagraphSymbol : 'DAG';

      const confirm = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Heading>Do you want to transfer?</Heading>
              <Row label="Network:">
                <Text>{capitalize(wallet.config.network)}</Text>
              </Row>
              <Row label="Sender:">
                <Text>{wallet.account.address}</Text>
              </Row>
              <Row label="Receipient:">
                <Text>{toAddress}</Text>
              </Row>
              <Row label="Amount:">
                <Text>
                  {amount} {symbol}
                </Text>
              </Row>
              <Row label="Fee:">
                <Text>
                  {fee} {symbol}
                </Text>
              </Row>
            </Box>
          ),
        },
      });

      if (confirm === true) {
        if (metagraph) {
          const tokenTx = await transferToken(metagraphId, toAddress, amount, fee);
          return tokenTx;
        } else {
          const dagTx = await transferDag(toAddress, amount, fee);
          return dagTx;
        }
      }

      return null;

    default:
      throw new Error('Method not found.');
  }
};

export const onInstall: OnInstallHandler = async () => {
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: (
        <Box>
          <Text>Your MetaMask wallet is now compatible with Constellation!</Text>
        </Box>
      ),
    },
  });
};

export const onHomePage: OnHomePageHandler = async () => {
  return {
    content: (
      <Box>
        <Heading>Hello frens!</Heading>
        <Text>Welcome to my Constellation Snap home page!</Text>
      </Box>
    ),
  };
};
