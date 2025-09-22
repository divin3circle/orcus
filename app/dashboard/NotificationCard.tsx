import React from "react";
import { Notification } from "@/hooks/useNotifications";

function NotificationCard({ notification }: { notification: Notification }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-foreground/5 transition-all duration-300">
      <div className="flex items-center gap-2">
        <img
          src={notification.image}
          alt={notification.title}
          className="size-10 rounded-full"
        />
        <div className="flex flex-col items-start">
          <p className="text-sm font-semibold">{notification.title}</p>
          <p className="text-xs text-foreground/80">
            {notification.description}
          </p>
        </div>
      </div>
      <p className="text-xs text-foreground/80">3 hours ago</p>
    </div>
  );
}

export default NotificationCard;
