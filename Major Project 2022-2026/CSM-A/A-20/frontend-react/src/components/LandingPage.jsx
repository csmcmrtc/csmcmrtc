import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Calendar, Wallet, ChevronRight, Zap, ShieldCheck, Globe } from 'lucide-react';

const LandingPage = ({ onStartPlanning }) => {
    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="glass-nav">
                <div className="nav-content">
                    <div className="logo">
                        <Sparkles className="text-primary" size={24} />
                        <span className="logo-text">TrIpFy AI</span>
                    </div>
                    <div className="nav-links">
                        <a href="#home">Home</a>
                        <a href="#features">Features</a>
                        <a href="#destinations">Destinations</a>
                        <button className="nav-cta" onClick={onStartPlanning}>Plan Trip</button>
                        <a href="#contact">Contact</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hero-content"
                >
                    <div className="badge-wrapper">
                        <span className="ai-badge"><Zap size={14} fill="currentColor" /> Next-Gen Travel Planning</span>
                    </div>
                    <h1 className="hero-title">
                        Plan Your Perfect Trip <br />
                        <span className="text-gradient">with AI Intelligence</span>
                    </h1>
                    <p className="hero-subtitle">
                        Discover amazing destinations tailored to your budget and preferences with our intelligent travel planning system.
                    </p>
                    <div className="hero-btns">
                        <button className="btn btn-primary btn-lg" onClick={onStartPlanning}>
                            Start Planning Now <ChevronRight size={18} />
                        </button>
                        <button className="btn btn-secondary btn-lg">Learn More</button>
                    </div>
                </motion.div>

                {/* Hero Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="hero-visual"
                >
                    <div className="floating-card c1">
                        <div className="icon-box"><MapPin size={20} /></div>
                        <div>
                            <p className="card-label">Next Destination</p>
                            <p className="card-value">Kyoto, Japan</p>
                        </div>
                    </div>
                    <div className="floating-card c2">
                        <div className="icon-box"><Wallet size={20} /></div>
                        <div>
                            <p className="card-label">Optimized Budget</p>
                            <p className="card-value">₹95,000</p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* How It Works Section */}
            <section id="features" className="how-it-works">
                <div className="section-header">
                    <h2 className="section-main-title">How It Works</h2>
                    <p className="section-description">Our AI-powered system makes travel planning effortless and personalized just for you</p>
                </div>

                <div className="features-grid">
                    <motion.div whileHover={{ y: -10 }} className="feature-card">
                        <div className="feature-icon-wrapper i1">
                            <Sparkles size={32} />
                        </div>
                        <h3>AI Recommendations</h3>
                        <p>Get personalized destination recommendations powered by advanced AI algorithms that understand your unique travel preferences and budget constraints.</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -10 }} className="feature-card">
                        <div className="feature-icon-wrapper i2">
                            <Calendar size={32} />
                        </div>
                        <h3>Smart Itineraries</h3>
                        <p>We create optimized routes and schedules to maximize your travel experience while minimizing travel time and costs.</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -10 }} className="feature-card">
                        <div className="feature-icon-wrapper i3">
                            <Wallet size={32} />
                        </div>
                        <h3>Budget Management</h3>
                        <p>Smart expense tracking and budget splitting features for group travels, ensuring everyone knows exactly what they're spending.</p>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="destinations" className="final-cta">
                <div className="cta-glass-box">
                    <h2>Plan Your Dream Trip</h2>
                    <p>Tell us your preferences and let our AI create the perfect personalized itinerary for you.</p>
                    <button className="btn btn-primary btn-xl" onClick={onStartPlanning}>
                        Create My Plan <Sparkles size={20} />
                    </button>
                </div>
            </section>

            <footer className="footer">
                <p>© 2026 TrIpFy AI. Your Intelligent Travel Companion.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
