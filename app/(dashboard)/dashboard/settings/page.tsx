"use client";
import { Topbar } from "@/components/layout/Topbar";

export default function SettingsPage() {
  return (
    <div>
      <Topbar title="Settings" />
      <div className="p-6">
        <div className="max-w-xl bg-card border border-border rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Workspace Settings</h2>
          <p className="text-muted-foreground text-sm">Settings configuration coming soon.</p>
        </div>
      </div>
    </div>
  );
}
