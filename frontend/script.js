const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");
const thinking = document.getElementById("thinking");

const API = "http://127.0.0.1:5001/chat";
const SPEECH_API = "http://127.0.0.1:5001/listen";

const STORAGE_KEY = "jarvis_chat";

const CHAT_LIST_KEY = "jarvis_chat_list";

const CURRENT_CHAT_ID_KEY = "jarvis_current_chat_id";

function createChatId(){
    if(globalThis.crypto && typeof globalThis.crypto.randomUUID === "function"){
        return globalThis.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

let currentChatId = localStorage.getItem(CURRENT_CHAT_ID_KEY) || createChatId();

function newChatMarkup(){
    return `

    <div class="message bot">

        <div class="avatar">

            🤖

        </div>

        <div class="bubble">

            <h3>New Chat</h3>

            <p>Hello! I'm Jarvis. How can I help you today?</p>

        </div>

    </div>

    `;
}

function getStoredChats(){
    try{
        const chats = JSON.parse(localStorage.getItem(CHAT_LIST_KEY) || "[]");
        let changed = false;

        const normalized = chats.map(chat=>{
            if(chat.id) return chat;

            changed = true;
            return {
                ...chat,
                id: createChatId()
            };
        });

        if(changed){
            saveStoredChats(normalized);
        }

        return normalized;
    }catch(error){
        saveStoredChats([]);
        return [];
    }
}

function saveStoredChats(chats){
    localStorage.setItem(CHAT_LIST_KEY, JSON.stringify(chats.slice(0,10)));
}

function updateCurrentChatSnapshot(){
    let chats = getStoredChats();
    const active = chats.find(c => c.id === currentChatId);

    if(!active) return;

    active.html = chatBox.innerHTML;
    active.time = Date.now();
    saveStoredChats(chats);
}

function saveRecentChat(title){
    let chats = getStoredChats();

    const existing = chats.find(c => c.id === currentChatId);
    if (existing) {
        existing.title = title;
        existing.html = chatBox.innerHTML;
        existing.time = Date.now();
    } else {
        chats.unshift({
            id: currentChatId,
            title,
            html: chatBox.innerHTML,
            time: Date.now()
        });
    }

    saveStoredChats(chats);
    renderRecentChats();
}

function renderRecentChats(){
    const history = document.querySelector(".history");
    let chats = getStoredChats();

    history.innerHTML = '<div class="history-title">Recent Chats</div>';

    chats.forEach((chat)=>{
        const item = document.createElement("div");
        item.className = "history-item";

        item.innerHTML = `
            <span class="chat-title"></span>
            <button class="chat-menu-btn">⋮</button>
            <div class="chat-menu">
                <button class="delete-chat-item">🗑 Delete</button>
            </div>`;

        item.querySelector(".chat-title").textContent = chat.title;

        item.querySelector(".chat-title").onclick = ()=>{
            chatBox.innerHTML = chat.html;
            currentChatId = chat.id;
            saveChat();
        };

        const menu = item.querySelector(".chat-menu");
        const overlay = document.getElementById("menu-overlay");
        menu.style.display = "none";

        item.querySelector(".chat-menu-btn").onclick = (e)=>{
            e.stopPropagation();
            document.querySelectorAll(".chat-menu").forEach(m=>{
                m.classList.remove("show");
                m.style.display = "none";
            });
            menu.style.display = "block";
            menu.classList.add("show");
            if(overlay) overlay.classList.add("show");
        };

        item.querySelector(".delete-chat-item").onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            let chats = getStoredChats();
            chats = chats.filter(c => c.id !== chat.id);
            saveStoredChats(chats);

            if(overlay) overlay.classList.remove("show");

            if(chat.id === currentChatId){
                currentChatId = createChatId();
                chatBox.innerHTML = newChatMarkup();
                saveChat();
            }

            renderRecentChats();
        };

        history.appendChild(item);
    });

    const overlay = document.getElementById("menu-overlay");
    if(overlay){
        overlay.onclick = ()=>{
            document.querySelectorAll(".chat-menu").forEach(m=>{
                m.classList.remove("show");
                m.style.display = "none";
            });
            overlay.classList.remove("show");
        };
    }
}


function saveChat(){
    localStorage.setItem(STORAGE_KEY, chatBox.innerHTML);
    localStorage.setItem(CURRENT_CHAT_ID_KEY, currentChatId);
}

function loadChat(){
    currentChatId = localStorage.getItem(CURRENT_CHAT_ID_KEY) || currentChatId;

    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved){
        chatBox.innerHTML = saved;
        chatBox.scrollTop = chatBox.scrollHeight;
    }else{
        saveChat();
    }
}

