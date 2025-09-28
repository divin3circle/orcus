import React from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Wallet, LogOut } from "lucide-react";

function ConnectButton() {
  const { isConnected, accountId, isLoading, connect, disconnect } =
    useWallet();

  if (isLoading) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (isConnected && accountId) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">Connected: {accountId}</span>
        <button
          onClick={disconnect}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 flex items-center gap-1"
        >
          <LogOut className="w-3 h-3" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}

export default ConnectButton;
