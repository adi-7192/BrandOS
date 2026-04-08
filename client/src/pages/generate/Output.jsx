import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getNextOutputIntentQuestion } from '../../lib/intent-capture';

function ComplianceItem({ label, value, pass }) {
  return (
    <span className={`text-xs flex items-center gap-1 ${pass ? 'text-green-700' : 'text-amber-600'}`}>
      {pass ? '✓' : '⚠'} {label}{value !== undefined ? `: ${value}` : ''}
    </span>
  );
}

export default function Output() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState(state?.activeTab || 'linkedin');
  const [content, setContent] = useState({
    linkedin: state?.output?.linkedin || '',
    blog: state?.output?.blog || '',
  });
  const [instruction, setInstruction] = useState('');
  const [iterating, setIterating] = useState(false);
  const [saveState, setSaveState] = useState({ saving: false, message: '' });
  const [intentHidden, setIntentHidden] = useState(false);

  const brief = state?.brief || {};
  const outputIntentQuestion = useMemo(
    () => getNextOutputIntentQuestion(user?.intentState),
    [user?.intentState]
  );

  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
  const hashtagCount = (text) => (text.match(/#\w+/g) || []).length;
  const hasHook = (text) => text.trim().split('\n')[0].length > 10;
  const hasCTA = (text) => /\b(contact|reach out|learn more|click|sign up|book|download|try|get started)\b/i.test(text);

  const linkedinCompliance = {
    wordCount: wordCount(content.linkedin),
    withinLimit: wordCount(content.linkedin) <= 220,
    hashtags: hashtagCount(content.linkedin),
    hookOk: hasHook(content.linkedin),
    ctaOk: hasCTA(content.linkedin),
  };
  const blogCompliance = {
    wordCount: wordCount(content.blog),
    inRange: wordCount(content.blog) >= 400 && wordCount(content.blog) <= 1000,
    closingOk: content.blog.trim().endsWith('?') || content.blog.trim().length > 0,
  };

  const handleIterate = async () => {
    if (!instruction.trim()) return;
    setIterating(true);
    try {
      const res = await api.post('/generate/iterate', { brief, instruction, currentContent: content });
      setContent(res.data.output);
    } catch {
      // silent
    } finally {
      setIterating(false);
      setInstruction('');
    }
  };

  const handleSaveDraft = async () => {
    if (!brief.brandId) {
      setSaveState({ saving: false, message: 'This draft cannot be saved because the brand context is missing.' });
      return;
    }

    setSaveState({ saving: true, message: '' });
    try {
      const res = await api.post('/generate/save-draft', {
        brandId: brief.brandId,
        inboxCardId: brief.sourceCardIds?.length === 1 ? brief.sourceCardIds[0] : null,
        format: activeTab,
        content: content[activeTab],
        instruction: instruction || null,
      });
      setSaveState({ saving: false, message: `Saved version ${res.data.version}.` });
    } catch {
      setSaveState({ saving: false, message: 'Failed to save draft. Please try again.' });
    }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  const handleIntentAnswer = async (answer) => {
    if (!outputIntentQuestion) return;

    await api.post('/intent', {
      moment: 'post_generation',
      question_key: outputIntentQuestion.questionKey,
      answer,
      content_piece_count: user?.intentState?.generationSessionCount || 0,
    });
    setIntentHidden(true);
    await refreshUser();
  };

  const handleIntentDismiss = async () => {
    if (!outputIntentQuestion) return;

    await api.post('/intent/dismiss', {
      moment: 'post_generation',
      question_key: outputIntentQuestion.questionKey,
      content_piece_count: user?.intentState?.generationSessionCount || 0,
    });
    setIntentHidden(true);
    await refreshUser();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {['linkedin', 'blog'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {tab === 'linkedin' ? 'LinkedIn post' : 'Blog post'}
            </button>
          ))}
        </div>

        {/* Output badge row */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          <span className="chip chip-purple">{brief.brandName}</span>
          <span className="chip chip-grey">{activeTab === 'linkedin' ? 'LinkedIn' : 'Blog'}</span>
          {brief.contentGoal && <span className="chip chip-grey">{brief.contentGoal}</span>}
          {brief.toneShift && <span className="chip chip-grey">{brief.toneShift}</span>}
          {brief.language && <span className="chip chip-grey">{brief.language}</span>}
          <span className="chip chip-green">✓ {brief.kit?.restrictedWords?.length || 0} restricted words</span>
        </div>

        {/* Output body */}
        <div
          contentEditable
          suppressContentEditableWarning
          onInput={e => setContent(c => ({ ...c, [activeTab]: e.currentTarget.textContent }))}
          className="min-h-[160px] w-full rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-800 focus:outline-none focus:border-gray-900 whitespace-pre-wrap"
        >
          {content[activeTab]}
        </div>

        {/* Compliance row */}
        <div className="flex flex-wrap gap-3 mt-2 mb-4">
          {activeTab === 'linkedin' ? (
            <>
              <ComplianceItem label="Words" value={`${linkedinCompliance.wordCount}/220`} pass={linkedinCompliance.withinLimit} />
              <ComplianceItem label="Hashtags" value={linkedinCompliance.hashtags} pass={linkedinCompliance.hashtags <= 3} />
              <ComplianceItem label="Hook in line 1" pass={linkedinCompliance.hookOk} />
              <ComplianceItem label="CTA detected" pass={linkedinCompliance.ctaOk} />
            </>
          ) : (
            <>
              <ComplianceItem label="Words" value={`${blogCompliance.wordCount}`} pass={blogCompliance.inRange} />
              <ComplianceItem label="Closing structure" pass={blogCompliance.closingOk} />
            </>
          )}
        </div>

        {/* Contextual iteration chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {activeTab === 'linkedin' && !linkedinCompliance.ctaOk && (
            <button onClick={() => setInstruction('Add a CTA')} className="text-xs px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700">
              Add a CTA
            </button>
          )}
          {activeTab === 'linkedin' && !linkedinCompliance.withinLimit && (
            <button onClick={() => setInstruction('Make it shorter')} className="text-xs px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-700">
              Make it shorter
            </button>
          )}
        </div>

        {/* Iteration bar */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={instruction}
            onChange={e => setInstruction(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleIterate()}
            placeholder="e.g. Make it shorter · Add a CTA · Use a question as the hook"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-gray-900"
          />
          <Button variant="primary" disabled={iterating || !instruction.trim()} onClick={handleIterate}>
            {iterating ? '…' : 'Apply →'}
          </Button>
        </div>

        {/* Export row */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="secondary" className="text-sm" onClick={handleSaveDraft} disabled={saveState.saving}>
            {saveState.saving ? 'Saving…' : 'Save draft'}
          </Button>
          <Button variant="secondary" className="text-sm" onClick={() => copyToClipboard(content[activeTab])}>Copy to clipboard</Button>
          {activeTab === 'blog' && (
            <Button variant="secondary" className="text-sm" onClick={() => {}}>Copy markdown</Button>
          )}
          <div className="relative">
            <Button variant="secondary" className="text-sm border-dashed cursor-not-allowed opacity-60">
              Post to LinkedIn
            </Button>
            <span className="absolute -top-2 -right-2 text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded-full">Coming V2</span>
          </div>
        </div>
        {saveState.message && <p className="mb-4 text-sm text-brand-muted">{saveState.message}</p>}

        {outputIntentQuestion && !intentHidden && (
          <div className="mb-6 rounded-xl border border-brand bg-brand-surface-subtle px-4 py-4 animate-dashboard-enter">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-brand">{outputIntentQuestion.label}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {outputIntentQuestion.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleIntentAnswer(option)}
                      className="rounded-full bg-brand-surface px-3 py-2 text-xs font-medium text-brand-muted transition-colors hover:text-brand"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleIntentDismiss}
                className="text-sm font-medium text-brand-muted transition-colors hover:text-brand"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Format switch */}
        <div className="border-t border-gray-200 pt-4">
          {activeTab === 'linkedin' ? (
            <button onClick={() => setActiveTab('blog')} className="text-sm text-gray-500 hover:underline">
              Generate blog post for this campaign →
            </button>
          ) : (
            <button onClick={() => setActiveTab('linkedin')} className="text-sm text-gray-500 hover:underline">
              ← Back to LinkedIn post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