// =======================
// ADD MESSAGE
// =======================

function addMessage(text, sender){

    const div=document.createElement("div");

    div.className=`message ${sender}`;

    if(sender==="user"){

        div.innerHTML=`

        <div class="bubble">
            <p>${text}</p>
        </div>

        <div class="avatar">
           😊
        </div>

        `;

    }

    else{

        div.innerHTML=`

        <div class="avatar">
            🤖
        </div>

        <div class="bubble">
            <p>${text}</p>
        </div>

        `;

    }

    chatBox.appendChild(div);

    chatBox.scrollTop=chatBox.scrollHeight;

    updateCurrentChatSnapshot();
    saveChat();
    if(sender === "user"){
        if(chatBox.querySelectorAll(".message.user").length === 1){
            const title = text.length > 30 ? text.substring(0,30) + "..." : text;
            saveRecentChat(title);
        }else{
            saveChat();
        }
    }
}

async function typeMessage(text){

    const div = document.createElement("div");

    div.className = "message bot";

    div.innerHTML = `
        <div class="avatar">
            🤖
        </div>

        <div class="bubble">
            <div class="typing-loader">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <p style="display:none;"></p>
        </div>
    `;

    chatBox.appendChild(div);

    const paragraph = div.querySelector("p");
    const loader = div.querySelector(".typing-loader");

    await new Promise(resolve => setTimeout(resolve, 600));
    loader.style.display = "none";
    paragraph.style.display = "block";

    for(let i = 0; i < text.length; i++){

        paragraph.textContent += text[i];

        chatBox.scrollTop = chatBox.scrollHeight;

        await new Promise(resolve => setTimeout(resolve, 15));

    }
    updateCurrentChatSnapshot();
    saveChat();
}

// =======================
// SEND MESSAGE
// =======================

async function sendMessage(message=null){

    const chatId = currentChatId;

    if(message===null){

        message=input.value.trim();

    }

    if(message==="") return;

    addMessage(message,"user");

    input.value="";

    thinking.style.display="flex";

    sendBtn.disabled=true;

    input.disabled=true;

    try{

        const response=await fetch(API,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                message:message
            })

        });

        const data=await response.json();

        thinking.style.display="none";

        if(chatId === currentChatId){
            typeMessage(data.reply);
        }else{
            let chats = getStoredChats();
            const index = chats.findIndex(c => c.id === chatId);
            if(index !== -1){
                const temp = document.createElement("div");
                temp.innerHTML = chats[index].html;
                const reply = document.createElement("div");
                reply.className = "message bot";
                reply.innerHTML = `
                <div class="avatar">🤖</div>
                <div class="bubble"><p>${data.reply}</p></div>`;
                temp.appendChild(reply);
                chats[index].html = temp.innerHTML;
                chats[index].time = Date.now();
                saveStoredChats(chats);
            }
        }

    }

    catch(error){

        thinking.style.display="none";

        addMessage(
            "❌ Unable to connect to Jarvis backend.",
            "bot"
        );

        console.error(error);

    }

    finally{

        sendBtn.disabled=false;

        input.disabled=false;

        input.focus();

    }

}

// =======================
// SEND BUTTON
// =======================

sendBtn.onclick=()=>{

    sendMessage();

};

// =======================
// ENTER
// =======================

input.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        e.preventDefault();

        sendMessage();

    }

});

// =======================
// =======================
// MICROPHONE
// =======================

micBtn.onclick = () => {

    const message = document.createElement("div");

    message.className = "message bot";

    message.innerHTML = `
        <div class="avatar">
            🤖
        </div>

        <div class="bubble">
            <h3>🎤 Voice Assistant</h3>
            <p>
                Voice mode is currently under development and will be available in the next update 2.O .
                For now, you can chat with Jarvis by typing your message below. Thanks for your patiance and support 
            </p>
        </div>
    `;

    chatBox.appendChild(message);

    chatBox.scrollTop = chatBox.scrollHeight;

};

// =======================
// NEW CHAT
// =======================

document.getElementById("new-chat").onclick=()=>{

    currentChatId = createChatId();

    chatBox.innerHTML = newChatMarkup();
    saveChat();
};


// =======================
// THEME
// =======================

document.getElementById("theme-btn").onclick=()=>{

    alert("Dark mode already enabled.");

};

// =======================
// AUTO SCROLL
// =======================

const observer=new MutationObserver(()=>{

    chatBox.scrollTop=chatBox.scrollHeight;

});

observer.observe(chatBox,{
    childList:true
});

window.onload=()=>{
    loadChat();
    renderRecentChats();
    input.focus();
};
