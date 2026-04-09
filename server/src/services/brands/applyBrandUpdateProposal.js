const FIELD_MAP = {
  voiceAdjectives: 'voice_adjectives',
  vocabulary: 'vocabulary',
  restrictedWords: 'restricted_words',
  audienceType: 'audience_type',
  toneShift: 'tone_shift',
  proofStyle: 'proof_style',
  channelRulesLinkedin: 'channel_rules_linkedin',
  channelRulesBlog: 'channel_rules_blog',
};

export async function applyBrandUpdateProposal({ client, brandId, proposal = {} }) {
  const fields = proposal.fields || {};
  const updates = [];
  const values = [];

  for (const [key, column] of Object.entries(FIELD_MAP)) {
    const suggested = fields[key]?.suggested;
    if (suggested === undefined) continue;

    values.push(Array.isArray(suggested) ? suggested : suggested || null);
    updates.push(`${column} = $${values.length}`);
  }

  if (updates.length === 0) {
    return false;
  }

  values.push(brandId);

  await client.query(
    `UPDATE brand_kits
     SET ${updates.join(', ')}
     WHERE brand_id = $${values.length} AND is_active = TRUE`,
    values
  );

  return true;
}
