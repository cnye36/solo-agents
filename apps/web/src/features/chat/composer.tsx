"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { formatFileSize } from "@/features/chat/chat-format";
import {
  CloseIcon,
  PaperclipIcon,
  SendIcon,
} from "@/features/chat/chat-icons";
import type { AttachmentDraft } from "@/features/chat/chat-types";

type ComposerProps = {
  draft: string;
  isSending: boolean;
  onDraftChange: (value: string) => void;
  onSend: (payload: { message: string; attachments: AttachmentDraft[] }) => void;
};

function fileToAttachment(file: File): AttachmentDraft {
  const isImage = file.type.startsWith("image/");

  return {
    id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    sizeLabel: formatFileSize(file.size),
    type: file.type || "application/octet-stream",
    previewUrl: isImage ? URL.createObjectURL(file) : undefined,
  };
}

export function Composer({
  draft,
  isSending,
  onDraftChange,
  onSend,
}: ComposerProps) {
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<AttachmentDraft[]>([]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
  }, [draft]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  function pushFiles(files: FileList | File[]) {
    const nextAttachments = Array.from(files).map(fileToAttachment);
    setAttachments((current) => [...current, ...nextAttachments]);
  }

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length) {
      return;
    }

    pushFiles(event.target.files);
    event.target.value = "";
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const imageFiles: File[] = [];

    for (const item of Array.from(event.clipboardData.items)) {
      if (item.kind === "file") {
        const file = item.getAsFile();

        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length) {
      event.preventDefault();
      pushFiles(imageFiles);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!isSending && draft.trim()) {
        onSend({
          message: draft.trim(),
          attachments,
        });
        setAttachments([]);
      }
    }
  }

  function handleSendClick() {
    if (!draft.trim() || isSending) {
      return;
    }

    onSend({
      message: draft.trim(),
      attachments,
    });
    setAttachments([]);
  }

  function removeAttachment(attachmentId: string) {
    setAttachments((current) => {
      const target = current.find((item) => item.id === attachmentId);

      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((item) => item.id !== attachmentId);
    });
  }

  useEffect(() => {
    return () => {
      for (const attachment of attachmentsRef.current) {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      }
    };
  }, []);

  return (
    <div className="sticky bottom-0 z-10 shrink-0 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,32,0.97),rgba(12,18,32,0.92))] p-3 shadow-[0_18px_48px_rgba(0,0,0,0.22)] backdrop-blur">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.txt,.md,.json,.csv,.pdf"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {attachments.length ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {attachment.name}
                </p>
                <p className="text-xs text-slate-400">{attachment.sizeLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="rounded-full p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label={`Remove ${attachment.name}`}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          aria-label="Add attachment"
        >
          <PaperclipIcon className="h-4 w-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          rows={1}
          placeholder="Send a message"
          className="min-h-[52px] max-h-[220px] flex-1 resize-none rounded-[24px] border border-white/8 bg-black/25 px-4 py-3 text-[15px] leading-6 text-slate-100 outline-none placeholder:text-slate-500"
          disabled={isSending}
        />

        <button
          type="button"
          onClick={handleSendClick}
          disabled={isSending || !draft.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-slate-500"
          aria-label="Send message"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
