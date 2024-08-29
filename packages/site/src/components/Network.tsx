import { useEffect, useState } from 'react';
import { Menu, Button, Text, rem } from '@mantine/core';
import { IconCaretDown, IconChevronDown } from '@tabler/icons-react';
import { useInvokeSnap, useWalletContext } from '../hooks';
import { WalletSnapState } from '../types/snap';
import { setLocalStorage } from '../utils';

export const Network = () => {
  const [networkName, setNetworkName] = useState<string | undefined>('integrationnet');
  const { wallet, setWallet } = useWalletContext();
  const invokeSnap = useInvokeSnap();

  const changeNetwork = async (network: string) => {
    const wallet = (await invokeSnap({
      method: 'changeNetwork',
      params: {
        network: network.toLowerCase(),
      },
    })) as WalletSnapState;

    console.log('wallet', wallet);
    setNetworkName(wallet.config.network);

    setLocalStorage('wallet', JSON.stringify(wallet));
    setWallet(wallet as WalletSnapState);
  };

  useEffect(() => {
    if (wallet) {
      setNetworkName(wallet.config.network);
    }
  }, [wallet?.config.network]);

  return (
    <Menu shadow="md" width={250} position="bottom-end">
      <Menu.Target>
        <Button justify="space-between" rightSection={<IconCaretDown size={16} />} variant="transparent" color="white">
          <Text size="sm" tt="capitalize">
            {networkName}
          </Text>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Network</Menu.Label>
        <Menu.Item onClick={() => changeNetwork('Mainnet')}>Mainnet</Menu.Item>
        <Menu.Item onClick={() => changeNetwork('IntegrationNet')}>IntegrationNet</Menu.Item>
        <Menu.Item onClick={() => changeNetwork('Testnet')}>Testnet</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
