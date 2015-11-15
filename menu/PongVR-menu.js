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