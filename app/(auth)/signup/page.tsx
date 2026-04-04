"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSignup } from "@/services/queries";

const schema = z.object({
  company_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const te = useTranslations("errors");
  const signup = useSignup();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signup.mutateAsync(data);
      toast.success(t("accountCreatedCheckEmail"));
      router.push("/login");
    } catch {
      toast.error(te("generic"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">TalentMatch</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t("setUpWorkspace")}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("companyName")}</label>
              <input
                {...register("company_name")}
                placeholder="Acme Corp"
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              {errors.company_name && <p className="text-destructive text-xs mt-1">{errors.company_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("workEmail")}</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("password")}</label>
              <input
                {...register("password")}
                type="password"
                placeholder={t("passwordHint")}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? t("creatingWorkspace") : t("createWorkspace")}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("hasAccount")}{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">{t("login")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
