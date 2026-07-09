

// ==========================================
// Jarvis Storage Engine
// ==========================================

const STORAGE = {
    CONVERSATIONS: "jarvis.conversations",
    SETTINGS: "jarvis.settings",
    VERSION: "jarvis.version"
};

const CURRENT_VERSION = "1.0.0";

export function initializeStorage(){

    if(!localStorage.getItem(STORAGE.VERSION)){
        localStorage.setItem(STORAGE.VERSION, CURRENT_VERSION);
    }

    if(!localStorage.getItem(STORAGE.CONVERSATIONS)){
        localStorage.setItem(STORAGE.CONVERSATIONS, JSON.stringify([]));
    }

    if(!localStorage.getItem(STORAGE.SETTINGS)){
        localStorage.setItem(STORAGE.SETTINGS, JSON.stringify({
            theme:"dark",
            typingSpeed:15,
            autoScroll:true,
            sound:true
        }));
    }
}

export function getConversations(){
    return JSON.parse(localStorage.getItem(STORAGE.CONVERSATIONS)) || [];
}

export function saveConversations(conversations){
    localStorage.setItem(
        STORAGE.CONVERSATIONS,
        JSON.stringify(conversations)
    );
}

export function createConversation(title="New Chat"){

    const conversations = getConversations();

    const conversation = {
        id: crypto.randomUUID(),
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: []
    };

    conversations.unshift(conversation);

    saveConversations(conversations);

    return conversation;
}

export function updateConversation(id, messages){

    const conversations = getConversations();

    const chat = conversations.find(c=>c.id===id);

    if(chat){
        chat.messages = messages;
        chat.updatedAt = Date.now();
    }

    saveConversations(conversations);
}

export function deleteConversation(id){

    const updated = getConversations().filter(c=>c.id!==id);

    saveConversations(updated);
}

export function renameConversation(id,newTitle){

    const conversations = getConversations();

    const chat = conversations.find(c=>c.id===id);

    if(chat){
        chat.title = newTitle;
        chat.updatedAt = Date.now();
    }

    saveConversations(conversations);
}

export function getSettings(){
    return JSON.parse(localStorage.getItem(STORAGE.SETTINGS));
}

export function saveSettings(settings){
    localStorage.setItem(STORAGE.SETTINGS,JSON.stringify(settings));
}