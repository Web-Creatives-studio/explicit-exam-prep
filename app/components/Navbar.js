'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import { 
  FaGraduationCap, 
  FaBookOpen, 
  FaClock, 
  FaTrophy, 
  FaUser, 
  FaSignOutAlt, 
  FaCrown,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Navbar({ profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info('Logged out successfully');
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { name: 'Single Subject', href: '/practice/single', icon: FaBookOpen },
    { name: 'Mock Challenge', href: '/practice/mock', icon: FaClock },
    { name: 'Leaderboard', href: '/practice/leaderboard', icon: FaTrophy },
    { name: 'My Profile', href: '/profile', icon: FaUser },
  ];

  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-800 text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
            <Link href="/practice/single" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-600/30">
                <FaGraduationCap className="text-xl" />
              </div>
              <span className="font-black text-lg tracking-tight">
                OAU<span className="text-orange-500">CBT</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                      isActive
                        ? 'bg-gray-800 text-orange-400'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                    }`}
                  >
                    <Icon className="text-xs" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Profile Badge & Logout */}
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-800/80 px-3 py-1.5 rounded-lg border border-gray-700">
                {profile?.is_premium ? (
                  <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">
                    <FaCrown className="text-orange-400" /> PRO
                  </span>
                ) : (
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                    FREE
                  </span>
                )}
                <span className="text-xs font-semibold text-gray-200 max-w-[120px] truncate">
                  {profile?.full_name?.split(' ')[0] || 'Candidate'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition cursor-pointer"
              >
                <FaSignOutAlt />
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Floating Mobile Menu Overlay & Dropdown (Zero Page Shift) */}
      {menuOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 top-16 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-150"
            onClick={() => setMenuOpen(false)}
          />

          {/* Floating Dropdown Drawer */}
          <div className="fixed top-16 left-0 right-0 bg-gray-900 border-b border-gray-800 shadow-2xl z-50 px-4 py-5 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive 
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' 
                      : 'text-gray-300 hover:bg-gray-800 active:bg-gray-800'
                  }`}
                >
                  <Icon className="text-base" />
                  {link.name}
                </Link>
              );
            })}

            {/* Mobile Footer Status & Logout */}
            <div className="pt-4 mt-2 border-t border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {profile?.is_premium ? (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">
                    <FaCrown /> PRO
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
                    FREE
                  </span>
                )}
                <span className="text-xs text-gray-300 font-bold max-w-[150px] truncate">
                  {profile?.full_name || 'Candidate'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-red-400 font-bold hover:underline flex items-center gap-1.5 p-1 cursor-pointer"
              >
                <FaSignOutAlt /> Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}