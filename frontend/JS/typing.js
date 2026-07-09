

// ==========================================
// Jarvis Typing Engine
// ==========================================

const DEFAULT_SPEED = 15;

class TypingEngine {

    constructor(){
        this.isTyping = false;
        this.speed = DEFAULT_SPEED;
    }

    setSpeed(speed){
        this.speed = speed;
    }

    async type(container, text){

        this.isTyping = true;

        container.innerHTML = "";

        const paragraph = document.createElement("p");
        container.appendChild(paragraph);

        const loader = document.createElement("span");
        loader.className = "typing-cursor";
        loader.textContent = "●";
        container.appendChild(loader);

        for(const char of text){

            paragraph.textContent += char;

            container.scrollIntoView({
                behavior:"smooth",
                block:"end"
            });

            await new Promise(resolve => setTimeout(resolve, this.speed));
        }

        loader.remove();

        this.isTyping = false;
    }

    instant(container, text){
        container.innerHTML = `<p>${text}</p>`;
        this.isTyping = false;
    }

    stop(){
        this.isTyping = false;
    }

    typing(){
        return this.isTyping;
    }
}

const typingEngine = new TypingEngine();

export function initializeTyping(){
    console.log("⌨️ Typing Engine Ready");
}

export default typingEngine;