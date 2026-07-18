"use client";

import { type ReactNode, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/chain";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <CartProvider>{children}</CartProvider>
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
