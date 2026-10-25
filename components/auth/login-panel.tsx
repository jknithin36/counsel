"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert02Icon,
  Briefcase01Icon,
  UserIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { describedBy, Field, inputClass } from "@/components/site/forms/fields";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { safeNext } from "@/lib/auth/roles";
import {
  isDemoDataCorrupted,
  resetDemo,
  type SignInResult,
  signIn,
  signInAs,
} from "@/lib/auth/session";
import { auth as a } from "@/lib/content/auth";
import {
  DEMO_PASSWORD,
  demoClientUser,
  demoStaffUser,
} from "@/lib/data/seed/users";
import { useDemoStore } from "@/lib/data/store";

const schema = z.object({
  email: z.string().trim().min(1, a.errors.email),
  password: z.string().min(1, a.errors.password),
  remember: z.boolean(),
});
type Values = z.infer<typeof schema>;

type Pending = "staff" | "client" | "form" | null;

export function LoginPanel() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<"invalid" | "corrupted" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isDemoDataCorrupted()) setError("corrupted");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: demoStaffUser.email,
      password: DEMO_PASSWORD,
      remember: true,
    },
  });

  async function finish(which: Pending, attempt: () => SignInResult) {
    setPending(which);
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 400));
    const result = attempt();
    if (!result.ok) {
      setError(result.error);
      setPending(null);
      return;
    }
    // Staff land on their chosen start page unless a page was requested.
    const start = !next
      ? useDemoStore.getState().profiles[result.user.id]?.defaultTab
      : undefined;
    router.replace(safeNext(start ?? next, result.user.role));
  }

  const demoButtons = [
    {
      key: "staff" as const,
      icon: Briefcase01Icon,
      user: demoStaffUser,
      copy: a.demo.staff,
    },
    {
      key: "client" as const,
      icon: UserIcon,
      user: demoClientUser,
      copy: a.demo.client,
    },
  ];

  return (
    <div className="w-full max-w-[400px]">
      <h1 className="text-[44px] leading-[1.05] tracking-[-0.02em] text-[#111]">
        {a.title}
      </h1>
      <p className="mt-3 text-[16px] leading-[1.6] text-[#3a3a3a]">{a.intro}</p>

      {error === "corrupted" && (
        <div
          role="alert"
          className="mt-6 flex flex-col gap-3 rounded-[10px] border border-[#f1c8c4] bg-[#fdecec] p-4 text-[14px] text-[#7a1d14]"
        >
          <p className="flex items-start gap-2">
            <HugeiconsIcon
              icon={Alert02Icon}
              className="mt-0.5 size-4 shrink-0"
            />
            {a.errors.corrupted}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="self-start bg-white"
            onClick={resetDemo}
          >
            {a.resetDemo}
          </Button>
        </div>
      )}

      <section
        aria-labelledby="demo-label"
        className="mt-8 rounded-[10px] bg-surface p-4"
      >
        <h2
          id="demo-label"
          className="font-sans text-[13px] font-medium uppercase leading-normal tracking-[0.08em] text-muted-foreground"
        >
          {a.demoLabel}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {demoButtons.map((b) => (
            <button
              key={b.key}
              type="button"
              disabled={pending !== null}
              aria-busy={pending === b.key}
              onClick={() => finish(b.key, () => signInAs(b.user))}
              className="flex min-w-0 flex-col items-start gap-0.5 rounded-[6px] border border-border bg-white px-2.5 py-1.5 text-left transition-colors hover:border-[#111] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[#111]">
                {pending === b.key ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <HugeiconsIcon
                    icon={b.icon}
                    strokeWidth={1.5}
                    className="size-3.5"
                  />
                )}
                {b.copy.title}
              </span>
              <span className="w-full truncate text-[11px] text-muted-foreground">
                {b.copy.subtitle}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="my-8 flex items-center gap-4 text-[13px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {a.divider}
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        noValidate
        onSubmit={handleSubmit((v) =>
          finish("form", () => signIn(v.email, v.password, v.remember)),
        )}
        className="flex flex-col gap-2"
      >
        <Field id="email" label={a.fields.email} error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="username"
            className={inputClass}
            aria-invalid={Boolean(errors.email) || error === "invalid"}
            aria-describedby={describedBy("email")}
            {...register("email")}
          />
        </Field>
        <Field
          id="password"
          label={a.fields.password}
          error={errors.password?.message}
        >
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={`${inputClass} pr-12`}
              aria-invalid={Boolean(errors.password) || error === "invalid"}
              aria-describedby={describedBy("password")}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={
                showPassword ? a.fields.hidePassword : a.fields.showPassword
              }
              aria-pressed={showPassword}
              className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center rounded-button text-muted-foreground hover:text-[#111]"
            >
              <HugeiconsIcon
                icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                className="size-5"
              />
            </button>
          </div>
        </Field>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-[#3a3a3a]">
            <input
              type="checkbox"
              className="size-4 accent-[#111]"
              {...register("remember")}
            />
            {a.fields.remember}
          </label>
          <button
            type="button"
            onClick={() => toast.add({ title: a.forgotToast })}
            className="text-[14px] font-medium text-[#111] underline-offset-4 hover:underline"
          >
            {a.fields.forgot}
          </button>
        </div>

        {/* Reserved height so the error doesn't shift the button. */}
        <p
          role="alert"
          className="mt-3 min-h-5 text-[13px] leading-5 text-[#b42318]"
        >
          {error === "invalid" && a.errors.invalid}
        </p>

        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full"
          disabled={pending !== null}
          aria-busy={pending === "form"}
        >
          {pending === "form" ? (
            <>
              <Spinner className="size-3.5" /> {a.signingIn}
            </>
          ) : (
            a.submit
          )}
        </Button>
      </form>

      <p className="mt-8 text-[12px] text-muted-foreground">{a.footerNote}</p>
    </div>
  );
}
