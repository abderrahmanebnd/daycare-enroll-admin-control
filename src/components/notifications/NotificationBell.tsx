import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notificationService } from "@/services/notificationService";
import { Notification } from "@/types";
import { io, Socket } from "socket.io-client";

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Setup socket connection
      const socketIo = io("http://localhost:3000", {
        withCredentials: true,
      });

      socketIo.on("connect", () => {
        // Register this user to the backend socket
        socketIo.emit("register", user.id);
      });

      // Listen for real-time notifications
      socketIo.on("notification", (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      setSocket(socketIo);

      // Cleanup on unmount
      return () => {
        socketIo.disconnect();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userNotifications =
        await notificationService.getNotificationsByUserId();
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await notificationService.markAsRead(notification.id);
      setNotifications((notifications) =>
        notifications.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
    }

    navigate("/notifications");
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user!.id);
      setNotifications((notifications) =>
        notifications.map((n) => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-daycare-accent text-daycare-dark text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                  !notification.read ? "bg-muted/20" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  {!notification.read && (
                    <span className="bg-daycare-primary w-2 h-2 rounded-full mt-1.5"></span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {notification.content}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(notification.createdAt).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            ))
          )}
        </div>
        {notifications.length > 5 && (
          <div className="p-3 text-center border-t">
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/notifications")}
            >
              Voir toutes les notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
