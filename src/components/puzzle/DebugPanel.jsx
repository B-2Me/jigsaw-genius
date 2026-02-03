import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { base44 } from '@/api/base44Client';

export default function DebugPanel() {
  const [debugData, setDebugData] = useState({
    session: 'Loading...',
    dbUser: 'Loading...',
    role: 'Loading...',
    error: null
  });

  const runDiagnostic = async () => {
    try {
      // 1. Check raw Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      
      // 2. Check SDK Auth (The Admin Gate source)
      let sdkUser = null;
      try {
        sdkUser = await base44.auth.me();
      } catch (e) {
        sdkUser = { error: e.message };
      }

      setDebugData({
        uid: session?.user?.id || 'No UID',
        email: session?.user?.email || 'Not logged in',
        sdkRole: sdkUser?.role || 'No role found',
        rawJwtRole: session?.user?.app_metadata?.role || 'None in JWT',
        lastError: sdkUser?.error || 'None'
      });
    } catch (err) {
      setDebugData(prev => ({ ...prev, error: err.message }));
    }
  };

  useEffect(() => {
    runDiagnostic();
    const interval = setInterval(runDiagnostic, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-slate-900 border-2 border-orange-500 rounded-xl p-4 shadow-2xl text-xs font-mono text-slate-200">
      <h3 className="text-orange-500 font-bold mb-2 flex justify-between">
        AUTH DIAGNOSTICS 
        <button onClick={runDiagnostic} className="underline text-blue-400">Refresh</button>
      </h3>
      <div className="space-y-1">
        <p><span className="text-slate-500">UID:</span> {debugData.uid}</p>
        <p><span className="text-slate-500">Email:</span> {debugData.email}</p>
        <p><span className="text-slate-500">DB Role:</span> <span className={debugData.sdkRole === 'admin' ? 'text-green-400' : 'text-red-400'}>{debugData.sdkRole}</span></p>
        <p><span className="text-slate-500">JWT Role:</span> {debugData.rawJwtRole}</p>
        {debugData.lastError !== 'None' && (
          <p className="text-red-500 mt-2 bg-red-950 p-1 rounded">Error: {debugData.lastError}</p>
        )}
      </div>
    </div>
  );
}
