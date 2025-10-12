import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import clsx from 'clsx';

export type AdminNotificationType = 'success' | 'error' | 'info';

interface AdminNotification {
  id: number;
  type: AdminNotificationType;
  title: string;
  message?: string;
  duration: number;
}

interface NotifyInput {
  type?: AdminNotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface AdminNotificationContextValue {
  notify: (input: NotifyInput) => number;
  remove: (id: number) => void;
  notifications: AdminNotification[];
}

const AdminNotificationContext = createContext<AdminNotificationContextValue | undefined>(undefined);

const DEFAULT_DURATION = 4500;

const typeStyles: Record<AdminNotificationType, string> = {
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700 shadow-emerald-100',
  error: 'border-rose-100 bg-rose-50 text-rose-700 shadow-rose-100',
  info: 'border-sky-100 bg-sky-50 text-sky-700 shadow-sky-100',
};

const typeBadgeStyles: Record<AdminNotificationType, string> = {
  success: 'bg-emerald-600/10 text-emerald-700',
  error: 'bg-rose-600/10 text-rose-700',
  info: 'bg-sky-600/10 text-sky-700',
};

export const AdminNotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const counterRef = useRef(0);

  const remove = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(({ type = 'info', title, message, duration = DEFAULT_DURATION }: NotifyInput) => {
    counterRef.current += 1;
    const id = Date.now() + counterRef.current;
    setNotifications((prev) => [...prev, { id, type, title, message, duration }]);
    if (duration > 0) {
      const timer = setTimeout(() => remove(id), duration);
      timersRef.current.set(id, timer);
    }
    return id;
  }, [remove]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const value = useMemo<AdminNotificationContextValue>(() => ({ notify, remove, notifications }), [notify, remove, notifications]);

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
      <AdminNotificationsViewport />
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotifications = () => {
  const ctx = useContext(AdminNotificationContext);
  if (!ctx) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider');
  }
  return { notify: ctx.notify };
};

const AdminNotificationsViewport = () => {
  const ctx = useContext(AdminNotificationContext);
  if (!ctx) return null;

  const { notifications, remove } = ctx;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-end px-4 sm:px-6">
      <div className="flex max-h-[80vh] w-full max-w-sm flex-col gap-3 overflow-y-auto pr-1">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={clsx(
              'pointer-events-auto overflow-hidden rounded-2xl border p-3 shadow-lg shadow-black/5 backdrop-blur transition-all',
              typeStyles[notification.type]
            )}
          >
            <div className="flex items-start gap-3">
              <div className={clsx('mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-wide', typeBadgeStyles[notification.type])}>
                {notification.type}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{notification.title}</div>
                {notification.message && (
                  <div className="mt-1 text-xs leading-5 text-current/80">{notification.message}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(notification.id)}
                className="-m-1 rounded-full p-1 text-xs text-current/60 transition hover:bg-white/50 hover:text-current"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

