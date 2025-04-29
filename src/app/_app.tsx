// pages/_app.tsx
import { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from "next-auth/react"; 

import customTheme from './theme/theme'; // or wherever your theme.ts is

function MyApp({ Component, pageProps }: AppProps) {
  return (
  <SessionProvider session = {pageProps.session}>
    <ChakraProvider theme={customTheme}>
      <Component {...pageProps} />
    </ChakraProvider>
  </SessionProvider>
  );
}

export default MyApp;
