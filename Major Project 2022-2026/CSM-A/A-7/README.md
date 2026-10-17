# AI-Based Medical Chatbot for Infectious Disease Prediction

A sophisticated web-based medical chatbot that uses AI to analyze symptoms and provide preliminary assessments of potential infectious diseases. Built with HTML, CSS, and JavaScript.

## 🏥 Features

### Core Functionality
- **Symptom Analysis**: Intelligent symptom extraction and matching
- **Disease Prediction**: AI-powered disease prediction based on symptom patterns
- **Confidence Scoring**: Percentage-based confidence levels for predictions
- **Emergency Detection**: Automatic detection of emergency symptoms
- **Interactive Chat**: Natural conversation flow with typing indicators

### Medical Database
- **10+ Diseases**: Comprehensive database including COVID-19, Influenza, Pneumonia, etc.
- **Symptom Synonyms**: Advanced symptom matching with multiple synonyms
- **Severity Classification**: High, medium, and low severity classifications
- **Treatment Recommendations**: Specific recommendations for each condition

### User Interface
- **Modern Design**: Professional medical-themed interface
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Real-time Chat**: Live chat interface with message history
- **Quick Symptoms**: One-click symptom buttons for common symptoms
- **Emergency Modal**: Important emergency information and guidelines

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Download or clone the project files
2. Ensure all files are in the same directory:
   - `index.html`
   - `styles.css`
   - `script.js`
3. Open `index.html` in your web browser

### Usage
1. **Start the Chat**: The chatbot will greet you with an introduction
2. **Describe Symptoms**: Type your symptoms in natural language
3. **Quick Symptoms**: Use the quick symptom buttons for common symptoms
4. **Get Analysis**: Receive AI-powered disease predictions and recommendations
5. **Emergency Info**: Click the emergency button for urgent care information

## 🧠 How It Works

### Symptom Extraction
The AI analyzes user input using:
- **Synonym Matching**: Recognizes multiple ways to describe symptoms
- **Context Analysis**: Understands severity, duration, and frequency
- **Natural Language Processing**: Processes conversational language

### Disease Prediction Algorithm
1. **Symptom Matching**: Compares user symptoms with disease databases
2. **Confidence Calculation**: Calculates match percentage based on symptom overlap
3. **Severity Assessment**: Considers disease severity and symptom intensity
4. **Recommendation Generation**: Provides appropriate medical advice

### Supported Diseases
- COVID-19
- Influenza (Flu)
- Common Cold
- Pneumonia
- Bronchitis
- Strep Throat
- Mononucleosis
- Dengue Fever
- Malaria
- Tuberculosis

## ⚠️ Important Disclaimers

### Medical Disclaimer
- **Educational Purpose Only**: This tool is for educational and informational purposes
- **Not Medical Diagnosis**: Does not provide medical diagnosis or treatment
- **Professional Consultation**: Always consult healthcare providers for proper diagnosis
- **Emergency Situations**: Call emergency services (911) for severe symptoms

### Limitations
- Symptom-based predictions may not be 100% accurate
- Individual health conditions may vary
- Professional medical evaluation is always recommended
- Not a substitute for professional healthcare

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: AI logic, chat functionality, and disease prediction
- **Font Awesome**: Icons for medical and UI elements
- **Google Fonts**: Inter font family for professional typography

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### File Structure
```
medical-chatbot/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## 🔧 Customization

### Adding New Diseases
To add new diseases to the database, edit the `diseaseDatabase` object in `script.js`:

```javascript
'New Disease': {
    symptoms: ['symptom1', 'symptom2', 'symptom3'],
    severity: 'medium', // 'high', 'medium', 'low'
    description: 'Description of the disease',
    recommendations: 'Medical recommendations',
    confidence: 0
}
```

### Adding Symptom Synonyms
To add new symptom synonyms, edit the `symptomSynonyms` object:

```javascript
'new_symptom': ['synonym1', 'synonym2', 'synonym3']
```

### Styling Customization
Modify `styles.css` to customize:
- Color schemes
- Layout dimensions
- Typography
- Animations
- Responsive breakpoints

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop**: Full-featured interface with sidebar
- **Tablet**: Adaptive layout with touch-friendly controls
- **Mobile**: Streamlined interface with optimized chat experience

## 🔒 Privacy & Security

- **No Data Storage**: Chat history is not stored or transmitted
- **Client-Side Processing**: All analysis happens locally in the browser
- **No Personal Information**: No collection of personal or medical data
- **Open Source**: Transparent code for security review

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional disease databases
- Enhanced symptom recognition
- Improved prediction algorithms
- Better UI/UX features
- Multi-language support

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For questions or support:
- Review the code comments for technical details
- Check browser console for any errors
- Ensure all files are properly loaded
- Verify internet connection for external resources (fonts, icons)

## 🎯 Future Enhancements

Potential future features:
- Machine learning integration
- Voice input/output
- Image-based symptom analysis
- Integration with health APIs
- Multi-language support
- Advanced medical databases
- Telemedicine integration

---

**Remember**: This is an educational tool. Always consult healthcare professionals for medical advice and treatment.
