import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Globe, Compass } from 'lucide-react';

const LoadingSpinner = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        border: '2px dashed var(--primary)',
                        borderRadius: '50%',
                        opacity: 0.3
                    }}
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        inset: '10px',
                        border: '2px dashed var(--secondary)',
                        borderRadius: '50%',
                        opacity: 0.3
                    }}
                />
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ color: 'var(--primary)' }}
                    >
                        <Plane size={40} />
                    </motion.div>
                </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}
                    />
                ))}
            </div>
        </div>
    );
};

export default LoadingSpinner;
