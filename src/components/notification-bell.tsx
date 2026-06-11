import { useMemo, useState } from "react";
import { Bell, Megaphone, Activity as ActivityIcon, Paperclip } from "lucide-react";

import { useApp } from "@/lib/app-store";
import { relativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NotificationItem {
  id: string;
  kind: "message" | "activity";
  title: string;
  body?: string;
  files?: string[];
  timestamp: string;
}

export function NotificationBell() {
  const { user, messages, activities, reads, markNotificationsRead } = useApp();
  const [open, setOpen] = useState(false);

  const items = useMemo<NotificationItem[]>(() => {
    if (!user) return [];
    const inbox: NotificationItem[] = messages
      .filter((m) => m.target === "all" || m.target === user.role)
      .map((m) => ({ id: m.id, kind: "message", title: m.title, body: m.body, files: m.files, timestamp: m.timestamp }));
    const acts: NotificationItem[] = activities
      .slice(0, 8)
      .map((a) => ({ id: a.id, kind: "activity", title: a.message, timestamp: a.timestamp }));
    return [...inbox, ...acts].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [user, messages, activities]);

  const lastRead = user ? reads[user.role] : undefined;
  const unread = items.filter((i) => !lastRead || i.timestamp > lastRead).length;

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (o) markNotificationsRead();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="font-display text-sm font-semibold">Notifications</p>
          <span className="text-xs text-muted-foreground">{items.length} total</span>
        </div>
        <ScrollArea className="max-h-80">
          {items.length ? (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 px-4 py-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {item.kind === "message" ? (
                      <Megaphone className="h-4 w-4 text-primary" />
                    ) : (
                      <ActivityIcon className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.body && <p className="mt-0.5 text-xs text-muted-foreground">{item.body}</p>}
                    {item.files && item.files.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.files.map((f) => (
                          <span key={f} className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px]">
                            <Paperclip className="h-3 w-3" />{f}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-1 text-[11px] text-muted-foreground">{relativeTime(item.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">No notifications yet.</div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
