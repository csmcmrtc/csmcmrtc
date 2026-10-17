// Medical Chatbot AI - Infectious Disease Prediction System

// Disease database with symptoms and prediction logic
const diseaseDatabase = {
    'COVID-19': {
        symptoms: ['fever', 'cough', 'fatigue', 'shortness of breath', 'loss of taste', 'loss of smell', 'sore throat', 'headache', 'body aches', 'chills'],
        severity: 'high',
        description: 'A respiratory illness caused by the SARS-CoV-2 virus.',
        recommendations: 'Seek medical attention immediately. Practice isolation and contact tracing.',
        confidence: 0
    },
    'Influenza': {
        symptoms: ['fever', 'cough', 'fatigue', 'body aches', 'headache', 'sore throat', 'runny nose', 'chills', 'weakness'],
        severity: 'medium',
        description: 'A viral infection that attacks your respiratory system.',
        recommendations: 'Rest, stay hydrated, and consider antiviral medications if diagnosed early.',
        confidence: 0
    },
    'Common Cold': {
        symptoms: ['runny nose', 'sore throat', 'cough', 'congestion', 'sneezing', 'mild fever', 'fatigue'],
        severity: 'low',
        description: 'A viral infection of the upper respiratory tract.',
        recommendations: 'Rest, stay hydrated, and use over-the-counter medications for symptom relief.',
        confidence: 0
    },
    'Pneumonia': {
        symptoms: ['fever', 'cough', 'shortness of breath', 'chest pain', 'fatigue', 'sweating', 'chills', 'loss of appetite'],
        severity: 'high',
        description: 'Infection that inflames the air sacs in one or both lungs.',
        recommendations: 'Seek immediate medical attention. May require hospitalization.',
        confidence: 0
    },
    'Bronchitis': {
        symptoms: ['cough', 'mucus production', 'fatigue', 'mild fever', 'chest discomfort', 'shortness of breath'],
        severity: 'medium',
        description: 'Inflammation of the bronchial tubes that carry air to the lungs.',
        recommendations: 'Rest, stay hydrated, and consider seeing a doctor if symptoms persist.',
        confidence: 0
    },
    'Strep Throat': {
        symptoms: ['sore throat', 'difficulty swallowing', 'fever', 'headache', 'fatigue', 'swollen lymph nodes', 'white patches on throat'],
        severity: 'medium',
        description: 'Bacterial infection that causes inflammation and pain in the throat.',
        recommendations: 'See a doctor for antibiotic treatment. Rest and stay hydrated.',
        confidence: 0
    },
    'Mononucleosis': {
        symptoms: ['fatigue', 'sore throat', 'fever', 'swollen lymph nodes', 'headache', 'body aches', 'loss of appetite'],
        severity: 'medium',
        description: 'Viral infection caused by Epstein-Barr virus.',
        recommendations: 'Rest, stay hydrated, and avoid contact sports. May take weeks to recover.',
        confidence: 0
    },
    'Dengue Fever': {
        symptoms: ['high fever', 'severe headache', 'pain behind eyes', 'joint and muscle pain', 'fatigue', 'nausea', 'vomiting', 'skin rash'],
        severity: 'high',
        description: 'Mosquito-borne viral infection.',
        recommendations: 'Seek immediate medical attention. Rest and stay hydrated.',
        confidence: 0
    },
    'Malaria': {
        symptoms: ['fever', 'chills', 'headache', 'muscle aches', 'fatigue', 'nausea', 'vomiting', 'sweating'],
        severity: 'high',
        description: 'Parasitic disease transmitted by mosquitoes.',
        recommendations: 'Seek immediate medical attention. Requires specific antimalarial treatment.',
        confidence: 0
    },
    'Tuberculosis': {
        symptoms: ['persistent cough', 'coughing up blood', 'chest pain', 'fatigue', 'weight loss', 'night sweats', 'fever', 'loss of appetite'],
        severity: 'high',
        description: 'Bacterial infection that primarily affects the lungs.',
        recommendations: 'Seek immediate medical attention. Requires long-term antibiotic treatment.',
        confidence: 0
    }
};

