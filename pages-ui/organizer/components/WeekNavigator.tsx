"use client";
import { Button } from "@/shared/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, formatWeekRange } from "../lib/week";

interface Props {
  weekStart: Date;
  weekEnd: Date;
  onChange: (d: Date) => void;
  onToday: () => void;
}

export function WeekNavigator({ weekStart, weekEnd, onChange, onToday }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onChange(addDays(weekStart, -7))}>
        <ChevronLeft className="w-4 h-4 mr-1" />
        Poprzedni
      </Button>
      <Button variant="outline" size="sm" onClick={onToday}>
        Dziś
      </Button>
      <Button variant="outline" size="sm" onClick={() => onChange(addDays(weekStart, 7))}>
        Następny
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
      <div className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-md border border-border text-sm">
        <CalendarDays className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">{formatWeekRange(weekStart, weekEnd)}</span>
      </div>
    </div>
  );
}
