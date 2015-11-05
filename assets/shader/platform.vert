attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform vec3 uAmbientColor;
uniform vec3 uPointLightingLocations[10];
uniform vec3 uPointLightingColors[10];
uniform float uLightIndex;

varying vec3 vLightWeighting;
varying float vAlpha;

void main(void) {
	vec4 position = uMVMatrix * vec4(aVertexPosition, 1.0);
	gl_Position = uPMatrix * position;
	vLightWeighting = uAmbientColor;
	vec3 transformedNormal = uNMatrix * aVertexNormal;
	vec3 normal = normalize(transformedNormal);
	vec3 eyeDirection = normalize(-position.xyz);
	vAlpha=(aVertexPosition.y+0.5)*0.95;
}