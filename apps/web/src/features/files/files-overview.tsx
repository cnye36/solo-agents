import type { KnowledgeFile } from "@solo-agents/types";
import { FeatureCard } from "@/components/ui/feature-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

type FilesOverviewProps = {
  files: KnowledgeFile[];
};

export function FilesOverview({ files }: FilesOverviewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Files"
        title="Knowledge for your assistant"
        description="Users should understand this as uploading useful reference material, not managing a retrieval pipeline."
        action={
          <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950">
            Upload file
          </button>
        }
      />

      <FeatureCard
        title="Uploaded files"
        description="This will connect to the existing knowledge upload and document assignment endpoints in AffinityBots."
        footer="Implementation TODO: POST to /api/knowledge with assistantId, poll processing status, and load the assistant-scoped file list."
      >
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-950/50 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-white">{file.name}</p>
                <p className="mt-1 text-sm text-zinc-300">{file.sizeLabel}</p>
              </div>
              <StatusBadge
                label={file.status}
                tone={file.status === "ready" ? "success" : "warning"}
              />
            </div>
          ))}
        </div>
      </FeatureCard>
    </div>
  );
}