// Symptom synonyms for better matching
const symptomSynonyms = {
    'fever': ['fever', 'high temperature', 'hot', 'burning up', 'temperature'],
    'cough': ['cough', 'coughing', 'dry cough', 'wet cough', 'hacking cough'],
    'fatigue': ['fatigue', 'tired', 'exhausted', 'weak', 'lethargic', 'run down'],
    'headache': ['headache', 'head pain', 'migraine', 'head ache'],
    'sore throat': ['sore throat', 'throat pain', 'scratchy throat', 'throat irritation'],
    'shortness of breath': ['shortness of breath', 'difficulty breathing', 'breathless', 'can\'t breathe', 'trouble breathing'],
    'body aches': ['body aches', 'muscle pain', 'joint pain', 'aches', 'sore muscles'],
    'runny nose': ['runny nose', 'nasal discharge', 'dripping nose', 'stuffy nose'],
    'chills': ['chills', 'shivering', 'cold', 'goosebumps'],
    'nausea': ['nausea', 'sick to stomach', 'queasy', 'upset stomach'],
    'vomiting': ['vomiting', 'throwing up', 'puking', 'sick'],
    'diarrhea': ['diarrhea', 'loose stools', 'watery stools', 'stomach upset'],
    'chest pain': ['chest pain', 'chest discomfort', 'chest tightness'],
    'loss of appetite': ['loss of appetite', 'not hungry', 'no appetite', 'can\'t eat'],
    'night sweats': ['night sweats', 'sweating at night', 'night perspiration'],
    'weight loss': ['weight loss', 'losing weight', 'unintentional weight loss'],
    'skin rash': ['skin rash', 'rash', 'red spots', 'skin irritation'],
    'swollen lymph nodes': ['swollen lymph nodes', 'swollen glands', 'lump in neck', 'swollen neck']
};

// Chat state management
let chatHistory = [];
let currentSymptoms = [];
let isAnalyzing = false;

// Multilingual support
let currentLanguage = 'en';
let speechEnabled = false;
let recognition = null;
let synthesis = window.speechSynthesis;

