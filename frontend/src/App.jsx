import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppHeader } from "./components/AppHeader";
import { DashboardPage } from "./pages/DashboardPage";
import { BrowseSkillsPage } from "./pages/BrowseSkillsPage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ConfirmEmailPage } from "./pages/ConfirmEmailPage";
import { AddSkillPage } from "./pages/AddSkillPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TeacherDetailPage } from "./pages/TeacherDetailPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { MatchesPage } from "./pages/MatchesPage";
import { WalletPage } from "./pages/WalletPage";
import { TeachingSessionPage } from "./pages/TeachingSessionPage";
import { BookingsPage } from "./pages/BookingsPage";
import { LearningSessionPage } from "./pages/LearningSessionPage";
import { LandingPage } from "./pages/LandingPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ThemeProvider } from "./theme/ThemeContext";
import { CertificatesPage } from "./pages/CertificatesPage";
import { CertificateDetailPage } from "./pages/CertificateDetailPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-bg-base">
      <AppHeader />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>   
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/confirm" element={<ConfirmEmailPage />} />
            <Route path="/browse" element={<Layout><BrowseSkillsPage/></Layout>}></Route>
            <Route path="/forgot" element={<ForgotPasswordPage />} />
            <Route path="/skills/new" element={<ProtectedRoute><Layout><AddSkillPage/></Layout></ProtectedRoute>}/>
            <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage/></Layout></ProtectedRoute>}/>
            <Route path="/teacher/:id" element={<ProtectedRoute><Layout><TeacherDetailPage/></Layout></ProtectedRoute>}/>
            <Route path="/wallet" element={<ProtectedRoute><Layout><WalletPage/></Layout></ProtectedRoute>}/>
            <Route path="/bookings" element={<ProtectedRoute><Layout><BookingsPage/></Layout></ProtectedRoute>}/>
            <Route path="/certificates/:transactionId" element={<ProtectedRoute><Layout><CertificateDetailPage/></Layout></ProtectedRoute>}/>
            <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage/></Layout></ProtectedRoute>}/>
            <Route path="/how-it-works" element={<Layout><HowItWorksPage/></Layout>} />
            <Route path="/teaching/:transactionId" element={<ProtectedRoute><Layout><TeachingSessionPage/></Layout></ProtectedRoute>}/>
            <Route path="/certificates" element={<ProtectedRoute><Layout><CertificatesPage/></Layout></ProtectedRoute>}/>
            <Route path="/learning/:transactionId" element={<ProtectedRoute><Layout><LearningSessionPage/></Layout></ProtectedRoute>}/>
            <Route path="/" element={<Layout><LandingPage/></Layout>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/matches" element={<ProtectedRoute><Layout><MatchesPage/></Layout></ProtectedRoute>}/>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}