"use client";

import { use, useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useApplication, useNotes, useAddNote, usePipelineStages, useUpdateStage, useScoreApplication } from "@/services/queries";
import { formatDate, formatRelative } from "@/lib/utils";
import { FileText, Mail, Phone, Send, Download, Star } from "lucide-react";
import { toast } from "sonner";
import { InterviewsSection } from "@/components/interviews/InterviewsSection";
import { GdprSection } from "@/components/gdpr/GdprSection";

export default function ApplicationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = use(params);
  const { data: app, isLoading } = useApplication(applicationId);
  const { data: notes } = useNotes(applicationId);
  const { data: stages } = usePipelineStages();
  const addNote = useAddNote(applicationId);
  const updateStage = useUpdateStage();
  const scoreApp = useScoreApplication(applicationId);

  const [noteContent, setNoteContent] = useState("");
  const [scores, setScores] = useState({ communication: 3, technical: 3, culture_fit: 3 });

  // Initialize scores from existing data when app loads
  useEffect(() => {
    if (app?.scores && app.scores.length > 0) {
      const latest = app.scores[app.scores.length - 1];
      setScores({
        communication: latest.communication ?? 3,
        technical: latest.technical ?? 3,
        culture_fit: latest.culture_fit ?? 3,
      });
    }
  }, [app]);

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    try {
      await addNote.mutateAsync({ content: noteContent, visible_to_candidate: false });
      setNoteContent("");
      toast.success("Note added");
    } catch { toast.error("Failed to add note"); }
  };

  const handleStageChange = async (stage_id: string) => {
    try {
      await updateStage.mutateAsync({ id: applicationId, stage_id });
      toast.success("Stage updated");
    } catch { toast.error("Failed to update stage"); }
  };

  const handleScore = async () => {
    try {
      await scoreApp.mutateAsync(scores);
      toast.success("Score saved");
    } catch { toast.error("Failed to save score"); }
  };

  if (isLoading) return <div className="p-6"><div className="h-64 bg-card border border-border rounded-xl animate-pulse" /></div>;
  if (!app) return <div className="p-6 text-muted-foreground">Application not found</div>;

  return (
    <div>
      <Topbar title={`${app.first_name} ${app.last_name}`} />
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: candidate info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Info card */}
          <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">{app.first_name} {app.last_name}</h2>
                <p className="text-muted-foreground text-sm mt-0.5">Applied {formatRelative(app.created_at)}</p>
              </div>
              {app.stage && (
                <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-primary/10 text-primary">
                  {app.stage.name}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" /> {app.email}
              </div>
              {app.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" /> {app.phone}
                </div>
              )}
              {app.cv_url && (
                <a href={`http://localhost:8000/${app.cv_url}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Download className="w-4 h-4" /> Download CV
                </a>
              )}
            </div>
          </div>

          {/* Form answers */}
          {(app.answers ?? []).length > 0 && (
            <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-1">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Application Answers
              </h3>
              <div className="space-y-4">
                {(app.answers ?? []).map((ans) => (
                  <div key={ans.id} className="border-b border-border pb-3 last:border-0">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {ans.field_label ?? `Field ${ans.field_id.slice(0, 8)}`}
                    </p>
                    <p className="text-sm text-foreground">{String(ans.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-2">
            <h3 className="font-semibold text-foreground mb-4">Notes</h3>
            <div className="space-y-3 mb-4">
              {notes?.length === 0 && <p className="text-muted-foreground text-sm">No notes yet</p>}
              {notes?.map((note) => (
                <div key={note.id} className="bg-muted/40 rounded-lg p-3">
                  <p className="text-sm text-foreground">{note.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatRelative(note.created_at)}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={noteContent} onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..." onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                className="flex-1 px-3.5 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={handleAddNote} disabled={!noteContent.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: pipeline + score */}
        <div className="space-y-5">
          {/* Stage selector */}
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-3">Pipeline Stage</h3>
            <div className="space-y-2">
              {stages?.map((stage) => (
                <button key={stage.id}
                  onClick={() => handleStageChange(stage.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    app.stage?.id === stage.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted border border-border"
                  }`}>
                  {stage.name}
                </button>
              ))}
            </div>
          </div>

          {/* Scoring */}
          <div className="bg-card border border-border rounded-xl p-5 animate-fade-in-delay-1">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> Candidate Score
            </h3>
            {(["communication", "technical", "culture_fit"] as const).map((key) => (
              <div key={key} className="mb-4">
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-medium text-foreground capitalize">{key.replace("_", " ")}</label>
                  <span className="text-xs text-primary font-bold">{scores[key]}/5</span>
                </div>
                <input type="range" min={1} max={5} value={scores[key]}
                  onChange={(e) => setScores((s) => ({ ...s, [key]: Number(e.target.value) }))}
                  className="w-full accent-primary" />
              </div>
            ))}
            <button onClick={handleScore}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
              Save Score
            </button>
          </div>

          {/* Stage history */}
          {(app.stage_history ?? []).length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 animate-fade-in-delay-2">
              <h3 className="font-semibold text-foreground mb-3">Timeline</h3>
              <div className="space-y-3">
                {(app.stage_history ?? []).map((h) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{h.stage?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(h.changed_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interviews */}
          <InterviewsSection applicationId={app.id} />

          {/* GDPR */}
          <GdprSection applicationId={app.id} />
        </div>
      </div>
    </div>
  );
}