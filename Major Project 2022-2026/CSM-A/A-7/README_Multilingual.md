# 🌍 Multilingual Medical Chatbot with Speech Support

A sophisticated AI-powered medical chatbot that supports multiple languages including **Telugu**, Hindi, Spanish, French, and English. Features text-to-speech and speech-to-text capabilities for enhanced user interaction.

## 🚀 Features

### 🌍 **Multilingual Support**
- **English (🇺🇸)**: Primary language with full support
- **Telugu (🇮🇳 తెలుగు)**: Complete native support with medical terminology
- **Hindi (🇮🇳 हिंदी)**: Full symptom and disease descriptions
- **Spanish (🇪🇸 Español)**: Comprehensive medical translations
- **French (🇫🇷 Français)**: Complete medical terminology
- **Auto-detection**: Automatically detects input language

### 🎤 **Speech Capabilities**
- **Text-to-Speech**: Converts AI responses to spoken audio
- **Speech-to-Text**: Listens to user voice input in multiple languages
- **Voice Commands**: Control chatbot with voice commands
- **Multilingual Speech**: Supports speech recognition in Telugu, Hindi, etc.

### 🏥 **Medical Intelligence**
- **AI-Powered Analysis**: Advanced symptom analysis and disease prediction
- **Multilingual Symptom Extraction**: Recognizes symptoms in any supported language
- **Emergency Detection**: Real-time emergency symptom identification
- **Cultural Adaptation**: Medical advice adapted to local culture

### 💬 **Interactive Features**
- **Language Switching**: Easy language switching with dropdown
- **Speech Toggle**: Enable/disable text-to-speech with button
- **Voice Input**: Use voice instead of typing with microphone button
- **Real-time Translation**: Instant translation of medical terms

## 📁 Project Structure

```
medical-chatbot-multilingual/
├── index.html              # Main HTML interface
├── styles.css              # CSS styling with multilingual support
├── script.js               # JavaScript with speech and translation
├── README_Multilingual.md  # This documentation
└── assets/                 # Optional: images, icons, etc.
```

## 🚀 Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Microphone for speech input
- Speakers for speech output
- Internet connection for translation services

### Setup Instructions

1. **Download the files**:
   - `index.html`
   - `styles.css`
   - `script.js`

2. **Open in browser**:
   ```bash
   # Simply open index.html in your web browser
   open index.html
   ```

3. **Grant microphone permissions** when prompted for speech features

## 🎯 Usage

### Language Selection
1. **Select Language**: Use the dropdown in the top-right corner
2. **Supported Languages**:
   - 🇺🇸 English
   - 🇮🇳 తెలుగు (Telugu)
   - 🇮🇳 हिंदी (Hindi)
   - 🇪🇸 Español (Spanish)
   - 🇫🇷 Français (French)
   - 🔍 Auto Detect

### Speech Features
1. **Enable Speech**: Click the 🔊 button to toggle text-to-speech
2. **Voice Input**: Click the 🎤 button to use voice input
3. **Speech Status**: Red indicator shows when listening

### Example Telugu Interaction

```
User: నాకు జ్వరం మరియు దగ్గు ఉంది
(Translation: I have fever and cough)

AI Response: మీ లక్షణాల ఆధారంగా, మీకు COVID-19 ఉండే అవకాశం ఉంది. 
SARS-CoV-2 వైరస్ వల్ల కలిగే శ్వాసకోశ వ్యాధి.

Extracted Symptoms: fever, cough
Disease Prediction: COVID-19 (80% confidence)
```

## 📊 Supported Languages

| Language | Code | Status | Speech Support | Medical Terms |
|----------|------|--------|----------------|---------------|
| English | en | ✅ Full | ✅ Yes | ✅ Complete |
| Telugu | te | ✅ Full | ✅ Yes | ✅ Native |
| Hindi | hi | ✅ Full | ✅ Yes | ✅ Complete |
| Spanish | es | ✅ Full | ✅ Yes | ✅ Complete |
| French | fr | ✅ Full | ✅ Yes | ✅ Complete |

## 🏥 Medical Features

### Telugu Medical Terms

