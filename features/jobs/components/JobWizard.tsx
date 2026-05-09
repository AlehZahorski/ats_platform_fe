"use client";

import { Button } from "@/shared/ui/button";
import { useJobWizard } from "../hooks/useJobWizard";
import { WizardProgressBar } from "./wizard/WizardProgressBar";
import { StepBasics } from "./wizard/StepBasics";
import { StepDescription } from "./wizard/StepDescription";
import { StepRequirements } from "./wizard/StepRequirements";
import { StepConditions } from "./wizard/StepConditions";
import { StepAiAnalysis } from "./wizard/StepAiAnalysis";
import { WIZARD_STEPS } from "../types/job-wizard.types";

export function JobWizard() {
  const {
    step,
    jobId,
    form,
    isSaving,
    handleChange,
    handleNext,
    handleBack,
    handlePublish,
    handleSaveDraft,
  } = useJobWizard();

  const isFirstStep = step === 1;
  const isLastStep = step === 5;
  const canProceed = step === 1 ? Boolean(form.title.trim()) : true;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">Utwórz ofertę pracy</h1>
        <p className="text-sm text-muted-foreground">{WIZARD_STEPS[step].description}</p>
      </div>

      {/* Progress */}
      <WizardProgressBar currentStep={step} />

      {/* Step content */}
      <div className="bg-card border border-border rounded-xl p-6 min-h-[400px]">
        <h2 className="font-display text-lg font-semibold text-foreground mb-6">
          {step}. {WIZARD_STEPS[step].label}
        </h2>

        {step === 1 && <StepBasics form={form} onChange={handleChange} />}
        {step === 2 && <StepDescription jobId={jobId ?? null} form={form} onChange={handleChange} />}
        {step === 3 && <StepRequirements form={form} onChange={handleChange} />}
        {step === 4 && <StepConditions form={form} onChange={handleChange} />}
        {step === 5 && jobId && (
          <StepAiAnalysis
            jobId={jobId}
            onPublish={handlePublish}
            onBack={handleBack}
            isPublishing={isSaving}
          />
        )}
      </div>

      {/* Navigation — hidden on step 5 (StepAiAnalysis handles its own actions) */}
      {!isLastStep && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isFirstStep && (
              <Button variant="outline" onClick={handleBack}>
                Wstecz
              </Button>
            )}
            <button
              onClick={handleSaveDraft}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Zapisz szkic i wyjdź
            </button>
          </div>
          <Button onClick={handleNext} disabled={!canProceed || isSaving}>
            {isSaving ? "Zapisywanie..." : "Dalej →"}
          </Button>
        </div>
      )}
    </div>
  );
}
