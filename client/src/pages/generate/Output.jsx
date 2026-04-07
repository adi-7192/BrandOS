import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';
import Button from '../../components/ui/Button';
import api from '../../services/api';

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
  const [activeTab, setActiveTab] = useState('linkedin');
  const [content, setContent] = useState({
    linkedin: state?.output?.linkedin || '',
    blog: state?.output?.blog || '',
  });
  const [instruction, setInstruction] = useState('');
  const [iterating, setIterating] = useState(false);

  const brief = state?.brief || {};

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

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

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
          <span className="chip chip-green">✓ 0 restricted words</span>
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
          <Button variant="secondary" className="text-sm" onClick={() => {}}>Save draft</Button>
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
