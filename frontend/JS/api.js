// ==========================================
// Jarvis API Service
// ==========================================

const CONFIG = {
    BASE_URL: "http://127.0.0.1:5001",
    ENDPOINTS: {
        CHAT: "/chat",
        LISTEN: "/listen",
        HEALTH: "/"
    },
    HEADERS: {
        "Content-Type": "application/json"
    }
};

class APIService {

    constructor(){
        this.baseURL = CONFIG.BASE_URL;
    }

    async request(endpoint, options = {}){

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            headers: CONFIG.HEADERS,
            ...options
        });

        if(!response.ok){
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    }

    async sendMessage(message){
        return this.request(CONFIG.ENDPOINTS.CHAT, {
            method: "POST",
            body: JSON.stringify({ message })
        });
    }

    async listen(){
        return this.request(CONFIG.ENDPOINTS.LISTEN, {
            method: "POST"
        });
    }

    async startVoiceRecognition(){

        const result = await this.listen();

        if(!result.success){
            throw new Error(result.error || "Voice recognition failed.");
        }

        return result.text;
    }

    async checkConnection(){
        try{
            const response = await fetch(`${this.baseURL}${CONFIG.ENDPOINTS.HEALTH}`);
            return response.ok;
        }catch(error){
            console.error("Backend Offline", error);
            return false;
        }
    }
}

const api = new APIService();

export async function microphoneInput(){
    return await api.startVoiceRecognition();
}

export function initializeAPI(){
    console.log("🌐 API initialized");
}

export default api;