// Multilingual translations
const translations = {
    en: {
        welcome: "Hello! I'm Dr. AI Assistant, your AI-powered medical chatbot. I can help you assess symptoms and provide preliminary information about potential infectious diseases.",
        disclaimer: "Important: This is for informational purposes only and should not replace professional medical advice. Always consult a healthcare provider for proper diagnosis.",
        help: "How can I help you today? Please describe your symptoms.",
        quickSymptoms: "Quick symptoms:",
        fever: "Fever",
        cough: "Cough",
        fatigue: "Fatigue",
        headache: "Headache",
        placeholder: "Describe your symptoms...",
        listening: "Listening...",
        speechEnabled: "Speech enabled",
        speechDisabled: "Speech disabled"
    },
    te: {
        welcome: "నమస్కారం! నేను డా. AI అసిస్టెంట్, మీ AI-పవర్డ్ మెడికల్ చాట్‌బాట్. నేను లక్షణాలను అంచనా వేయడానికి మరియు సంభావ్య సంక్రమణ వ్యాధుల గురించి ప్రాథమిక సమాచారాన్ని అందించడానికి సహాయపడగలను.",
        disclaimer: "ముఖ్యమైనది: ఇది సమాచార ప్రయోజనాల కోసం మాత్రమే మరియు వృత్తిపరమైన వైద్య సలహాను భర్తీ చేయకూడదు. సరైన నిర్ధారణ కోసం ఎల్లప్పుడూ వైద్య సర్వీస్ ప్రొవైడర్‌తో సంప్రదించండి.",
        help: "నేను ఈరోజు మీకు ఎలా సహాయం చేయగలను? దయచేసి మీ లక్షణాలను వివరించండి.",
        quickSymptoms: "త్వరిత లక్షణాలు:",
        fever: "జ్వరం",
        cough: "దగ్గు",
        fatigue: "అలసట",
        headache: "తలనొప్పి",
        placeholder: "మీ లక్షణాలను వివరించండి...",
        listening: "వింటున్నాను...",
        speechEnabled: "మాట్లాడటం ప్రారంభించబడింది",
        speechDisabled: "మాట్లాడటం ఆపబడింది"
    },
    hi: {
        welcome: "नमस्ते! मैं डॉ. AI असिस्टेंट हूं, आपका AI-संचालित मेडिकल चैटबॉट। मैं लक्षणों का आकलन करने और संभावित संक्रामक रोगों के बारे में प्रारंभिक जानकारी प्रदान करने में मदद कर सकता हूं।",
        disclaimer: "महत्वपूर्ण: यह केवल सूचनात्मक उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह को प्रतिस्थापित नहीं करना चाहिए। उचित निदान के लिए हमेशा स्वास्थ्य सेवा प्रदाता से परामर्श करें।",
        help: "मैं आज आपकी कैसे मदद कर सकता हूं? कृपया अपने लक्षणों का वर्णन करें।",
        quickSymptoms: "त्वरित लक्षण:",
        fever: "बुखार",
        cough: "खांसी",
        fatigue: "थकान",
        headache: "सिरदर्द",
        placeholder: "अपने लक्षणों का वर्णन करें...",
        listening: "सुन रहा हूं...",
        speechEnabled: "भाषण सक्षम",
        speechDisabled: "भाषण अक्षम"
    },
    es: {
        welcome: "¡Hola! Soy el Dr. Asistente AI, su chatbot médico impulsado por IA. Puedo ayudarle a evaluar síntomas y proporcionar información preliminar sobre posibles enfermedades infecciosas.",
        disclaimer: "Importante: Esto es solo para fines informativos y no debe reemplazar el consejo médico profesional. Siempre consulte con un proveedor de atención médica para un diagnóstico adecuado.",
        help: "¿Cómo puedo ayudarle hoy? Por favor, describa sus síntomas.",
        quickSymptoms: "Síntomas rápidos:",
        fever: "Fiebre",
        cough: "Tos",
        fatigue: "Fatiga",
        headache: "Dolor de cabeza",
        placeholder: "Describa sus síntomas...",
        listening: "Escuchando...",
        speechEnabled: "Voz habilitada",
        speechDisabled: "Voz deshabilitada"
    },
    fr: {
        welcome: "Bonjour ! Je suis le Dr Assistant IA, votre chatbot médical alimenté par l'IA. Je peux vous aider à évaluer les symptômes et fournir des informations préliminaires sur les maladies infectieuses potentielles.",
        disclaimer: "Important : Ceci est à des fins d'information uniquement et ne doit pas remplacer les conseils médicaux professionnels. Consultez toujours un fournisseur de soins de santé pour un diagnostic approprié.",
        help: "Comment puis-je vous aider aujourd'hui ? Veuillez décrire vos symptômes.",
        quickSymptoms: "Symptômes rapides :",
        fever: "Fièvre",
        cough: "Toux",
        fatigue: "Fatigue",
        headache: "Mal de tête",
        placeholder: "Décrivez vos symptômes...",
        listening: "Écoute...",
        speechEnabled: "Parole activée",
        speechDisabled: "Parole désactivée"
    }
};

