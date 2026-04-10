import { apiServerRequest } from "@/lib/api/server";

export type SendMessagePayload = {
  threadId?: string;
  message: string;
};

export async function createThread() {
  return apiServerRequest<{ threadId: string }>("/threads", {
    method: "POST",
  });
}

export async function sendMessage(payload: SendMessagePayload) {
  return apiServerRequest<{ ok?: true }>("/chat/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
