// Star Field Generator
const stars = document.getElementById("stars");
for(let i=0; i<250; i++){
    let s = document.createElement("div");
    s.className = "star";
    s.style.left = Math.random()*100 + "%";
    s.style.top = Math.random()*100 + "%";
    s.style.animationDelay = Math.random()*4 + "s";
    stars.appendChild(s);
}

// Numerical Loading Sequence Update Loop
let p = 0;
const txt = document.getElementById("percent");
const timer = setInterval(() => {
    p++;
    txt.innerHTML = p + "%";
    if(p >= 100){
        clearInterval(timer);
        txt.innerHTML = "SYSTEM READY";
    }
}, 50);