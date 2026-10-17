import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, ExternalLink, Play, Info } from 'lucide-react';

const AIInsights = ({ vlogs }) => {
    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)',
                padding: '2rem',
                borderRadius: '24px',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: '#FF0000',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(255, 0, 0, 0.2)'
                    }}>
                        <Youtube size={20} color="white" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>Visual Resources</h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Travel Guides & Vlogs</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {vlogs && vlogs.map((vlog, index) => (
                        <motion.a
                            key={index}
                            href={vlog.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ y: -5, background: 'rgba(255, 255, 255, 0.05)' }}
                            className="glass-card"
                            style={{
                                padding: '1.2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                                color: 'inherit',
                                textDecoration: 'none'
                            }}
                        >
                            <div style={{
                                height: '140px',
                                background: 'rgba(0,0,0,0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <Play size={40} className="text-primary" style={{ opacity: 0.5 }} />
                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '4px', background: '#FF0000' }}></div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '1rem', margin: '0 0 8px 0', lineHeight: '1.4' }}>{vlog.title}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                    Watch on YouTube <ExternalLink size={12} />
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <Info size={16} style={{ color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                    Vlogs provide a visual perspective of the destination to help you better prepare for your trip.
                </p>
            </div>
        </div>
    );
};

export default AIInsights;
