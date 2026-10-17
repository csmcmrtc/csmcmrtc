import React, { useState } from 'react';
import { Search, MapPin, Calendar, Wallet, Sparkles, Leaf, Users, Plane } from 'lucide-react';

const InputForm = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        destination: '',
        budget: 50000,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sustainability_preference: 'Medium',
        group_size: 1,
        transport_preference: 'Auto'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'budget' || name === 'group_size' ? Number(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="input-group">
                <label className="label"><MapPin size={14} /> Destination</label>
                <input
                    type="text"
                    name="destination"
                    className="input"
                    placeholder="e.g. Paris, France"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                    <label className="label"><Wallet size={14} /> Total Budget (₹)</label>
                    <input
                        type="number"
                        name="budget"
                        className="input"
                        min="100"
                        step="50"
                        value={formData.budget}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label className="label"><Users size={14} /> Group Size</label>
                    <input
                        type="number"
                        name="group_size"
                        className="input"
                        min="1"
                        max="20"
                        value={formData.group_size}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                    <label className="label"><Calendar size={14} /> Start Date</label>
                    <input
                        type="date"
                        name="start_date"
                        className="input"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label className="label"><Calendar size={14} /> End Date</label>
                    <input
                        type="date"
                        name="end_date"
                        className="input"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                    <label className="label"><Plane size={14} /> Transport</label>
                    <select
                        name="transport_preference"
                        className="input"
                        value={formData.transport_preference}
                        onChange={handleChange}
                        style={{ appearance: 'none' }}
                    >
                        <option value="Auto">AI Optimized (Auto)</option>
                        <option value="Flight">Flight</option>
                        <option value="Train">Train</option>
                        <option value="Bus">Bus</option>
                    </select>
                </div>
                <div className="input-group">
                    <label className="label"><Leaf size={14} /> Sustainability</label>
                    <select
                        name="sustainability_preference"
                        className="input"
                        value={formData.sustainability_preference}
                        onChange={handleChange}
                        style={{ appearance: 'none' }}
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="spinner" size={18} /> Analyzing Data...
                    </>
                ) : (
                    <>
                        <Sparkles size={18} /> Generate TrIpFy Plan
                    </>
                )}
            </button>
        </form>
    );
};

const Loader2 = ({ className, size }) => (
    <Search className={className} size={size} />
);

export default InputForm;
