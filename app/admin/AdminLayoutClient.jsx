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
  FaShieldAlt
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

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin/dashboard', icon: FaChartPie },
    { name: 'Questions Explorer', href: '/admin/questions', icon: FaBook },
    { name: 'Upload Questions', href: '/admin/upload', icon: FaCloudUploadAlt },
    { name: 'Student Analytics', href: '/admin/students', icon: FaUserGraduate },
    { name: 'Voucher Codes', href: '/admin/codes', icon: FaKey },
    { name: 'Leaderboard Control', href: '/admin/leaderboard', icon: FaTrophy },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-100 flex select-none">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Persistent / Responsive Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#161922] border-r border-gray-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 space-y-6">
          {/* Brand & Admin Badge */}
          <div className="flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
                <FaGraduationCap className="text-xl" />
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white block leading-tight">
                  TOPPERS<span className="text-orange-500">CBT</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 flex items-center gap-1 w-fit mt-0.5">
                  <FaShieldAlt className="text-[9px]" /> Administrator
                </span>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white cursor-pointer"
            >
              <FaTimes />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 px-3 pb-1">
              Control Panel
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className={`text-base ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Signout */}
        <div className="p-4 border-t border-gray-800/80 space-y-3">
          <div className="px-3 py-2 bg-[#0f1117] rounded-xl border border-gray-800/80">
            <div className="text-[10px] text-gray-500 font-bold uppercase">Authenticated Admin</div>
            <div className="text-xs font-bold text-white truncate">{userProfile?.full_name || 'Root Admin'}</div>
          </div>

          <div className="space-y-1">
            <Link
              href="/practice/single"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800/60 transition"
            >
              <FaArrowLeft className="text-xs" /> Switch to Student Portal
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            >
              <FaSignOutAlt className="text-xs" /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        <header className="h-16 border-b border-gray-800/80 bg-[#161922]/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
          >
            <FaBars className="text-lg" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Authenticated Admin Session Active
          </div>

          <div className="text-xs font-mono font-semibold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20">
            Role: {userProfile?.role || 'admin'}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}