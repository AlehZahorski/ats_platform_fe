"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Users,
  ChevronRight,
  CheckSquare,
  Square,
  Minus,
  X,
  GitBranch,
  Tag,
  XCircle,
} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { tagsApi } from "@/services/api/tags";
import { useApplications, useBulkAction, usePipelineStages } from "@/services/queries";
import { formatRelative } from "@/lib/utils";

const STAGE_COLORS: Record<string, string> = {
  Applied: "bg-blue-500/10 text-blue-500",
  Screening: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  Interview: "bg-purple-500/10 text-purple-500",
  Offer: "bg-orange-500/10 text-orange-500",
  Hired: "bg-green-500/10 text-green-500",
  Rejected: "bg-destructive/10 text-destructive",
};

function BulkToolbar({
  selectedIds,
  onClear,
  onAction,
}: {
  selectedIds: string[];
  onClear: () => void;
  onAction: (action: "stage_change" | "reject" | "tag", payload: Record<string, string>) => void;
}) {
  const t = useTranslations("applications.bulkActions");
  const tApplications = useTranslations("applications");
  const tStages = useTranslations("common.stageNames");
  const { data: stages } = usePipelineStages();
  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsApi.list().then((response) => response.data),
  });

  const [showStages, setShowStages] = useState(false);
  const [showTags, setShowTags] = useState(false);

  const translateStageName = (stageName: string) => {
    const key = stageName.toLowerCase().replace(/\s+/g, "_");
    const knownKeys = ["applied", "screening", "interview", "offer", "hired", "rejected", "under_review"];
    return knownKeys.includes(key)
      ? tStages(key as "applied" | "screening" | "interview" | "offer" | "hired" | "rejected" | "under_review")
      : stageName;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 min-w-[400px]">
        <div className="flex items-center gap-2 pr-3 border-r border-border">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">{selectedIds.length}</span>
          </div>
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            {t("selected", { count: selectedIds.length })}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowStages(!showStages);
              setShowTags(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-all"
          >
            <GitBranch className="w-3.5 h-3.5" />
            {t("changeStage")}
          </button>
          {showStages && (
            <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[160px]">
              {stages?.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => {
                    setShowStages(false);
                    if (confirm(t("confirm", { count: selectedIds.length }))) {
                      onAction("stage_change", { stage_id: stage.id });
                    }
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {translateStageName(stage.name)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowTags(!showTags);
              setShowStages(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-all"
          >
            <Tag className="w-3.5 h-3.5" />
            {t("addTag")}
          </button>
          {showTags && (
            <div className="absolute bottom-full mb-2 left-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[160px] max-h-48 overflow-y-auto">
              {tags?.length === 0 && (
                <p className="px-3.5 py-2.5 text-sm text-muted-foreground">{tApplications("noTags")}</p>
              )}
              {tags?.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    setShowTags(false);
                    if (confirm(t("confirm", { count: selectedIds.length }))) {
                      onAction("tag", { tag_id: tag.id });
                    }
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (confirm(t("confirm", { count: selectedIds.length }))) {
              onAction("reject", {});
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all"
        >
          <XCircle className="w-3.5 h-3.5" />
          {t("reject")}
        </button>

        <button
          onClick={onClear}
          className="ml-auto p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const t = useTranslations("applications");
  const tc = useTranslations("common");
  const tStages = useTranslations("common.stageNames");

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: stages } = usePipelineStages();
  const { data, isLoading } = useApplications({
    search: search || undefined,
    stage_id: stageFilter || undefined,
  });

  const bulkMutation = useBulkAction();
  const allIds = data?.items.map((item) => item.id) ?? [];
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(allIds));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const translateStageName = (stageName: string) => {
    const key = stageName.toLowerCase().replace(/\s+/g, "_");
    const knownKeys = ["applied", "screening", "interview", "offer", "hired", "rejected", "under_review"];
    return knownKeys.includes(key)
      ? tStages(key as "applied" | "screening" | "interview" | "offer" | "hired" | "rejected" | "under_review")
      : stageName;
  };

  const handleBulkAction = async (
    action: "stage_change" | "reject" | "tag",
    payload: Record<string, string>
  ) => {
    try {
      const result = await bulkMutation.mutateAsync({
        application_ids: Array.from(selectedIds),
        action,
        payload,
      });

      toast.success(
        result.failed > 0
          ? t("bulkUpdatedWithFailed", { updated: result.updated, failed: result.failed })
          : t("bulkUpdated", { updated: result.updated })
      );
      setSelectedIds(new Set());
    } catch {
      toast.error(tc("error"));
    }
  };

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("search")}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t("allStages")}</option>
            {stages?.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {translateStageName(stage.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("total", { count: data?.total ?? 0 })}</p>
          {(data?.items.length ?? 0) > 0 && (
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : someSelected ? (
                <Minus className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {allSelected ? t("deselectAll") : t("selectAll")}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">{t("noApplications")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.items.map((application, index) => {
              const isSelected = selectedIds.has(application.id);

              return (
                <div
                  key={application.id}
                  className={`flex items-center gap-3 bg-card border rounded-xl px-4 py-3.5 transition-all animate-fade-in ${
                    isSelected ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <button
                    onClick={() => toggleOne(application.id)}
                    className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <Link href={`/dashboard/applications/${application.id}`} className="flex-1 flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {application.first_name[0]}
                        {application.last_name[0]}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {application.first_name} {application.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{application.email}</p>
                    </div>

                    <div className="hidden sm:block shrink-0">
                      {application.stage ? (
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            STAGE_COLORS[application.stage.name] ?? "bg-muted text-muted-foreground"
                          }`}
                        >
                          {translateStageName(application.stage.name)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>

                    <p className="hidden md:block text-xs text-muted-foreground shrink-0">
                      {formatRelative(application.created_at)}
                    </p>

                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedIds.size > 0 && (
        <BulkToolbar
          selectedIds={Array.from(selectedIds)}
          onClear={() => setSelectedIds(new Set())}
          onAction={handleBulkAction}
        />
      )}
    </div>
  );
}
