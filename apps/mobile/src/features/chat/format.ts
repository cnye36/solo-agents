const dateFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export function formatMessageTime(isoString: string) {
  return dateFormatter.format(new Date(isoString));
}

export function trimPreview(text: string, maxLength = 92) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}...`;
}