// Multilingual symptom synonyms
const multilingualSymptomSynonyms = {
    en: symptomSynonyms,
    te: {
        'fever': ['జ్వరం', 'అధిక ఉష్ణోగ్రత', 'వేడి', 'కాలుతున్న', 'ఉష్ణోగ్రత'],
        'cough': ['దగ్గు', 'దగ్గుతున్న', 'ఎండు దగ్గు', 'తడి దగ్గు'],
        'fatigue': ['అలసట', 'అలసిపోయిన', 'ఎగ్జాస్టెడ్', 'బలహీనమైన'],
        'headache': ['తలనొప్పి', 'తల నొప్పి', 'మైగ్రేన్'],
        'sore throat': ['గొంతు నొప్పి', 'గొంతు వేదన', 'గొంతు చీదర'],
        'shortness of breath': ['ఊపిరి తీసుకోవడంలో ఇబ్బంది', 'ఊపిరి తీసుకోవడంలో కష్టం'],
        'body aches': ['శరీర నొప్పి', 'మాంసపుష్టి నొప్పి', 'జాయింట్ నొప్పి'],
        'runny nose': ['ముక్కు కారడం', 'ముక్కు డిస్చార్జ్'],
        'chills': ['చలి', 'వణుకు', 'గూస్‌బంప్స్'],
        'nausea': ['వికారం', 'వాంతి వేయాలనే భావన'],
        'vomiting': ['వాంతి', 'వేయడం', 'ఎమెసిస్'],
        'chest pain': ['ఛాతీ నొప్పి', 'ఛాతీ వేదన'],
        'loss of appetite': ['ఆకలి లేకపోవడం', 'ఆహారం తినలేకపోవడం']
    },
    hi: {
        'fever': ['बुखार', 'तेज बुखार', 'गर्मी', 'जलन', 'तापमान'],
        'cough': ['खांसी', 'खांस रहा', 'सूखी खांसी', 'गीली खांसी'],
        'fatigue': ['थकान', 'थका हुआ', 'थक गया', 'कमजोर'],
        'headache': ['सिरदर्द', 'सिर में दर्द', 'माइग्रेन'],
        'sore throat': ['गले में दर्द', 'गले की खराश', 'गले में जलन'],
        'shortness of breath': ['सांस लेने में तकलीफ', 'सांस लेने में कठिनाई'],
        'body aches': ['शरीर में दर्द', 'मांसपेशियों में दर्द', 'जोड़ों में दर्द'],
        'runny nose': ['नाक बहना', 'नाक से पानी आना'],
        'chills': ['ठंड लगना', 'कंपकंपी', 'सिहरन'],
        'nausea': ['मतली', 'उल्टी आने का मन'],
        'vomiting': ['उल्टी', 'वमन', 'कै'],
        'chest pain': ['छाती में दर्द', 'सीने में दर्द'],
        'loss of appetite': ['भूख न लगना', 'खाना न खा पाना']
    }
};

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const loadingOverlay = document.getElementById('loadingOverlay');
const emergencyModal = document.getElementById('emergencyModal');

// Initialize the chatbot
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Focus on input
    userInput.focus();
});

// Send message function
function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isAnalyzing) return;

    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';

    // Process the message
    processUserMessage(message);
}

// Add message to chat
function addMessage(text, sender, isTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isTyping) {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
            <div class="message-time">${currentTime}</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">
                    <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
                </div>
                <div class="message-bubble">
                    ${formatMessage(text)}
                </div>
            </div>
            <div class="message-time">${currentTime}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Store in chat history
    if (!isTyping) {
        chatHistory.push({ text, sender, timestamp: new Date() });
    }
}

// Format message with proper line breaks and styling
function formatMessage(text) {
    return text.replace(/\n/g, '<br>');
}

