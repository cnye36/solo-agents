import { supabaseAdmin } from "@/clients/supabase-admin";

/**
 * Profile key for the workspace used exclusively by Solo Agents.
 * AffinityBots may continue using `activeWorkspaceId` on the same profile;
 * Solo never reads that key for integrations, MCP, or assistant provisioning.
 */
export const SOLO_WORKSPACE_PREF_KEY = "soloWorkspaceId" as const;

const SOLO_WORKSPACE_DISPLAY_NAME = "Solo Agents";

type ProfilePreferences = {
  activeWorkspaceId?: string;
  soloWorkspaceId?: string;
  [key: string]: unknown;
};

async function loadPreferences(userId: string): Promise<ProfilePreferences> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("preferences")
    .eq("id", userId)
    .maybeSingle();

  return (profile?.preferences as ProfilePreferences) ?? {};
}

async function saveSoloWorkspacePreference(
  userId: string,
  workspaceId: string,
): Promise<void> {
  const preferences = await loadPreferences(userId);
  const next: ProfilePreferences = {
    ...preferences,
    [SOLO_WORKSPACE_PREF_KEY]: workspaceId,
  };

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ preferences: next })
    .eq("id", userId);

  if (error) {
    console.error("[solo-workspace] failed to persist preference", error);
    throw new Error("Failed to save Solo workspace preference.");
  }
}

async function verifyMembership(
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  return Boolean(data);
}

async function createSoloWorkspace(userId: string): Promise<string> {
  const { data: workspace, error: wsError } = await supabaseAdmin
    .from("workspaces")
    .insert({
      name: SOLO_WORKSPACE_DISPLAY_NAME,
      owner_id: userId,
    })
    .select("id")
    .single();

  if (wsError || !workspace?.id) {
    console.error("[solo-workspace] workspaces insert failed", wsError);
    throw new Error(
      wsError?.message ??
        "Could not create Solo workspace. Ensure the `workspaces` table exists and the service role can insert rows.",
    );
  }

  const memberAttempts = [
    { workspace_id: workspace.id, user_id: userId },
    { workspace_id: workspace.id, user_id: userId, role: "owner" },
  ];

  let memError: { message?: string } | null = null;

  for (const row of memberAttempts) {
    const { error } = await supabaseAdmin.from("workspace_members").insert(row);
    if (!error) {
      memError = null;
      break;
    }
    memError = error;
  }

  if (memError) {
    console.error("[solo-workspace] workspace_members insert failed", memError);
    throw new Error(
      memError.message ??
        "Could not add Solo workspace membership. Check `workspace_members` columns match your schema.",
    );
  }

  return workspace.id;
}

/**
 * Returns the workspace id dedicated to Solo Agents for this user, creating
 * the workspace and profile preference on first use.
 */
export async function ensureSoloWorkspaceId(userId: string): Promise<string> {
  const preferences = await loadPreferences(userId);
  const existingId =
    typeof preferences[SOLO_WORKSPACE_PREF_KEY] === "string"
      ? preferences[SOLO_WORKSPACE_PREF_KEY]
      : undefined;

  if (existingId && (await verifyMembership(userId, existingId))) {
    return existingId;
  }

  if (existingId) {
    console.warn("[solo-workspace] stale soloWorkspaceId; provisioning again", {
      userId,
      existingId,
    });
  }

  const raced = await loadPreferences(userId);
  const racedId =
    typeof raced[SOLO_WORKSPACE_PREF_KEY] === "string"
      ? raced[SOLO_WORKSPACE_PREF_KEY]
      : undefined;

  if (racedId && (await verifyMembership(userId, racedId))) {
    return racedId;
  }

  const workspaceId = await createSoloWorkspace(userId);
  await saveSoloWorkspacePreference(userId, workspaceId);
  return workspaceId;
}
