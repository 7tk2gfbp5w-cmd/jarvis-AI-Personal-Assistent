const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");
const thinking = document.getElementById("thinking");

const API = "http://127.0.0.1:5001/chat";
const SPEECH_API = "http://127.0.0.1:5001/listen";

const STORAGE_KEY = "jarvis_chat";

const CHAT_LIST_KEY = "jarvis_chat_list";

let currentChatId = Date.now().toString();

function saveRecentChat(title){
    let chats = JSON.parse(localStorage.getItem(CHAT_LIST_KEY) || "[]");

    chats = chats.filter(chat => chat.title !== title);

    chats.unshift({
        title,
        html: chatBox.innerHTML,
        time: Date.now()
    });

    localStorage.setItem(CHAT_LIST_KEY, JSON.stringify(chats.slice(0,10)));
    renderRecentChats();
}

function renderRecentChats(){
    const history = document.querySelector(".history");
    const chats = JSON.parse(localStorage.getItem(CHAT_LIST_KEY) || "[]");

    history.innerHTML = '<div class="history-title">Recent Chats</div>';

    chats.forEach(chat=>{
        const item = document.createElement("div");
        item.className = "history-item";
        item.textContent = chat.title;
        item.onclick = ()=>{
            chatBox.innerHTML = chat.html;
            saveChat();
        };
        history.appendChild(item);
    });
}

function saveChat(){
    localStorage.setItem(STORAGE_KEY, chatBox.innerHTML);
}

function loadChat(){
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved){
        chatBox.innerHTML = saved;
        chatBox.scrollTop = chatBox.scrollHeight;
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
            <img src="PHOTO-USER.jpeg" alt="User Avatar">
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
    saveChat();
    if(sender === "user"){
        const title = text.length > 30 ? text.substring(0,30) + "..." : text;
        saveRecentChat(title);
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
            let chats = JSON.parse(localStorage.getItem(CHAT_LIST_KEY) || "[]");
            const index = chats.findIndex(c => c.title === (message.length > 30 ? message.substring(0,30) + "..." : message));
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
                localStorage.setItem(CHAT_LIST_KEY, JSON.stringify(chats));
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
                Voice mode is currently under development and will be available in the next update.
                For now, you can chat with Jarvis by typing your message below.
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

    currentChatId = Date.now().toString();

    chatBox.innerHTML=`

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