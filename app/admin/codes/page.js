'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'react-toastify';
import { FaKey, FaCopy, FaCheck, FaSpinner, FaDownload } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

function CodesManagementContent() {
  const supabase = createClient();
  const [codes, setCodes] = useState([]);
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState('unused'); // 'all' | 'unused' | 'used'

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setInitialLoading(true);
    const { data, error } = await supabase
      .from('access_codes')
      .select('*, profiles:used_by(full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load voucher codes.');
    } else {
      setCodes(data || []);
    }
    setInitialLoading(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const newItems = [];
    for (let i = 0; i < quantity; i++) {
      const code = 'OAU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      newItems.push({ code, is_used: false });
    }

    const { data, error } = await supabase.from('access_codes').insert(newItems).select();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Generated ${data.length} new access codes!`);
      setCodes([...data, ...codes]);
    }
    setLoading(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success(`Code ${text} copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportUnusedCodes = () => {
    const unused = codes.filter((c) => !c.is_used).map((c) => c.code).join('\n');
    const blob = new Blob([unused], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OAU_PRO_CODES_${Date.now()}.txt`;
    link.click();
  };

  const filteredCodes = codes.filter((c) => {
    if (filter === 'unused') return !c.is_used;
    if (filter === 'used') return c.is_used;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Voucher Code Generator</h1>
          <p className="text-gray-400 text-sm mt-1">Generate and distribute one-time activation keys to students.</p>
        </div>

        <button
          onClick={exportUnusedCodes}
          className="flex items-center gap-2 bg-[#161922] hover:bg-gray-800 border border-gray-800 text-gray-300 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <FaDownload /> Export Unused List (.txt)
        </button>
      </div>

      {/* Generator Box */}
      <div className="bg-[#161922] border border-gray-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="font-bold text-white flex items-center gap-2">
            <FaKey className="text-orange-500" /> Batch Code Creator
          </div>
          <div className="text-xs text-gray-400">Specify quantity to instantly batch-create cryptographic vouchers.</div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="number"
            min="1"
            max="200"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-24 bg-[#0f1117] border border-gray-800 rounded-xl p-2.5 text-center font-bold text-white text-sm focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 cursor-pointer"
          >
            {loading ? <FaSpinner className="animate-spin" /> : `Generate ${quantity} Codes`}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['unused', 'used', 'all'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              filter === tab
                ? 'bg-orange-600 text-white'
                : 'bg-[#161922] text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Code Vault Table */}
      <div className="bg-[#161922] border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300 min-w-[650px]">
            <thead className="bg-gray-800/60 text-xs uppercase font-bold text-gray-400 border-b border-gray-800">
              <tr>
                <th className="p-4">Access Code</th>
                <th className="p-4">Status</th>
                <th className="p-4">Redeemed By</th>
                <th className="p-4">Redeemed Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {initialLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiLoader className="animate-spin text-orange-500 text-2xl" />
                      <span className="text-xs font-bold uppercase tracking-wider">Loading Access Codes...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCodes.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition">
                    <td className="p-4 font-mono font-bold text-orange-400">{item.code}</td>
                    <td className="p-4">
                      {item.is_used ? (
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-2 py-0.5 rounded">
                          CLAIMED
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2 py-0.5 rounded">
                          ACTIVE / UNUSED
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-300">{item.profiles?.full_name || '—'}</td>
                    <td className="p-4 text-xs text-gray-500">
                      {item.used_at ? new Date(item.used_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => copyToClipboard(item.code, item.id)}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedId === item.id ? <><FaCheck className="text-green-400" /> Copied</> : <><FaCopy /> Copy</>}
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {filteredCodes.length === 0 && !initialLoading && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No voucher codes found for this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CodesManagementFallback() {
  return (
    <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-3 text-gray-400">
      <FiLoader className="animate-spin text-orange-500 text-3xl" />
      <p className="text-xs font-bold uppercase tracking-widest">Loading Voucher Code Vault...</p>
    </div>
  );
}

export default function CodesManagementPage() {
  return (
    <Suspense fallback={<CodesManagementFallback />}>
      <CodesManagementContent />
    </Suspense>
  );
}