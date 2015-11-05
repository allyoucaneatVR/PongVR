attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uTime;

varying vec3 vColor;
varying vec2 vTextureCoord;
varying float vDigit;

void main(void) {
	vec4 position = uMVMatrix * vec4(aVertexPosition, 1.0);
	gl_Position = uPMatrix * position;
	vTextureCoord = aTextureCoord;

	vColor.r = (sin(((mod(uTime, 3000.0)/3000.0)*3.14*2.0)-3.14)+1.0)/2.0;
	vColor.g = (sin(((mod(uTime+1000.0, 3000.0)/3000.0)*3.14*2.0)-3.14)+1.0)/2.0;
	vColor.b = (sin(((mod(uTime+2000.0, 3000.0)/3000.0)*3.14*2.0)-3.14)+1.0)/2.0;

	if(aVertexPosition.x<=-1.5){
		vDigit = 0.0;
	}else if(aVertexPosition.x<=-0.5){
		vDigit = 1.0;
	}else if(aVertexPosition.x<=0.5){
		vDigit = 2.0;
	}else if(aVertexPosition.x<=1.5){
		vDigit = 3.0;
	}else if(aVertexPosition.x<=2.5){
		vDigit = 4.0;
	}
}