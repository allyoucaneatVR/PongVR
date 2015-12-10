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
    
    loadingBackground.style.backgroundColor = "rgb("+color.r+", "+color.g+", "+color.b+")";

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