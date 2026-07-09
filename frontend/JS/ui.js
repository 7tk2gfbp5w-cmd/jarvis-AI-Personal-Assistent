// ==========================================
// Jarvis UI Manager
// ==========================================

import api, { microphoneInput } from "./api.js";
import manager from "./conversation.js";
import typingEngine from "./typing.js";

let elements = {};
let historyContainer = null;

export function initializeUI(){

    elements.chatBox = document.getElementById("chat-box");
    elements.input = document.getElementById("user-input");
    elements.send = document.getElementById("send-btn");
    elements.mic = document.getElementById("mic-btn");
    elements.thinking = document.getElementById("thinking");

    historyContainer = document.getElementById("history-list");

    elements.send.addEventListener("click", sendCurrentMessage);

    elements.input.addEventListener("keydown", e=>{
        if(e.key === "Enter"){
            e.preventDefault();
            sendCurrentMessage();
        }
    });

    elements.mic.addEventListener("click", startVoiceMode);

    const newChatButton = document.getElementById("new-chat");
    if(newChatButton){
        newChatButton.addEventListener("click", createNewChat);
    }
    renderConversationList();
    elements.input.focus();
}

async function sendCurrentMessage(){

    const message = elements.input.value.trim();
    if(!message) return;

    addMessage(message,"user");
    manager.addMessage("user", message);

    elements.input.value = "";
    elements.thinking.style.display = "flex";

    try{
        const data = await api.sendMessage(message);
        elements.thinking.style.display = "none";
        const bubble = addMessage("","bot");
        const paragraph = bubble.querySelector("p");
        await typingEngine.type(paragraph.parentElement, data.reply);
        manager.addMessage("assistant", data.reply);
    }catch(error){
        elements.thinking.style.display = "none";
        addMessage("❌ Unable to connect to Jarvis backend.","bot");
        console.error(error);
    }
}

async function startVoiceMode(){

    elements.mic.disabled = true;
    elements.mic.textContent = "🔴";
    elements.thinking.style.display = "flex";

    try{
        const text = await microphoneInput();
        elements.input.value = text;
        await sendCurrentMessage();
    }catch(error){
        elements.thinking.style.display = "none";
        alert(error.message);
    }finally{
        elements.mic.disabled = false;
        elements.mic.textContent = "🎤";
    }
}

function createNewChat(){

    manager.createNewConversation("New Chat");
    renderConversationList();

    elements.chatBox.innerHTML = `
        <div class="message bot">
            <div class="avatar">🤖</div>
            <div class="bubble">
                <h3>New Chat</h3>
                <p>Hello! I'm Jarvis. How can I help you today?</p>
            </div>
        </div>
    `;

    elements.input.value = "";
    elements.input.focus();
}

function renderConversationList(){

    if(!historyContainer) return;

    const conversations = manager.getAllConversations();

    historyContainer.innerHTML = '<div class="history-title">Recent Chats</div>';

    conversations.forEach(conversation=>{

        const item = document.createElement("div");

        item.className = "history-item";

        item.textContent = conversation.title;

        if(manager.getCurrentConversation()?.id === conversation.id){
            item.classList.add("active");
        }

        item.addEventListener("click",()=>{
            manager.switchConversation(conversation.id);
            renderConversationList();
        });

        historyContainer.appendChild(item);
    });
}

function addMessage(text,sender){

    const div = document.createElement("div");
    div.className = `message ${sender}`;

    div.innerHTML = sender === "user"
    ? `<div class="bubble"><p>${text}</p></div><div class="avatar">👤</div>`
    : `<div class="avatar">🤖</div><div class="bubble"><p>${text}</p></div>`;

    elements.chatBox.appendChild(div);
    elements.chatBox.scrollTop = elements.chatBox.scrollHeight;

    return div.querySelector(".bubble");
}