// Process user message and generate response
async function processUserMessage(message) {
    isAnalyzing = true;
    
    // Show typing indicator
    addMessage('', 'bot', true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Remove typing indicator
    chatMessages.removeChild(chatMessages.lastChild);
    
    // Extract symptoms from message
    const extractedSymptoms = extractSymptoms(message.toLowerCase());
    
    if (extractedSymptoms.length > 0) {
        currentSymptoms = [...new Set([...currentSymptoms, ...extractedSymptoms])];
        
        // Analyze symptoms and predict diseases
        const predictions = analyzeSymptoms(currentSymptoms);
        
        // Generate response
        const response = generateResponse(predictions, extractedSymptoms);
        addMessage(response, 'bot');
        
        // If high confidence prediction, show detailed results
        if (predictions.length > 0 && predictions[0].confidence > 0.6) {
            showDiseaseResults(predictions[0]);
        }
    } else {
        // No symptoms detected
        const response = generateGeneralResponse(message);
        addMessage(response, 'bot');
    }
    
    isAnalyzing = false;
}

// Extract symptoms from user message
function extractSymptoms(message) {
    const symptoms = [];
    
    // Check for symptom synonyms
    for (const [symptom, synonyms] of Object.entries(symptomSynonyms)) {
        for (const synonym of synonyms) {
            if (message.includes(synonym)) {
                symptoms.push(symptom);
                break;
            }
        }
    }
    
    // Check for severity indicators
    const severityWords = ['severe', 'bad', 'terrible', 'awful', 'intense', 'mild', 'slight', 'minor'];
    const hasSeverity = severityWords.some(word => message.includes(word));
    
    return symptoms;
}

// Analyze symptoms and predict diseases
function analyzeSymptoms(symptoms) {
    const predictions = [];
    
    // Reset confidence scores
    for (const disease in diseaseDatabase) {
        diseaseDatabase[disease].confidence = 0;
    }
    
    // Calculate confidence scores for each disease
    for (const [diseaseName, diseaseInfo] of Object.entries(diseaseDatabase)) {
        let matchedSymptoms = 0;
        let totalSymptoms = diseaseInfo.symptoms.length;
        
        for (const symptom of symptoms) {
            if (diseaseInfo.symptoms.includes(symptom)) {
                matchedSymptoms++;
            }
        }
        
        // Calculate confidence based on symptom match ratio
        const confidence = matchedSymptoms / totalSymptoms;
        
        if (confidence > 0.2) { // Only include diseases with at least 20% symptom match
            predictions.push({
                name: diseaseName,
                confidence: confidence,
                matchedSymptoms: matchedSymptoms,
                totalSymptoms: totalSymptoms,
                severity: diseaseInfo.severity,
                description: diseaseInfo.description,
                recommendations: diseaseInfo.recommendations
            });
        }
    }
    
    // Sort by confidence (highest first)
    predictions.sort((a, b) => b.confidence - a.confidence);
    
    return predictions;
}

// Generate response based on predictions
function generateResponse(predictions, newSymptoms) {
    let response = '';
    
    if (predictions.length === 0) {
        response = `I understand you're not feeling well. Could you please describe your symptoms in more detail? For example, are you experiencing fever, cough, fatigue, or any other specific symptoms?`;
    } else if (predictions.length === 1 && predictions[0].confidence > 0.7) {
        const disease = predictions[0];
        response = `Based on your symptoms, there's a strong possibility you might have ${disease.name}. `;
        response += `${disease.description} `;
        response += `\n\n${disease.recommendations}`;
    } else if (predictions.length > 1) {
        response = `Based on your symptoms, there are several possibilities:\n\n`;
        predictions.slice(0, 3).forEach((prediction, index) => {
            response += `${index + 1}. ${prediction.name} (${Math.round(prediction.confidence * 100)}% match)\n`;
        });
        response += `\nI recommend consulting with a healthcare provider for proper diagnosis.`;
    } else {
        response = `I've identified some symptoms that could indicate various conditions. `;
        response += `To provide a more accurate assessment, could you tell me more about:\n`;
        response += `• How long have you been experiencing these symptoms?\n`;
        response += `• How severe are they?\n`;
        response += `• Do you have any other symptoms?`;
    }
    
    return response;
}

// Generate general response for non-symptom messages
function generateGeneralResponse(message) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const thanks = ['thank', 'thanks', 'appreciate'];
    const help = ['help', 'what can you do', 'how does this work'];
    
    if (greetings.some(greeting => message.includes(greeting))) {
        return `Hello! I'm here to help you assess your symptoms and provide preliminary information about potential infectious diseases. Please describe any symptoms you're experiencing.`;
    } else if (thanks.some(thank => message.includes(thank))) {
        return `You're welcome! I'm here to help. Remember, this is for informational purposes only and should not replace professional medical advice.`;
    } else if (help.some(h => message.includes(h))) {
        return `I can help you by:\n• Analyzing your symptoms\n• Providing preliminary disease predictions\n• Offering general health recommendations\n• Identifying when to seek medical attention\n\nPlease describe your symptoms to get started.`;
    } else {
        return `I'm here to help with symptom analysis and disease prediction. Please describe any symptoms you're experiencing, such as fever, cough, fatigue, or any other health concerns.`;
    }
}

// Show detailed disease results
function showDiseaseResults(prediction) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'disease-result';
    
    resultDiv.innerHTML = `
        <h4><i class="fas fa-stethoscope"></i> Analysis Results</h4>
        <p><strong>Most Likely Condition:</strong> ${prediction.name}</p>
        <p><strong>Confidence:</strong> ${Math.round(prediction.confidence * 100)}%</p>
        <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${prediction.confidence * 100}%"></div>
        </div>
        <p><strong>Description:</strong> ${prediction.description}</p>
        <p><strong>Recommendations:</strong> ${prediction.recommendations}</p>
        <div class="symptoms-list">
            <strong>Your Symptoms:</strong>
            ${currentSymptoms.map(symptom => `<span class="symptom-tag">${symptom}</span>`).join('')}
        </div>
        <p><em>⚠️ This is a preliminary assessment. Please consult a healthcare provider for proper diagnosis and treatment.</em></p>
    `;
    
    // Add to the last bot message
    const lastBotMessage = chatMessages.querySelector('.bot-message:last-child .message-bubble');
    lastBotMessage.appendChild(resultDiv);
    
    // Scroll to show results
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add symptom from quick buttons
function addSymptom(symptom) {
    if (!currentSymptoms.includes(symptom)) {
        currentSymptoms.push(symptom);
        const message = `I have ${symptom}.`;
        addMessage(message, 'user');
        processUserMessage(message);
    } else {
        addMessage(`You've already mentioned ${symptom}. Please describe any other symptoms you're experiencing.`, 'bot');
    }
}

