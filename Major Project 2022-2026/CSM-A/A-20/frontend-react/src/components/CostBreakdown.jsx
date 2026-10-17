import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, IndianRupee, Users, CreditCard, Wallet } from 'lucide-react';

const CostBreakdown = ({ plannedDays, totalBudget }) => {
    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ background: 'rgba(99, 102, 241, 0.05)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Trip Forecast</p>
                    <h2 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{totalBudget}</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated total for the group</p>
                </div>

                <div className="glass-card" style={{ background: 'rgba(16, 185, 129, 0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Budget Optimization</span>
                        <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}>OPTIMIZED</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '85%' }}
                            style={{ height: '100%', background: '#10b981' }}
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>AI agents prioritized affordable activities & local transport.</p>
                </div>
            </div>

            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={18} /> Daily Budget Breakdown
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {plannedDays && plannedDays.map((day, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card"
                        style={{
                            padding: '1.2rem',
                            background: 'rgba(255,255,255,0.02)',
                            border: `1px solid rgba(99, 102, 241, 0.1)`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.05 }}>
                            <IndianRupee size={40} />
                        </div>
                        <div style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px' }}>Day {day.day}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{day.daily_budget_total}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{day.date}</div>
                    </motion.div>
                ))}
            </div>

            <div className="glass-card" style={{ marginTop: '2rem', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px dashed var(--glass-border)' }}>
                <Wallet className="text-primary" />
                <p style={{ fontSize: '0.9rem', margin: 0, color: 'var(--text-secondary)' }}>
                    <strong>Note:</strong> Costs are based on current estimates for 1 person unless specified. Use the totals above for group planning.
                </p>
            </div>
        </div>
    );
};

export default CostBreakdown;
