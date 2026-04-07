import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import TopNav from '../../components/layout/TopNav';
import Button from '../../components/ui/Button';

const LINKEDIN_SECTIONS = ['Hook', 'Body', 'Closing', 'Hashtags'];
const BLOG_SECTIONS = ['Headline', 'Opening', 'Body', 'Closing'];

function EditableSection({ label, content, onChange }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">{label}</p>
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange(e.currentTarget.textContent)}
        className="w-full min-h-[60px] rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 focus:outline-none focus:border-gray-900"
      >
        {content}
      </div>
    </div>
  );
}

export default function Preview() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [activeFormat, setActiveFormat] = useState('linkedin');
  const [sections, setSections] = useState({
    linkedin: { hook: '', body: '', closing: '', hashtags: '#brand #content #marketing' },
    blog: { headline: '', opening: '', body: '', closing: '' },
  });

  const updateSection = (format, key, val) => {
    setSections(s => ({ ...s, [format]: { ...s[format], [key]: val } }));
  };

  const handleGenerate = () => {
    navigate('/generate/creating', { state: { brief: state?.brief, sections } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <span>Brief</span>
          <span>→</span>
          <span className="font-medium text-gray-900">Preview</span>
          <span>→</span>
          <span>Generate</span>
        </div>

        <div className="flex gap-2 mb-4">
          {['linkedin', 'blog'].map(fmt => (
            <button key={fmt} onClick={() => setActiveFormat(fmt)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeFormat === fmt ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {fmt === 'linkedin' ? 'LinkedIn post' : 'Blog post'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <p className="text-xs text-gray-400 mb-4">Click any section to edit before generating.</p>

          {activeFormat === 'linkedin' && (
            <>
              <EditableSection label="Hook" content={sections.linkedin.hook} onChange={v => updateSection('linkedin', 'hook', v)} />
              <EditableSection label="Body" content={sections.linkedin.body} onChange={v => updateSection('linkedin', 'body', v)} />
              <EditableSection label="Closing" content={sections.linkedin.closing} onChange={v => updateSection('linkedin', 'closing', v)} />
              <EditableSection label="Hashtags" content={sections.linkedin.hashtags} onChange={v => updateSection('linkedin', 'hashtags', v)} />
            </>
          )}
          {activeFormat === 'blog' && (
            <>
              <EditableSection label="Headline" content={sections.blog.headline} onChange={v => updateSection('blog', 'headline', v)} />
              <EditableSection label="Opening" content={sections.blog.opening} onChange={v => updateSection('blog', 'opening', v)} />
              <EditableSection label="Body" content={sections.blog.body} onChange={v => updateSection('blog', 'body', v)} />
              <EditableSection label="Closing" content={sections.blog.closing} onChange={v => updateSection('blog', 'closing', v)} />
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/generate/brief')} className="text-sm text-gray-500 hover:underline">← Back to brief</button>
          <Button variant="primary" onClick={handleGenerate} className="flex-1">
            Looks good — generate full content →
          </Button>
        </div>
      </div>
    </div>
  );
}
