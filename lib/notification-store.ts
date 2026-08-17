/**
 * notification-store.ts — In-app notification and settlement alert system
 *
 * Provides a lightweight pub-sub notification store for real-time
 * settlement alerts. Addresses user feedback #1 Rahul:
 * "Add push notifications when someone settles their split."
 */

export type NotificationType = "settlement" | "payment" | "expense" | "info" | "error";

export interface DivifyNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  txHash?: string;
  timestamp: string;
  read: boolean;
}

type NotificationListener = (notifications: DivifyNotification[]) => void;

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------
let notifications: DivifyNotification[] = [];
const listeners = new Set<NotificationListener>();

function notify() {
  const snapshot = [...notifications];
  listeners.forEach((fn) => fn(snapshot));
}

function generateId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Add a new notification to the store.
 */
export function addNotification(params: {
  type: NotificationType;
  title: string;
  message: string;
  txHash?: string;
}): DivifyNotification {
  const notif: DivifyNotification = {
    id: generateId(),
    type: params.type,
    title: params.title,
    message: params.message,
    txHash: params.txHash,
    timestamp: new Date().toISOString(),
    read: false,
  };
  notifications = [notif, ...notifications].slice(0, 50); // keep last 50
  notify();
  return notif;
}

/**
 * Add a settlement-specific notification.
 * Use this when an expense split is settled on-chain.
 */
export function addSettlementAlert(params: {
  description: string;
  amountXLM: string;
  participants: number;
  txHash?: string;
}): DivifyNotification {
  return addNotification({
    type: "settlement",
    title: "Expense Settled! 🎉",
    message: `"${params.description}" — ${params.amountXLM} XLM split across ${params.participants} participant${params.participants !== 1 ? "s" : ""}.`,
    txHash: params.txHash,
  });
}

/**
 * Mark a notification as read.
 */
export function markAsRead(id: string): void {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  notify();
}

/**
 * Mark all notifications as read.
 */
export function markAllAsRead(): void {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  notify();
}

/**
 * Clear all notifications.
 */
export function clearNotifications(): void {
  notifications = [];
  notify();
}

/**
 * Get current notifications snapshot.
 */
export function getNotifications(): DivifyNotification[] {
  return [...notifications];
}

/**
 * Get unread notification count.
 */
export function getUnreadCount(): number {
  return notifications.filter((n) => !n.read).length;
}

/**
 * Subscribe to notification changes. Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  listener: NotificationListener
): () => void {
  listeners.add(listener);
  // Fire immediately with current state
  listener([...notifications]);
  return () => listeners.delete(listener);
}
