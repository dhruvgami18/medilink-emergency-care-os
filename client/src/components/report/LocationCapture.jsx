export default function LocationCapture({ geo }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold border-b border-theme-dark/10 pb-2">3. Incident Location</h3>
      <div className="bg-theme-bg p-5 rounded-xl border border-theme-dark/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-bold text-sm">GPS Coordinates</div>
          <div className="text-sm text-theme-dark/60 mt-1">
            {geo.status === 'success' ? (
              <span className="text-green-600 font-bold">✓ {geo.coords.lat.toFixed(5)}, {geo.coords.lng.toFixed(5)}</span>
            ) : geo.status === 'error' ? (
              <span className="text-red-500">Location access denied. Please type address below.</span>
            ) : 'Required for ambulance dispatch.'}
          </div>
        </div>
        <button 
          type="button" 
          onClick={geo.capture}
          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${geo.status === 'success' ? 'bg-theme-accentBlue text-theme-dark' : 'bg-theme-dark text-white hover:scale-[1.02] shadow-md'}`}
        >
          {geo.status === 'idle' && '📍 Auto-Locate'}
          {geo.status === 'locating' && 'Locating...'}
          {geo.status === 'success' && 'Update Location'}
          {geo.status === 'error' && 'Retry Auto-Locate'}
        </button>
      </div>
      
      {geo.status === 'error' && (
        <input type="text" placeholder="Enter manual address or cross-streets..." className="w-full bg-theme-bg border border-red-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 transition-colors" />
      )}
    </div>
  );
}