// Clear chat
function clearChat() {
    chatMessages.innerHTML = `
        <div class="message bot-message">
            <div class="message-content">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-bubble">
                    <p>Hello! I'm Dr. AI Assistant, your AI-powered medical chatbot. I can help you assess symptoms and provide preliminary information about potential infectious diseases.</p>
                    <p><strong>Important:</strong> This is for informational purposes only and should not replace professional medical advice. Always consult a healthcare provider for proper diagnosis.</p>
                    <p>How can I help you today? Please describe your symptoms.</p>
                </div>
            </div>
            <div class="message-time">Just now</div>
        </div>
    `;
    
    chatHistory = [];
    currentSymptoms = [];
    isAnalyzing = false;
}

// Show emergency information
function showEmergencyInfo() {
    emergencyModal.style.display = 'flex';
}

// Close modal
function closeModal() {
    emergencyModal.style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === emergencyModal) {
        closeModal();
    }
});

// Show loading overlay
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Emergency symptom detection
function checkForEmergencySymptoms(symptoms) {
    const emergencySymptoms = [
        'difficulty breathing',
        'shortness of breath',
        'chest pain',
        'severe chest pain',
        'unconsciousness',
        'severe bleeding',
        'high fever'
    ];
    
    const hasEmergency = emergencySymptoms.some(symptom => 
        symptoms.some(userSymptom => userSymptom.includes(symptom))
    );
    
    if (hasEmergency) {
        return `⚠️ EMERGENCY: You're experiencing symptoms that require immediate medical attention. Please call emergency services (911) immediately or go to the nearest emergency room.`;
    }
    
    return null;
}

// Enhanced symptom extraction with context
function extractSymptomsWithContext(message) {
    const symptoms = extractSymptoms(message);
    const context = {
        duration: extractDuration(message),
        severity: extractSeverity(message),
        frequency: extractFrequency(message)
    };
    
    return { symptoms, context };
}

// Extract duration from message
function extractDuration(message) {
    const durationPatterns = [
        /(\d+)\s*(day|days)/i,
        /(\d+)\s*(week|weeks)/i,
        /(\d+)\s*(hour|hours)/i,
        /(\d+)\s*(month|months)/i
    ];
    
    for (const pattern of durationPatterns) {
        const match = message.match(pattern);
        if (match) {
            return { value: parseInt(match[1]), unit: match[2] };
        }
    }
    
    return null;
}

// Extract severity from message
function extractSeverity(message) {
    const severeWords = ['severe', 'terrible', 'awful', 'intense', 'extreme', 'very bad'];
    const mildWords = ['mild', 'slight', 'minor', 'little', 'slight'];
    
    if (severeWords.some(word => message.includes(word))) {
        return 'severe';
    } else if (mildWords.some(word => message.includes(word))) {
        return 'mild';
    }
    
    return 'moderate';
}

// Extract frequency from message
function extractFrequency(message) {
    const frequencyWords = {
        'constant': 'constant',
        'continuous': 'constant',
        'intermittent': 'intermittent',
        'occasional': 'occasional',
        'frequent': 'frequent',
        'rare': 'rare'
    };
    
    for (const [word, frequency] of Object.entries(frequencyWords)) {
        if (message.includes(word)) {
            return frequency;
        }
    }
    
    return 'unknown';
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractSymptoms,
        analyzeSymptoms,
        generateResponse,
        diseaseDatabase
    };
}

// ===== MULTILINGUAL AND SPEECH FUNCTIONS =====

