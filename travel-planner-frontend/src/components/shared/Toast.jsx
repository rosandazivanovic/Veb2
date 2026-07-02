import { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
        error: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
    };

    const style = colors[type] || colors.success;

    return (
        <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            minWidth: '260px',
            maxWidth: '400px',
            animation: 'slideIn 0.2s ease'
        }}>
            <span style={{ flex: 1 }}>{message}</span>
            <button onClick={onClose} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: style.color, fontSize: '1rem', opacity: 0.6, padding: 0, lineHeight: 1
            }}>×</button>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}