import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeEditableBrandKitPatch } from './updateBrandKit.js';

test('normalizeEditableBrandKitPatch trims strings and converts editable list fields into arrays', () => {
  const patch = normalizeEditableBrandKitPatch({
    voiceAdjectives: [' Warm ', 'Direct', 'Warm'],
    vocabulary: 'Craft, Neighbourhood',
    restrictedWords: [' cheap ', 'disruptive '],
    channelRulesLinkedin: ' Lead with a point of view. ',
    channelRulesBlog: '',
    contentGoal: ' Thought leadership ',
    publishingFrequency: ' Weekly ',
    audienceType: ' CMOs ',
    buyerSeniority: ' Director ',
    ageRange: ' 30-45 ',
    industrySector: ' Retail ',
    industryTarget: ' Luxury retail ',
    funnelStages: 'Top of funnel, Mid funnel',
    toneShift: ' More premium ',
    proofStyle: ' Customer story ',
    voiceFormality: '4',
    campaignCoreWhy: ' Build preference over time. ',
    pastContentExamples: ' Founder note and launch post. ',
    websiteUrl: ' https://atlas.example ',
    websiteUrls: [' https://atlas.example/about ', 'https://atlas.example/journal'],
    websiteSummary: ' Atlas designs modern retail experiences. ',
    guidelineFileName: 'should be ignored.pdf',
  });

  assert.deepEqual(patch, {
    voiceAdjectives: ['Warm', 'Direct'],
    vocabulary: ['Craft', 'Neighbourhood'],
    restrictedWords: ['cheap', 'disruptive'],
    channelRulesLinkedin: 'Lead with a point of view.',
    channelRulesBlog: '',
    contentGoal: 'Thought leadership',
    publishingFrequency: 'Weekly',
    audienceType: 'CMOs',
    buyerSeniority: 'Director',
    ageRange: '30-45',
    industrySector: 'Retail',
    industryTarget: 'Luxury retail',
    funnelStages: ['Top of funnel', 'Mid funnel'],
    toneShift: 'More premium',
    proofStyle: 'Customer story',
    voiceFormality: 4,
    campaignCoreWhy: 'Build preference over time.',
    pastContentExamples: 'Founder note and launch post.',
    websiteUrl: 'https://atlas.example',
    websiteUrls: ['https://atlas.example/about', 'https://atlas.example/journal'],
    websiteSummary: 'Atlas designs modern retail experiences.',
  });
});

test('normalizeEditableBrandKitPatch preserves empty editable fields without mutating file-based fields', () => {
  const patch = normalizeEditableBrandKitPatch({
    voiceAdjectives: '',
    vocabulary: '',
    restrictedWords: '',
    channelRulesLinkedin: '',
    voiceFormality: '',
    websiteUrls: '',
    guidelineFileUrl: 'https://example.com/guide.pdf',
  });

  assert.deepEqual(patch, {
    voiceAdjectives: [],
    vocabulary: [],
    restrictedWords: [],
    channelRulesLinkedin: '',
    voiceFormality: null,
    websiteUrls: [],
  });
});
