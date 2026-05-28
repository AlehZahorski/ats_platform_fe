export type UserRole = "owner" | "recruiter" | "manager";
export type InvitableRole = Exclude<UserRole, "owner">;

export type AvatarKey =
  | "robot" | "koala" | "fox" | "panda" | "cat" | "dog"
  | "ghost" | "alien" | "dino" | "bear" | "penguin" | "owl";

export interface User {
  id: string;
  company_id: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  is_active?: boolean;
  language?: string;
  avatar_key?: AvatarKey | null;
  created_at: string;
}

export interface UserInvitation {
  id: string;
  company_id: string;
  email: string;
  role: UserRole;
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
  // Returned by the backend only in non-production environments — used to copy
  // the link directly when SMTP is unavailable.
  invitation_url?: string | null;
}

export interface InvitationPreview {
  email: string;
  role: UserRole;
  company_name: string;
  expires_at: string;
}

export interface Company {
  id: string;
  name: string;
  created_at: string;
}
