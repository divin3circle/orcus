import type { AppKitNetwork } from "@reown/appkit/networks";
import type { CustomCaipNetwork } from "@reown/appkit-common";
import { UniversalConnector } from "@reown/appkit-universal-connector";

export const projectId = "9409b8057a42f3eb54993c57fdfe8358"; // this is a public projectId only to use on localhost

if (!projectId) {
  throw new Error("Project ID is not defined");
}

const hederaTestnet: CustomCaipNetwork<"hedera"> = {
  id: 295,
  chainNamespace: "hedera",
  caipNetworkId: "hedera:testnet",
  name: "Hedera",
  nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 8 },
  rpcUrls: { default: { http: ["https://testnet.hashio.ai/api/v1/hedera"] } },
};

export const networks = [hederaTestnet] as [AppKitNetwork, ...AppKitNetwork[]];

export async function getUniversalConnector() {
  const universalConnector = await UniversalConnector.init({
    projectId,
    metadata: {
      name: "Universal Connector",
      description: "Universal Connector",
      url: "https://appkit.reown.com",
      icons: ["https://appkit.reown.com/icon.png"],
    },
    networks: [
      {
        methods: ["hedera_signTransaction"],
        chains: [hederaTestnet as CustomCaipNetwork],
        events: [],
        namespace: "hedera",
      },
    ],
  });

  return universalConnector;
}
