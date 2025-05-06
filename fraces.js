// script.js

document.addEventListener("DOMContentLoaded", () => {

    const phraseDisplay = document.getElementById("phrase-display");
    const generateButton = document.getElementById("generate-button");

    // List of conversation starter phrases
    const conversationStarters = [
        "¿Cuál es la cosa más interesante que te pasó hoy?",
        "Si pudieras viajar a cualquier lugar del mundo ahora mismo, ¿a dónde irías?",
        "¿Qué libro estás leyendo o cuál recomendarías?",
        "¿Hay alguna película o serie que te haya encantado recientemente?",
        "¿Cuál es tu pasatiempo favorito?",
        "Si tuvieras un superpoder, ¿cuál sería?",
        "¿Qué tipo de música te gusta escuchar?",
        "¿Tienes algún plan interesante para el fin de semana?",
        "¿Qué es lo que más te apasiona?",
        "Si pudieras cenar con cualquier persona, viva o muerta, ¿quién sería?",
        "¿Cuál es tu comida favorita?",
        "¿Hay algo nuevo que hayas aprendido últimamente?",
        "¿Qué es lo más divertido que has hecho este año?",
        "Si pudieras tener cualquier trabajo en el mundo, ¿cuál sería?",
        "¿Cuál es un pequeño placer culpable que tengas?",
        "¿Hay alguna frase o cita que te motive?",
        "¿Qué es lo que más valoras en una amistad?",
        "¿Qué lugar de tu ciudad te gusta más?",
        "¿Cuál es tu recuerdo de viaje favorito?",
        "Si fueras un animal, ¿cuál serías y por qué?"
    ];

    // Function to generate and display a random phrase
    const generatePhrase = () => {
        if (conversationStarters.length > 0) {
            const randomIndex = Math.floor(Math.random() * conversationStarters.length);
            const randomPhrase = conversationStarters[randomIndex];
            phraseDisplay.textContent = randomPhrase;
        } else {
            phraseDisplay.textContent = "No hay frases disponibles.";
        }
    };

    // Add event listener to the button
    if (generateButton) {
        generateButton.addEventListener("click", generatePhrase);
    }

    // Optional: Generate an initial phrase when the page loads
     // generatePhrase();

});