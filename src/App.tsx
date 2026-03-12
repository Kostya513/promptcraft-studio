import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { AdminProvider } from "./contexts/AdminContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AppLayout } from "./components/layout/AppLayout";
import AdminLayout from "./components/admin/AdminLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Onboarding from "./pages/Onboarding";
import SearchCatalog from "./pages/SearchCatalog";
import PromptMarket from "./pages/PromptMarket";
import PromptDetail from "./pages/PromptDetail";
import AssistantPage from "./pages/AssistantPage";
import StudioPage from "./pages/StudioPage";
import AccountManager from "./pages/AccountManager";
import CommunityPage from "./pages/CommunityPage";
import FavoritesPage from "./pages/FavoritesPage";
import SupportPage from "./pages/SupportPage";
import AboutService from "./pages/AboutService";
import AboutPage from "./pages/About";
import OfferPage from "./pages/OfferPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsPage from "./pages/TermsPage";
import ContactsPage from "./pages/ContactsPage";

import Blog from "./pages/Blog";
import CreatePost from "./pages/CreatePost";
import PublishPromptPage from "./components/prompt-market/PublishPromptPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";
import ReferralPage from "./pages/ReferralPage";
import TeamAccountsPage from "./pages/TeamAccountsPage";
import CustomOrdersPage from "./pages/CustomOrdersPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminFinances from "./pages/admin/AdminFinances";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAudit from "./pages/admin/AdminAudit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <AdminProvider>
          <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<AppLayout />}>
                <Route path="/feed" element={<Navigate to="/market" replace />} />
                <Route path="/search" element={<SearchCatalog />} />
                <Route path="/market" element={<PromptMarket />} />
                <Route path="/publish" element={<PublishPromptPage />} />
                <Route path="/prompt/:id" element={<PromptDetail />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/studio" element={<StudioPage />} />
                <Route path="/accounts" element={<AccountManager />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/support/about" element={<AboutService />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/support/about/offer" element={<OfferPage />} />
                <Route path="/support/about/privacy" element={<PrivacyPolicy />} />
                <Route path="/support/about/terms" element={<TermsPage />} />
                <Route path="/support/about/contacts" element={<ContactsPage />} />

                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/create" element={<CreatePost />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/referrals" element={<ReferralPage />} />
                <Route path="/team" element={<TeamAccountsPage />} />
                <Route path="/custom-orders" element={<CustomOrdersPage />} />
              </Route>
              {/* Admin Panel */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/moderation" element={<AdminModeration />} />
                <Route path="/admin/finances" element={<AdminFinances />} />
                <Route path="/admin/tickets" element={<AdminTickets />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/audit" element={<AdminAudit />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </NotificationProvider>
        </AdminProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
