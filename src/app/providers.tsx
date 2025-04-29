// app/providers.tsx (CLIENT COMPONENT)
"use client";

import { SessionProvider } from "next-auth/react";
import { ChakraBaseProvider } from "@chakra-ui/react";
import customTheme from "./theme/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChakraBaseProvider theme={customTheme}>
        {children}
      </ChakraBaseProvider>
    </SessionProvider>
  );
}