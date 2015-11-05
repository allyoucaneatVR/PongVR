attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute float aTextureIndex;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoord;
varying float vTextureIndex;

void main(void) {
	vec4 position = uMVMatrix * vec4(aVertexPosition, 1.0);
	gl_Position = uPMatrix * position;
	vTextureIndex = aTextureIndex;
	vTextureCoord = aTextureCoord;
}