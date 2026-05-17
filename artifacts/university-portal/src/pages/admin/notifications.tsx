import { useState } from "react";
import { useListNotifications } from "@workspace/api-client-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Plus, Trash2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { format } from "date-fns";

async function createNotification(data: { title: string; message: string; targetRole: string; priority: string }) {
  const res = await fetch("/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function deleteNotification(id: number) {
  const res = await fetch(`/api/notifications/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed");
}

export function AdminNotificationsPage() {
  const { data, isLoading } = useListNotifications();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      setShowForm(false);
      setForm({ title: "", message: "", targetRole: "all", priority: "normal" });
    },
  });

  const del = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetRole: "all",
    priority: "normal",
  });

  const notifications = Array.isArray(data) ? [...data].reverse() : [];

  const priorityIcon = (p: string | undefined) => {
    if (p === "urgent") return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (p === "important") return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Info className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Create and manage university announcements</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> New Notification
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-sm border-primary/30 bg-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Create New Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title *"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <textarea
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              rows={3}
              placeholder="Message *"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Target Audience</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                  value={form.targetRole}
                  onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
                >
                  <option value="all">All</option>
                  <option value="student">Students Only</option>
                  <option value="staff">Staff Only</option>
                  <option value="admin">Admin Only</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button
                disabled={!form.title || !form.message || create.isPending}
                onClick={() => create.mutate(form)}
              >
                {create.isPending ? "Creating..." : "Create Notification"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}</div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No notifications yet. Create one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <Card key={n.id} className={`shadow-sm border-l-4 ${
              n.priority === "urgent" ? "border-l-red-500" :
              n.priority === "important" ? "border-l-amber-500" : "border-l-primary"
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{priorityIcon(n.priority)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{n.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-500 shrink-0"
                        onClick={() => del.mutate(n.id as number)}
                        disabled={del.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{n.targetRole}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${
                        n.priority === "urgent" ? "border-red-200 text-red-700" :
                        n.priority === "important" ? "border-amber-200 text-amber-700" : ""
                      }`}>{n.priority}</Badge>
                      {n.createdAt && <span className="text-xs text-gray-400">{format(new Date(n.createdAt), "dd MMM yyyy")}</span>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
