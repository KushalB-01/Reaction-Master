let startTime;
let timeout;
let scores = JSON.parse(localStorage.getItem("scores")) || [];
let streak = 0;
let username = localStorage.getItem("username") || "Player";

const gameArea = document.getElementById("gameArea");
const message = document.getElementById("message");
const result = document.getElementById("result");
const startBtn = document.getElementById("startBtn");

const difficulty = document.getElementById("difficulty");
const themeSwitcher = document.getElementById("themeSwitcher");
const streakDisplay = document.getElementById("streak");

const introScreen = document.getElementById("introScreen");
const enterGame = document.getElementById("enterGame");
const usernameInput = document.getElementById("username");
const shareBtn = document.getElementById("shareBtn");

// Sounds
const clickSound = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const successSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");

// Leaderboard
const leaderboard = document.createElement("div");
leaderboard.id = "leaderboard";
document.querySelector(".container").appendChild(leaderboard);

// Fake global
let globalScores = [180, 220, 250, 300, 320];

// Intro
enterGame.onclick = () => {
  username = usernameInput.value || "Player";
  localStorage.setItem("username", username);

  introScreen.style.display = "none";
  document.querySelector(".container").style.display = "block";
};

// Difficulty
function getDelay() {
  if (difficulty.value === "easy") return Math.random()*4000+3000;
  if (difficulty.value === "hard") return Math.random()*2000+1000;
  return Math.random()*3000+2000;
}

// Start
startBtn.onclick = () => {
  clickSound.currentTime = 0;
  clickSound.play();

  result.textContent = "";
  message.textContent = "Wait for green...";
  gameArea.style.background = "red";
  gameArea.classList.remove("green-glow");

  timeout = setTimeout(() => {
    gameArea.style.background = "green";
    gameArea.classList.add("green-glow");
    startTime = Date.now();
    message.textContent = "CLICK NOW!";
  }, getDelay());
};

// Click
gameArea.onclick = (e) => {

  // Ripple
  const ripple = document.createElement("div");
  ripple.classList.add("ripple");
  const rect = gameArea.getBoundingClientRect();
  ripple.style.left = (e.clientX - rect.left) + "px";
  ripple.style.top = (e.clientY - rect.top) + "px";
  ripple.style.width = ripple.style.height = "50px";
  gameArea.appendChild(ripple);
  setTimeout(()=>ripple.remove(),600);

  if (gameArea.style.background === "green") {

    successSound.currentTime = 0;
    successSound.play();

    const reactionTime = Date.now() - startTime;

    result.textContent = `⚡ ${reactionTime} ms`;
    message.textContent = getMessage(reactionTime);

    // Streak
    streak = reactionTime < 300 ? streak+1 : 0;
    streakDisplay.textContent = `🔥 Streak: ${streak}`;

    // Emojis
    if (reactionTime < 250) showEmojis();

    // Save score
    scores.push(reactionTime);
    scores.sort((a,b)=>a-b);
    scores = scores.slice(0,5);
    localStorage.setItem("scores", JSON.stringify(scores));

    // Confetti
    if (reactionTime === scores[0]) confettiBlast();

    updateLeaderboard();

  } else {
    clearTimeout(timeout);
    streak = 0;
    streakDisplay.textContent = `🔥 Streak: 0`;
    result.textContent = "❌ Too early!";
  }
};

// Message
function getMessage(t){
  if(t<180)return "👑 God reflex!";
  if(t<250)return "⚡ Pro!";
  if(t<350)return "😎 Nice!";
  return "🐢 Slow!";
}

// Leaderboard
function updateLeaderboard(){
  const combined = scores.map(s=>({name:username,score:s}));
  globalScores.forEach(s=>combined.push({name:"Guest",score:s}));

  combined.sort((a,b)=>a.score-b.score);

  leaderboard.innerHTML =
    "<br>🌍 Leaderboard:<br>" +
    combined.slice(0,5)
    .map((p,i)=>`${i+1}. ${p.name} - ${p.score} ms`)
    .join("<br>");
}

// Theme
themeSwitcher.onchange = ()=>{
  document.body.className = themeSwitcher.value;
};

// Share
shareBtn.onclick = async () => {
  if (scores.length === 0) {
    alert("Play first!");
    return;
  }

  const best = scores[0];

  const text = `🔥 ${username} scored ${best} ms in Reaction Master!
Can you beat me? 😈`;

  const url = window.location.href;

  // 📱 Try native sharing (mobile apps like WhatsApp)
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Reaction Master",
        text: text,
        url: url
      });
    } catch (err) {
      console.log("Share cancelled");
    }
  } 
  // 💻 Fallback (copy to clipboard)
  else {
    navigator.clipboard.writeText(text + "\n" + url);
    alert("🔥 Score + link copied! Share it 😎");
  }
};

// Particles
function createParticles(){
  for(let i=0;i<35;i++){
    const p=document.createElement("div");
    p.classList.add("particle");
    p.style.width=p.style.height=(Math.random()*15+8)+"px";
    p.style.left=Math.random()*100+"vw";
    p.style.animationDuration=(Math.random()*6+4)+"s";
    p.style.animationDelay=Math.random()*5+"s";
    document.body.appendChild(p);
  }
}

// Emojis
function showEmojis(){
  const arr=["🔥","⚡","😍","💯","🚀"];
  for(let i=0;i<5;i++){
    const e=document.createElement("div");
    e.classList.add("emoji");
    e.textContent=arr[Math.floor(Math.random()*arr.length)];
    e.style.left=Math.random()*100+"vw";
    e.style.top="60%";
    document.body.appendChild(e);
    setTimeout(()=>e.remove(),2000);
  }
}

// Confetti
function confettiBlast(){
  for(let i=0;i<30;i++){
    const c=document.createElement("div");
    c.classList.add("particle");
    c.style.background=`hsl(${Math.random()*360},100%,50%)`;
    c.style.width="8px";
    c.style.height="8px";
    c.style.left=Math.random()*100+"vw";
    c.style.animationDuration="2s";
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),2000);
  }
}

// Init
createParticles();
updateLeaderboard();
