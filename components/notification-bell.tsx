"use client";

import { useState, useEffect } from "react";
import {
  subscribeToNotifications,
  markAllAsRead,
  clearNotifications,
  getUnreadCount,
  type DivifyNotification,
} from "@/lib/notification-store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Trash2, ArrowUpRight } from "lucide-react";

const iconMap: Record<string, string> = {
  settlement: "🎉",
  payment: "💸",
  expense: "📊",
  info: "ℹ️",
  error: "❌",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<DivifyNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToNotifications(setNotifications);
    return unsub;
  }, []);

  const unread = getUnreadCount();

  const handleOpen = (v: boolean) => {
    setOpen(v);
    if (v && unread > 0) {
      // Mark all read after a short delay so badge updates feel deliberate
      setTimeout(() => markAllAsRead(), 800);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
          id="notification-bell-btn"
          aria-label={`Notifications${unread > 0 ? ` — ${unread} unread` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-stellar-teal text-[9px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">Notifications</p>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={markAllAsRead}
                  title="Mark all read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={clearNotifications}
                  title="Clear all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
              <Bell className="h-6 w-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                No notifications yet. Settle an expense to see alerts here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors ${
                  !n.read ? "bg-stellar-teal/5" : ""
                }`}
              >
                <span className="text-base shrink-0 mt-0.5">
                  {iconMap[n.type] ?? "🔔"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {n.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground/60">
                      {timeAgo(n.timestamp)}
                    </span>
                    {n.txHash && (
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${n.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-0.5 text-[10px] text-stellar-teal hover:underline"
                      >
                        View TX <ArrowUpRight className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
                {!n.read && (
                  <div className="h-2 w-2 rounded-full bg-stellar-teal shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
