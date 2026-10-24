import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalSearchModal } from './GlobalSearchModal';
import { QuickTicketModal } from './QuickTicketModal';

interface AppLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  pageTitle: string;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPath,
  navigate,
  pageTitle,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickTicketOpen, setQuickTicketOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        navigate={navigate}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          pageTitle={pageTitle}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenQuickTicket={() => setQuickTicketOpen(true)}
          navigate={navigate}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        navigate={navigate}
      />

      <QuickTicketModal
        isOpen={quickTicketOpen}
        onClose={() => setQuickTicketOpen(false)}
        navigate={navigate}
      />
    </div>
  );
};
