"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApplications } from "@/services/queries";

interface JobTabsProps {
  jobId: string;
}

export function JobTabs({ jobId }: JobTabsProps) {
  const t = useTranslations("jobs");
  const pathname = usePathname();
  const { data: apps } = useApplications({ job_id: jobId });

  const editHref = `/dashboard/jobs/${jobId}`;
  const applicationsHref = `/dashboard/jobs/${jobId}/applications`;
  const isApplications = pathname?.startsWith(applicationsHref);

  const tabs = [
    { key: "edit", href: editHref, icon: FileText, active: !isApplications, count: null as number | null },
    { key: "applications", href: applicationsHref, icon: Users, active: !!isApplications, count: apps?.total ?? 0 },
  ];

  return (
    <div className="border-b border-border bg-card/30 px-6">
      <nav className="-mb-px flex gap-1">
        {tabs.map(({ key, href, icon: Icon, active, count }) => (
          <Link
            key={key}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <Icon className="h-4 w-4" />
            {t(`tab.${key}` as never)}
            {count !== null && (
              <span
                className={cn(
                  "ml-1 inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
