import type { NavItem } from "@solo-agents/types";

export const APP_NAME = "Northstar Assistant";

export const APP_DESCRIPTION =
  "A premium, chat-first AI assistant experience built on top of the existing AffinityBots platform.";

export const APP_TAGLINE =
  "One assistant. One conversation space. One simple way to get work done.";

export const NAV_ITEMS: NavItem[] = [
  { href: "/chat", label: "Chat" },
  { href: "/integrations", label: "Apps" },
  { href: "/files", label: "Files" },
];

export const API_TODOS = {
  auth: "Map auth to Supabase SSR in the web app and token verification in the API app.",
  bootstrap:
    "Add a bootstrap endpoint that returns user, assistant, onboarding, and billing summary in one response.",
  chat: "Wire chat to the AffinityBots assistant thread endpoints and LangGraph runtime.",
  files:
    "Connect file uploads to the existing knowledge endpoints and attachment storage flows.",
  integrations:
    "Map connected apps to the AffinityBots integrations catalog and user connection state.",
} as const;