// Initialize speech recognition
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.onstart = function() {
            document.getElementById('listenBtn').classList.add('listening');
            document.getElementById('speechStatus').style.display = 'flex';
            document.getElementById('speechStatusText').textContent = translations[currentLanguage].listening;
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('userInput').value = transcript;
            sendMessage();
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            stopListening();
        };
        
        recognition.onend = function() {
            stopListening();
        };
    } else {
        console.warn('Speech recognition not supported');
        document.getElementById('listenBtn').style.display = 'none';
    }
}

// Start listening for voice input
function startListening() {
    if (recognition) {
        recognition.lang = getSpeechLanguageCode();
        recognition.start();
    }
}

// Stop listening
function stopListening() {
    if (recognition) {
        recognition.stop();
    }
    document.getElementById('listenBtn').classList.remove('listening');
    document.getElementById('speechStatus').style.display = 'none';
}

// Get speech language code
function getSpeechLanguageCode() {
    const languageCodes = {
        'en': 'en-US',
        'te': 'te-IN',
        'hi': 'hi-IN',
        'es': 'es-ES',
        'fr': 'fr-FR'
    };
    return languageCodes[currentLanguage] || 'en-US';
}

// Toggle speech synthesis
function toggleSpeech() {
    speechEnabled = !speechEnabled;
    const speechBtn = document.getElementById('speechToggle');
    
    if (speechEnabled) {
        speechBtn.classList.add('active');
        speechBtn.title = translations[currentLanguage].speechDisabled;
    } else {
        speechBtn.classList.remove('active');
        speechBtn.title = translations[currentLanguage].speechEnabled;
    }
}

// Speak text using speech synthesis
function speakText(text) {
    if (speechEnabled && synthesis) {
        // Cancel any ongoing speech
        synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getSpeechLanguageCode();
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        synthesis.speak(utterance);
    }
}

// Change language
function changeLanguage() {
    const languageSelector = document.getElementById('languageSelector');
    const newLanguage = languageSelector.value;
    
    if (newLanguage === 'auto') {
        // Auto-detect language (simplified - could be enhanced with language detection API)
        currentLanguage = 'en';
    } else {
        currentLanguage = newLanguage;
    }
    
    updateUILanguage();
}

// Update UI elements with new language
function updateUILanguage() {
    const t = translations[currentLanguage];
    
    // Update placeholder text
    document.getElementById('userInput').placeholder = t.placeholder;
    
    // Update quick symptoms
    document.getElementById('quickLabel').textContent = t.quickSymptoms;
    document.getElementById('feverBtn').textContent = t.fever;
    document.getElementById('coughBtn').textContent = t.cough;
    document.getElementById('fatigueBtn').textContent = t.fatigue;
    document.getElementById('headacheBtn').textContent = t.headache;
    
    // Update speech button titles
    document.getElementById('speechToggle').title = speechEnabled ? t.speechDisabled : t.speechEnabled;
    document.getElementById('listenBtn').title = t.listening;
}

// Enhanced extract symptoms with multilingual support
function extractSymptomsMultilingual(message, language = 'en') {
    const symptoms = [];
    const messageLower = message.toLowerCase();
    
    // Get symptom synonyms for the current language
    const synonyms = multilingualSymptomSynonyms[language] || multilingualSymptomSynonyms['en'];
    
    for (const [symptom, synonymList] of Object.entries(synonyms)) {
        for (const synonym of synonymList) {
            if (messageLower.includes(synonym.toLowerCase())) {
                symptoms.push(symptom);
                break;
            }
        }
    }
    
    return [...new Set(symptoms)]; // Remove duplicates
}

// Enhanced send message with multilingual support
function sendMessageMultilingual() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Extract symptoms using multilingual support
    const symptoms = extractSymptomsMultilingual(message, currentLanguage);
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Clear input
    userInput.value = '';
    
    // Show typing indicator
    addMessage('', 'bot', true);
    
    // Process message with delay to show typing
    setTimeout(() => {
        // Remove typing indicator
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        // Generate response
        const response = generateResponse(symptoms, message);
        
        // Add bot response
        addMessage(response, 'bot');
        
        // Speak response if enabled
        if (speechEnabled) {
            speakText(response);
        }
    }, 1500);
}

// Initialize multilingual features
function initializeMultilingual() {
    // Initialize speech recognition
    initializeSpeechRecognition();
    
    // Update UI with current language
    updateUILanguage();
    
    // Add event listeners
    document.getElementById('userInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessageMultilingual();
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeMultilingual();
});
