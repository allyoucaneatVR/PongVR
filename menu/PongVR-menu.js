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
    
    var startSe = document.querySelector("#start-selection");
    var playerSe = document.querySelector("#player-selection");
    var vrSe = document.querySelector("#vr-selection");
    var backMulti = document.querySelector("#back-multi");    
    
    document.querySelector("#start" ).addEventListener("click", function(){showMenuChapter(playerSe)});
    document.querySelector("#friend").addEventListener("click", playWithFriend);
    document.querySelector("#random").addEventListener("click", playWithRandom);
    backMulti.addEventListener("click", function(){showMenuChapter(playerSe);});
//    window.addEventListener("resize", function(){});
    
    showMenuChapter(startSe);
    
    
    function playWithFriend(){
        var info = document.querySelector('#multi-info');
        info.innerHTML = "Send this link to your friend: " + window.location + "?" + gameId;
        joinID = null;
        showMenuChapter(vrSe);
    }
    function playWithRandom(){
        var info = document.querySelector('#multi-info');
        info.innerHTML = "You are playing against a random opponent.";
        joinID = "random";
        showMenuChapter(vrSe);
    }
    
    if(joinID){
        var info = document.querySelector('#multi-info');
        info.innerHTML = "You are joining a game.";
        showMenuChapter(vrSe);
    }
});

function showMenuChapter(chapter){
    var selectionContainer = document.querySelector("#menu-frame");
    if(!selectionContainer.contains(chapter))return;
    
    selectionContainer.style.width = chapter.clientWidth;
    selectionContainer.style.height = chapter.clientHeight;
    var w = 0;
    
    for(var i=0; i<selectionContainer.children.length; i++){
        if(selectionContainer.children[i] === chapter)break;
        w += selectionContainer.children[i].clientWidth;
    }
    for(var i=0; i<selectionContainer.children.length; i++){
        transEl(selectionContainer.children[i], w);
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