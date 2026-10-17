import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Train, Bus, MapPin, ExternalLink, ShieldCheck, Zap, Globe } from 'lucide-react';

const TransportAccommodation = ({ transportOptions }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                <Globe size={20} className="text-primary" /> Booking Leads & Transport
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {transportOptions && transportOptions.map((option, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        <div style={{ background: option.eco_friendly ? '#10b981' : 'var(--primary)', color: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            {option.type.toLowerCase().includes('train') ? <Train size={24} /> :
                                option.type.toLowerCase().includes('bus') ? <Bus size={24} /> : <Plane size={24} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', margin: '0 0 4px 0' }}>{option.type}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{option.provider}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{option.estimated_price}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {option.eco_friendly && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                            <Zap size={10} /> ECO-FRIENDLY
                                        </div>
                                    )}
                                </div>
                                <a
                                    href={option.booking_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    Book Now <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="glass-card" style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px dashed rgba(244, 63, 94, 0.2)', padding: '1rem' }}>
                <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} className="text-secondary" />
                    Prices are estimates based on real-time availability. Always verify on the provider's website before booking.
                </p>
            </div>
        </div>
    );
};

export default TransportAccommodation;
