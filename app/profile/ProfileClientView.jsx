'use client';

import { useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { OAU_FACULTIES_AND_DEPARTMENTS } from '../utils/department';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaBuilding, 
  FaCrown, 
  FaWhatsapp, 
  FaSave, 
  FaSpinner, 
  FaTrophy, 
  FaChartLine, 
  FaClock, 
  FaGraduationCap 
} from 'react-icons/fa';

export default function ProfileClientView({ profile, stats }) {
  const supabase = createClient();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [loading, setLoading] = useState(false);

  const adminPhoneNumber = '2348160874970';
  const whatsappMessage = encodeURIComponent(
    `Hello Admin, I am ${profile?.full_name || 'Candidate'} preparing for ${profile?.department || 'OAU Post-UTME'}. I want to upgrade to PRO Access.`
  );
  const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${whatsappMessage}`;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          department: department,
        })
        .eq('id', profile?.id);

      if (error) throw error;

      toast.success('Profile details updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-2xl font-black shrink-0 shadow-lg">
            <FaGraduationCap />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{profile?.full_name}</h1>
            <p className="text-xs text-gray-400">{profile?.email}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-orange-400 bg-orange-600/15 px-2.5 py-0.5 rounded-md border border-orange-500/30">
                {profile?.department || 'Post-UTME Candidate'}
              </span>
            </div>
          </div>
        </div>

        {/* Tier status badge */}
        <div>
          {profile?.is_premium ? (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-2xl text-xs font-black">
              <FaCrown className="text-sm" /> PRO Candidate Pass Unlocked
            </div>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <FaWhatsapp className="text-base" /> Upgrade to PRO on WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* Lifetime Performance Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#141822] border border-gray-800 p-5 rounded-2xl text-center space-y-1">
          <div className="text-gray-500 text-xs font-bold uppercase flex items-center justify-center gap-1.5">
            <FaTrophy className="text-orange-500" /> Tests Taken
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalExams}</div>
        </div>

        <div className="bg-[#141822] border border-gray-800 p-5 rounded-2xl text-center space-y-1">
          <div className="text-gray-500 text-xs font-bold uppercase flex items-center justify-center gap-1.5">
            <FaChartLine className="text-emerald-400" /> Avg. Accuracy
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.averageAccuracy}%</div>
        </div>

        <div className="bg-[#141822] border border-gray-800 p-5 rounded-2xl text-center space-y-1">
          <div className="text-gray-500 text-xs font-bold uppercase flex items-center justify-center gap-1.5">
            <FaCrown className="text-yellow-400" /> Best Score
          </div>
          <div className="text-2xl sm:text-3xl font-black text-yellow-400">{stats.bestScore}</div>
        </div>

        <div className="bg-[#141822] border border-gray-800 p-5 rounded-2xl text-center space-y-1">
          <div className="text-gray-500 text-xs font-bold uppercase flex items-center justify-center gap-1.5">
            <FaClock className="text-orange-400" /> Study Time
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.totalHoursStudied} hrs</div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-[#141822] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="border-b border-gray-800 pb-4">
          <h2 className="text-lg font-black text-white">Candidate Settings</h2>
          <p className="text-xs text-gray-400">Update your official full name and target faculty/department.</p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0b0e14] border border-gray-800 rounded-xl text-sm text-gray-100 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1.5">Target Department</label>
            <div className="relative">
              <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
              <select
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0b0e14] border border-gray-800 rounded-xl text-sm text-gray-100 focus:outline-none focus:border-orange-500"
              >
                <option value="">Select target course...</option>
                {OAU_FACULTIES_AND_DEPARTMENTS.map((fac) => (
                  <optgroup key={fac.faculty} label={`Faculty of ${fac.faculty}`}>
                    {fac.departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-600/25"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> Updating Profile...
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}