import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DAppConnector,
  HederaJsonRpcMethod,
  HederaChainId,
  transactionToBase64String,
} from "@hashgraph/hedera-wallet-connect";
import {
  AccountId,
  LedgerId,
  TokenAssociateTransaction,
  TokenId,
  TransactionId,
  TransactionReceiptQuery,
  TransferTransaction,
} from "@hashgraph/sdk";

import { useAppKitAccount } from "@reown/appkit/react";
import { appkitMetadata } from "@/lib/config";
import { projectId } from "@/lib/config";
import { ParticipantsResponse, useCampaignParticipants } from "./useMyShops";
import { endCampaign } from "./useCampaigns";

export const TOKENDECIMALS = 100;
export const tokenId = "0.0.6883537";

export interface Participant {
  account_id: string;
  token_balance: number;
  user_id: string;
  user_topic_id: string;
}

export function useAssociate(tokenId: string | undefined) {
  const { address } = useAppKitAccount();

  const { mutate: associate, isPending } = useMutation({
    mutationFn: async () => await associateToken(tokenId, address),
    onSuccess: () => {
      toast.success("Token associated successfully");
    },
    onError: () => {
      toast.error("Failed to associate token");
    },
  });

  return {
    associate,
    isPending,
  };
}

export async function associateToken(
  tokenId: string | undefined,
  accountId: string | undefined
) {
  if (!tokenId) {
    toast.error("Token ID is required");
    return;
  }
  if (!accountId) {
    toast.error("Account ID is required");
    return;
  }

  const dAppConnector = new DAppConnector(
    appkitMetadata,
    LedgerId.TESTNET,
    projectId,
    Object.values(HederaJsonRpcMethod),
    [],
    [HederaChainId.Testnet]
  );

  await dAppConnector.init();

  await dAppConnector.openModal();

  const signer = dAppConnector.getSigner(AccountId.fromString(accountId));
  const transactionId = TransactionId.generate(accountId);
  const associateTx = new TokenAssociateTransaction()
    .setTransactionId(transactionId)
    .setAccountId(AccountId.fromString(accountId))
    .setTokenIds([TokenId.fromString(tokenId)]);

  const result = await dAppConnector.signAndExecuteTransaction({
    signerAccountId: accountId,
    transactionList: transactionToBase64String(associateTx),
  });
  console.log("Associate Result:", result);
  const receiptQuery = new TransactionReceiptQuery().setTransactionId(
    transactionId
  );
  const receipt = await receiptQuery.executeWithSigner(signer);
  const status = receipt.status;

  return status;
}

export function useAirdropTokens(campaignId: string, accountId: string | null) {
  const { data } = useCampaignParticipants(campaignId);
  let totalAirDropAmount = 0;
  if (data && accountId) {
    totalAirDropAmount = data?.campaign.distributed
      ? data?.campaign.distributed / data?.participants.length / 10
      : 0;
  }

  const {
    mutate: airdropTokens,
    isPending,
    data: airdropData,
    isSuccess,
  } = useMutation({
    mutationFn: () => {
      if (!data || !accountId) {
        throw new Error("Missing data or account ID");
      }
      return airDropTokens(data.participants, accountId, totalAirDropAmount);
    },
    onSuccess: async (data) => {
      toast.success("Tokens airdropped successfully");
      console.log("data:", data);
      await endCampaign(campaignId);
      toast.success("Campaign ended successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to airdrop tokens");
      console.log(error);
    },
  });

  return {
    airdropTokens,
    isPending,
    airdropData,
    isSuccess,
  };
}

export async function airDropTokens(
  participants: Participant[],
  accountId: string,
  airdropAmount: number
): Promise<string> {
  if (participants.length === 0) {
    toast.error("No participants found");
    return "No participants found";
  }
  if (airdropAmount <= 0) {
    toast.error("Airdrop amount must be greater than 0");
    return "Airdrop amount must be greater than 0";
  }

  console.log("airdropAmount:", airdropAmount);
  console.log("participants:", participants);
  console.log("accountId:", accountId);
  console.log("tokenId:", tokenId);

  const dAppConnector = new DAppConnector(
    appkitMetadata,
    LedgerId.TESTNET,
    projectId,
    Object.values(HederaJsonRpcMethod),
    [],
    [HederaChainId.Testnet]
  );

  await dAppConnector.init();

  await dAppConnector.openModal();

  const signer = dAppConnector.getSigner(AccountId.fromString(accountId));
  const transactionId = TransactionId.generate(accountId);
  const airdropTx = new TransferTransaction();
  participants.forEach((participant) => {
    airdropTx.addTokenTransfer(
      TokenId.fromString(tokenId),
      AccountId.fromString(accountId),
      -airdropAmount * (participant.token_balance / 10) * TOKENDECIMALS
    );
    airdropTx.addTokenTransfer(
      TokenId.fromString(tokenId),
      AccountId.fromString(participant.account_id),
      airdropAmount * (participant.token_balance / 10) * TOKENDECIMALS
    );
  });

  const result = await dAppConnector.signAndExecuteTransaction({
    signerAccountId: accountId,
    transactionList: transactionToBase64String(airdropTx),
  });

  console.log("Airdrop Result:", result);

  const receiptQuery = new TransactionReceiptQuery().setTransactionId(
    transactionId
  );
  const receipt = await receiptQuery.executeWithSigner(signer);
  const status = receipt.status;

  return status.toString();
}

export const formatAccountId = (accountId: string) => {
  if (!accountId || accountId === "") return "";
  const a = accountId.split(" ");
  const valid = a[1].slice(1, a[1].length - 1);
  return valid;
};
