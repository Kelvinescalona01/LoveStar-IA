// scripts.js

// Clave de API de Gemini.
// ADVERTENCIA DE SEGURIDAD: Esta clave está visible públicamente en el código del lado del cliente.
// Esto NO es seguro para una aplicación en producción. La forma segura es usar un backend.
const API_KEY = "AIzaSyAIi9lemFB-izEQzt9Gk3lu5XnLteF1ZjQ";
const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`; // Endpoint para generateContent

document.addEventListener("DOMContentLoaded", () => {

    // --- References to UI Elements ---
    const chatForm = document.getElementById("chat-form");
    const userInput = document.getElementById("user-input");
    const chatBox = document.getElementById("chat-box");
    const reiniciarChatBtn = document.getElementById("reiniciar-chat");
    const asistenteIaSection = document.getElementById("asistente-ia"); // The main chat section
    const coquetrySlider = document.getElementById("coquetry-level"); // Get the coquetry slider
    const coquetryValueSpan = document.getElementById("coquetry-value"); // Get the span for the charm level value
    const generateAltResponseBtn = document.getElementById("generate-alt-response-btn"); // Get the generate alternative response button
    // Language display element (now a span)
    const languageDisplay = document.getElementById("language-display");


    // --- Translation Data ---
    const translations = {
        es: {
            title: 'LoveStar IA - Tu Asistente Encantador',
            heading: 'Chatea con LoveStar IA',
            languageName: 'Español', // Display name for the language
            coquetryLabel: 'Nivel de Encanto:',
            coquetryLevelPrefix: 'Nivel: ', // Text before the slider value
            placeholder: 'Escribe tu mensaje...',
            // sendButton: '', // Icon only, no text needed
            resetButton: 'Reiniciar Chat',
            generateAltButton: 'Generar otra respuesta',
            initialMessage: '¡Hola! Soy LoveStar, tu asistente. Ajusta mi nivel de encanto y cambia de idioma haciendo clic en "Español".',
            resetConfirmation: 'Chat reiniciado. ¡Ajusta el nivel de encanto y pregúntame algo!',
            thinkingMessage: 'Pensando...', // Thinking message text
            apiError: 'Error en la API: ', // API error prefix
            noValidResponse: 'No se recibió una respuesta de texto válida del asistente.', // No response text
            generalError: 'Error: ', // General error prefix
            tryAgain: '. Intenta nuevamente.', // Try again suffix
            cannotGenerateAlt: 'No se puede generar respuesta alternativa: ', // Cannot generate alt prefix
            lastMessageNotBot: 'El último mensaje no es una respuesta completa del asistente.', // Reason
            noUserMessage: 'No se ha enviado ningún mensaje de usuario o no se ha recibido respuesta.', // Reason
             subscriptionMessage: 'Debes estar suscrito para usar el asistente de IA. Suscríbete <a href=\'contacto.html\'>aquí</a>.', // Subscription message HTML

             // Tone descriptions added for translation
             toneNeutral: "Mantén un tono amigable pero estrictamente neutral, sin ningún elemento coqueto o carismático.",
             toneLow: `Sé amigable y ligeramente encantador.`,
             toneModerate: `Sé encantador y carismático. Usa un tono juguetón.`,
             toneHigh: `Sé muy coqueto y seductor. Usa un tono muy juguetón y quizás emojis coquetos.`,
             toneMaximum: `Sé extremadamente coqueto, seductor y atrevido. Sé muy carismático y usa un lenguaje muy juguetón y directo. Usa emojis audaces.`

        },
        en: {
            title: 'LoveStar AI - Your Charming Assistant',
            heading: 'Chat with LoveStar AI',
            languageName: 'English', // Display name for the language
            coquetryLabel: 'Charm Level:',
            coquetryLevelPrefix: 'Level: ',
            placeholder: 'Type your message...',
            // sendButton: '', // Icon only
            resetButton: 'Reset Chat',
            generateAltButton: 'Generate another response',
            initialMessage: 'Hello! I am LoveStar, your assistant. Adjust my charm level and change language by clicking on "English".',
            resetConfirmation: 'Chat reset. Adjust the charm level and ask me something!',
            thinkingMessage: 'Thinking...',
            apiError: 'API Error: ',
            noValidResponse: 'No valid text response was received from the assistant.',
            generalError: 'Error: ',
            tryAgain: '. Please try again.',
            cannotGenerateAlt: 'Cannot generate alternative response: ',
            lastMessageNotBot: 'The last message is not a complete bot response.',
            noUserMessage: 'No user message sent yet or no response received.',
            subscriptionMessage: 'You must be subscribed to use the AI assistant. Subscribe <a href=\'contacto.html\'>here</a>.',

            // Tone descriptions added for translation
            toneNeutral: "Maintain a friendly but strictly neutral tone, without any flirty or charismatic elements.",
            toneLow: `Be friendly and slightly charming.`,
            toneModerate: `Be charming and charismatic. Use a playful tone.`,
            toneHigh: `Be very flirty and seductive. Use a very playful tone and maybe flirty emojis.`,
            toneMaximum: `Be extremely flirty, seductive, and bold. Be very charismatic and use very playful and direct language. Use bold emojis.`
        }
        // Add more language translations here
        // fr: { ... }
    };

    // Available language codes
    const availableLanguages = Object.keys(translations);

    // --- State Variables ---
    let chatHistory = []; // Array to store chat history for context
    let lastUserMessage = null; // Store the last user message to regenerate response
    // Get language from localStorage or default to the first available language
    let currentLanguage = localStorage.getItem('currentLanguage') || availableLanguages[0];


    // --- Helper Functions ---

    // Function to update the UI text based on the selected language
    const updateUIText = (lang) => {
        // Update the language display text
        if (languageDisplay && translations[lang] && translations[lang].languageName) {
            languageDisplay.textContent = translations[lang].languageName;
        }

        const elementsToTranslate = document.querySelectorAll('[data-translate]');
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-translate');
            // Skip the languageName key as it's handled by languageDisplay span
            if (key === 'languageName') return;

            if (translations[lang] && translations[lang][key]) {
                if (element.tagName === 'INPUT' && element.getAttribute('type') === 'text') {
                    element.placeholder = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });
         // Update the window title
         if (translations[lang] && translations[lang].title) {
             document.title = translations[lang].title;
         }
         // Update the coquetry value display
         updateCoquetryValueDisplay(); // Call to update the prefix in the correct language
    };

    // Function to update the displayed value of the coquetry slider
    const updateCoquetryValueDisplay = () => {
        if (coquetrySlider && coquetryValueSpan && translations[currentLanguage]) {
            // Use the translated prefix
            coquetryValueSpan.textContent = translations[currentLanguage].coquetryLevelPrefix + coquetrySlider.value;
        }
    };

    // Function to add messages to the DOM
    const agregarMensaje = (text, clase, isThinking = false) => {
        const mensajeDiv = document.createElement("div");
        mensajeDiv.classList.add("message", clase);

        if (isThinking) {
             mensajeDiv.classList.add("thinking"); // Add thinking class
             // Use innerHTML to include the typing indicator HTML (translated "Thinking...")
             const thinkingText = translations[currentLanguage] ? translations[currentLanguage].thinkingMessage : 'Thinking...'; // Get from translations
             mensajeDiv.innerHTML = `${thinkingText} <span class="typing-indicator"><span></span><span></span><span></span></span>`;
         } else {
             // Use textContent initially to prevent rendering user-provided HTML
             mensajeDiv.textContent = text;
             // Then add line breaks for display
             mensajeDiv.innerHTML = mensajeDiv.innerHTML.replace(/\n/g, '<br>');
         }

        chatBox.appendChild(mensajeDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
        return mensajeDiv; // Return the created element
    };

    // Function to remove the thinking message
    const removeThinkingMessage = (thinkingElement) => {
         if (thinkingElement && chatBox.contains(thinkingElement)) { // Check if element is still in chatBox
             chatBox.removeChild(thinkingElement);
         }
    };


    // Function to send the message to Gemini using Fetch with history and charm level
    const enviarMensajeAI = async (mensaje, isAlternative = false) => {
        // If it's not an alternative generation, add user message to history and display it
        if (!isAlternative) {
            chatHistory.push({ role: 'user', parts: [{ text: mensaje }] });
            agregarMensaje(mensaje, "user"); // Display user message
            lastUserMessage = mensaje; // Store this message as the last user message
             // Hide the generate alternative button when a new message is sent
             if (generateAltResponseBtn) {
                generateAltResponseBtn.style.display = 'none';
            }
        }

        // Add a "Thinking..." message with indicator
        const thinkingMessageElement = agregarMensaje("", "bot", true);

        // Get the current coquetry level from the slider
        const currentCoquetryLevel = coquetrySlider ? parseInt(coquetrySlider.value) : 5; // Default to 5 if slider not found, ensure it's a number

        try {
            // Realiza la llamada a la API de Gemini usando fetch

             // Dynamic tone instruction based on coquetry level and language
             let toneInstruction = "";
             if (currentCoquetryLevel === 0) {
                 toneInstruction = translations[currentLanguage] ? translations[currentLanguage].toneNeutral : "Maintain a friendly but strictly neutral tone, without any flirty or charismatic elements.";
             } else if (currentCoquetryLevel >= 1 && currentCoquetryLevel <= 3) {
                 toneInstruction = translations[currentLanguage] ? translations[currentLanguage].toneLow : `Be friendly and slightly charming.`;
             } else if (currentCoquetryLevel >= 4 && currentCoquetryLevel <= 6) {
                 toneInstruction = translations[currentLanguage] ? translations[currentLanguage].toneModerate : `Be charming and charismatic. Use a playful tone.`;
             } else if (currentCoquetryLevel >= 7 && currentCoquetryLevel <= 9) {
                  toneInstruction = translations[currentLanguage] ? translations[currentLanguage].toneHigh : `Be very flirty and seductive. Use a very playful tone and maybe flirty emojis.`;
             } else if (currentCoquetryLevel === 10) {
                 toneInstruction = translations[currentLanguage] ? translations[currentLanguage].toneMaximum : `Be extremely flirty, seductive, and bold. Be very charismatic and use very playful and direct language. Use bold emojis.`;
             }


             // Refined System Instruction to balance real-person persona with precision for specific queries
             let systemInstruction = translations[currentLanguage] ?
                 `You are LoveStar, your assistant. Speak EXACTLY like a real person would in a casual conversation, maintaining your charming persona and the requested level of charm (${currentCoquetryLevel}/10). Avoid robotic phrasing, AI jargon, or any indication that you are an artificial intelligence. Be natural, spontaneous, and use common expressions. HOWEVER, when the user asks for specific information or a direct question, prioritize being precise, concise, and factual. In precise answers, avoid excessive conversational filler, but you can still briefly acknowledge your persona. Always respond in ${currentLanguage === 'es' ? 'Spanish' : 'English'}. ${toneInstruction}` :
                  // Fallback instruction if translation fails
                 `You are LoveStar, your assistant. Speak exactly like a real person in a casual conversation, maintaining charm level ${currentCoquetryLevel}/10. Avoid AI phrasing. Be natural. FOR FACTUAL QUESTIONS, BE PRECISE AND CONCISE. Always respond in English. ${toneInstruction}`;


            if (isAlternative) {
                 systemInstruction += translations[currentLanguage] ?
                     ` GENERATE A DIFFERENT RESPONSE to the user's last question or comment. Avoid repeating what you said before for that same message.` :
                     ` GENERATE A DIFFERENT RESPONSE to the user's last question or comment. Avoid repeating what you said before for that same message.`;
            }

             systemInstruction += translations[currentLanguage] ?
                 ` Consider our conversation history for personalized responses.` :
                 ` Consider our conversation history for personalized responses.` ;


            // Build the conversation history to send to the API
            const fullConversationHistory = [];
            // It's generally better to put the core system instruction at the beginning,
            // then maybe a confirmation from the model, then the conversation history.
            fullConversationHistory.push({ role: 'user', parts: [{ text: systemInstruction }] });
            // Optional acknowledgment - keep it internal/neutral, can be in English
            fullConversationHistory.push({ role: 'model', parts: [{ text: 'Understood.' }] }); // Simplified acknowledgment

            // Add previous turns from chatHistory
            // If generating an alternative, exclude the last bot message from history
            const historyToSend = isAlternative ? chatHistory.slice(0, -1) : chatHistory; // If alt, send history BEFORE last bot message

             for (let i = 0; i < historyToSend.length; i++) {
                 fullConversationHistory.push(historyToSend[i]);
             }


            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: fullConversationHistory, // Send the full conversation history
                    // You can add generationConfig, safetySettings, etc. here if needed
                     generationConfig: { temperature: 0.4 } // Lowered temperature for more precise/less varied responses
                })
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                const errorMessage = errorBody && errorBody.error && errorBody.error.message ? errorBody.error.message : `Error HTTP: ${response.status}`;
                throw new Error((translations[currentLanguage] ? translations[currentLanguage].apiError : 'API Error: ') + errorMessage);
            }

            const data = await response.json();

            const text = data && data.candidates && data.candidates.length > 0
                         && data.candidates[0].content && data.candidates[0].content.parts
                         && data.candidates[0].content.parts.length > 0
                         ? data.candidates[0].content.parts[0].text
                         : null;

            // Remove the "Thinking..." message
            removeThinkingMessage(thinkingMessageElement);


            if (text) {
                // Add bot message to history
                chatHistory.push({ role: 'model', parts: [{ text: text }] });
                 // Display bot message
                 agregarMensaje(text, "bot");
                 // Show the generate alternative button after a successful response
                 if (generateAltResponseBtn) {
                    generateAltResponseBtn.style.display = 'inline-block'; // Use inline-block or block depending on layout
                }
            } else {
                const noValidResponseText = translations[currentLanguage] ? translations[currentLanguage].noValidResponse : "No valid text response was received from the assistant.";
                agregarMensaje(noValidResponseText, "bot error"); // Display error message with special class
                 console.error("Estructura de respuesta de la API inesperada:", data);
                 // Optional: Add a placeholder or error to history if you want to track API failures
                 chatHistory.push({ role: 'model', parts: [{ text: noValidResponseText }] });
            }

        } catch (error) {
            // Remove the "Thinking..." message
            removeThinkingMessage(thinkingMessageElement);

            const errorPrefix = translations[currentLanguage] ? translations[currentLanguage].generalError : 'Error: ';
            const tryAgainSuffix = translations[currentLanguage] ? translations[currentLanguage].tryAgain : '. Please try again.';
            const errorMessageText = `${errorPrefix}${error.message}${tryAgainSuffix}`;
            agregarMensaje(errorMessageText, "bot error"); // Display error message with special class
            console.error("Error durante la llamada a la API:", error);
             // Optional: Add error to history
             chatHistory.push({ role: 'model', parts: [{ text: error.message }] }); // Store just the error message text
        } finally {
            // Ensure thinking message is removed even if there's an unexpected issue
             if (thinkingMessageElement && chatBox.contains(thinkingMessageElement)) {
                 chatBox.removeChild(thinkingMessageElement);
             }
        }
    };

    // --- Event Listeners ---

    // Event listener for chat form submission
    chatForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent default form submission
        const mensaje = userInput.value.trim();

        if (mensaje) { // Ensure message is not empty
            enviarMensajeAI(mensaje); // Send the message to Gemini (not as alternative)
            userInput.value = ""; // Clear the input field
        }
    });

    // Event listener for the reset chat button
    reiniciarChatBtn.addEventListener("click", () => {
        chatBox.innerHTML = ""; // Clear the chat box visually
        chatHistory = []; // Clear chat history
        lastUserMessage = null; // Clear last user message
         // Hide the generate alternative button on reset
         if (generateAltResponseBtn) {
            generateAltResponseBtn.style.display = 'none';
        }
        agregarMensaje(translations[currentLanguage].resetConfirmation, "bot"); // Display reset message in current language
    });

     // Event listener for the coquetry slider input (updates value display in real-time)
     if (coquetrySlider) {
        coquetrySlider.addEventListener('input', updateCoquetryValueDisplay);
     }

     // Event listener for the "Generate Another Response" button
    if (generateAltResponseBtn) {
        generateAltResponseBtn.addEventListener('click', () => {
            // Ensure there was a user message and at least one bot response before trying to regenerate
            // Check if the last entry in chatHistory is a bot response before removing it
            if (lastUserMessage && chatHistory.length >= 2 && chatHistory[chatHistory.length - 1].role === 'model') {
                // Find and remove the last bot message element from the DOM
                const lastBotMessageElement = chatBox.lastChild;
                 // Double-check that the last message in the DOM is indeed a bot message (and not thinking/error)
                 // This is a bit fragile, relies on DOM order matching history. A better way in a complex app
                 // would be to give messages unique IDs. For this structure, checking class is okay.
                if (lastBotMessageElement && lastBotMessageElement.classList.contains('bot') && !lastBotMessageElement.classList.contains('thinking')) {
                     removeThinkingMessage(lastBotMessageElement); // Reuse the remove logic
                     // Remove the last bot message from history
                     chatHistory.pop();
                     // Now send the last user message again, requesting an alternative
                     enviarMensajeAI(lastUserMessage, true); // Send as alternative
                } else {
                     const cannotGenerateAltText = translations[currentLanguage] ? translations[currentLanguage].cannotGenerateAlt : "Cannot generate alternative response: ";
                     const reasonText = translations[currentLanguage] ? translations[currentLanguage].lastMessageNotBot : "The last message is not a complete bot response.";
                     console.warn(cannotGenerateAltText + reasonText);
                     // Optionally, display a temporary message to the user
                }
            } else {
                const cannotGenerateAltText = translations[currentLanguage] ? translations[currentLanguage].cannotGenerateAlt : "Cannot generate alternative response: ";
                const reasonText = translations[currentLanguage] ? translations[currentLanguage].noUserMessage : "No user message sent yet or no response received.";
                 console.warn(cannotGenerateAltText + reasonText);
                 // Optionally, display a temporary message to the user
            }
        });
         // Initially hide the button
         // Visibility is controlled within enviarMensajeAI after the first bot response
    }

    // Event listener for language display click
    if (languageDisplay) {
        languageDisplay.addEventListener('click', () => {
            const currentIndex = availableLanguages.indexOf(currentLanguage);
            const nextIndex = (currentIndex + 1) % availableLanguages.length;
            currentLanguage = availableLanguages[nextIndex];

            localStorage.setItem('currentLanguage', currentLanguage); // Save selected language
            updateUIText(currentLanguage); // Update UI text
            // Optional: Add a message to the chat confirming the language change
            const languageChangedMessage = currentLanguage === 'es' ?
                `Idioma cambiado a Español.` :
                `Language changed to English.`;
            // Clearing and re-adding initial message provides clearer feedback
            chatBox.innerHTML = ""; // Clear chat box
            chatHistory = []; // Clear history
            lastUserMessage = null; // Clear last user message
            if (generateAltResponseBtn) { // Hide alt button on language change
                generateAltResponseBtn.style.display = 'none';
            }
            agregarMensaje(translations[currentLanguage].initialMessage, "bot"); // Add initial message in new language
        });
    }


    // --- Initial Setup on Page Load ---

    // Set the initial language based on localStorage or default
    // This is handled by the initial assignment of currentLanguage

    updateUIText(currentLanguage); // Update UI text on load (includes setting initial title and coquetry display)


    // Add initial bot message when the page loads (in the determined language)
    if (chatBox && translations[currentLanguage]) { // Ensure chatBox and translations exist
         agregarMensaje(translations[currentLanguage].initialMessage, "bot");
    }


    // --- Subscription Check Logic ---
    // Assuming the subscription check logic is needed to show/hide the chat section
    const isSubscribed = () => {
        const suscripciones = JSON.parse(localStorage.getItem("suscripciones")) || [];
        // This simple check assumes any subscription counts. Adjust as needed.
        return suscripciones.length > 0;
    };

    const mostrarSeccionIA = () => {
         if (asistenteIaSection) {
             // Get element references here within the function to ensure they exist when called
             const chatContainer = document.getElementById('chat-container');
             const chatForm = document.getElementById('chat-form');
             const reiniciarChatBtn = document.getElementById('reiniciar-chat');
             const coquetryControl = document.getElementById('coquetry-control');
             const languageDisplay = document.getElementById('language-display'); // Get language display reference
             const generateAltResponseBtn = document.getElementById('generate-alt-response-btn');


            if (isSubscribed()) {
                asistenteIaSection.style.display = "flex";
                // Show chat elements if they exist on the page
                 if (chatContainer) chatContainer.style.display = 'flex';
                 if (chatForm) chatForm.style.display = 'flex';
                 if (reiniciarChatBtn) reiniciarChatBtn.style.display = 'block'; // Or 'inline-block'
                 if (coquetryControl) coquetryControl.style.display = 'flex';
                 if (languageDisplay) languageDisplay.style.display = 'block'; // Show language display
                 // The generateAltResponseBtn visibility is handled by enviarMensajeAI

            } else {
                 // Hide chat elements and show subscription message
                if (chatContainer) chatContainer.style.display = 'none';
                if (chatForm) chatForm.style.display = 'none';
                if (reiniciarChatBtn) reiniciarChatBtn.style.display = 'none';
                if (coquetryControl) coquetryControl.style.display = 'none';
                 if (languageDisplay) languageDisplay.style.display = 'none'; // Hide language display
                if (generateAltResponseBtn) generateAltResponseBtn.style.display = 'none';


                // Display a message prompting subscription (using translated text)
                 asistenteIaSection.innerHTML = `
                    <h2>${currentLanguage === 'es' ? 'Asistente de Inteligencia Artificial' : 'Artificial Intelligence Assistant'}</h2>
                    <p>${translations[currentLanguage] ? translations[currentLanguage].subscriptionMessage : translations['es'].subscriptionMessage}</p>
                 `;
                 asistenteIaSection.style.textAlign = "center";
                 asistenteIaSection.style.color = "#333"; // Adjust color as needed
                 asistenteIaSection.style.display = "flex"; // Ensure the section is visible to show the message
                 asistenteIaSection.style.flexDirection = 'column';
                 asistenteIaSection.style.justifyContent = 'center';
                 asistenteIaSection.style.alignItems = 'center';
             }
        }
    };

     // Initial check for subscription status and display
    mostrarSeccionIA();


}); // End of DOMContentLoaded event listener