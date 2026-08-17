'use client';

import { useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { toast } from 'react-toastify';
import { FaCrown, FaTimes, FaWhatsapp, FaKey, FaSpinner, FaTag } from 'react-icons/fa';

export default function RedeemModal({ isOpen, onClose, profile, onRedeemed }) {
  const supabase = createClient();
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const adminPhoneNumber = '2348160874970';
  const candidateName = profile?.full_name || 'Candidate';
  const targetDept = profile?.department || 'OAU Post-UTME';
  const proPrice = '₦4,000';

  const whatsappMessage = encodeURIComponent(
    `Hello Admin, I am ${candidateName} preparing for ${targetDept}. I would like to pay ${proPrice} to get a TOPPERS CBT PRO Access Code.`
  );
  const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${whatsappMessage}`;

  const handleRedeem = async (e) => {
    e.preventDefault();
    const cleanCode = accessCode.trim().toUpperCase();

    if (!cleanCode) {
      toast.error('Please enter an access voucher code.');
      return;
    }

    setLoading(true);

    try {
      // 1. Resolve current user ID
      let currentUserId = profile?.id;
      if (!currentUserId) {
        const { data: authData } = await supabase.auth.getUser();
        currentUserId = authData?.user?.id;
      }

      if (!currentUserId) {
        throw new Error('You must be logged in to redeem a code.');
      }

      // 2. Look up the voucher code using maybeSingle()
      const { data: codeData, error: codeFetchErr } = await supabase
        .from('access_codes')
        .select('id, code, is_used')
        .eq('code', cleanCode)
        .eq('is_used', false)
        .maybeSingle();

      if (codeFetchErr) throw codeFetchErr;

      if (!codeData) {
        toast.error('Invalid, expired, or already used access code.');
        setLoading(false);
        return;
      }

      // 3. Mark code as used in access_codes table
      const { error: updateCodeErr } = await supabase
        .from('access_codes')
        .update({
          is_used: true,
          used_by: currentUserId,
          used_at: new Date().toISOString(),
        })
        .eq('id', codeData.id);

      if (updateCodeErr) {
        console.error('Failed to update access_codes:', updateCodeErr);
        throw updateCodeErr;
      }

      // 4. Upgrade student profile to PRO
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          last_active_at: new Date().toISOString(),
        })
        .eq('id', currentUserId);

      if (profileErr) {
        console.error('Failed to update profile:', profileErr);
        throw profileErr;
      }

      toast.success('PRO Pass activated successfully! Enjoy full access.');
      if (onRedeemed) onRedeemed();
      if (onClose) onClose();
    } catch (err) {
      console.error('Redemption error:', err);
      toast.error(err.message || 'Failed to redeem voucher code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#141822] border border-orange-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-white relative animate-in fade-in zoom-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <FaTimes />
        </button>

        {/* Header with Pricing Badge */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 text-2xl shadow-lg shadow-orange-600/20">
            <FaCrown />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <FaTag className="text-[10px]" /> One-Time Pass: <span className="text-white font-extrabold">{proPrice}</span>
          </div>

          <h3 className="text-2xl font-black tracking-tight text-white">Upgrade to PRO Pass</h3>
          <p className="text-xs text-gray-400">
            Get unlimited 40-question mock exams, 10,000+ past questions, and full step-by-step explanations.
          </p>
        </div>

        {/* WhatsApp Direct Buy Box */}
        <div className="bg-[#0b0e14] border border-gray-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-300">Don't have an access code?</span>
            <span className="text-xs font-black text-emerald-400">{proPrice}</span>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold rounded-xl transition shadow-lg shadow-emerald-600/25 text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaWhatsapp className="text-base" /> Pay {proPrice} & Get Code on WhatsApp
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
              placeholder="e.g. OAU-BW867O"
              className="w-full pl-10 pr-4 py-3 bg-[#0b0e14] border border-gray-800 rounded-xl text-sm font-mono tracking-wider text-white focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:bg-orange-400 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-600/20"
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