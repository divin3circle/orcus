import { mockNotifications } from "@/mocks";
import { useMerchant } from "@/hooks/useMerchant";
import { useQuery } from "@tanstack/react-query";

const BASE_TOPIC_URL = "https://testnet.mirrornode.hedera.com/api/v1/topics/";

export interface Notification {
  type: string;
  message_content: string;
  timestamp: number;
  consensus_timestamp?: string;
}

export interface TopicMessage {
  consensus_timestamp: string;
  message: string;
  payer_account_id: string;
  running_hash: string;
  running_hash_version: number;
  sequence_number: number;
  topic_id: string;
  chunk_info?: {
    initial_transaction_id: {
      account_id: string;
      nonce: number;
      scheduled: boolean;
      transaction_valid_start: string;
    };
    number: number;
    total: number;
  };
}

export const useNotifications = () => {
  const { data: merchant } = useMerchant();
  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications", merchant?.topic_id],
    queryFn: () => getNotifications(merchant?.topic_id),
    enabled: !!merchant?.topic_id,
  });

  return { data, isLoading, error };
};

async function getNotifications(
  topicID: string | undefined
): Promise<Notification[]> {
  if (!topicID) {
    throw new Error("Topic ID is undefined: at getNotifications");
  }

  const response = await fetch(`${BASE_TOPIC_URL}${topicID}/messages`);
  const data = await response.json();

  if (!data.messages || !Array.isArray(data.messages)) {
    return [];
  }

  // Decode and parse each message
  const notifications: Notification[] = data.messages
    .map((topicMessage: TopicMessage) => {
      try {
        // Decode base64 message
        const decodedMessage = atob(topicMessage.message);
        // Parse JSON
        const notification: Notification = JSON.parse(decodedMessage);
        // Keep the original timestamp from the message body (this is the actual event time)
        // Optionally store consensus timestamp for reference
        notification.consensus_timestamp = topicMessage.consensus_timestamp;
        return notification;
      } catch (error) {
        console.error("Error decoding notification message:", error);
        return null;
      }
    })
    .filter(
      (notification: Notification | null): notification is Notification =>
        notification !== null
    );

  return notifications;
}
