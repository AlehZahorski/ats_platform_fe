export interface User {
  id: string;
  company_id: string;
  email: string;
  role: "owner" | "recruiter" | "manager";
  is_verified: boolean;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  created_at: string;
}
