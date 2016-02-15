/*jslint browser: true*/
var up = [];
function optionAnimation(element){
    if(up.indexOf(element) !== -1)return;
    
    while(up.length > 0){
        setElement(up.pop(), 0);
    }
    setElement(element, element.offsetHeight);

    up.push(element);
}

function setElement(element, height){
    var trans = "translate(0,-"+height+"px)";
    for(var i=0; i < element.childNodes.length; i++){
        var e = element.childNodes[i];
        if(e.nodeType === Node.ELEMENT_NODE){
            e.style.transform = trans;
            e.style.webkitProperty = trans;
            e.style.MozProperty = trans;
            e.style.msProperty = trans;
            e.style.OProperty = trans;
        }
    }
}

function showMenu(){
    document.getElementById("menu").style.display = 'block';
    document.getElementById("showMenu").style.display = 'none';
}
function hideMenu(){
    document.getElementById("showMenu").style.display = 'block';
    document.getElementById("menu").style.display = 'none';
}

var animation = true;
var loadingBackground;
function showLoadingScreen(){
    loadingBackground = document.getElementById('loading-screen');
    document.getElementById('titlescreen').style.display = 'none';
    document.getElementById('main-canvas').style.display = 'block';
    loadingBackground.style.display = 'block';
    animation = true;
    loadingScreenAnimation();
}
function loadingScreenAnimation(){
    var duration = 4000;
    var time = Date.now()/duration;
    var color = HSVtoRGB((Math.sin(time)+1)/2, 0.2, 1);
    
//    loadingBackground.style.backgroundColor = "rgb("+color.r+", "+color.g+", "+color.b+")";

    if(animation){
        requestAnimationFrame(loadingScreenAnimation);
    }
}
function hideLoadingScreen(){
        animation = false;
        document.getElementById('ayce-settings').style.display = 'block';
        loadingBackground.style.display = 'none';
}
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

window.addEventListener("load", function(){
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof InstallTrigger !== 'undefined';
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    var isEdge = !isIE && !!window.StyleMedia;
    var isChrome = !!window.chrome && !!window.chrome.webstore;
    var isBlink = (isChrome || isOpera) && !!window.CSS;
    
    if(isSafari || isIE)document.querySelector("#browser-warning").style.display = "block";
    
    var selectionContainer = document.querySelector("#menu-frame");
    var startSe = document.querySelector("#start-selection");
    var playerSe = document.querySelector("#player-selection");
    var vrSe = document.querySelector("#vr-selection");
    
    var multiInfo = document.querySelector('#multi-info');
    var backOpp = document.querySelector("#back-opp"); 
    var backVR = document.querySelector("#back-vr"); 
    
    var info = document.querySelector("#info");
    var infoStatus = document.querySelector("#info-status");
    var rules = document.querySelector("#info_rules");
    var opponents = document.querySelector("#info_opponent");
    var vrMode = document.querySelector("#info_vrMode");   
    var linkBox = document.querySelector("#link-box");   
    var qrBox = document.querySelector("#qr-box");   
    var copyBox = document.querySelector("#copy-box");   
    
    document.querySelector("#start" ).addEventListener("click", showOpponent);
    document.querySelector("#friend").addEventListener("click", playWithFriend);
    document.querySelector("#random").addEventListener("click", playWithRandom);
    
    backOpp.addEventListener("click", showStart);
    backVR.addEventListener("click", showOpponent);
    copyBox.addEventListener("click", function(){
        clickFlash(copyBox);
    });
    var qrcode = new QRCode(linkBox.querySelector("#qr-container"), {
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });
    var isQR = false;
    qrBox.addEventListener("click", function(){
        if(isQR){
            qrBox.innerHTML = "QR Code";
            var container = linkBox.querySelector("#qr-container");
            container.style.display = "none";
            multiInfo.style.display = "inline-block";
            showVR();
            isQR = false;
        }
        else{
            clickFlash(qrBox);
            qrcode.makeCode(window.location + "?" + gameId);
            var container = linkBox.querySelector("#qr-container");
            container.style.display = "block";
            container.style.width = "200px";
            multiInfo.style.display = "none";
            qrBox.innerHTML = "Show Link";
            showVR();
            isQR = true;
        }
    });
    
    var shown = 0;
    window.addEventListener("resize", function(){
        if(shown === 1){
            window.setTimeout(showStart, 1000);
        }
        else if(shown === 2){
            window.setTimeout(showOpponent, 1000);
        }
        else if(shown === 3){
            window.setTimeout(showVR, 1000);
        }
    });
    
    function showStart(){
        shown = 1;
        showMenuChapter(selectionContainer, startSe);
        showMenuChapter(info, rules);
    }
    function showOpponent(){
        shown = 2;
        showMenuChapter(selectionContainer, playerSe);
        showMenuChapter(info, opponents);
    }
    function showVR(){
        shown = 3;
        showMenuChapter(selectionContainer, vrSe);
        showMenuChapter(info, vrMode);
    }
    
    showStart();
    
    function playWithFriend(){
        multiInfo.innerHTML = window.location.origin + window.location.pathname + "?" + gameId;
        infoStatus.innerHTML = "Send this link to your friend: ";
        linkBox.style.display = "block";
        joinID = null;
        showVR();
    }
    function playWithRandom(){
        linkBox.style.display = "none";
        infoStatus.innerHTML = "You are playing against a random opponent.";
        multiInfo.innerHTML = "";
        joinID = "random";
        showVR();
    }
    
    if(joinID){
        infoStatus.innerHTML = "You are joining a game.";
        linkBox.style.display = "none";
        showVR();
    }
});

function showMenuChapter(container, chapter){
    if(!container.contains(chapter))return;
    var info = document.querySelector("#info");
    info.style.height = chapter.clientHeight;
    
    var w = 0;
    
    for(var i=0; i<container.children.length; i++){
        if(container.children[i] === chapter)break;
        w += container.children[i].clientWidth;
    }
    for(var i=0; i<container.children.length; i++){
        transEl(container.children[i], w);
    }
}
function transEl(e, height){
    var trans = "translate(-"+height+"px, 0px)";
    e.style.transform = trans;
    e.style.webkitProperty = trans;
    e.style.MozProperty = trans;
    e.style.msProperty = trans;
    e.style.OProperty = trans;
}

function clickFlash(element){
    element.classList.remove("ani");
    window.setTimeout(function(){
        element.style.backgroundColor = "rgba(0, 255, 0, 0.4)";
    }, 50);
    window.setTimeout(function(){
        element.classList.add("ani");
        element.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
    }, 100);
}

function showWebVRInfo(){
    var w = document.querySelector("#webvr-container");
    var m = document.querySelector("#menu-container");
    w.style.display = "block";
    m.style.display = "none";
}
function showMainMenu(){
    var w = document.querySelector("#webvr-container");
    var m = document.querySelector("#menu-container");
    m.style.display = "block";
    w.style.display = "none";
}