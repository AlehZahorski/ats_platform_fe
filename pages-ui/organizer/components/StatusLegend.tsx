"use client";
import { StickyNote, Users } from "lucide-react";
import { STATUS_CONFIG, STATUS_ORDER } from "../lib/statusConfig";
import { cn } from "@/lib/utils";

export function StatusLegend() {
  return (
    <div className="flex items-center gap-5 px-4 py-3 border-t border-border text-xs text-muted-foreground">
      <div className="flex items-center gap-4 flex-1">
        {STATUS_ORDER.map((key) => {
          const s = STATUS_CONFIG[key];
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", s.dot)} />
              <span>{s.labelPl}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5" />
          <span>Notatka pracownika</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>Notatka kierownika</span>
        </div>
      </div>
    </div>
  );
}
