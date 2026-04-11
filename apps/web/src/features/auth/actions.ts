"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error: string | null;
  info?: string | null;
};

export async function signIn(formData: FormData): Promise<AuthFormState | void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[auth] signInWithPassword failed", {
      email,
      message: error.message,
      status: error.status,
    });
    return { error: error.message };
  }

  const cookieStore = await cookies();
  const cookieNamesAfterSignIn = cookieStore.getAll().map((cookie) => cookie.name);

  // Ensure session is read back so cookies are committed before navigation.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("[auth] signIn success", {
    email,
    userId: signInData.user?.id ?? null,
    hasUserAfterReadback: Boolean(user),
    hasSessionAfterReadback: Boolean(session),
    accessTokenPrefix: session?.access_token?.slice(0, 12) ?? null,
    cookieNamesAfterSignIn,
  });

  if (!user) {
    return {
      error:
        "Signed in but no session was stored. Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in apps/web/.env.local.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/chat");
}

export async function signUp(formData: FormData): Promise<AuthFormState | void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/chat`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is enabled, there is no session yet.
  if (!data.session) {
    return {
      error: null,
      info: "Check your email to confirm your account before signing in.",
    };
  }

  await supabase.auth.getUser();
  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const cookieStore = await cookies();
  console.log("[auth] signOut", {
    remainingCookieNames: cookieStore.getAll().map((cookie) => cookie.name),
  });
  revalidatePath("/", "layout");
  redirect("/login");
}
