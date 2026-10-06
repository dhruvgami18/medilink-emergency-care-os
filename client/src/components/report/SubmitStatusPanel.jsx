export default function SubmitStatusPanel({ state, trackingCode, coords }) {
  return (
    <div className="bg-theme-cardGrey rounded-[2.5rem] w-full h-full min-h-[400px] relative overflow-hidden p-6 flex flex-col justify-between shadow-lg border border-theme-dark/5">
      <div className="absolute inset-0 bg-theme-accentBlue opacity-10 mix-blend-multiply"></div>
      
      <div className="relative z-10 flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/50">
        <div className="text-xs font-bold text-theme-dark uppercase tracking-wider">System Status</div>
        {state === 'submitting' && <span className="animate-pulse text-xs font-bold text-theme-accentYellow bg-theme-dark px-3 py-1 rounded-full">Transmitting</span>}
        {state === 'success' && <span className="text-xs font-bold text-white bg-green-600 px-3 py-1 rounded-full">Secured</span>}
        {state === 'error' && <span className="text-xs font-bold text-white bg-red-600 px-3 py-1 rounded-full">Offline</span>}
        {state === 'idle' && <span className="text-xs font-bold text-theme-dark/50 bg-white px-3 py-1 rounded-full">Draft Mode</span>}
      </div>

      <div className="relative z-10 bg-white p-6 rounded-3xl shadow-sm mb-2 w-full mt-auto">
        {state === 'idle' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4 opacity-50">📝</div>
            <h4 className="font-bold text-lg mb-2">Awaiting Submission</h4>
            <p className="text-sm text-theme-dark/60">Your data is auto-saving locally. Fill out the required fields to dispatch a unit.</p>
          </div>
        )}

        {state === 'submitting' && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-theme-dark border-t-theme-accentYellow rounded-full animate-spin mx-auto mb-4"></div>
            <h4 className="font-bold text-lg">Generating PRP...</h4>
          </div>
        )}

        {state === 'success' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
            <h4 className="font-bold text-xl mb-1">Ambulance Dispatched</h4>
            <p className="text-sm text-theme-dark/60 mb-6">Tracking Code:</p>
            <div className="bg-theme-bg border border-theme-dark/10 py-3 rounded-xl text-2xl font-bold tracking-widest mb-6">
              {trackingCode}
            </div>
            <button onClick={() => window.location.href=`/track/${trackingCode}`} className="w-full bg-theme-dark text-white font-bold py-3.5 rounded-xl hover:scale-[1.02] transition-transform">
              Open Live Tracker
            </button>
          </div>
        )}
      </div>
    </div>
  );
}