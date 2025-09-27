"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getUniversalConnector } from "@/lib/config";
import { UniversalConnector } from "@reown/appkit-universal-connector";

interface WalletContextType {
  universalConnector: UniversalConnector | undefined;
  isConnected: boolean;
  accountId: string | null;
  isLoading: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Helper function to get Hedera account ID from public key
async function getHederaAccountId(publicKey: string): Promise<string | null> {
  try {
    const url = `https://testnet.mirrornode.hedera.com/api/v1/accounts?account.publickey=${publicKey}&balance=false&limit=1&order=desc`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.accounts && data.accounts.length > 0) {
      return data.accounts[0].account;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch Hedera account ID:", error);
    return null;
  }
}

// Helper function to format account info with Hedera account ID
async function getAccountInfo(session: any): Promise<string | null> {
  if (!session) return null;

  const alias = session.sessionProperties?.alias;
  const publicKey = session.sessionProperties?.publicKey;

  if (alias && publicKey) {
    const accountId = await getHederaAccountId(publicKey);
    if (accountId) {
      return `${alias} (${accountId})`;
    }
    // Fallback to just alias if we can't get account ID
    return alias;
  }

  // Fallback to just alias or accounts[0]
  return alias || session.accounts?.[0] || null;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [universalConnector, setUniversalConnector] =
    useState<UniversalConnector>();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    const initializeConnector = async () => {
      try {
        setIsLoading(true);
        const connector = await getUniversalConnector();
        setUniversalConnector(connector);

        // Listen for connection events
        connector.provider.on("session_event", async (event: any) => {
          if (event.params?.event === "connect") {
            setIsConnected(true);
            const accountInfo = await getAccountInfo(event.session);
            setAccountId(accountInfo);
          } else if (event.params?.event === "disconnect") {
            setIsConnected(false);
            setAccountId(null);
          }
        });

        // Also listen for session update events
        connector.provider.on("session_update", async (event: any) => {
          if (event.params?.accounts) {
            setIsConnected(true);
            const accountInfo = await getAccountInfo(event.session);
            setAccountId(accountInfo);
          }
        });

        // Listen for connect events
        connector.provider.on("connect", async (event: any) => {
          setIsConnected(true);
          const accountInfo = await getAccountInfo(event.session);
          setAccountId(accountInfo);
        });

        // Listen for disconnect events
        connector.provider.on("disconnect", (event: any) => {
          setIsConnected(false);
          setAccountId(null);
        });

        // Check if already connected
        if (connector.provider.session) {
          setIsConnected(true);
          getAccountInfo(connector.provider.session).then(setAccountId);
        }

        // Add a periodic check for session updates (fallback)
        const sessionCheckInterval = setInterval(async () => {
          if (connector.provider.session && !isConnected) {
            setIsConnected(true);
            const accountInfo = await getAccountInfo(
              connector.provider.session
            );
            setAccountId(accountInfo);
          }
        }, 1000);

        // Cleanup interval when component unmounts
        return () => {
          clearInterval(sessionCheckInterval);
        };
      } catch (error) {
        console.error("Failed to initialize wallet connector:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeConnector();
  }, []);

  const connect = async () => {
    if (!universalConnector) {
      return;
    }
    try {
      const { session } = await universalConnector.connect();
      setIsConnected(true);
      const accountInfo = await getAccountInfo(session);
      setAccountId(accountInfo);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const disconnect = async () => {
    if (!universalConnector) {
      return;
    }
    try {
      await universalConnector.disconnect();
      setIsConnected(false);
      setAccountId(null);
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  const value: WalletContextType = {
    universalConnector,
    isConnected,
    accountId,
    isLoading,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
