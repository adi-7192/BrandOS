import { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext(null);

const initialState = {
  // S1
  role: '',
  team: '',
  brandCount: '',
  // S2
  brandName: '',
  primaryMarket: '',
  brandLanguage: '',
  // S3
  contentTypes: [],
  contentTypesInterest: [],
  // S4a
  websiteUrl: '',
  websiteUrls: [],
  websiteSummary: '',
  pastContentExamples: '',
  brandGuidelinesFile: null,
  guidelineFileUrl: '',
  guidelineFileName: '',
  guidelineStoragePath: '',
  guidelineTextExcerpt: '',
  s4aSkipped: false,
  // S4b
  audienceType: '',
  audienceTypeOther: '',
  buyerSeniority: '',
  ageRange: '',
  industrySector: '',
  industryTarget: '',
  industryTargetOther: '',
  audiencePainPoint: '',
  campaignType: '',
  campaignTypeOther: '',
  funnelStages: [],
  toneShift: '',
  toneShiftOther: '',
  proofStyle: '',
  proofStyleOther: '',
  contentGoal: '',
  contentGoalOther: '',
  ctaStyle: '',
  ctaStyleOther: '',
  emojiUsage: '',
  publishingFrequency: '',
  voiceFormality: null,
  campaignCoreWhy: '',
  // S5b / kit cards
  kitCards: null,
  // S6
  confidenceTestResult: null,
};

export function OnboardingProvider({ children }) {
  const [state, setState] = useState(initialState);

  const update = (fields) => setState(prev => ({ ...prev, ...fields }));
  const reset = () => setState(initialState);

  return (
    <OnboardingContext.Provider value={{ ...state, update, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
