import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plane,
    MapPin,
    Calendar,
    Leaf,
    IndianRupee,
    Zap,
    Download,
    Loader2,
    AlertCircle,
    ChevronLeft,
    Users
} from 'lucide-react';
import confetti from 'canvas-confetti';

import LandingPage from './components/LandingPage';
import InputForm from './components/InputForm';
import LoadingSpinner from './components/LoadingSpinner';
import Itinerary from './components/Itinerary';
import CostBreakdown from './components/CostBreakdown';
import Sustainability from './components/Sustainability';
import TransportAccommodation from './components/TransportAccommodation';
import AIInsights from './components/AIInsights';

const Tabs = ({ activeTab, setActiveTab, tabs }) => {
    return (
        <div className="tabs-container">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {tab.icon}
                        {tab.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

function App() {
    const [view, setView] = useState('landing'); // 'landing' or 'planner'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('itinerary');

    useEffect(() => {
        if (data) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#10b981', '#f43f5e']
            });
        }
    }, [data]);

    const handleGeneratePlan = async (formData) => {
        setLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await fetch('/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to connect to the brain. Is the engine running?' }));
                throw new Error(errorData.detail || 'Failed to generate plan');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'itinerary', label: 'Itinerary', icon: <Calendar size={18} /> },
        { id: 'cost', label: 'Budget', icon: <IndianRupee size={18} /> },
        { id: 'sustainability', label: 'Eco-Impact', icon: <Leaf size={18} /> },
        { id: 'transport', label: 'Leads', icon: <Plane size={18} /> },
        { id: 'vlogs', label: 'Vlogs', icon: <Zap size={18} /> }
    ];

    if (view === 'landing') {
        return (
            <>
                <div className="bg-orbs">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="orb orb-3"></div>
                </div>
                <LandingPage onStartPlanning={() => setView('planner')} />
            </>
        );
    }

    return (
        <>
            <div className="bg-orbs">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <div className="container">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '1rem' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <button onClick={() => setView('landing')} className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '100px', fontSize: '0.8rem' }}>
                            <ChevronLeft size={16} /> Back to Home
                        </button>
                    </div>
                    <h1 style={{ fontSize: '2.5rem' }}>TrIpFy AI Planner</h1>
                </motion.header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: data ? '380px 1fr' : '1fr',
                    gap: '3rem',
                    alignItems: 'start',
                    maxWidth: data ? '100%' : '600px',
                    margin: '0 auto'
                }}>
                    <motion.div
                        layout
                        className="glass-card"
                        style={{ position: 'sticky', top: '2rem' }}
                    >
                        <h2 className="section-title"><MapPin className="text-primary" /> Plan Your Trip</h2>
                        <InputForm onSubmit={handleGeneratePlan} isLoading={loading} />

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.2)', fontSize: '0.9rem', display: 'flex', gap: '10px' }}
                                >
                                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {loading && !data && (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ textAlign: 'center', padding: '5rem 0' }}
                            >
                                <LoadingSpinner />
                                <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                    Our AI agents are negotiating the best routes for you...
                                </p>
                            </motion.div>
                        )}

                        {data && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{ width: '100%' }}
                            >
                                <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{data.trip_summary.location}</h2>
                                            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> {data.planned_days.length} Days</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} /> {data.group_size || 1} People</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IndianRupee size={16} /> {data.trip_summary.total_budget} Total</span>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `tripfy_${data.trip_summary.location.toLowerCase()}.json`;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                            }}
                                        >
                                            <Download size={18} /> Export Plan
                                        </button>
                                    </div>
                                </div>

                                <Tabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

                                <motion.div
                                    className="glass-card"
                                    style={{ minHeight: '500px' }}
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {activeTab === 'itinerary' && <Itinerary plannedDays={data.planned_days} />}
                                    {activeTab === 'cost' && <CostBreakdown plannedDays={data.planned_days} totalBudget={data.trip_summary.total_budget} />}
                                    {activeTab === 'sustainability' && <Sustainability rating={data.trip_summary.sustainability_rating} plannedDays={data.planned_days} />}
                                    {activeTab === 'transport' && <TransportAccommodation transportOptions={data.transport_options} />}
                                    {activeTab === 'vlogs' && <AIInsights vlogs={data.visual_resources.youtube_vlogs} />}
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}

export default App;
