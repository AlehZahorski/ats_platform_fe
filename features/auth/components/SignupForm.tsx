"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSignup } from "@/services/queries";
import { ROUTES } from "@/config/routes";
import { signupSchema, type SignupFormData } from "../schemas/auth.schema";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/Logo";

export function SignupForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const te = useTranslations("errors");
  const signup = useSignup();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup.mutateAsync(data);
      toast.success(t("accountCreatedCheckEmail"));
      router.push(ROUTES.login);
    } catch {
      toast.error(te("generic"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Logo className="h-20 w-auto mx-auto" />
          <p className="text-muted-foreground mt-2 text-sm">{t("setUpWorkspace")}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="company_name">{t("companyName")}</Label>
              <Input
                id="company_name"
                {...register("company_name")}
                placeholder="Acme Corp"
              />
              {errors.company_name && <p className="text-destructive text-xs">{errors.company_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">{t("workEmail")}</Label>
              <Input
                id="email"
                {...register("email")}
                type="email"
                placeholder="you@company.com"
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                {...register("password")}
                type="password"
                placeholder={t("passwordHint")}
              />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? t("creatingWorkspace") : t("createWorkspace")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("hasAccount")}{" "}
            <Link href={ROUTES.login} className="text-primary font-medium hover:underline">{t("login")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
