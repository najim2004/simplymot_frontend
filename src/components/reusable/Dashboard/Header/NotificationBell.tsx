"use client";

import React, { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  useGetAdminNotificationsQuery,
  useGetAdminUnreadCountQuery,
  useAdminReadAllNotificationsMutation,
  useAdminReadNotificationMutation,
  useAdminDeleteAllNotificationsMutation,
  useAdminDeleteNotificationMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  useDeleteAllNotificationsMutation,
  useDeleteNotificationMutation,
} from "@/features/notifications";
import { useAppSelector } from "@/store/hooks";
import { formatDistanceToNow } from "date-fns";

export const NotificationBell: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.type === "ADMIN";

  const { data: adminNotifData, isLoading: loadingAdminNotifs } = useGetAdminNotificationsQuery(
    { page: 1, limit: 10 },
    { skip: !user || !isAdmin }
  );
  const { data: adminUnreadData } = useGetAdminUnreadCountQuery(undefined, { skip: !user || !isAdmin });
  const [adminReadAll] = useAdminReadAllNotificationsMutation();
  const [adminReadOne] = useAdminReadNotificationMutation();
  const [adminDeleteAll] = useAdminDeleteAllNotificationsMutation();
  const [adminDeleteOne] = useAdminDeleteNotificationMutation();

  const { data: gdNotifData, isLoading: loadingGdNotifs } = useGetNotificationsQuery(
    { page: 1, limit: 10 },
    { skip: !user || isAdmin }
  );
  const { data: gdUnreadData } = useGetUnreadCountQuery(undefined, { skip: !user || isAdmin });
  const [gdReadAll] = useReadAllNotificationsMutation();
  const [gdReadOne] = useReadNotificationMutation();
  const [gdDeleteAll] = useDeleteAllNotificationsMutation();
  const [gdDeleteOne] = useDeleteNotificationMutation();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const rawNotifications = isAdmin
    ? adminNotifData?.data?.notifications || adminNotifData?.data?.notificaitons || []
    : gdNotifData?.data?.notifications || gdNotifData?.data?.notificaitons || [];

  const unreadCount = isAdmin
    ? adminUnreadData?.data?.unread_count ?? 0
    : gdUnreadData?.data?.unread_count ?? 0;

  const isLoading = isAdmin ? loadingAdminNotifs : loadingGdNotifs;

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdmin) {
      await adminReadAll().unwrap();
    } else {
      await gdReadAll().unwrap();
    }
  };

  const handleItemClick = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdmin) {
      await adminReadOne(id).unwrap();
    } else {
      await gdReadOne(id).unwrap();
    }
  };

  const handleClearAll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    setTimeout(async () => {
      if (isAdmin) {
        await adminDeleteAll().unwrap();
      } else {
        await gdDeleteAll().unwrap();
      }
      setIsDeleting(false);
    }, 300);
  };

  const handleDeleteOne = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    setTimeout(async () => {
      if (isAdmin) {
        await adminDeleteOne(id).unwrap();
      } else {
        await gdDeleteOne(id).unwrap();
      }
      setDeletingId(null);
    }, 300);
  };

  const formatNotificationDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return new Date(dateString).toLocaleString();
    }
  };

  const getNotificationText = (notification: any) => {
    return notification?.notification_event?.text || notification?.message || "New notification";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full bg-[#14A228] text-white hover:bg-[#14A228]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-96 max-h-[500px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <span className="font-semibold text-base">Notifications</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#14A228] hover:text-[#0f7d1f] hover:bg-emerald-50 h-7 px-2 cursor-pointer"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </Button>
            )}
            {rawNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2 cursor-pointer flex items-center gap-1"
                onClick={handleClearAll}
                disabled={isDeleting}
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading notifications...</div>
        ) : rawNotifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No notifications</div>
        ) : (
          <div className={`space-y-1 ${isDeleting ? "opacity-30 transition-opacity duration-300" : ""}`}>
            {rawNotifications.map((notification: any) => {
              const isUnread = !notification.is_read;
              const isItemDeleting = deletingId === notification.id;

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-3 cursor-pointer relative group transition-all duration-300 ${
                    isUnread ? "bg-emerald-50/50" : "bg-transparent"
                  } ${isItemDeleting ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
                  onClick={(e) => handleItemClick(e, notification.id)}
                  onMouseEnter={() => setHoveredId(notification.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex items-start justify-between w-full gap-2">
                    <p
                      className={`text-sm font-medium leading-snug flex-1 ${
                        isUnread ? "text-gray-900 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {getNotificationText(notification)}
                    </p>

                    {hoveredId === notification.id && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteOne(e, notification.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer shrink-0"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between w-full mt-2 text-xs text-gray-500">
                    <span>{formatNotificationDate(notification.created_at)}</span>
                    {isUnread && (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#14A228]"></span>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
