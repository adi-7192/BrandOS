export function mapGenerationSessionRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    brandId: row.brand_id,
    brandName: row.brand_name,
    language: row.brand_language,
    sessionTitle: row.session_title,
    source: row.source,
    sourceCardIds: row.source_card_ids || [],
    status: row.status,
    currentStep: row.current_step,
    publishDate: row.publish_date || '',
    briefPayload: row.brief_payload || {},
    previewPayload: row.preview_payload || {},
    outputPayload: row.output_payload || {},
    activeTab: row.active_tab || 'linkedin',
    lastInstruction: row.last_instruction || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
