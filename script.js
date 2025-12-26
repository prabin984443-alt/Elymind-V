/* script.js - Ultimate Fixed Edition */
document.addEventListener('DOMContentLoaded', () => {
    // ... your existing init code ...
    
    // 👇 ADD THIS LINE:
    buildSpectrum(); 
});

const FIREBASE_URL = "https://elymind-v-8e53c-default-rtdb.firebaseio.com";

// --- THEME & NAV LOGIC ---
const themes = {
    fire: { class: 'texture-fire', title: 'Quick Fire Quest', desc: 'Ignite Momentum' },
    water: { class: 'texture-water', title: 'EmoSync', desc: 'Flow like Water' },
    air: { class: 'texture-air', title: 'Breath With Me', desc: 'Inhale... Exhale...' },
    earth: { class: 'texture-earth', title: 'Smart Scheduler', desc: 'Grounded Habits' },
    space: { class: 'texture-space', title: 'Chat with Crys', desc: 'Space to Vent' }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Greeting
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good Morning ☀️" : hour < 18 ? "Good Afternoon 🌤️" : "Good Evening 🌙";
    const greetElem = document.getElementById('dynamic-greeting');
    if(greetElem) greetElem.innerText = greet;
    
    // 2. Random Quote
    const quotes = ["Small steps every day.", "Inhale the future.", "Your mind is a garden.", "Focus on the now."];
    const quoteElem = document.getElementById('daily-quote');
    if(quoteElem) quoteElem.innerText = quotes[Math.floor(Math.random()*quotes.length)];

    // 3. Load XP
    updateXP(parseInt(localStorage.getItem('user_xp') || 0));
    
    // 4. Load Earth Schedule
    loadSchedule();
    
    // 5. Build Visualizer
    buildVisualizer();
});

function switchTab(element) {
    document.body.className = themes[element].class;
    const title = document.getElementById('section-title');
    const desc = document.getElementById('section-desc');
    
    if(title) title.innerText = themes[element].title;
    if(desc) desc.innerText = themes[element].desc;
    
    document.querySelectorAll('.element-section').forEach(el => el.style.display = 'none');
    const target = document.getElementById(`${element}-section`);
    if(target) target.style.display = 'block';
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    if(element === 'fire') fetchQuests();
}

// ==========================================
// 🔥 FIRE: QUESTS
// ==========================================
async function fetchQuests() {
    const container = document.getElementById('quest-list');
    if(!container) return;
    
    container.innerHTML = '<p style="text-align:center">Loading...</p>';
    
    try {
        const res = await fetch(`${FIREBASE_URL}/quests.json`);
        const data = await res.json();
        container.innerHTML = '';
        
        if(!data) {
            container.innerHTML = '<p style="text-align:center">No active quests.</p>';
            return;
        }

        const catColors = { Physical: "#ef5350", Mental: "#42a5f5", Academic: "#66bb6a", Social: "#ec407a" };

        Object.entries(data).forEach(([key, quest]) => {
            const isDone = localStorage.getItem(`quest_done_${key}`) === 'true';
            const badgeCol = catColors[quest.category] || "#ffa726";
            const opacity = isDone ? "0.5" : "1";
            const tipText = quest.tip || "No specific tip. Do your best!";

            const actionHTML = isDone 
                ? `<div style="color:#66bb6a; font-weight:bold; margin-top:10px; text-align:center;">✔ Completed</div>`
                : `<button id="btn-${key}" onclick="markPersistentComplete('${key}')" style="background:${badgeCol}; color:white; width:100%; padding:8px; margin-top:10px;">Complete</button>`;

            container.innerHTML += `
                <div class="glass-card" id="card-${key}" style="opacity:${opacity};">
                    <span class="badge" style="background:${badgeCol}; color:white;">${quest.category}</span>
                    <h4 style="margin:5px 0;">${quest.text}</h4>
                    <div style="margin-top:5px; font-size:0.8rem; cursor:pointer; color:#ffd54f; display:flex; align-items:center; gap:5px;" onclick="toggleTip('${key}')">
                        <i class="fas fa-lightbulb"></i> Show Tip
                    </div>
                    <div id="tip-${key}" style="display:none; background:rgba(0,0,0,0.2); padding:10px; border-radius:10px; margin-top:5px; font-size:0.9rem; color:#eee; border-left:3px solid #ffd54f;">
                        ${tipText}
                    </div>
                    ${actionHTML}
                </div>
            `;
        });
    } catch(err) {
        container.innerHTML = '<p>Error loading quests.</p>';
    }
}

