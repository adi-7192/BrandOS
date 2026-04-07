import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { BrandProvider } from './context/BrandContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Auth
import SignUp from './pages/auth/SignUp';
import SignIn from './pages/auth/SignIn';
import GoogleCallback from './pages/auth/GoogleCallback';

// Onboarding
import S1Team from './pages/onboarding/S1Team';
import S2BrandName from './pages/onboarding/S2BrandName';
import S3ContentTypes from './pages/onboarding/S3ContentTypes';
import Unlocked from './pages/onboarding/Unlocked';
import S4aBrandContent from './pages/onboarding/S4aBrandContent';
import S4bAudienceCampaign from './pages/onboarding/S4bAudienceCampaign';
import S5aGenerating from './pages/onboarding/S5aGenerating';
import S5bReviewKit from './pages/onboarding/S5bReviewKit';
import S6ConfidenceTest from './pages/onboarding/S6ConfidenceTest';
import S7KitLive from './pages/onboarding/S7KitLive';

// Main app
import Dashboard from './pages/dashboard/Dashboard';
import Inbox from './pages/inbox/Inbox';
import Brief from './pages/generate/Brief';
import Preview from './pages/generate/Preview';
import Creating from './pages/generate/Creating';
import Output from './pages/generate/Output';

// Settings
import Settings from './pages/settings/Settings';
import BrandsList from './pages/settings/BrandsList';
import BrandEditor from './pages/settings/BrandEditor';

export default function App() {
  return (
    <AuthProvider>
      <BrandProvider>
        <OnboardingProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Navigate to="/signin" replace />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/auth/callback" element={<GoogleCallback />} />

            {/* Onboarding */}
            <Route path="/onboarding/team" element={<ProtectedRoute><S1Team /></ProtectedRoute>} />
            <Route path="/onboarding/brand-name" element={<ProtectedRoute><S2BrandName /></ProtectedRoute>} />
            <Route path="/onboarding/content-types" element={<ProtectedRoute><S3ContentTypes /></ProtectedRoute>} />
            <Route path="/onboarding/unlocked" element={<ProtectedRoute><Unlocked /></ProtectedRoute>} />
            <Route path="/onboarding/brand-content" element={<ProtectedRoute><S4aBrandContent /></ProtectedRoute>} />
            <Route path="/onboarding/audience-campaign" element={<ProtectedRoute><S4bAudienceCampaign /></ProtectedRoute>} />
            <Route path="/onboarding/generating" element={<ProtectedRoute><S5aGenerating /></ProtectedRoute>} />
            <Route path="/onboarding/review-kit" element={<ProtectedRoute><S5bReviewKit /></ProtectedRoute>} />
            <Route path="/onboarding/confidence-test" element={<ProtectedRoute><S6ConfidenceTest /></ProtectedRoute>} />
            <Route path="/onboarding/kit-live" element={<ProtectedRoute><S7KitLive /></ProtectedRoute>} />

            {/* Main app */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path="/generate/brief" element={<ProtectedRoute><Brief /></ProtectedRoute>} />
            <Route path="/generate/preview" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
            <Route path="/generate/creating" element={<ProtectedRoute><Creating /></ProtectedRoute>} />
            <Route path="/generate/output" element={<ProtectedRoute><Output /></ProtectedRoute>} />

            {/* Settings */}
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/brands" element={<ProtectedRoute><BrandsList /></ProtectedRoute>} />
            <Route path="/settings/brands/:id" element={<ProtectedRoute><BrandEditor /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/signin" replace />} />
          </Routes>
        </OnboardingProvider>
      </BrandProvider>
    </AuthProvider>
  );
}
