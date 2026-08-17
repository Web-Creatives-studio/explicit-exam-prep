'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import { 
  FaGraduationCap, 
  FaChartPie, 
  FaBook,
  FaCloudUploadAlt, 
  FaUserGraduate, 
  FaKey, 
  FaTrophy, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaArrowLeft,
  FaShieldAlt,
  FaCalendarAlt,
  FaSlidersH,
  FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function AdminLayoutClient({ children, userProfile }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.info('Signed out from Admin Portal');
    router.push('/login');
    router.refresh();
  };

  // Structured Nav Groups
  const navSections = [
    {
      group: 'Overview & Users',
      items: [
        { name: 'Dashboard Overview', href: '/admin/dashboard', icon: FaChartPie },
        { name: 'Student Analytics', href: '/admin/students', icon: FaUserGraduate },
      ],
    },
    {
      group: 'Question Bank',
      items: [
        { name: 'Questions Explorer', href: '/admin/questions', icon: FaBook },
        { name: 'Upload & Ingest', href: '/admin/upload', icon: FaCloudUploadAlt },
      ],
    },
    {
      group: 'Licensing & Mock Challenges',
      items: [
        { name: 'Access Vouchers', href: '/admin/codes', icon: FaKey },
        { name: 'Weekly Mock Builder', href: '/admin/mock-builder', icon: FaCalendarAlt },
        { name: 'Live Leaderboards', href: '/admin/weekly-leaderboard', icon: FaTrophy },
        { name: 'Rankings Config', href: '/admin/leaderboard', icon: FaSlidersH },
      ],
    },
  ];

  // Resolve current section name for breadcrumb
  const currentNav = navSections
    .flatMap((s) => s.items)
    .find((i) => i.href === pathname);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex select-none">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-150"
        />
      )}

      {/* Persistent / Responsive Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#12151e] border-r border-gray-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Brand & Admin Badge */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800/70">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-600/30 ring-1 ring-white/10">
                <FaGraduationCap className="text-xl" />
              </div>
              <div>
                <span className="font-black text-base tracking-tight text-white block leading-tight">
                  TOPPERS<span className="text-orange-500">CBT</span>
                </span>
                <span className="text-[9px] font-extrabold tracking-widest text-orange-400 uppercase bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1 w-fit mt-1">
                  <FaShieldAlt className="text-[8px]" /> Command Center
                </span>
              </div>
            </Link>
            
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-white cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>

          {/* Categorized Navigation */}
          <nav className="space-y-5">
            {navSections.map((section) => (
              <div key={section.group} className="space-y-1.5">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 px-3">
                  {section.group}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`text-sm ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <FaChevronRight className="text-[10px] text-white/80" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Info & Quick Switchers */}
        <div className="p-4 border-t border-gray-800/80 bg-[#0d1017] space-y-3">
          <div className="p-3 bg-[#161a24] rounded-2xl border border-gray-800 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-[9px] text-gray-500 font-extrabold uppercase tracking-wider">Super Administrator</div>
              <div className="text-xs font-bold text-white truncate">{userProfile?.full_name || 'Admin Root'}</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          </div>

          <div className="space-y-1">
            <Link
              href="/practice/single"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 transition"
            >
              <FaArrowLeft className="text-[10px]" /> Return to Student Portal
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition cursor-pointer text-left"
            >
              <FaSignOutAlt className="text-xs" /> Terminate Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        
        {/* Top Navbar Header */}
        <header className="h-16 border-b border-gray-800/80 bg-[#0e1118]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
            >
              <FaBars className="text-lg" />
            </button>

            {/* Breadcrumb Context */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
              <span className="text-gray-500">Admin</span>
              <span className="text-gray-600">/</span>
              <span className="text-white font-bold">{currentNav?.name || 'Overview'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Realtime Database Connected
            </div>

            <div className="text-[11px] font-mono font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20">
              Access: {userProfile?.role?.toUpperCase() || 'ADMIN'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}