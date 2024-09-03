import { useDisclosure } from '@mantine/hooks';
import { Container, Stack, LoadingOverlay, Button } from '@mantine/core';
import { PortfolioHeader, PortfolioAssets, OnboardingModal } from '../components';
import { defaultSnapOrigin } from '../config';
import { useMetaMask, useInvokeSnap, useMetaMaskContext, useRequestSnap } from '../hooks';
import { getLocalStorage, isLocalSnap, setLocalStorage, shouldDisplayReconnectButton } from '../utils';
import { useEffect, useState } from 'react';
import { Balance, Asset, WalletSnapState } from 'src/types/snap';
import { useWalletContext } from '../hooks/WalletContext';

const Index = () => {
  const { error } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const invokeSnap = useInvokeSnap();

  const [balance, setBalance] = useState('0');
  const [balanceUsd, setBalanceUsd] = useState('0');
  const [assets, setAssets] = useState<Asset[]>([]);
  const { wallet, setWallet } = useWalletContext();
  const [loading, setLoading] = useState(false);

  const loadBalanceAndAssets = async () => {
    try {
      const address = wallet?.account.address;
      if (address) {
        const snapRes = (await invokeSnap({
          method: 'getBalance',
          params: {
            network: wallet?.config.network,
            address: wallet?.account.address,
          },
        })) as Balance;

        console.log('loadBalanceAndAssets', snapRes);
        setBalance(snapRes.balance);
        setBalanceUsd(snapRes.balanceUsd);
        setAssets(snapRes.assets);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin) ? isFlask : snapsDetected;
  const onboardDone = Boolean(getLocalStorage('onboard-done'));

  useEffect(() => {
    if (onboardDone) {
      if (isMetaMaskReady && installedSnap) {
        const walletStore = getLocalStorage('wallet');
        if (walletStore && !wallet) {
          // reload wallet
          setWallet(JSON.parse(walletStore) as WalletSnapState);
        }

        setTimeout(() => {
          setLoading(true);
          loadBalanceAndAssets().then((rs) => {
            setLoading(false);
          });
        }, 500);
      }
    }
  }, [isMetaMaskReady, installedSnap, wallet?.config.network]);

  useEffect(() => {
    if (onboardDone && isMetaMaskReady && installedSnap) {
      setInterval(() => {
        console.log('interval loadBalanceAndAssets');
        loadBalanceAndAssets();
      }, 4000);
    }
  }, ['']);

  // useEffect(() => {
  //   const walletStore = getLocalStorage('wallet');
  //   if (isMetaMaskReady && installedSnap) {
  //     if (!walletStore) {
  //       invokeSnap({ method: 'getWallet' }).then((wallet) => {
  //         console.log('invokeSnap getWallet', wallet);

  //         if (wallet) {
  //           setLocalStorage('wallet', JSON.stringify(wallet));
  //           setWallet(wallet as WalletSnapState);
  //         }
  //       });
  //     } else {
  //       console.log('setWallet walletStore', walletStore);
  //       setWallet(JSON.parse(walletStore) as WalletSnapState);
  //     }
  //   }
  // }, [isMetaMaskReady, installedSnap]);

  // useEffect(() => {
  //   const walletStore = getLocalStorage('wallet');
  //   if (isMetaMaskReady && installedSnap && walletStore) {
  //     setWallet(JSON.parse(walletStore) as WalletSnapState);

  //     loadBalanceAndAssets();
  //   }
  // }, [isMetaMaskReady, installedSnap]);

  useEffect(() => {
    if (wallet) {
      setLocalStorage('wallet', JSON.stringify(wallet));
      setWallet(wallet as WalletSnapState);
    }
  }, [wallet]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     const walletStore = getLocalStorage('wallet');
  //     if (!walletStore) {
  //       console.log('invokeSnap getWallet');
  //       invokeSnap({ method: 'getWallet' }).then((wallet) => {
  //         setWallet(wallet as WalletSnapState);
  //         setLocalStorage('wallet', JSON.stringify(wallet));

  //         console.log('setWallet', wallet);
  //       });
  //     } else {
  //       console.log('setWallet walletStore');
  //       setWallet(JSON.parse(walletStore) as WalletSnapState);
  //     }
  //     console.log('walletStore', walletStore);
  //   }, 10000);
  // }, []);

  // useEffect(() => {
  //   setLocalStorage('wallet', JSON.stringify(wallet));
  // }, [wallet]);

  const [onboardModalOpened, { open: openOnboardModal, close: closeOnboardModal }] = useDisclosure(false);
  useEffect(() => {
    if (!onboardDone) openOnboardModal();
  }, [onboardDone]);

  return (
    <Container size="lg">
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: 'md', blur: 2 }}
        loaderProps={{ type: 'bars' }}
      />
{/* 
      <Button onClick={() => requestSnap()}>Reconnect</Button>
      <Button onClick={() => loadBalanceAndAssets()}>Balance</Button> */}

      <OnboardingModal
        opened={onboardModalOpened}
        close={() => {
          closeOnboardModal();
          setTimeout(() => {
            setLoading(true);
            loadBalanceAndAssets().then((rs) => {
              setLoading(false);
            });
          }, 200);
        }}
      ></OnboardingModal>

      <Stack align="stretch" justify="flex-start" gap="md">
        <PortfolioHeader
          balance={balance}
          balanceUsd={balanceUsd}
          address={wallet?.account.address || ''}
        ></PortfolioHeader>
        <PortfolioAssets assets={assets}></PortfolioAssets>
      </Stack>
    </Container>
  );
};

export default Index;
