attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform float uTime;

varying vec3 vColor;
varying vec2 vTextureCoord;

void main(void) {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	vTextureCoord = aTextureCoord;
	vColor.r = (sin(((mod(uTime, 3000.0)/3000.0)*3.14*2.0)-3.14)+1.0)/2.0;
	vColor.g = (sin(((mod(uTime+1000.0, 3000.0)/3000.0)*3.14*2.0)-3.14)+1.0)/2.0;
	vColor.b = (sin(((mod(uTime+2000.0, 3000.0)/3000.0)*3.14*2.0)-3.14)+1.0)/2.0;
}