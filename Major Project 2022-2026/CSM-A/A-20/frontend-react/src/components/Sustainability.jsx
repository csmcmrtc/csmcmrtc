import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Award, Wind, CheckCircle, TreePine, BarChart3, Globe } from 'lucide-react';

const Sustainability = ({ rating, plannedDays }) => {
    // rating is 1-5 from backend
    const numericRating = parseInt(rating) || 3;
    const scoreVal = numericRating * 20; // 5 -> 100, 3 -> 60

    const getRatingLabel = (r) => {
        if (r >= 4) return 'Excellent';
        if (r >= 3) return 'Good';
        return 'Fair';
    };

    // Collect all sustainability notes
    const ecoNotes = [];
    plannedDays?.forEach(day => {
        day.activities?.forEach(activity => {
            if (activity.sustainability_note) {
                ecoNotes.push({
                    day: day.day,
                    place: activity.place_name,
                    note: activity.sustainability_note
                });
            }
        });
    });

    return (
        <div>
            <div style={{ position: 'relative', padding: '2.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0) 100%)', borderRadius: '24px', marginBottom: '2.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ position: 'absolute', top: '-15px', right: '30px', background: '#10b981', color: 'white', padding: '6px 18px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                    <Award size={14} /> {getRatingLabel(numericRating).toUpperCase()} RATING
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="100" height="100" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="8" />
                            <motion.circle
                                cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8"
                                strokeDasharray="283"
                                initial={{ strokeDashoffset: 283 }}
                                animate={{ strokeDashoffset: 283 - (283 * scoreVal) / 100 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span style={{ position: 'absolute', fontWeight: '800', fontSize: '1.5rem', color: '#10b981' }}>{numericRating}/5</span>
                    </div>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Eco-Impact Analytics</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
                            Your travel plan has been optimized for sustainability. A rating of {numericRating}/5 indicates {getRatingLabel(numericRating).toLowerCase()} environmental consciousness in your choices.
                        </p>
                    </div>
                </div>
            </div>

            <h4 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} className="text-secondary" /> Sustainable Activity Log
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {ecoNotes.map((note, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5, background: 'rgba(16, 185, 129, 0.05)' }}
                        className="glass-card"
                        style={{ padding: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                    >
                        <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-primary)' }}>Day {note.day} - {note.place}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{note.note}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Sustainability;
