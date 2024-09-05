import type { FunctionComponent, ReactNode } from 'react';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Footer, Header } from './components';
import { GlobalStyle } from './config/theme';
import { ToggleThemeContext } from './Root';
import { ColorSchemeScript, createTheme, MantineProvider, useMantineTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Container } from '@mantine/core';
import '@mantine/core/styles.css';
import { WalletContext } from './hooks';
import { WalletSnapState } from './types/snap';

const theme = createTheme({
  /** Put your mantine theme override here */
  fontSizes: {
    xs: '0.75rem',
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
    xl: '1.75rem',
  },
  primaryColor: 'violet',
  // cursorType: "pointer"
});

export type AppProps = {
  children: ReactNode;
};

export const App: FunctionComponent<AppProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletSnapState | null>(null);

  return (
    <>
      <ColorSchemeScript defaultColorScheme="dark" />
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications />
        <WalletContext.Provider value={{ wallet, setWallet }}>
          <Container fluid>
            <Header />

            {children}
            <Footer />
          </Container>
        </WalletContext.Provider>
      </MantineProvider>
    </>
  );
};
