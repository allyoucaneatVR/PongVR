attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform vec3 uAmbientColor;
uniform vec3 uPointLightingLocations[1];
uniform vec3 uPointLightingColors[1];
uniform float uLightIndex;
uniform float uTime;
uniform int uIndex;

varying vec4 vColor;
varying vec3 vLightWeighting;

void main(void) {
	vec4 position = uMVMatrix * vec4(aVertexPosition, 1.0);
	gl_Position = uPMatrix * position;
	
	vec3 color = vec3(0.5);
	if(uIndex == 0){
		float durration = 5000.0;
		float intensity = 0.6;
		float red   = 0.6 + intensity * (sin(uTime/durration                	)+1.0)/2.0;
		float green = 0.6 + intensity * (sin(uTime/durration + 3.1415*(1.0/3.0) )+1.0)/2.0;
		float blue  = 0.6 + intensity * (sin(uTime/durration + 3.1415*(2.0/3.0) )+1.0)/2.0;
		color = vec3(red, green, blue);
	}
	else if(uIndex == 1){
		float durration = 5000.0;
		float intensity = 0.9;
		float red   = intensity * (sin(uTime/durration + aVertexPosition.y                    )+1.0)/2.0;
		float green = intensity * (sin(uTime/durration + aVertexPosition.y + 100.0*(1.0/3.0) )+1.0)/2.0;
		float blue  = intensity * (sin(uTime/durration + aVertexPosition.y + 100.0*(2.0/3.0) )+1.0)/2.0;
		color = vec3(red, green, blue);
	}
	else if(uIndex == 2){
		float durration = 500.0;
		float intensity = 0.9;
		float red   = intensity * (sin(uTime/durration + aVertexPosition.x                    )+1.0)/2.0;
		float green = intensity * (sin(uTime/durration + aVertexPosition.x + 100.0*(1.0/3.0) )+1.0)/2.0;
		float blue  = intensity * (sin(uTime/durration + aVertexPosition.x + 100.0*(2.0/3.0) )+1.0)/2.0;
		color = vec3(red, green, blue);
	}
	
	vColor = vec4(color, 1.0);
	vLightWeighting = uAmbientColor;
	
	vec3 transformedNormal = uNMatrix * aVertexNormal;
	vec3 normal = normalize(transformedNormal);
	vec3 eyeDirection = normalize(-position.xyz);
	
	if(uLightIndex-1.0>-0.01){
		vec3 lightDirection = normalize(uPointLightingLocations[0] - position.xyz);
		vec3 reflectionDirection = reflect(-lightDirection, normal);
		float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
		vLightWeighting += uPointLightingColors[0] * diffuseLightWeighting;
	}
}