function toggleTip(id) {
    const el = document.getElementById(`tip-${id}`);
    if(el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function markPersistentComplete(id) {
    localStorage.setItem(`quest_done_${id}`, 'true');
    const card = document.getElementById(`card-${id}`);
    const btn = document.getElementById(`btn-${id}`);
    if(card) card.style.opacity = '0.5';
    if(btn) btn.outerHTML = `<div style="color:#66bb6a; font-weight:bold; margin-top:10px; text-align:center;">✔ Completed</div>`;
    
    // CONFETTI SAFE CHECK
    if(typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    let xp = parseInt(localStorage.getItem('user_xp') || 0) + 50;
    localStorage.setItem('user_xp', xp);
    updateXP(xp);
}

function updateXP(xp) {
    const xpDisp = document.getElementById('xp-display');
    const heatBar = document.getElementById('heat-bar');
    if(xpDisp) xpDisp.innerText = `${xp} XP`;
    if(heatBar) heatBar.style.width = Math.min((xp/500)*100, 100) + "%";
}

// ==========================================
// 🌊 WATER: VISUALIZER & MUSIC
// ==========================================
function buildVisualizer() {
    const vis = document.getElementById('visualizer');
    if(!vis) return;
    vis.innerHTML = '';
    for(let i=0; i<20; i++) {
        const h = Math.random() * 20 + 5;
        vis.innerHTML += `<div class="spec-bar" style="height:${h}px; animation-delay:${i * 0.05}s"></div>`;
    }
}

async function fetchMusic() {
    const moodElem = document.getElementById('mood-selector');
    if(!moodElem) return;
    const mood = moodElem.value;

    const playerCard = document.getElementById('player-card');
    const audio = document.getElementById('audio-player');
    const title = document.getElementById('track-name');
    
    const bgs = {
        focus: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,215,0,0.15))",
        anxiety: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,255,255,0.15))",
        sleep: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(25,25,112,0.3))",
        energy: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,69,0,0.2))", 
        sadness: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(70,130,180,0.2))", 
        calm: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(144,238,144,0.15))", 
        anger: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(139,0,0,0.2))"
    };
    if(playerCard) playerCard.style.background = bgs[mood] || "var(--glass-bg)";

    try {
        const res = await fetch(`${FIREBASE_URL}/emosync_sounds.json`);
        const data = await res.json();
        
        let matchingTracks = [];
        if(data) {
            Object.values(data).forEach(track => {
                if(track.category.toLowerCase() === mood) matchingTracks.push(track);
            });
        }

        if(matchingTracks.length > 0) {
            const randomTrack = matchingTracks[Math.floor(Math.random() * matchingTracks.length)];
            audio.src = randomTrack.url;
            if(title) title.innerText = `🎵 Playing: ${randomTrack.name}`;
            audio.play().catch(e => console.log("Auto-play blocked"));
        } else {
            if(title) title.innerText = "No track found for this mood.";
        }
    } catch(e) { console.error(e); }
}

// Spectrum Trigger
const audio = document.getElementById('audio-player');
const visualizer = document.getElementById('visualizer');
if(audio && visualizer) {
    audio.onplay = () => visualizer.classList.add('playing');
    audio.onpause = () => visualizer.classList.remove('playing');
    audio.onended = () => visualizer.classList.remove('playing');
}
// --- AUDIO EVENT LISTENERS ---
const audioPlayer = document.getElementById('audio-player');
const spectrum = document.getElementById('spectrum-visualizer');

if(audioPlayer && spectrum) {
    // Start Dancing
    audioPlayer.onplay = () => {
        spectrum.classList.add('playing');
    };
    
    // Stop Dancing
    audioPlayer.onpause = () => {
        spectrum.classList.remove('playing');
    };
    
    // Stop when song ends
    audioPlayer.onended = () => {
        spectrum.classList.remove('playing');
    };
}