```javascript
// Telugu symptom synonyms
telugu_symptoms = {
    'fever': ['జ్వరం', 'అధిక ఉష్ణోగ్రత', 'వేడి'],
    'cough': ['దగ్గు', 'దగ్గుతున్న', 'ఎండు దగ్గు'],
    'fatigue': ['అలసట', 'అలసిపోయిన', 'బలహీనమైన'],
    'headache': ['తలనొప్పి', 'తల నొప్పి', 'మైగ్రేన్'],
    'sore throat': ['గొంతు నొప్పి', 'గొంతు వేదన'],
    'shortness of breath': ['ఊపిరి తీసుకోవడంలో ఇబ్బంది']
}
```

### Disease Descriptions in Telugu

```javascript
// COVID-19 in Telugu
covid19_telugu = {
    'description': 'SARS-CoV-2 వైరస్ వల్ల కలిగే శ్వాసకోశ వ్యాధి.',
    'recommendations': 'వెంటనే వైద్య సహాయం తీసుకోండి. ఐసోలేషన్ మరియు కాంటాక్ట్ ట్రేసింగ్ పాటించండి.'
}
```

## 🎤 Speech Features

### Text-to-Speech

```javascript
// Enable speech output
speechEnabled = true;
speakText("Hello, how can I help you today?");

// Speak in Telugu (translated to English for TTS)
speakText("నమస్కారం, నేను మీకు ఎలా సహాయం చేయగలను?");
```

### Speech-to-Text

```javascript
// Listen for voice input in Telugu
recognition.lang = 'te-IN';
recognition.start();

// Listen for voice input in Hindi
recognition.lang = 'hi-IN';
recognition.start();
```

## 🎨 UI Features

### Language Selector
- **Dropdown Menu**: Easy language switching
- **Flag Icons**: Visual language identification
- **Auto-detect**: Automatic language detection

### Speech Controls
- **🔊 Toggle Button**: Enable/disable text-to-speech
- **🎤 Microphone Button**: Voice input activation
- **Status Indicator**: Visual feedback for speech states

### Quick Symptoms
- **Multilingual Buttons**: Symptom buttons in selected language
- **Dynamic Updates**: UI updates when language changes
- **Responsive Design**: Works on mobile and desktop

## 🔧 Customization

### Adding New Languages

```javascript
// Add new language support
translations['ta'] = {
    welcome: "வணக்கம்! நான் டாக்டர் AI உதவியாளர்...",
    disclaimer: "முக்கியமானது: இது தகவல் நோக்கங்களுக்காக மட்டுமே...",
    help: "நான் இன்று உங்களுக்கு எப்படி உதவ முடியும்?",
    // ... more translations
};

// Add symptom synonyms
multilingualSymptomSynonyms['ta'] = {
    'fever': ['காய்ச்சல்', 'உயர் வெப்பநிலை', 'சூடு'],
    'cough': ['இருமல்', 'இருமுகிறேன்'],
    // ... more symptoms
};
```

### Adding New Diseases

```javascript
// Add new disease with multilingual support
diseaseDatabase['New Disease'] = {
    symptoms: ['symptom1', 'symptom2'],
    severity: 'medium',
    description: 'English description',
    recommendations: 'English recommendations',
    // Add multilingual descriptions
    descriptions: {
        'en': 'English description',
        'te': 'Telugu description',
        'hi': 'Hindi description'
    }
};
```

## 🛠️ Technical Details

### Speech Recognition

- **Web Speech API**: Native browser speech recognition
- **Language-specific models**: Optimized for each supported language
- **Error handling**: Graceful fallback for unsupported features
- **Cross-browser support**: Works on Chrome, Firefox, Safari, Edge

### Text-to-Speech

- **Speech Synthesis API**: Native browser TTS
- **Voice selection**: Automatic voice selection based on language
- **Speed control**: Adjustable speech rate
- **Volume control**: Configurable audio output

### Browser Compatibility

| Browser | Speech Recognition | Speech Synthesis | Status |
|---------|-------------------|------------------|--------|
| Chrome | ✅ Yes | ✅ Yes | ✅ Full Support |
| Firefox | ✅ Yes | ✅ Yes | ✅ Full Support |
| Safari | ✅ Yes | ✅ Yes | ✅ Full Support |
| Edge | ✅ Yes | ✅ Yes | ✅ Full Support |

