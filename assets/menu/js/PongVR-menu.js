/*jslint browser: true*/

/* Main Menu Function */
var showStart,
    showOpponent,
    showVR,
    showLoading;

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
    var loadingSe = document.querySelector("#loading-selection");

    var multiInfo = document.querySelector('#multi-info');
    var backOpp = document.querySelector("#back-opp");
    var backVR = document.querySelector("#back-vr");

    var info = document.querySelector("#info");
    var infoStatus = document.querySelector("#info-status");
    var rules = document.querySelector("#info_rules");
    var opponents = document.querySelector("#info_opponent");
    var vrMode = document.querySelector("#info_vrMode");
    var infoLoading = document.querySelector("#info_loading");
    var linkBox = document.querySelector("#link-box");
    var qrBox = document.querySelector("#qr-box");
    var copyBox = document.querySelector("#copy-box");
    var qrcode = new QRCode(linkBox.querySelector("#qr-container"), {
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.L
    });
    var isQR = false;

    var shown = 0;

    showStart = function(){
        shown = 1;
        showMenuChapter(selectionContainer, startSe);
        showMenuChapter(info, rules);
    };
    showOpponent = function(){
        shown = 2;
        showMenuChapter(selectionContainer, playerSe);
        showMenuChapter(info, opponents);
    };
    showVR = function(){
        shown = 3;
        showMenuChapter(selectionContainer, vrSe);
        showMenuChapter(info, vrMode);
    };
    showLoading = function(){
        shown = 4;
        showMenuChapter(selectionContainer, loadingSe);
        showMenuChapter(info, infoLoading);
        window.scrollTo(0, 0);
    };

    window.addEventListener("resize", function(){
        window.setTimeout(function(){
            if(shown === 1){
                showStart();
            }
            else if(shown === 2){
                showOpponent();
            }
            else if(shown === 3){
                showVR();
            }
            else if(shown === 4){
                showLoading();
            }
        }, 1000);
    });

    showStart();

    function playWithFriend(){
        multiInfo.value = window.location.origin + window.location.pathname + "?" + gameId;
        //multiInfo.innerHTML = window.location.origin + window.location.pathname + "?" + gameId;
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

    document.querySelector("#start").addEventListener("click", function(){
        clickFlash(document.querySelector("#start"));
        showOpponent();
        window.scrollTo(0, 0);
    });
    document.querySelector("#friend").addEventListener("click", function(){
        clickFlash(document.querySelector("#friend"));
        playWithFriend();
        window.scrollTo(0, 0);
    });
    document.querySelector("#random").addEventListener("click", function(){
        clickFlash(document.querySelector("#random"));
        playWithRandom();
        window.scrollTo(0, 0);
    });

    backOpp.addEventListener("click", showStart);
    backVR.addEventListener("click", showOpponent);
    copyBox.addEventListener("click", function(){
        clickFlash(copyBox);
    });
    qrBox.addEventListener("click", function(){
      var container;
        if(isQR){
            qrBox.innerHTML = "QR Code";
            container = linkBox.querySelector("#qr-container");
            container.style.display = "none";
            multiInfo.style.display = "inline-block";
            showVR();
            isQR = false;
        }
        else{
            clickFlash(qrBox);
            qrcode.makeCode(window.location + "?" + gameId);
            container = linkBox.querySelector("#qr-container");
            container.style.display = "block";
            container.style.width = "200px";
            multiInfo.style.display = "none";
            qrBox.innerHTML = "Show Link";
            showVR();
            isQR = true;
        }
    });

    if(joinID){
        infoStatus.innerHTML = "You are joining a game.";
        linkBox.style.display = "none";
        showVR();
    }
    load();
});

//helpers
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

//Green Menu Flash
function clickFlash(element){
    element.classList.remove("ani");
    window.setTimeout(function(){
        element.style.backgroundColor = "rgba(110, 255, 100, 0.4)";
    }, 50);
    window.setTimeout(function(){
        element.classList.add("ani");
        element.style.backgroundColor = "rgba(255, 255, 255, 0.4)";
    }, 100);
}

/* VR Mode Selection Animation */
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

/* AYCE Settings */
function showMenu(){
    document.getElementById("menu").style.display = 'block';
    document.getElementById("showMenu").style.display = 'none';
}
function hideMenu(){
    document.getElementById("showMenu").style.display = 'block';
    document.getElementById("menu").style.display = 'none';
}

/* Load and Init AYCE Canvas */
function load(webVR, cardboard, distortion){
    showLoading();
    window.setTimeout(function(){
        initAyce(cardboard, distortion);

        document.getElementById('main-canvas').style.display = 'block';
        document.getElementById('ayce-settings').style.display = 'block';
        document.getElementById('titlescreen').style.display = 'none';

        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.zIndex = '1000';
        stats.domElement.style.right = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
        if(scene)scene.resize();
    }, 650);
}
