'use client';

import { FaCrown, FaWhatsapp, FaTimes, FaCheckCircle, FaLock } from 'react-icons/fa';

export default function PremiumPaywallModal({ isOpen, onClose, profile, subjectName }) {
  if (!isOpen) return null;

  const adminPhoneNumber = '2348160874970'; // Replace with your WhatsApp number
  const candidateName = profile?.full_name || 'Candidate';
  const targetDept = profile?.department || 'OAU Post-UTME';

  const whatsappMessage = encodeURIComponent(
    `Hello Admin, I am ${candidateName} preparing for ${targetDept}. I would like to get a PRO Access Code to unlock unlimited CBT practice questions for ${subjectName || 'all subjects'}.`
  );

  const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141822] border border-orange-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white relative animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <FaTimes />
        </button>

        {/* Crown Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 text-3xl shadow-lg shadow-orange-600/20">
            <FaCrown />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            Unlock Full Question Bank
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Free trial is limited to 5 questions per drill. Upgrade to <strong className="text-orange-400">PRO Pass</strong> to practice all 10,000+ past questions and detailed explanations.
          </p>
        </div>

        {/* Benefits List */}
        <div className="bg-[#0b0e14] p-4 rounded-2xl border border-gray-800 space-y-2.5 text-xs text-gray-300">
          <div className="flex items-center gap-2.5">
            <FaCheckCircle className="text-emerald-400 shrink-0" />
            <span>Unlimited 40-Question Mock Challenges</span>
          </div>
          <div className="flex items-center gap-2.5">
            <FaCheckCircle className="text-emerald-400 shrink-0" />
            <span>Complete Past Questions & Explanations</span>
          </div>
          <div className="flex items-center gap-2.5">
            <FaCheckCircle className="text-emerald-400 shrink-0" />
            <span>Nationwide Weekly Leaderboard Ranking</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition shadow-lg shadow-emerald-600/25 text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaWhatsapp className="text-base" /> Chat Admin on WhatsApp to Get Code
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-[#0b0e14] hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white font-bold rounded-xl transition text-xs cursor-pointer"
          >
            Continue with Free Drill (5 Qs)
          </button>
        </div>
      </div>
    </div>
  );
}