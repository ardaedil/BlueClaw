export type ParsedOpenClawCommand = {
  action: string;
  payload: Record<string, unknown>;
  explanation: string;
};

function extractPrice(command: string) {
  const match = command.match(/under\s*\$?(\d+(?:\.\d+)?)/i);
  return match ? Number(match[1]) : undefined;
}

function extractWatchId(command: string) {
  const quoted = command.match(/"([^"]+)"/);
  if (quoted) return quoted[1];

  const trailing = command.match(/(?:watch|id)\s+([a-zA-Z0-9_-]{4,})/i);
  return trailing?.[1];
}

export function parseOpenClawCommand(command: string, userId: string): ParsedOpenClawCommand {
  const normalized = command.trim();
  const lower = normalized.toLowerCase();

  if (lower.includes('show me my active watches') || lower.includes('list watches') || lower === 'show watches') {
    return {
      action: 'list_watches',
      payload: { userId, activeOnly: true },
      explanation: 'Listing active watches for the user.'
    };
  }

  if (lower.startsWith('pause')) {
    const id = extractWatchId(normalized);
    if (!id) throw new Error('Could not detect watch id for pause command. Use: pause watch <id>');
    return {
      action: 'pause_watch',
      payload: { id },
      explanation: `Pausing watch ${id}.`
    };
  }

  if (lower.startsWith('resume')) {
    const id = extractWatchId(normalized);
    if (!id) throw new Error('Could not detect watch id for resume command. Use: resume watch <id>');
    return {
      action: 'resume_watch',
      payload: { id },
      explanation: `Resuming watch ${id}.`
    };
  }

  if (lower.startsWith('delete')) {
    const id = extractWatchId(normalized);
    if (!id) throw new Error('Could not detect watch id for delete command. Use: delete watch <id>');
    return {
      action: 'delete_watch',
      payload: { id },
      explanation: `Deleting watch ${id}.`
    };
  }

  if (lower.includes('recent matches')) {
    const id = extractWatchId(normalized);
    if (!id) throw new Error('Could not detect watch id for recent matches. Use: recent matches for watch <id>');
    return {
      action: 'recent_matches',
      payload: { watchJobId: id, limit: 10 },
      explanation: `Fetching recent matches for watch ${id}.`
    };
  }

  if (lower.includes('watch ebay for')) {
    const target = normalized.split(/watch ebay for/i)[1]?.trim();
    if (!target) throw new Error('Could not parse watch target. Example: Watch eBay for a PS5 under $300');

    const maxPrice = extractPrice(normalized);
    const query = target.replace(/under\s*\$?\d+(?:\.\d+)?/i, '').trim();
    const cleanedQuery = query.replace(/^a\s+/i, '').trim();

    return {
      action: 'create_watch',
      payload: {
        userId,
        title: maxPrice ? `${cleanedQuery} under $${maxPrice}` : cleanedQuery,
        rawPrompt: normalized,
        query: cleanedQuery,
        maxPrice,
        preferredKeywords: cleanedQuery.split(/\s+/).filter(Boolean)
      },
      explanation: `Creating a watch for ${cleanedQuery}${maxPrice ? ` under $${maxPrice}` : ''}.`
    };
  }

  throw new Error('Unsupported command. Try: "Watch eBay for a PS5 under $300" or "Show me my active watches".');
}
