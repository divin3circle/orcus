import React from "react";
import { Notification } from "@/hooks/useNotifications";

function NotificationCard({ notification }: { notification: Notification }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-foreground/5 transition-all duration-300">
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-start">
          <p className="text-sm font-semibold capitalize">
            {notification.type}
          </p>
          <p className="text-xs text-foreground/80">
            {notification.message_content}
          </p>
        </div>
      </div>
      <p className="text-xs text-foreground/80">
        {new Date(notification.timestamp * 1000).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </p>
    </div>
  );
}

export default NotificationCard;
