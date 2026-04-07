import { useNavigate } from 'react-router-dom';
import TopNav from '../../components/layout/TopNav';

export default function Settings() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/settings/brands')}
            className="rounded-xl border border-gray-200 bg-white p-5 text-left hover:border-gray-400 transition-colors">
            <p className="font-semibold text-gray-900">Brand kits</p>
            <p className="text-sm text-gray-400 mt-1">Manage all your brand kits, voice adjectives, restricted words, and channel rules.</p>
          </button>
          <div className="rounded-xl border border-gray-200 bg-white p-5 opacity-50 cursor-not-allowed">
            <p className="font-semibold text-gray-900">Gmail integration</p>
            <p className="text-sm text-gray-400 mt-1">Connect Gmail to capture campaign briefs automatically via labelled emails.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 opacity-50 cursor-not-allowed">
            <p className="font-semibold text-gray-900">Group layer</p>
            <p className="text-sm text-gray-400 mt-1">Available after adding a second brand. Set shared rules across all brands.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 opacity-50 cursor-not-allowed">
            <p className="font-semibold text-gray-900">SSO configuration</p>
            <p className="text-sm text-gray-400 mt-1">Configure Okta, OneLogin, or SAML 2.0 for your workspace.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
