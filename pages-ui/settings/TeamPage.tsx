"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Mail, Plus, RefreshCw, ShieldX, ShieldCheck, Trash2, UserPlus, X,
} from "lucide-react";
import { Topbar } from "@/shared/layout/Topbar";
import { ROUTES } from "@/config/routes";
import {
  useMe,
  usePendingInvitations,
  useTeamMembers,
  useInviteMember,
  useResendInvitation,
  useRevokeInvitation,
  useUpdateMemberRole,
  useSetMemberActive,
} from "@/services/queries";
import type { InvitableRole, User, UserInvitation } from "@/types";

const selectClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

// =============================================================================
// Invite Dialog
// =============================================================================
function InviteDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations("team");
  const tc = useTranslations("common");
  const invite = useInviteMember();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitableRole>("recruiter");

  const submit = async () => {
    if (!email.trim()) {
      toast.error(t("emailRequired"));
      return;
    }
    try {
      const invitation = await invite.mutateAsync({ email: email.trim(), role });
      toast.success(t("invitationSent"));
      if (invitation.invitation_url) {
        navigator.clipboard?.writeText(invitation.invitation_url).catch(() => {});
        toast.message(t("devLinkCopied"), {
          description: invitation.invitation_url,
          duration: 30000,
        });
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? tc("error"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">{t("inviteTitle")}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("email")} *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anna@wakanta.pl"
              className={selectClass}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t("role")} *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as InvitableRole)}
              className={selectClass}
            >
              <option value="recruiter">{t("roleRecruiter")}</option>
              <option value="manager">{t("roleManager")}</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1.5">{t("roleHint")}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-all"
          >
            {tc("cancel")}
          </button>
          <button
            onClick={submit}
            disabled={invite.isPending}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {invite.isPending ? t("sending") : t("sendInvitation")}
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Pending Invitations Table
// =============================================================================
function InvitationRow({ invitation }: { invitation: UserInvitation }) {
  const t = useTranslations("team");
  const tc = useTranslations("common");
  const resend = useResendInvitation();
  const revoke = useRevokeInvitation();

  const isExpired = new Date(invitation.expires_at) < new Date();

  const handleResend = async () => {
    try {
      const updated = await resend.mutateAsync(invitation.id);
      toast.success(t("invitationResent"));
      if (updated.invitation_url) {
        navigator.clipboard?.writeText(updated.invitation_url).catch(() => {});
        toast.message(t("devLinkCopied"), {
          description: updated.invitation_url,
          duration: 30000,
        });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? tc("error"));
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm(t("confirmRevoke", { email: invitation.email }))) return;
    try {
      await revoke.mutateAsync(invitation.id);
      toast.success(t("invitationRevoked"));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? tc("error"));
    }
  };

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-sm text-foreground">{invitation.email}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{invitation.role}</td>
      <td className="px-4 py-3 text-sm">
        {isExpired ? (
          <span className="inline-block px-2 py-0.5 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
            {t("expired")}
          </span>
        ) : (
          <span className="inline-block px-2 py-0.5 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
            {t("pending")}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {new Date(invitation.expires_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex gap-1">
          <button
            onClick={handleResend}
            disabled={resend.isPending}
            title={t("resend")}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${resend.isPending ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleRevoke}
            disabled={revoke.isPending}
            title={t("revoke")}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// =============================================================================
// Member Row
// =============================================================================
function MemberRow({ member, currentUserId }: { member: User; currentUserId: string }) {
  const t = useTranslations("team");
  const tc = useTranslations("common");
  const updateRole = useUpdateMemberRole();
  const setActive = useSetMemberActive();

  const isSelf = member.id === currentUserId;
  const isOwner = member.role === "owner";
  const lockedActions = isSelf || isOwner;

  const handleRoleChange = async (newRole: InvitableRole) => {
    if (newRole === member.role) return;
    try {
      await updateRole.mutateAsync({ userId: member.id, role: newRole });
      toast.success(t("roleUpdated"));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? tc("error"));
    }
  };

  const toggleActive = async () => {
    const nextActive = !(member.is_active ?? true);
    if (!nextActive && !window.confirm(t("confirmDeactivate", { email: member.email }))) return;
    try {
      await setActive.mutateAsync({ userId: member.id, isActive: nextActive });
      toast.success(nextActive ? t("activated") : t("deactivated"));
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? tc("error"));
    }
  };

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 text-sm text-foreground">
        {member.email} {isSelf && <span className="text-xs text-muted-foreground">({t("you")})</span>}
      </td>
      <td className="px-4 py-3 text-sm">
        {lockedActions ? (
          <span className="capitalize text-muted-foreground">{member.role}</span>
        ) : (
          <select
            value={member.role}
            onChange={(e) => handleRoleChange(e.target.value as InvitableRole)}
            className="px-2 py-1 rounded border border-input bg-background text-sm"
            disabled={updateRole.isPending}
          >
            <option value="recruiter">{t("roleRecruiter")}</option>
            <option value="manager">{t("roleManager")}</option>
          </select>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        {(member.is_active ?? true) ? (
          <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium">
            {t("active")}
          </span>
        ) : (
          <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
            {t("inactive")}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {new Date(member.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-right">
        {!lockedActions && (
          <button
            onClick={toggleActive}
            disabled={setActive.isPending}
            title={(member.is_active ?? true) ? t("deactivate") : t("activate")}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all disabled:opacity-50"
          >
            {(member.is_active ?? true) ? <ShieldX className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </button>
        )}
      </td>
    </tr>
  );
}

// =============================================================================
// Main Page
// =============================================================================
export function TeamPage() {
  const t = useTranslations("team");
  const router = useRouter();
  const { data: me, isLoading: loadingMe } = useMe();
  const { data: members, isLoading: loadingMembers } = useTeamMembers();
  const { data: invitations, isLoading: loadingInvites } = usePendingInvitations();
  const [inviteOpen, setInviteOpen] = useState(false);

  const isOwner = me?.role === "owner";

  // Owner-only page — kick everyone else.
  if (!loadingMe && !isOwner) {
    if (typeof window !== "undefined") router.replace(ROUTES.dashboard);
    return null;
  }

  const sortedMembers = useMemo(
    () => (members ?? []).slice().sort((a, b) => a.email.localeCompare(b.email)),
    [members]
  );

  return (
    <>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-6 max-w-6xl">
        {/* Members section */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="font-display font-semibold text-foreground">{t("members")}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{t("membersHint")}</p>
            </div>
            <button
              onClick={() => setInviteOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm font-medium flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {t("inviteButton")}
            </button>
          </div>

          {loadingMembers ? (
            <div className="p-8 text-center text-muted-foreground text-sm">{t("loading")}</div>
          ) : sortedMembers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">{t("emptyMembers")}</div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("email")}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("role")}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("status")}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("joined")}</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map((m) => (
                  <MemberRow key={m.id} member={m} currentUserId={me!.id} />
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Pending invitations */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-display font-semibold text-foreground">{t("pendingInvitations")}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{t("pendingHint")}</p>
          </div>

          {loadingInvites ? (
            <div className="p-8 text-center text-muted-foreground text-sm">{t("loading")}</div>
          ) : (invitations ?? []).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">{t("emptyInvitations")}</div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("email")}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("role")}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("status")}</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("expires")}</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {(invitations ?? []).map((inv) => (
                  <InvitationRow key={inv.id} invitation={inv} />
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {inviteOpen && <InviteDialog onClose={() => setInviteOpen(false)} />}
    </>
  );
}