// ==========================================
// 🌬️ AIR: HAPTIC BREATHING
// ==========================================
let currentBreath = 'box';

async function startBreathing() {
    const circle = document.getElementById('breath-circle');
    const text = document.getElementById('breath-text');
    const btn = document.getElementById('breath-start-btn');
    const instr = document.getElementById('breath-instruction');
    
    if(btn) btn.style.display = 'none';

    const configs = {
        box: [{t:"Inhale", s:1.6, d:4000}, {t:"Hold", s:1.6, d:4000}, {t:"Exhale", s:1.0, d:4000}, {t:"Hold", s:1.0, d:4000}],
        relax: [{t:"Inhale", s:1.7, d:4000}, {t:"Hold", s:1.7, d:7000}, {t:"Exhale", s:1.0, d:8000}],
        panic: [{t:"Inhale", s:1.4, d:7000}, {t:"Exhale", s:1.0, d:11000}],
        balance: [{t:"Inhale", s:1.5, d:5500}, {t:"Exhale", s:1.0, d:5500}]
    };

    const phases = configs[currentBreath];
    for(let i=0; i<3; i++) { 
        if(instr) instr.innerText = `Cycle ${i+1} of 3`;
        for(let p of phases) {
            if(text) text.innerText = p.t;
            if(p.t==="Inhale" && navigator.vibrate) navigator.vibrate(100);
            if(p.t==="Exhale" && navigator.vibrate) navigator.vibrate([50,50]);

            if(circle) {
                circle.style.transition = `all ${p.d}ms ease-in-out`;
                circle.style.transform = `scale(${p.s})`;
                circle.style.background = p.t === "Inhale" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.05)";
            }
            await new Promise(r => setTimeout(r, p.d));
        }
    }
    if(text) text.innerText = "Done";
    if(circle) circle.style.transform = "scale(1)";
    if(btn) btn.style.display = 'inline-block';
}

function setBreathMode(mode) {
    currentBreath = mode;
    document.querySelectorAll('.breath-btn').forEach(b => b.style.border = "none");
    event.target.style.border = "1px solid white";
}

// ==========================================
// 🌱 EARTH: PERSISTENT SCHEDULE
// ==========================================
let schedule = [];

function loadSchedule() {
    const stored = localStorage.getItem('user_schedule');
    if(stored) {
        schedule = JSON.parse(stored);
        renderSchedule();
    }
}

function saveSchedule() {
    localStorage.setItem('user_schedule', JSON.stringify(schedule));
}

function addTask() {
    const name = document.getElementById('task-name').value;
    const time = document.getElementById('task-time').value;
    if(!name || !time) return;

    schedule.push({task:name, time:time, done:false});
    saveSchedule();
    renderSchedule();
}

function renderSchedule() {
    schedule.sort((a,b) => a.time.localeCompare(b.time));
    const container = document.getElementById('timeline-container');
    if(!container) return;
    container.innerHTML = '';

    schedule.forEach((item, index) => {
        const checkClass = item.done ? 'task-check checked' : 'task-check';
        const opacity = item.done ? '0.5' : '1';

        container.innerHTML += `
            <div class="glass-card" style="display:flex; align-items:center; gap:15px; padding:15px; margin-bottom:10px; opacity:${opacity};">
                <div class="${checkClass}" onclick="toggleEarthItem(${index})"></div>
                <div>
                    <div style="font-weight:bold; color:#ffb74d;">${item.time}</div>
                    <div>${item.task}</div>
                </div>
            </div>
        `;
        if(index < schedule.length - 1) {
            const t1 = new Date("2000-01-01 " + item.time);
            const t2 = new Date("2000-01-01 " + schedule[index+1].time);
            const diff = (t2 - t1) / 60000;
            let filler = diff > 60 ? "🚶 Take a Walk" : (diff > 20 ? "💧 Drink Water" : "");
            
            if(filler) {
                container.innerHTML += `
                    <div class="glass-card" onclick="this.style.opacity='0.3'" style="margin-left:30px; background:rgba(102, 187, 106, 0.2); cursor:pointer; display:flex; gap:10px; align-items:center; padding:10px;">
                        <div class="task-check" style="width:20px; height:20px; border-color:#81c784;"></div>
                        <small style="color:#e8f5e9;">${filler}</small>
                    </div>
                `;
            }
        }
    });
}

