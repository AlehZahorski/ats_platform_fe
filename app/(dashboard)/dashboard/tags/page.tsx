"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Topbar } from "@/components/layout/Topbar";
import { tagsApi } from "@/services/api/tags";
import type { Tag } from "@/types";
import { Plus, Tag as TagIcon, Trash2, X, Hash } from "lucide-react";
import { toast } from "sonner";

const TAG_COLORS = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
];

function getTagColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export default function TagsPage() {
  const t = useTranslations("tags");
  const tc = useTranslations("common");
  const qc = useQueryClient();

  const [newTag, setNewTag] = useState("");
  const [search, setSearch] = useState("");

  const { data: tags, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => tagsApi.create(name).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags"] });
      toast.success(t("created"));
      setNewTag("");
    },
    onError: () => toast.error(tc("error")),
  });

  const handleCreate = async () => {
    const name = newTag.trim();
    if (!name) return;
    if (tags?.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Tag already exists");
      return;
    }
    await createMutation.mutateAsync(name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreate();
  };

  const filtered = tags?.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">Total tags</p>
            <p className="text-2xl font-bold text-foreground mt-1">{tags?.length ?? 0}</p>
          </div>
        </div>

        {/* Create new tag */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            {t("new")}
          </h3>
          <div className="flex gap-3">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. senior, react, recommended..."
              maxLength={30}
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleCreate}
              disabled={!newTag.trim() || createMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              {tc("create")}
            </button>
          </div>
          {/* Live preview */}
          {newTag.trim() && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Preview:</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getTagColor(newTag)}`}>
                <Hash className="w-3 h-3" />
                {newTag.trim()}
              </span>
            </div>
          )}
        </div>

        {/* Search + list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tc("search")}
              className="w-full max-w-xs px-3.5 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-muted-foreground">
              {filtered?.length ?? 0} tags
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-14 bg-card border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <TagIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">
                {search ? tc("noResults") : t("noTags")}
              </p>
              {!search && (
                <p className="text-muted-foreground text-sm mt-1">
                  Create your first tag to start organizing candidates
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered?.map((tag, i) => (
                <TagCard
                  key={tag.id}
                  tag={tag}
                  index={i}
                  onDeleted={() => qc.invalidateQueries({ queryKey: ["tags"] })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tag Card ─────────────────────────────────────────────────────────────────
function TagCard({
  tag,
  index,
  onDeleted,
}: {
  tag: Tag;
  index: number;
  onDeleted: () => void;
}) {
  const tc = useTranslations("common");
  const t = useTranslations("tags");
  const [hovered, setHovered] = useState(false);
  const colorClass = getTagColor(tag.name);

  // Note: delete endpoint needs to be added to backend if not present
  const handleDelete = async () => {
    if (!confirm(tc("confirm"))) return;
    try {
      await fetch(`/api/v1/tags/${tag.id}`, { method: "DELETE", credentials: "include" });
      toast.success(t("removed"));
      onDeleted();
    } catch {
      toast.error(tc("error"));
    }
  };

  return (
    <div
      className={`relative group bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all animate-fade-in`}
      style={{ animationDelay: `${index * 0.03}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClass} flex-1 truncate`}>
        <Hash className="w-3 h-3 shrink-0" />
        <span className="truncate">{tag.name}</span>
      </span>
      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all shrink-0"
        title={tc("delete")}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}