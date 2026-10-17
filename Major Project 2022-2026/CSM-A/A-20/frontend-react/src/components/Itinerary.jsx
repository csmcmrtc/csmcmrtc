import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Cloud, Thermometer, Info } from 'lucide-react';

const Itinerary = ({ plannedDays }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="timeline">
                {plannedDays && plannedDays.map((dayData, index) => (
                    <motion.div
                        key={index}
                        className="timeline-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="timeline-dot"></div>
                        <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span style={{
                                        background: 'var(--primary)',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '100px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700'
                                    }}>
                                        DAY {dayData.day}
                                    </span>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{dayData.date}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Thermometer size={12} /> {dayData.weather.temp}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Cloud size={12} /> {dayData.weather.condition}</span>
                                        </div>
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '600' }}>
                                    Daily Total: {dayData.daily_budget_total}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {dayData.activities && dayData.activities.map((activity, actIdx) => (
                                    <div key={actIdx} className="glass-card" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Clock size={14} className="text-secondary" />
                                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{activity.time}</span>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{activity.estimated_cost}</span>
                                        </div>
                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <MapPin size={16} className="text-primary" /> {activity.place_name}
                                        </h4>
                                        <p style={{ fontSize: '0.9rem', margin: '0 0 0.8rem 0', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                            {activity.description}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'start', gap: '8px', padding: '8px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                            <Info size={14} className="text-secondary" style={{ marginTop: '2px' }} />
                                            <p style={{ fontSize: '0.75rem', margin: 0, color: '#10b981' }}>{activity.sustainability_note}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Itinerary;
