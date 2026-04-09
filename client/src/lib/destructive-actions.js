export function buildBrandDeleteConfirmation({ brandName }) {
  return {
    title: 'Delete brand kit',
    subject: brandName || 'This brand',
    description: 'This permanently deletes this brand kit and all related campaign work for this brand. This action cannot be undone.',
    warningItems: [
      'All campaign work for this brand will be permanently deleted.',
      'Saved drafts and inbox briefs tied to this brand will be permanently deleted.',
      'Uploaded guideline files for this brand will be permanently deleted.',
    ],
    confirmLabel: 'Delete brand kit permanently',
  };
}

export function buildCampaignDeleteConfirmation({ sessionTitle }) {
  return {
    title: 'Delete campaign',
    subject: sessionTitle || 'Untitled campaign',
    description: 'This permanently deletes this campaign and its in-progress work. This action cannot be undone.',
    warningItems: [
      'The current brief, preview, and generated content for this campaign will be permanently deleted.',
    ],
    confirmLabel: 'Delete campaign permanently',
  };
}
