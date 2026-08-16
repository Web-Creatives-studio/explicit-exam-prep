'use client';

import { useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { toast } from 'react-toastify';
import { FaCrown, FaTimes, FaWhatsapp, FaKey, FaSpinner, FaCheckCircle } from 'react-icons/fa';

export default function RedeemModal({ isOpen, onClose, profile, onRedeemed }) {
  const supabase = createClient();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const adminPhoneNumber = '2348160874970'; // Replace with your WhatsApp contact
  const candidateName = profile?.full_name || 'Candidate';
  const targetDept = profile?.department || 'OAU Post-UTME';

  const whatsappMessage = encodeURIComponent(
    `Hello Admin, I am ${candidateName} preparing for ${targetDept}. I would like to get a PRO Access Code to unlock the full OAU CBT portal.`
  );
  const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${whatsappMessage}`;

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error('Please enter an access voucher code.');
      return;
    }

    setLoading(true);

    try {
      // 1. Verify code in access_codes table
      const { data: codeData, error: codeError } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', accessCode.trim().toUpperCase())
        .eq('is_used', false)
        .single();

      if (codeError || !codeData) {
        throw new Error('Invalid or already redeemed access code.');
      }

      // 2. Mark code as used
      await supabase
        .from('access_codes')
        .update({
          is_used: true,
          used_by: profile?.id,
          used_at: new Date().toISOString(),
        })
        .eq('id', codeData.id);

      // 3. Upgrade candidate profile to PRO
      await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', profile?.id);

      toast.success('PRO Pass activated successfully! Enjoy full access.');
      if (onRedeemed) onRedeemed();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to redeem code.');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-2xl shadow-lg shadow-orange-600/20">
            <FaCrown />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">Upgrade to PRO Pass</h3>
          <p className="text-xs text-gray-400">
            Get unlimited 40-question mock exams, 10,000+ past questions, and full answer explanations.
          </p>
        </div>

        {/* WhatsApp Direct Buy Link */}
        <div className="bg-[#0b0e14] border border-gray-800 p-4 rounded-2xl space-y-3">
          <div className="text-xs font-bold text-gray-300">Don't have an access code yet?</div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition shadow-lg shadow-emerald-600/25 text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaWhatsapp className="text-base" /> Chat Admin on WhatsApp to Buy
          </a>
        </div>

        {/* Redeem Form */}
        <form onSubmit={handleRedeem} className="space-y-3">
          <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider">
            Already have a code? Enter it below:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FaKey className="text-xs" />
            </div>
            <input
              type="text"
              required
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="e.g. OAU-PRO-XXXX"
              className="w-full pl-10 pr-4 py-3 bg-[#0b0e14] border border-gray-800 rounded-xl text-sm font-mono tracking-wider text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-600/20"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> Verifying Code...
              </>
            ) : (
              'Activate PRO Pass'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}