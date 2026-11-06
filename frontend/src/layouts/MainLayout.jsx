import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0E17] text-gray-100 flex flex-col font-sans">
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 bg-grid-cyber pointer-events-none opacity-40 z-0" />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col min-h-screen relative z-10">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="py-4 px-6 border-t border-gray-800/80 text-center text-xs font-mono text-gray-500 bg-[#0D121F]/60">
          <p>CyberGuard AI IDS &bull; Powered by Apache Spark MLlib &amp; Django REST &bull; File-based Zero-DB Architecture</p>
        </footer>
      </div>
    </div>
  );
}

