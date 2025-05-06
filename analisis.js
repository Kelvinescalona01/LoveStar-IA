// image_analysis_script.js

// Use the same API Key as the chat script
// ADVERTENCIA DE SEGURIDAD: Esta clave está visible públicamente. Usa un backend en producción.
const VISION_API_KEY = "AIzaSyAIi9lemFB-izEQzt9Gk3lu5XnLteF1ZjQ"; // Ensure this is your actual API Key
const VISION_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${VISION_API_KEY}`;


// Wrap the code inside an initialization function to be called by main.js
function initImageAnalysisScript() {

    // Get references to the elements within the image analysis section
    const imageUpload = document.getElementById('image-upload');
    const analyzeButton = document.getElementById('analyze-image-button');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewImg = imagePreview ? imagePreview.querySelector('img') : null;
    const analysisResult = document.getElementById('analysis-result');
    const analysisLoadingIndicator = document.getElementById('analysis-loading-indicator');

    let selectedImageBase64 = null; // To store the image data in Base64 format


    // Check if all necessary elements are found
    if (!imageUpload || !analyzeButton || !imagePreview || !imagePreviewImg || !analysisResult || !analysisLoadingIndicator) {
        console.error("ERROR: Some elements for the Image Analysis section were not found in the DOM.");
        // Optionally, display an error message in the UI
        const container = document.querySelector('#image-analysis-section .container');
        if (container) {
             container.innerHTML = "<p style='color: red;'>Error loading the Image Analysis tool. Please check the console for details.</p>";
        }
        return; // Stop execution if elements are missing
    }


    // Function to handle file selection and preview
    const handleImageUpload = (event) => {
        const file = event.target.files[0]; // Get the selected file
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg']; // Define allowed image types

        if (file) {
            // Check if the file type is allowed
            if (!allowedMimeTypes.includes(file.type)) {
                alert("Por favor, selecciona un archivo de imagen (JPG, JPEG, PNG).");
                imageUpload.value = ''; // Clear the file input
                selectedImageBase64 = null;
                 imagePreview.style.display = 'none';
                 imagePreviewImg.src = '#';
                 analysisResult.textContent = '';
                 analysisResult.style.display = 'none';
                 analyzeButton.disabled = true;
                return; // Stop processing
            }

            // Check file size (optional, but recommended for API limits)
            const maxSizeInBytes = 5 * 1024 * 1024; // 5MB example limit
            if (file.size > maxSizeInBytes) {
                 alert("El archivo de imagen es demasiado grande (máximo 5MB permitido).");
                 imageUpload.value = '';
                 selectedImageBase64 = null;
                 imagePreview.style.display = 'none';
                 imagePreviewImg.src = '#';
                 analysisResult.textContent = '';
                 analysisResult.style.display = 'none';
                 analyzeButton.disabled = true;
                 return;
            }


            const reader = new FileReader(); // Create a FileReader object
            reader.onload = (e) => {
                // The result is a Data URL (base64 encoded image)
                selectedImageBase64 = e.target.result.split(',')[1]; // Extract Base64 data part
                imagePreviewImg.src = e.target.result; // Set preview image source
                imagePreview.style.display = 'block'; // Show the preview container

                // Clear previous results and hide the result area
                analysisResult.textContent = '';
                analysisResult.style.display = 'none';

                // Enable the analyze button once an image is loaded
                analyzeButton.disabled = false;
            };
            reader.onerror = (error) => {
                 console.error("Error reading file:", error);
                 alert("Ocurrió un error al leer el archivo de imagen.");
                 selectedImageBase64 = null;
                 imagePreview.style.display = 'none';
                 imagePreviewImg.src = '#';
                 analysisResult.textContent = '';
                 analysisResult.style.display = 'none';
                 analyzeButton.disabled = true;
            };
            reader.readAsDataURL(file); // Read the file as a data URL

        } else {
            // No file selected, reset state
            selectedImageBase64 = null;
            imagePreview.style.display = 'none';
            imagePreviewImg.src = '#';
            analysisResult.textContent = '';
            analysisResult.style.display = 'none';
            analyzeButton.disabled = true; // Disable button
        }
    };

    // Function to send image data and prompt to the Vision API
    const analyzeImage = async () => {
        if (!selectedImageBase64) {
            console.warn("No image selected for analysis. The button should be disabled.");
            // The button should be disabled, but as a safeguard:
            alert("Por favor, sube una imagen primero.");
            return;
        }

        // Show loading indicator and disable the button
        analysisLoadingIndicator.style.display = 'block';
        analyzeButton.disabled = true;
        analysisResult.textContent = ''; // Clear previous result text
        analysisResult.style.display = 'none'; // Hide result area while loading


        try {
            // Prompt for the Vision API
            // Instruct it to act as LoveStar and analyze the conversation in the image
            const prompt = "Actúa como LoveStar, una asistente de IA encantadora y con carisma. Analiza esta imagen que contiene una conversación. Dame un breve resumen de la conversación o extrae los puntos clave y el contexto de una manera amigable y concisa, manteniendo tu personalidad. Responde en español.";


            const response = await fetch(VISION_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt }, // The text prompt
                                {
                                    inline_data: {
                                        // Determine mime type dynamically if possible, or assume common ones
                                        mime_type: 'image/jpeg', // Default, consider refining this
                                        data: selectedImageBase64 // The Base64 image data
                                    }
                                }
                            ]
                        }
                    ],
                    // Optional: adjust generation parameters
                     generationConfig: {
                        temperature: 0.2, // Lower temperature for more focused analysis
                        max_output_tokens: 500 // Limit the response length
                     }
                })
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => null);
                 const errorMessage = errorBody && errorBody.error && errorBody.error.message ? errorBody.error.message : `Error HTTP: ${response.status}`;
                 throw new Error(`API Error: ${errorMessage}`);
            }

            const data = await response.json();

            // Extract the text from the API response
            const text = data && data.candidates && data.candidates.length > 0
                         && data.candidates[0].content && data.candidates[0].content.parts
                         && data.candidates[0].content.parts.length > 0
                         && data.candidates[0].content.parts[0].text
                         ? data.candidates[0].content.parts[0].text
                         : "No se pudo obtener un resultado válido del análisis de la imagen."; // Default message


            // Display the analysis result
            if (analysisResult) {
                analysisResult.textContent = text;
                analysisResult.style.display = 'block'; // Show results area
            }

        } catch (error) {
            // Handle errors during the API call
            console.error("Error analyzing image:", error);
            if (analysisResult) {
                 analysisResult.textContent = `Error al analizar la imagen: ${error.message}`;
                 analysisResult.style.display = 'block';
             }
             alert(`Error al analizar la imagen: ${error.message}`); // Show alert to user
        } finally {
            // Hide loading indicator and re-enable the button
            if (analysisLoadingIndicator) analysisLoadingIndicator.style.display = 'none';
            if (analyzeButton) analyzeButton.disabled = false;
        }
    };


    // --- Event Listeners ---

    // Add event listener for file selection
    imageUpload.addEventListener('change', handleImageUpload);

    // Add event listener for the analyze button
    analyzeButton.addEventListener('click', analyzeImage);

    // --- Initial State ---
    // Initially disable the analyze button until a file is uploaded (handled by handleImageUpload)
    analyzeButton.disabled = true;

     // When this section is initialized (called by main.js),
     // you might want to reset the UI or keep the last state.
     // For now, we'll just ensure the initial state (button disabled, results hidden) is correct.
     imageUpload.value = ''; // Clear any previously selected file
     selectedImageBase64 = null;
     imagePreview.style.display = 'none';
     imagePreviewImg.src = '#';
     analysisResult.textContent = '';
     analysisResult.style.display = 'none';
     analysisLoadingIndicator.style.display = 'none';
     analyzeButton.disabled = true; // Explicitly disable button

} // End of initImageAnalysisScript function