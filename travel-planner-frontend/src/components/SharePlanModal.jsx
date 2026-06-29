import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import sharedPlanService from '../services/sharedPlanService';
import { createShareModel } from '../models/TravelPlan';
import { formatDate } from '../utils/formatDate';

export default function SharePlanModal({ planId, onClose }) {
    const [shareData, setShareData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [form, setForm] = useState(createShareModel());

    const shareUrl = shareData
        ? `${window.location.origin}/shared/${shareData.token}`
        : null;

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await sharedPlanService.create(planId, form);
            setShareData(res.data);
        } catch {
            alert('Greška pri generisanju linka');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                });
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = shareUrl;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch {
            alert('Kopirajte link ručno: ' + shareUrl);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>

                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--line)'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                            Podijeli plan
                        </h2>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '2px 0 0' }}>
                            Generiši link ili QR kod za dijeljenje
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1,
                        padding: '0.2rem', borderRadius: '6px', opacity: 0.5, transition: 'opacity 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                    >
                        ×
                    </button>
                </div>

                {!shareData ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
                            {[
                                { value: 'VIEW', label: 'Pregled', desc: 'Može samo čitati sadržaj plana' },
                                { value: 'EDIT', label: 'Uređivanje', desc: 'Može dodavati i mijenjati sadržaj' },
                            ].map(opt => (
                                <div
                                    key={opt.value}
                                    onClick={() => setForm({ ...form, accessType: opt.value })}
                                    style={{
                                        border: form.accessType === opt.value
                                            ? '2px solid var(--primary)' : '1px solid var(--line)',
                                        borderRadius: '10px', padding: '0.75rem', cursor: 'pointer',
                                        background: form.accessType === opt.value ? 'var(--primary-soft)' : 'white',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <div style={{
                                        fontWeight: 700, fontSize: '0.85rem',
                                        color: form.accessType === opt.value ? 'var(--primary)' : 'var(--text)',
                                        marginBottom: '0.2rem'
                                    }}>
                                        {opt.label}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                                        {opt.desc}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="form-group">
                            <label>Ističe za (dana)</label>
                            <input
                                type="number"
                                value={form.expiresInDays}
                                onChange={e => setForm({ ...form, expiresInDays: Number(e.target.value) })}
                                min="1"
                                max="30"
                            />
                        </div>

                        <div style={{
                            display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
                            marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--line)'
                        }}>
                            <button onClick={onClose} className="btn-secondary">Otkaži</button>
                            <button onClick={handleGenerate} disabled={loading} className="btn-primary">
                                {loading ? 'Generisanje...' : 'Generiši link'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0 1rem' }}>
                            <div style={{
                                padding: '1rem', border: '1px solid var(--line)',
                                borderRadius: '12px', background: 'white'
                            }}>
                                <QRCodeSVG value={shareUrl} size={160} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                            {[
                                { label: 'Pristup', value: form.accessType === 'VIEW' ? 'Pregled' : 'Uređivanje' },
                                { label: 'Ističe', value: formatDate(shareData.expiresAt) },
                            ].map(({ label, value }) => (
                                <div key={label} style={{
                                    flex: 1, background: 'white', border: '1px solid var(--line)',
                                    borderRadius: '10px', padding: '0.7rem 0.9rem', textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)',
                                        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem'
                                    }}>
                                        {label}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
                            <input
                                type="text" value={shareUrl} readOnly
                                style={{
                                    flex: 1, padding: '0.65rem 0.9rem', border: '1px solid var(--line)',
                                    borderRadius: '8px', fontSize: '0.82rem', color: 'var(--muted)',
                                    background: '#fbfaf9', outline: 'none'
                                }}
                            />
                            <button onClick={handleCopy} className="btn-primary" style={{ flexShrink: 0, fontSize: '0.85rem' }}>
                                {copied ? 'Kopirano!' : 'Kopiraj'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--line)' }}>
                            <button onClick={onClose} className="btn-secondary">Zatvori</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}