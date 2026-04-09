function getTimestamp(value) {
  const timestamp = new Date(value || 0).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function buildUpcomingDeadlineItems(rows = []) {
  const sessionBackedBriefs = new Set();

  for (const row of rows) {
    if (row.kind !== 'session' || !row.publish_date) {
      continue;
    }

    for (const sourceCardId of row.source_card_ids || []) {
      sessionBackedBriefs.add(`${sourceCardId}:${row.publish_date}`);
    }
  }

  return rows
    .filter((row) => {
      if (!row.publish_date) {
        return false;
      }

      if (row.kind !== 'brief') {
        return true;
      }

      return !sessionBackedBriefs.has(`${row.source_id}:${row.publish_date}`);
    })
    .map((row) => ({
      id: row.source_id,
      kind: row.kind,
      title: row.title || 'Untitled campaign',
      brandName: row.brand_name || 'Unknown brand',
      publishDate: row.publish_date,
      stateLabel: row.state_label || 'Scheduled',
      sourceCardIds: row.source_card_ids || [],
      currentStep: row.current_step || 'brief',
      updatedAt: row.updated_at,
    }))
    .sort((a, b) => {
      const publishDiff = getTimestamp(a.publishDate) - getTimestamp(b.publishDate);
      if (publishDiff !== 0) {
        return publishDiff;
      }

      return getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt);
    })
    .slice(0, 6);
}

export function mapDashboardBrandRows(rows = []) {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    market: row.market,
    language: row.language,
    updatedAt: row.updated_at,
    voiceAdjectives: row.voice_adjectives || [],
    pendingBriefCount: Number(row.pending_brief_count || 0),
    hasGuidelineDocument: Boolean(row.guideline_file_name),
  }));
}
