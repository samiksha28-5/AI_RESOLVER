import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { TicketsPage } from './pages/TicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { CreateTicketPage } from './pages/CreateTicketPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { TeamPage } from './pages/TeamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AutomationPage } from './pages/AutomationPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { NotFoundPage } from './pages/NotFoundPage';

const RouterComponent: React.FC = () => {
  const { currentUser, hasCompletedOnboarding } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/dashboard');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  // Auth gate
  if (!currentUser) {
    if (currentPath === '/signup') {
      return <SignupPage navigate={navigate} />;
    }
    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }
    return <LoginPage navigate={navigate} />;
  }

  // First-time onboarding redirect
  if (!hasCompletedOnboarding && currentPath === '/onboarding') {
    return <OnboardingPage navigate={navigate} />;
  }

  // Route matching
  let pageContent: React.ReactNode = null;
  let pageTitle = 'Dashboard';

  if (currentPath === '/' || currentPath === '/dashboard') {
    pageTitle = 'Operations Overview';
    pageContent = <DashboardPage navigate={navigate} />;
  } else if (currentPath === '/tickets/new') {
    pageTitle = 'Create Support Ticket';
    pageContent = <CreateTicketPage navigate={navigate} />;
  } else if (currentPath.startsWith('/tickets/')) {
    const ticketId = currentPath.replace('/tickets/', '').split('?')[0];
    pageTitle = `Ticket ${ticketId}`;
    pageContent = <TicketDetailPage ticketId={ticketId} navigate={navigate} />;
  } else if (currentPath === '/tickets' || currentPath.startsWith('/tickets?')) {
    pageTitle = 'Support Tickets';
    const params = new URLSearchParams(window.location.search);
    const priority = params.get('priority') || undefined;
    pageContent = <TicketsPage navigate={navigate} initialPriorityFilter={priority} />;
  } else if (currentPath === '/ai-assistant') {
    pageTitle = 'AI Grounded Assistant';
    pageContent = <AIAssistantPage navigate={navigate} />;
  } else if (currentPath.startsWith('/knowledge-base/')) {
    const articleId = currentPath.replace('/knowledge-base/', '').split('?')[0];
    pageTitle = 'Knowledge Article';
    pageContent = <ArticleDetailPage articleId={articleId} navigate={navigate} />;
  } else if (currentPath === '/knowledge-base') {
    pageTitle = 'Knowledge Base';
    pageContent = <KnowledgeBasePage navigate={navigate} />;
  } else if (currentPath.startsWith('/customers/')) {
    const customerId = currentPath.replace('/customers/', '').split('?')[0];
    pageTitle = 'Customer Profile';
    pageContent = <CustomerDetailPage customerId={customerId} navigate={navigate} />;
  } else if (currentPath === '/customers') {
    pageTitle = 'Customer Directory';
    pageContent = <CustomersPage navigate={navigate} />;
  } else if (currentPath === '/team') {
    pageTitle = 'Team Management';
    pageContent = <TeamPage navigate={navigate} />;
  } else if (currentPath === '/analytics') {
    pageTitle = 'Analytics & Reporting';
    pageContent = <AnalyticsPage navigate={navigate} />;
  } else if (currentPath === '/automation') {
    pageTitle = 'Automation Rules Engine';
    pageContent = <AutomationPage navigate={navigate} />;
  } else if (currentPath === '/activity') {
    pageTitle = 'Activity & Audit Log';
    pageContent = <ActivityPage navigate={navigate} />;
  } else if (currentPath === '/settings') {
    pageTitle = 'Workspace Settings';
    pageContent = <SettingsPage navigate={navigate} />;
  } else if (currentPath === '/onboarding') {
    return <OnboardingPage navigate={navigate} />;
  } else {
    pageTitle = 'Not Found';
    pageContent = <NotFoundPage navigate={navigate} />;
  }

  // Update document title
  document.title = `${pageTitle} — ResolveAI`;

  return (
    <AppLayout currentPath={currentPath} navigate={navigate} pageTitle={pageTitle}>
      {pageContent}
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterComponent />
      </NotificationProvider>
    </AuthProvider>
  );
}
