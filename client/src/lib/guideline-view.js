export function buildGuidelineDisplay({ guidelineFileName }) {
  if (!guidelineFileName) {
    return {
      title: '',
      meta: '',
      detailItems: [],
    };
  }

  return {
    title: `Guidelines applied from ${guidelineFileName}`,
    meta: 'Used to guide AI extraction and generation.',
    detailItems: [`File: ${guidelineFileName}`],
  };
}