## 📱 Mobile and Web Integration

### Responsive Design
- **Mobile-friendly**: Optimized for smartphones and tablets
- **Touch support**: Touch-friendly buttons and controls
- **Voice input**: Works with mobile microphones
- **Offline capability**: Basic functionality without internet

### Progressive Web App (PWA)
```javascript
// Add to manifest.json for PWA support
{
    "name": "Multilingual Medical Chatbot",
    "short_name": "MediBot",
    "description": "AI-powered medical chatbot with multilingual support",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#667eea",
    "theme_color": "#3498db"
}
```

## 🔒 Privacy & Security

- **Local Processing**: Speech recognition and TTS run locally
- **No Data Storage**: Chat history is not stored or transmitted
- **Secure Translation**: Uses browser APIs securely
- **Voice Privacy**: Voice data is not recorded or stored
- **HTTPS Recommended**: For production deployment

## 🎯 Future Enhancements

### Planned Features
- **Offline Translation**: Local translation models
- **Voice Cloning**: Personalized voice synthesis
- **Emotion Detection**: Voice emotion analysis
- **Accent Recognition**: Regional accent support
- **Medical Imaging**: Symptom image analysis

### Research Areas
- **Neural Translation**: Advanced neural machine translation
- **Voice Biometrics**: Speaker identification
- **Context Awareness**: Conversation context understanding
- **Medical Knowledge Graph**: Enhanced disease-symptom relationships

## 🤝 Contributing

### Language Contributions
- **Telugu Medical Terms**: Add more Telugu medical terminology
- **Regional Dialects**: Support for different Telugu dialects
- **Cultural Context**: Medical advice adapted to local culture
- **Translation Quality**: Improve translation accuracy

### Technical Contributions
- **Speech Models**: Better speech recognition models
- **TTS Quality**: Improved text-to-speech quality
- **Performance**: Optimize for faster response times
- **Accessibility**: Enhanced accessibility features

## 📞 Support

### Getting Help
- **Language Issues**: Check translation accuracy
- **Speech Problems**: Verify microphone and speaker setup
- **Performance**: Monitor browser resources
- **Integration**: Review browser compatibility

### Common Issues
1. **Speech Recognition**: Ensure good microphone quality and permissions
2. **Translation Errors**: Check internet connection for language detection
3. **TTS Issues**: Verify audio drivers and browser settings
4. **Language Support**: Confirm language code is supported

### Browser Permissions
```javascript
// Request microphone permission
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        console.log('Microphone access granted');
    })
    .catch(err => {
        console.error('Microphone access denied:', err);
    });
```

## 📄 License

This project is open source and available under the MIT License.

---

**Remember**: This is an educational tool. Always consult healthcare professionals for medical advice and treatment.

## 🏥 Medical Disclaimer

This AI system is designed for educational and research purposes only. It should not be used as a substitute for professional medical advice, diagnosis, or treatment. The predictions and recommendations provided by this system are based on pattern recognition and may not be accurate for individual cases. Always seek the advice of qualified healthcare providers for any medical concerns.

## 🌟 Key Highlights

### Telugu Support
- **Native Medical Terms**: Complete Telugu medical terminology
- **Cultural Adaptation**: Medical advice adapted to Indian context
- **Voice Recognition**: Telugu speech recognition support
- **Text-to-Speech**: Telugu voice synthesis

### Speech Features
- **Multilingual Voice Input**: Speak in Telugu, Hindi, English, etc.
- **Voice Output**: Hear responses in your preferred language
- **Real-time Processing**: Instant speech recognition and synthesis
- **Accessibility**: Helps users with typing difficulties

### User Experience
- **Intuitive Interface**: Easy language switching and speech controls
- **Responsive Design**: Works on all devices and screen sizes
- **Visual Feedback**: Clear indicators for speech states
- **Error Handling**: Graceful fallbacks for unsupported features

The multilingual medical chatbot provides a comprehensive solution for users who prefer to interact in their native language, with special emphasis on Telugu support as requested. The speech capabilities make it accessible to users who may have difficulty typing or reading, while the multilingual features ensure that medical information is accessible to diverse populations.
