export const ROUTES = {
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  jobs: "/dashboard/jobs",
  jobCreate: "/dashboard/jobs/create",
  job: (id: string) => `/dashboard/jobs/${id}`,
  jobApplications: (id: string) => `/dashboard/jobs/${id}/applications`,
  applications: "/dashboard/applications",
  application: (id: string) => `/dashboard/applications/${id}`,
  forms: "/dashboard/forms",
  pipeline: "/dashboard/pipeline",
  tags: "/dashboard/tags",
  tasks: "/dashboard/tasks",
  organizer: "/dashboard/organizer",
  reports: "/dashboard/reports",
  articles: "/dashboard/articles",
  settings: {
    companyProfile: "/dashboard/settings/company-profile",
    emailTemplates: "/dashboard/settings/email-templates",
    automations: "/dashboard/settings/automations",
    gdpr: "/dashboard/settings/gdpr",
    team: "/dashboard/settings/team",
  },
  public: {
    home: "/",
    jobs: "/jobs",
    // Job board with a specific offer pre-selected (?job=<id>). Used by the
    // recruiter dashboard's "open offer" links and the saved-jobs deep links.
    jobOnBoard: (id: string) => `/jobs?job=${id}`,
    // Canonical, SEO-friendly public offer URL: /praca/<slug>-<uuid>.
    // Slug is cosmetic; the trailing UUID is what the page resolves by.
    job: (id: string, slug?: string | null) =>
      `/praca/${slug ? `${slug}-${id}` : id}`,
    companies: "/firmy",
    guide: "/poradnik",
    about: "/o-nas",
    apply: (jobId: string) => `/apply/${jobId}`,
    track: (token: string) => `/track/${token}`,
    acceptInvitation: "/accept-invitation",
    employers: "/dla-pracodawcow",       // → redirects to /login (HR side)
  },
  candidate: {
    login: "/konto/zaloguj",
    signup: "/konto/zarejestruj",
    account: "/konto",
    savedJobs: "/konto/obserwowane",
    savedSearches: "/konto/zapisane-wyszukiwania",
  },
} as const;
