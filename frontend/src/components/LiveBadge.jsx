import React from 'react'

/**
 * LiveBadge — shows a pulsing green dot + "Live" label + last-updated time.
 * Drop this anywhere in a page header to signal real-time polling is active.
 */
const LiveBadge = ({ lastUpdated }) => {
  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
    : '—'

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.3rem 0.75rem',
      background: 'rgba(16, 185, 129, 0.08)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      borderRadius: '999px',
      fontSize: '0.75rem',
      color: '#34d399',
      fontWeight: 500,
      userSelect: 'none',
    }}>
      {/* Pulsing dot */}
      <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
        <span style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: '#10b981',
          animation: 'livePulse 2s ease-in-out infinite',
          opacity: 0.6,
        }} />
        <span style={{
          position: 'relative',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#10b981',
        }} />
      </span>
      Live &bull; Updated {timeStr}
      <style>{`
        @keyframes livePulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default LiveBadge
