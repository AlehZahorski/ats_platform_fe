"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Topbar } from "@/shared/layout/Topbar";
import { Input } from "@/shared/ui/input";
import { useMe } from "@/services/queries";
import { useOrganizerBoard } from "@/services/queries/organizer.queries";
import { mondayOf, toISODate, addDays } from "./lib/week";
import { WeekNavigator } from "./components/WeekNavigator";
import { ViewModeToggle } from "./components/ViewModeToggle";
import { BoardGrid } from "./components/BoardGrid";
import { StatusLegend } from "./components/StatusLegend";
import { DayModal } from "./components/DayModal";

export function OrganizerPage() {
  const { data: me } = useMe();
  const isManager = me?.role === "owner" || me?.role === "manager";

  const [weekStart, setWeekStart] = useState<Date>(() => mondayOf(new Date()));
  const [scope, setScope] = useState<"self" | "team">(isManager ? "team" : "self");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ userId: string; date: string } | null>(null);

  const weekEnd = addDays(weekStart, 6);
  const weekStartISO = toISODate(weekStart);

  const effectiveScope = isManager ? scope : "self";

  const { data: board, isLoading } = useOrganizerBoard({
    week_start: weekStartISO,
    scope: effectiveScope,
  });

  return (
    <div className="flex flex-col h-full">
      <Topbar />
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Organizer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tablica pracowników i harmonogram tygodniowy
          </p>
        </div>
        {isManager && <ViewModeToggle value={scope} onChange={setScope} />}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 pb-4 flex-wrap">
        <WeekNavigator
          weekStart={weekStart}
          weekEnd={weekEnd}
          onChange={(d) => setWeekStart(mondayOf(d))}
          onToday={() => setWeekStart(mondayOf(new Date()))}
        />
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj pracownika…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 px-6 pb-2 overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Ładowanie tygodnia…
          </div>
        )}
        {board && (
          <BoardGrid
            board={board}
            weekStart={weekStart}
            onSelectDay={(userId, date) => setSelected({ userId, date })}
            searchQuery={search}
          />
        )}
      </div>

      <StatusLegend />

      <DayModal
        open={!!selected}
        userId={selected?.userId ?? null}
        date={selected?.date ?? null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
