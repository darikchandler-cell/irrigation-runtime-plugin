// Simple debug version of the irrigation calculator
console.log('Irrigation Calculator: Script loaded');

// Check if WordPress data is available
if (typeof window.irrigationCalcData !== 'undefined') {
    console.log('WordPress data available:', window.irrigationCalcData);
} else {
    console.error('WordPress data not available - check wp_localize_script');
}

// Simple React app to test
import React from 'react';
import { createRoot } from 'react-dom/client';

function SimpleCalculator() {
    return React.createElement('div', {
        style: {
            padding: '20px',
            border: '2px solid #007cba',
            borderRadius: '8px',
            backgroundColor: '#f0f8ff',
            fontFamily: 'Arial, sans-serif'
        }
    }, [
        React.createElement('h2', { key: 'title' }, '🌱 Irrigation Schedule Calculator'),
        React.createElement('p', { key: 'status' }, 'Plugin loaded successfully!'),
        React.createElement('p', { key: 'debug' }, 'If you can see this, the React app is working.'),
        React.createElement('button', {
            key: 'test',
            onClick: () => alert('Button clicked! React is working.'),
            style: {
                padding: '10px 20px',
                backgroundColor: '#007cba',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }
        }, 'Test Button')
    ]);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing React app');
    
    const rootElement = document.getElementById('irrigation-calculator-root');
    
    if (rootElement) {
        console.log('Root element found, creating React root');
        try {
            const root = createRoot(rootElement);
            root.render(React.createElement(SimpleCalculator));
            console.log('React app rendered successfully');
        } catch (error) {
            console.error('Error rendering React app:', error);
            rootElement.innerHTML = '<div style="padding: 20px; color: red;">Error loading calculator: ' + error.message + '</div>';
        }
    } else {
        console.error('Root element #irrigation-calculator-root not found');
    }
});

console.log('Irrigation Calculator: Script execution complete');



