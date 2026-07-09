// ==========================================
// Jarvis Conversation Manager
// ==========================================

import {
    createConversation,
    getConversations,
    updateConversation,
    deleteConversation,
    renameConversation
} from "./storage.js";

class ConversationManager {

    constructor(){
        this.currentConversation = null;
        this.conversations = [];
        this.voiceState = {
            listening: false,
            processing: false
        };
    }

    initialize(){

        this.conversations = getConversations();

        if(this.conversations.length === 0){
            this.currentConversation = createConversation("New Chat");
            this.conversations = getConversations();
        }else{
            this.currentConversation = this.conversations[0];
        }

        console.log("💬 Active Conversation:", this.currentConversation.title);
    }

    createNewConversation(title = "New Chat"){

        const conversation = createConversation(title);

        this.conversations.unshift(conversation);

        this.currentConversation = conversation;

        return conversation;
    }

    switchConversation(id){

        const conversation = this.conversations.find(c => c.id === id);

        if(!conversation) return null;

        this.currentConversation = conversation;

        return conversation;
    }

    addMessage(role, content){
        if(!this.currentConversation) return;

        this.currentConversation.messages.push({
            id: crypto.randomUUID(),
            role,
            content,
            createdAt: Date.now()
        });

        updateConversation(
            this.currentConversation.id,
            this.currentConversation.messages
        );
    }

    setVoiceState(listening = false, processing = false){
        this.voiceState.listening = listening;
        this.voiceState.processing = processing;
    }

    getVoiceState(){
        return this.voiceState;
    }

    renameCurrentConversation(title){
        if(!this.currentConversation) return;

        renameConversation(this.currentConversation.id, title);
        this.currentConversation.title = title;
    }

    deleteCurrentConversation(){
        if(!this.currentConversation) return;

        deleteConversation(this.currentConversation.id);
        this.conversations = getConversations();
        this.currentConversation = this.conversations[0] || null;
    }

    getCurrentConversation(){
        return this.currentConversation;
    }

    getAllConversations(){

        this.conversations = getConversations();

        this.conversations.sort((a,b)=>b.updatedAt-a.updatedAt);

        return this.conversations;
    }

    getCurrentMessages(){
        if(!this.currentConversation) return [];
        return this.currentConversation.messages;
    }

    clearCurrentConversation(){
        if(!this.currentConversation) return;

        this.currentConversation.messages = [];

        updateConversation(
            this.currentConversation.id,
            this.currentConversation.messages
        );
    }
}

const manager = new ConversationManager();

export function initializeConversationManager(){
    manager.initialize();
}

export default manager;
