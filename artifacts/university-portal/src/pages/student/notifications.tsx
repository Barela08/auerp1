import { useListNotifications } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Bell, Info, AlertTriangle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export function NotificationsPage() {
  const { data, isLoading, isError } = useListNotifications({ targetRole: "student" });

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Failed to load notifications.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const priorityIcon = (priority: string | undefined) => {
    if (priority === "urgent") return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (priority === "important") return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <Info className="w-5 h-5 text-primary" />;
  };

  const priorityBadge = (priority: string | undefined) => {
    if (priority === "urgent") return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Urgent</Badge>;
    if (priority === "important") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Important</Badge>;
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Info</Badge>;
  };

  const notifications = Array.isArray(data) ? data : [];

  const urgent = notifications.filter(n => n.priority === "urgent");
  const important = notifications.filter(n => n.priority === "important");
  const normal = notifications.filter(n => n.priority === "normal");
  const sorted = [...urgent, ...important, ...normal];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1">University announcements and alerts</p>
      </div>

      <div className="flex gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-red-500" /> {urgent.length} Urgent</span>
        <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> {important.length} Important</span>
        <span className="flex items-center gap-1.5"><Info className="w-4 h-4 text-primary" /> {normal.length} Info</span>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No notifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((n) => (
            <Card key={n.id} className={`shadow-sm border-l-4 ${
              n.priority === "urgent" ? "border-l-red-500" :
              n.priority === "important" ? "border-l-amber-500" : "border-l-primary"
            }`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-0.5">{priorityIcon(n.priority)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-gray-900 leading-tight">{n.title}</h3>
                      {priorityBadge(n.priority)}
                    </div>
                    <p className="text-sm text-gray-600">{n.message}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      {n.createdBy && <span>From: {n.createdBy}</span>}
                      {n.createdAt && (
                        <span title={format(new Date(n.createdAt), "dd MMM yyyy, hh:mm a")}>
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      )}
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
