import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Send, Paperclip, X, Megaphone, Users } from "lucide-react";

import { useApp, type Role } from "@/lib/app-store";
import { relativeTime } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { RequireRole } from "@/components/require-role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/app/messages")({
  head: () => ({
    meta: [
      { title: "Messages — DDR Operations" },
      { name: "description", content: "Send messages, reminders and files to any team or role." },
    ],
  }),
  component: () => (
    <RequireRole roles={["ceo"]}>
      <MessagesPage />
    </RequireRole>
  ),
});

const targetOptions: { value: Role | "all"; label: string }[] = [
  { value: "all", label: "Everyone" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" },
  { value: "logistics", label: "Logistics" },
];

const targetLabel = (t: Role | "all") => targetOptions.find((o) => o.value === t)?.label ?? t;

function MessagesPage() {
  const { messages, addMessage } = useApp();
  const [target, setTarget] = useState<Role | "all">("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).map((f) => f.name);
    if (picked.length) setFiles((prev) => [...prev, ...picked]);
    e.target.value = "";
  };

  const removeFile = (name: string) => setFiles((prev) => prev.filter((f) => f !== name));

  const submit = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Please add a title and a message.");
      return;
    }
    addMessage({ target, title: title.trim(), body: body.trim(), files });
    toast.success(`Message sent to ${targetLabel(target)}`);
    setTitle("");
    setBody("");
    setFiles([]);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Messages & Reminders" subtitle="Send instructions, reminders and files to any role" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Send className="h-4 w-4 text-primary" /> Compose
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Send to</Label>
              <Select value={target} onValueChange={(v) => setTarget(v as Role | "all")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {targetOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-title">Title</Label>
              <Input id="m-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Submit Q3 report" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-body">Message / instructions</Label>
              <Textarea
                id="m-body"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe what they should do…"
              />
            </div>
            <div className="space-y-2">
              <Label>Attachments</Label>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={onFiles} />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Paperclip className="h-4 w-4" /> Upload file
              </Button>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {files.map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs">
                      <Paperclip className="h-3 w-3" />
                      {f}
                      <button onClick={() => removeFile(f)} aria-label={`Remove ${f}`}>
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Button variant="gold" className="w-full" onClick={submit}>
              <Send className="h-4 w-4" /> Send message
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)]">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Megaphone className="h-4 w-4 text-primary" /> Sent
          </h2>
          {messages.length ? (
            <ul className="space-y-3">
              {messages.map((m) => (
                <li key={m.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{m.title}</p>
                    <Badge variant="outline" className="gap-1 border-primary/40 text-primary">
                      <Users className="h-3 w-3" />{targetLabel(m.target)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
                  {m.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.files.map((f) => (
                        <span key={f} className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px]">
                          <Paperclip className="h-3 w-3" />{f}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-muted-foreground">{relativeTime(m.timestamp)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No messages sent yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
