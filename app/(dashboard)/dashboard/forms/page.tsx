"use client";
import { Topbar } from "@/components/layout/Topbar";
import { FileText } from "lucide-react";

export default function FormsPage() {
  return (
    <div>
      <Topbar title="Form Templates" />
      <div className="p-6">
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">Form Builder</p>
          <p className="text-muted-foreground text-sm mt-1">Create dynamic application forms for your job postings</p>
        </div>
      </div>
    </div>
  );
}
