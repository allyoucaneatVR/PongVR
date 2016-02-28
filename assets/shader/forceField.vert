attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoord;
//varying vec3 vPosition;

void main(void) {
	vec4 position = uMVMatrix * vec4(aVertexPosition, 1.0);
	gl_Position = uPMatrix * position;
	vTextureCoord = aTextureCoord;
	//vPosition = aVertexPosition;
}