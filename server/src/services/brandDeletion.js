export function collectGuidelineStoragePaths(rows = []) {
  return [...new Set(
    rows
      .map((row) => String(row?.guideline_storage_path || '').trim())
      .filter(Boolean)
  )];
}
