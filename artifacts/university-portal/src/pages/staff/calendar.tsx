import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FileUploadZone } from "@/components/ui/file-upload-zone";
import {
  CalendarDays, Plus, Trash2, BookOpen, Flag, Star, ImageIcon, X
} from "lucide-react";
import { format } from "date-fns";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  eventType: string;
}

async function fetchEvents(): Promise<CalendarEvent[]> {
  const res = await fetch("/api/calendar", { credentials: "include" });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function fetchCalendarMeta(): Promise<{ exists: boolean; contentType?: string }> {
  const res = await fetch("/api/branding/meta/calendar_image", { credentials: "include" });
  if (!res.ok) return { exists: false };
  return res.json();
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const EVENT_TYPES = [
  { value: "exam", label: "Exam", icon: <BookOpen className="w-3.5 h-3.5" />, color: "bg-purple-100 text-purple-700" },
  { value: "holiday", label: "Holiday", icon: <Star className="w-3.5 h-3.5" />, color: "bg-emerald-100 text-emerald-700" },
  { value: "deadline", label: "Deadline", icon: <Flag className="w-3.5 h-3.5" />, color: "bg-red-100 text-red-700" },
  { value: "event", label: "Event", icon: <CalendarDays className="w-3.5 h-3.5" />, color: "bg-amber-100 text-amber-700" },
];

export function StaffCalendarPage() {
  const queryClient = useQueryClient();
  const { data: events, isLoading } = useQuery({ queryKey: ["calendar-events"], queryFn: fetchEvents });
  const { data: calMeta, isLoading: metaLoading } = useQuery({ queryKey: ["calendar-meta"], queryFn: fetchCalendarMeta });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", startDate: "", endDate: "", eventType: "event" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleAddEvent = async () => {
    if (!form.title || !form.startDate) return;
    setSaving(true);
    try {
      await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      setForm({ title: "", description: "", startDate: "", endDate: "", eventType: "event" });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(`/api/calendar/${id}`, { method: "DELETE", credentials: "include" });
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    } finally {
      setDeletingId(null);
    }
  };

  const handleImageUpload = async (file: File) => {
    const data = await toBase64(file);
    const res = await fetch("/api/branding/image/calendar_image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ data, contentType: file.type }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || "Upload failed");
    }
    queryClient.invalidateQueries({ queryKey: ["calendar-meta"] });
  };

  const handleImageDelete = async () => {
    await fetch("/api/branding/image/calendar_image", { method: "DELETE", credentials: "include" });
    queryClient.invalidateQueries({ queryKey: ["calendar-meta"] });
  };

  const sorted = [...(events ?? [])].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const calImageUrl = calMeta?.exists ? "/api/branding/image/calendar_image" : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Academic Calendar</h1>
        <p className="text-gray-500 text-sm mt-1">Upload calendar image/PDF and manage academic events for students</p>
      </div>

      {/* Calendar Image Upload */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            Calendar Image / PDF
          </CardTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload a calendar image or PDF. Students will see it on their Calendar page.
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          {metaLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <FileUploadZone
              accept="image/png,image/jpeg,image/webp,application/pdf"
              currentUrl={calImageUrl}
              currentContentType={calMeta?.contentType}
              onUpload={handleImageUpload}
              onDelete={calImageUrl ? handleImageDelete : undefined}
              maxSizeMB={15}
            />
          )}
        </CardContent>
      </Card>

      {/* Event Management */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Academic Events</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">Add exams, holidays, and important dates</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? <><X className="w-3.5 h-3.5 mr-1" /> Cancel</> : <><Plus className="w-3.5 h-3.5 mr-1" /> Add Event</>}
          </Button>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {showForm && (
            <div className="border border-blue-100 bg-blue-50 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-blue-800">New Event</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Event title *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <Input
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Start Date *</label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">End Date (optional)</label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setForm({ ...form, eventType: t.value })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.eventType === t.value
                        ? `${t.color} border-current`
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddEvent} disabled={!form.title || !form.startDate || saving}>
                  {saving ? "Saving…" : "Save Event"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No events yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((ev) => {
                const typeConf = EVENT_TYPES.find((t) => t.value === ev.eventType) ?? EVENT_TYPES[3];
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="bg-white border rounded-lg px-2.5 py-1.5 text-center min-w-[3rem] shrink-0">
                      <p className="text-xs font-medium text-gray-400 uppercase leading-none">
                        {format(new Date(ev.startDate), "MMM")}
                      </p>
                      <p className="text-lg font-bold text-gray-800 leading-tight">
                        {format(new Date(ev.startDate), "dd")}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{ev.title}</p>
                      {ev.description && <p className="text-xs text-gray-500 truncate">{ev.description}</p>}
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ${typeConf.color}`}>
                      {typeConf.label}
                    </Badge>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      disabled={deletingId === ev.id}
                      className="shrink-0 p-1.5 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
