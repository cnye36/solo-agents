export type AttachmentDraft = {
  id: string;
  name: string;
  sizeLabel: string;
  type: string;
  previewUrl?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  status?: "streaming" | "complete" | "error";
  attachments?: AttachmentDraft[];
};
