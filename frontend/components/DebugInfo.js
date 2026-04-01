// Debug component to verify backend connection
// Add this temporarily to your login page to see what's happening

export default function DebugInfo() {
  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production after testing
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#000',
      color: '#0f0',
      padding: '10px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      borderTop: '2px solid #0f0'
    }}>
      <strong>🔍 DEBUG INFO:</strong><br/>
      Backend URL: <strong>{backendUrl}</strong><br/>
      Expected (Production): https://your-backend.onrender.com<br/>
      Expected (Local): http://localhost:8000<br/>
      {backendUrl.includes('localhost') && (
        <span style={{color: '#f00'}}>
          ⚠️ WARNING: Using localhost in production! Set NEXT_PUBLIC_BACKEND_URL in Vercel!
        </span>
      )}
    </div>
  );
}
