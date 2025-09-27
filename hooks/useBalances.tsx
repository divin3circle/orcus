import { useQuery } from "@tanstack/react-query";
import { useMerchant } from "./useMerchant";

const MIRROR_NODE_BASE_URL = "https://testnet.mirrornode.hedera.com/api/v1/";
const KSH_TOKEN_ID = "0.0.6883537";

export interface Token {
  automatic_association: boolean;
  balance: number;
  created_timestamp: string;
  decimals: number;
  freeze_status: "UNFROZEN" | "FROZEN";
  kyc_status: "NOT_APPLICABLE" | "GRANTED" | "REVOKED";
  token_id: string;
}

export interface Tokens extends Array<Token> {}

export const useBalances = () => {
  const { data: merchant } = useMerchant();

  const { data, isLoading, error } = useQuery({
    queryKey: ["balances"],
    queryFn: () => getBalances(merchant?.account_id),
    enabled: !!merchant?.account_id,
  });

  return { data, isLoading, error };
};

async function getBalances(accountId: string | undefined): Promise<Tokens> {
  if (!accountId) {
    throw new Error("Merchant ID is required");
  }
  const response = await fetch(
    `${MIRROR_NODE_BASE_URL}accounts/${accountId}/tokens`
  );
  const data = await response.json();
  return data.tokens;
}

export const useKESTBalance = () => {
  const { data: merchant } = useMerchant();
  const { data: tokens } = useBalances();
  const { data: kshBalance } = useQuery({
    queryKey: ["kshBalance"],
    queryFn: () => getKESTBalance(tokens),
  });
  return { data: kshBalance };
};

async function getKESTBalance(tokens: Tokens | undefined): Promise<number> {
  if (!tokens) {
    throw new Error("Tokens not found");
  }
  const kshToken = tokens.find((token) => token.token_id === KSH_TOKEN_ID);
  if (!kshToken) {
    throw new Error("KES token not found");
  }
  return kshToken.balance;
}

export const formatBalance = (balance: number | undefined) => {
  if (!balance) {
    return "0.00";
  }
  return (balance / 10 ** 2).toFixed(2).toLocaleString();
};
