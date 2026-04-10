import { API_TODOS } from "@solo-agents/config";
import type { AppBootstrapData } from "@solo-agents/types";
import { apiServerRequest } from "@/lib/api/server";

export type AppBootstrapViewModel = AppBootstrapData & {
  todos: string[];
};

const fallbackBootstrap: AppBootstrapData = {
  user: {
    firstName: "there",
    email: "",
  },
  assistant: {
    id: "assistant_demo",
    name: "Northstar Assistant",
    status: "provisioning",
    description:
      "The assistant bootstrap endpoint has not returned a live assistant yet.",
  },
  recentThreads: [],
  connectedApps: [],
  files: [],
  preferences: [
    {
      title: "Response style",
      description: "How your assistant should sound and structure answers.",
      items: [{ label: "Tone", value: "Clear and confident" }],
    },
  ],
  onboardingComplete: false,
  billing: {
    planName: "Free",
    renewalLabel: "No renewal scheduled",
  },
};

export async function getAppBootstrapData(): Promise<AppBootstrapViewModel> {
  try {
    const data = await apiServerRequest<
      AppBootstrapData | { assistant: null; onboardingComplete: false }
    >("/bootstrap");

    if ("assistant" in data && data.assistant === null) {
      return {
        ...fallbackBootstrap,
        onboardingComplete: false,
        todos: [
          API_TODOS.bootstrap,
          API_TODOS.chat,
          API_TODOS.files,
          API_TODOS.integrations,
          API_TODOS.auth,
        ],
      };
    }

    return {
      ...data,
      todos: [
        API_TODOS.bootstrap,
        API_TODOS.chat,
        API_TODOS.files,
        API_TODOS.integrations,
        API_TODOS.auth,
      ],
    };
  } catch {
    return {
      ...fallbackBootstrap,
      todos: [
        API_TODOS.bootstrap,
        API_TODOS.chat,
        API_TODOS.files,
        API_TODOS.integrations,
        API_TODOS.auth,
      ],
    };
  }
}