function toggleEarthItem(index) {
    schedule[index].done = !schedule[index].done;
    saveSchedule();
    renderSchedule();
}

function finishDay() {
    if(confirm("Finish Day?")) {
        schedule = [];
        saveSchedule();
        renderSchedule();
        if(typeof confetti === 'function') confetti({ particleCount: 150, spread: 100 });
    }
}
// --- ADD THIS TO EARTH SECTION IN SCRIPT.JS ---

function resetSchedule() {
    if(confirm("Are you sure you want to clear your schedule?")) {
        // 1. Clear Array
        schedule = [];
        // 2. Clear Storage
        localStorage.removeItem('user_schedule');
        // 3. Re-render (Empty)
        renderSchedule();
    }
}

// ==========================================
// 🌌 SPACE: CRYS BOT (FREE API VERSION)
// ==========================================

function quickChat(text) {
    const input = document.getElementById('user-input');
    if(input) {
        input.value = text;
        sendMessage();
    }
}

function typeWriter(element, text, i = 0) {
    if (i < text.length) {
        element.innerHTML += text.charAt(i);
        const hist = document.getElementById('chat-history');
        if(hist) hist.scrollTop = hist.scrollHeight;
        setTimeout(() => typeWriter(element, text, i + 1), 10);
    }
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const txt = input.value;
    if(!txt) return;

    const history = document.getElementById('chat-history');
    
    // 1. Show User Message
    history.innerHTML += `<div class="msg user">${txt}</div>`;
    input.value = '';

    // 2. Loading
    const loadId = `loading-${Date.now()}`;
    history.innerHTML += `<div class="msg ai" id="${loadId}">Thinking...</div>`;
    history.scrollTop = history.scrollHeight;

    // 3. Determine Mode (Default to Buddy if selector missing)
    const modeSelector = document.getElementById('crys-mode');
    const mode = modeSelector ? modeSelector.value : 'buddy';
    
    let systemPrompt = "You are Crys. ";
    if (mode === 'buddy') systemPrompt += "Be a supportive best friend. Use emojis. Keep it casual within 120 words. ";
    if (mode === 'guide') systemPrompt += "Be a practical life coach. Give 3 clear and practical steps to solve the user's problem within 100 words. ";
    if (mode === 'philosopher') systemPrompt += "Be a wise Vedic sage. Use ancient Hindu philosophy in short and nature metaphors to explain within 100 words. ";
    
    systemPrompt += "User says: ";

    try {
        // 4. CALL FREE API (Pollinations)
        const finalUrl = `https://text.pollinations.ai/${encodeURIComponent(systemPrompt + txt)}`;
        const response = await fetch(finalUrl);
        
        if (!response.ok) throw new Error("Connection failed");
        
        const reply = await response.text();
        
        // 5. Success
        document.getElementById(loadId).remove();
        const msgId = `msg-${Date.now()}`;
        history.innerHTML += `<div class="msg ai" id="${msgId}"></div>`;
        
        typeWriter(document.getElementById(msgId), reply);

    } catch(err) {
        document.getElementById(loadId).innerText = "⚠️ Crys is offline. Check internet.";
    }
    history.scrollTop = history.scrollHeight;
}

// Paste this anywhere in script.js
function buildSpectrum() {
    const container = document.getElementById('spectrum-visualizer');
    if(!container) return;
    
    container.innerHTML = ''; // Clear old ones
    
    // Create 20 Bars
    for(let i=0; i<20; i++) {
        // Random starting height variation for natural look
        const h = Math.floor(Math.random() * 15) + 5; 
        container.innerHTML += `<div class="spec-bar" style="height:${h}px; animation-delay: -${Math.random()}s"></div>`;
    }
}