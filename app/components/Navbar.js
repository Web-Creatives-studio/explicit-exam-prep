'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/client';
import { 
  FaGraduationCap, 
  FaBookOpen, 
  FaClock, 
  FaHistory, 
  FaUser, 
  FaSignOutAlt, 
  FaCrown,
  FaBars,
  FaTimes,
  FaWhatsapp,
  FaChevronDown,
  FaShieldAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function Navbar({ profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.info('Signed out successfully');
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { name: 'Practice Drills', href: '/practice/single', icon: FaBookOpen },
    { name: 'Full Mock CBT', href: '/practice/mock', icon: FaClock },
    { name: 'My History', href: '/history', icon: FaHistory },
  ];

  // User initials fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  };

  const candidateInitials = getInitials(profile?.full_name);
  const firstName = profile?.full_name?.split(' ')[0] || 'Candidate';
  const isAdmin = profile?.role === 'admin';

  return (
    <>
      <header className="bg-[#0b0e14]/90 backdrop-blur-xl border-b border-gray-800/80 text-white sticky top-0 z-50 select-none transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-8">
              <Link 
                href="/practice/single" 
                className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xl"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-600/20 ring-1 ring-white/10">
                  <FaGraduationCap className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base tracking-tight leading-tight text-white flex items-center gap-0.5">
                    TOPPERS<span className="text-orange-500">CBT</span>
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                    Excellence Portal
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Items */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-[#141822] text-orange-400 border border-gray-800 shadow-inner'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 border border-transparent'
                      }`}
                    >
                      <Icon className={`text-xs ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Desktop Actions (Community, Pro Badge & User Dropdown) */}
            <div className="hidden md:flex items-center gap-3">
              
              {/* WhatsApp Community Link */}
              <a
                href="https://chat.whatsapp.com/Fg3IVBojRafBlIcHF25gTH"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition shadow-sm"
              >
                <FaWhatsapp className="text-sm" />
                <span>Community</span>
              </a>

              {/* Admin Portal Shortcut if Admin */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition"
                >
                  <FaShieldAlt className="text-xs" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <div className="h-5 w-px bg-gray-800 mx-1" />

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2.5 bg-[#141822] hover:bg-[#191f2c] border border-gray-800 hover:border-gray-700/80 p-1.5 pl-3 rounded-2xl transition cursor-pointer"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-200 max-w-[110px] truncate leading-tight">
                      {firstName}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 truncate leading-tight">
                      {profile?.department || 'Candidate'}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="w-8 h-8 rounded-xl bg-[#0b0e14] border border-gray-700/60 flex items-center justify-center font-black text-xs text-orange-400 shadow-inner">
                      {candidateInitials}
                    </div>
                    {profile?.is_premium && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-500 border-2 border-[#0b0e14] flex items-center justify-center text-[8px] text-black">
                        <FaCrown />
                      </span>
                    )}
                  </div>

                  <FaChevronDown className="text-[10px] text-gray-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#141822] border border-gray-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-gray-800/80">
                      <div className="text-xs font-bold text-white truncate">{profile?.full_name || 'Candidate'}</div>
                      <div className="text-[11px] text-gray-400 truncate mt-0.5">{profile?.department || 'OAU Post-UTME'}</div>
                      <div className="mt-2">
                        {profile?.is_premium ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20">
                            <FaCrown className="text-[9px]" /> PRO Candidate
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700">
                            Free Tier
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800/40 transition"
                      >
                        <FaUser className="text-gray-400 text-xs" />
                        Account Settings
                      </Link>

                      <Link
                        href="/history"
                        onClick={() => setProfileDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800/40 transition"
                      >
                        <FaHistory className="text-gray-400 text-xs" />
                        Performance Log
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-gray-800/80">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition cursor-pointer text-left"
                      >
                        <FaSignOutAlt className="text-xs" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-[#141822] rounded-xl border border-transparent hover:border-gray-800 focus:outline-none transition cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {menuOpen ? <FaTimes className="text-base" /> : <FaBars className="text-base" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {menuOpen && (
        <div className="md:hidden">
          {/* Overlay Backdrop */}
          <div 
            className="fixed inset-0 top-16 bg-black/80 backdrop-blur-sm z-40 animate-in fade-in duration-150"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="fixed top-16 left-0 right-0 bg-[#0f1117] border-b border-gray-800 shadow-2xl z-50 px-4 py-5 space-y-3 animate-in slide-in-from-top-3 duration-200">
            
            {/* User Profile Mini Card */}
            <div className="bg-[#141822] border border-gray-800 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0b0e14] border border-gray-700/60 flex items-center justify-center font-black text-sm text-orange-400">
                  {candidateInitials}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{profile?.full_name || 'Candidate'}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{profile?.department || 'OAU Post-UTME'}</div>
                </div>
              </div>

              <div>
                {profile?.is_premium ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-md border border-yellow-500/20">
                    <FaCrown className="text-[9px]" /> PRO
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md border border-gray-700">
                    FREE
                  </span>
                )}
              </div>
            </div>

            {/* Nav Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' 
                        : 'text-gray-300 hover:bg-[#141822]'
                    }`}
                  >
                    <Icon className="text-sm" />
                    {link.name}
                  </Link>
                );
              })}

              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:bg-[#141822] transition"
              >
                <FaUser className="text-sm" />
                Account Profile
              </Link>
            </div>

            {/* WhatsApp Community Button */}
            <a
              href="https://chat.whatsapp.com/Fg3IVBojRafBlIcHF25gTH"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
            >
              <FaWhatsapp className="text-base text-emerald-500" />
              <span>Join Aspirants Community</span>
            </a>

            {/* Logout Action */}
            <div className="pt-2 border-t border-gray-800/80">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}