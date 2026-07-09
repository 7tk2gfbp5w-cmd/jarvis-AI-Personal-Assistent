

// ==========================================
// Jarvis Application Entry Point
// ==========================================

import { initializeStorage, getSettings } from "./storage.js";
import { initializeUI } from "./ui.js";
import api, { initializeAPI } from "./api.js";
import manager, { initializeConversationManager } from "./conversation.js";
import typingEngine, { initializeTyping } from "./typing.js";

class JarvisApp {
    async start() {
        console.log("🚀 Starting Jarvis...");

        initializeStorage();
        initializeConversationManager();
        initializeTyping();
        initializeAPI();
        const online = await api.checkConnection();
        console.log(online ? "🟢 Flask Backend Connected" : "🔴 Flask Backend Offline");
        initializeUI();

        const settings = getSettings();
        typingEngine.setSpeed(settings.typingSpeed);

        console.table({
            Theme: settings.theme,
            TypingSpeed: settings.typingSpeed,
            AutoScroll: settings.autoScroll,
            Sound: settings.sound,
            ActiveConversation: manager.getCurrentConversation()?.title
        });

        console.log("✅ Jarvis Ready");
    }
}

const app = new JarvisApp();
app.start();