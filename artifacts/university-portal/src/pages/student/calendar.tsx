import { useQuery } from "@tanstack/react-query";
import { useListCalendarEvents } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CalendarDays, BookOpen, Flag, Star, ImageIcon, FileText } from "lucide-react";
import { format } from "date-fns";

async function fetchCalendarMeta(): Promise<{ exists: boolean; contentType?: string }> {
  const res = await fetch("/api/branding/meta/calendar_image");
  if (!res.ok) return { exists: false };
  return res.json();
}

export function CalendarPage() {
  const { data, isLoading, isError } = useListCalendarEvents();
  const { data: calMeta } = useQuery({ queryKey: ["calendar-meta"], queryFn: fetchCalendarMeta });

  const calImageUrl = calMeta?.exists ? `/api/branding/image/calendar_image?t=${Math.floor(Date.now() / 30000)}` : null;
  const isCalPdf = calMeta?.contentType === "application/pdf";

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Failed to load calendar.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const events = Array.isArray(data) ? data : [];
  const sorted = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const typeConfig = {
    exam: { label: "Exam", color: "border-l-purple-500", badge: "bg-purple-100 text-purple-700", icon: <BookOpen className="w-4 h-4 text-purple-500" /> },
    deadline: { label: "Deadline", color: "border-l-red-500", badge: "bg-red-100 text-red-700", icon: <Flag className="w-4 h-4 text-red-500" /> },
    holiday: { label: "Holiday", color: "border-l-emerald-500", badge: "bg-emerald-100 text-emerald-700", icon: <Star className="w-4 h-4 text-emerald-500" /> },
    event: { label: "Event", color: "border-l-amber-500", badge: "bg-amber-100 text-amber-700", icon: <CalendarDays className="w-4 h-4 text-amber-500" /> },
  } as const;

  type CalendarEvent = (typeof events)[number];
  const grouped = sorted.reduce((acc, event) => {
    const month = format(new Date(event.startDate), "MMMM yyyy");
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Academic Calendar</h1>
        <p className="text-gray-500 mt-1">Upcoming exams, events, deadlines, and holidays</p>
      </div>

      {/* Calendar Image / PDF uploaded by admin/staff */}
      {calImageUrl && (
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="border-b py-3 px-4 flex flex-row items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-500" />
            <CardTitle className="text-sm font-semibold text-gray-700">Academic Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isCalPdf ? (
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <FileText className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Academic Calendar (PDF)</p>
                  <a
                    href={calImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View / Download PDF →
                  </a>
                </div>
              </div>
            ) : (
              <img
                src={calImageUrl}
                alt="Academic Calendar"
                className="w-full object-contain max-h-[600px]"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(typeConfig).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5 text-sm text-gray-600">
            {val.icon} {val.label}
          </div>
        ))}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No upcoming events</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([month, monthEvents]) => (
          <div key={month}>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{month}</h2>
            <div className="space-y-3">
              {monthEvents.map((event) => {
                const config = typeConfig[event.eventType as keyof typeof typeConfig] || typeConfig.event;
                return (
                  <Card key={event.id} className={`shadow-sm border-l-4 ${config.color}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-gray-50 border rounded-lg p-3 text-center min-w-[3.5rem] shrink-0">
                          <p className="text-xs font-medium text-gray-500 uppercase">{format(new Date(event.startDate), "MMM")}</p>
                          <p className="text-xl font-bold text-primary leading-none">{format(new Date(event.startDate), "dd")}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{event.title}</h3>
                              {event.description && (
                                <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                              )}
                              {event.endDate && event.endDate !== event.startDate && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {format(new Date(event.startDate), "dd MMM")} – {format(new Date(event.endDate), "dd MMM yyyy")}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className={config.badge}>
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
