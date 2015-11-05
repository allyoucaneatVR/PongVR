attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
attribute vec4 aVertexColor;
attribute float aTextureIndex;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform vec3 uAmbientColor;
uniform vec3 uPointLightingLocations[10];
uniform vec3 uPointLightingColors[10];
uniform vec3 uSpecularColors[10];
uniform float uShininess;
uniform float uLightIndex;

varying vec3 vLightWeighting;
varying vec2 vTextureCoord;
varying float vTextureIndex;
varying vec4 vColor;

void main(void) {
vec4 mvPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
gl_Position = uPMatrix * mvPosition;
vTextureIndex = aTextureIndex;
vTextureCoord = aTextureCoord;
vColor = aVertexColor;
vLightWeighting = uAmbientColor;
vec4 position = uMVMatrix * vec4(aVertexPosition, 1.0);
vec3 transformedNormal = uNMatrix * aVertexNormal;
vec3 normal = normalize(transformedNormal);
vec3 eyeDirection = normalize(-position.xyz);
if(uLightIndex-1.0>-0.01){
vec3 lightDirection = normalize(uPointLightingLocations[0] - position.xyz);
vec3 reflectionDirection = reflect(-lightDirection, normal);
float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
vLightWeighting += uPointLightingColors[0] * diffuseLightWeighting + uSpecularColors[0] * specularLightWeighting;
}
if(uLightIndex-2.0>-0.01){
vec3 lightDirection = normalize(uPointLightingLocations[1] - position.xyz);
vec3 reflectionDirection = reflect(-lightDirection, normal);
float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
vLightWeighting += uPointLightingColors[1] * diffuseLightWeighting + uSpecularColors[1] * specularLightWeighting;
}
if(uLightIndex-3.0>-0.01){
vec3 lightDirection = normalize(uPointLightingLocations[2] - position.xyz);
vec3 reflectionDirection = reflect(-lightDirection, normal);
float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
vLightWeighting += uPointLightingColors[2] * diffuseLightWeighting + uSpecularColors[2] * specularLightWeighting;
}
if(uLightIndex-4.0>-0.01){
vec3 lightDirection = normalize(uPointLightingLocations[3] - position.xyz);
vec3 reflectionDirection = reflect(-lightDirection, normal);
float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
vLightWeighting += uPointLightingColors[3] * diffuseLightWeighting + uSpecularColors[3] * specularLightWeighting;
}
if(uLightIndex-5.0>-0.01){
vec3 lightDirection = normalize(uPointLightingLocations[4] - position.xyz);
vec3 reflectionDirection = reflect(-lightDirection, normal);
float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
vLightWeighting += uPointLightingColors[4] * diffuseLightWeighting + uSpecularColors[4] * specularLightWeighting;
}
if(uLightIndex-6.0>-0.01){
vec3 lightDirection = normalize(uPointLightingLocations[5] - position.xyz);
vec3 reflectionDirection = reflect(-lightDirection, normal);
float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
vLightWeighting += uPointLightingColors[5] * diffuseLightWeighting + uSpecularColors[5] * specularLightWeighting;
}
if(uLightIndex-7.0>-0.01){
vec3 lightDirection = normalize(uPointLightingLocations[6] - position.xyz);
vec3 reflectionDirection = reflect(-lightDirection, normal);
float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
vLightWeighting += uPointLightingColors[6] * diffuseLightWeighting + uSpecularColors[6] * specularLightWeighting;
}
if(uLightIndex-8.0>-0.01){
vec3 lightDirection = normalize(uPointLightingLocations[7] - position.xyz);
vec3 reflectionDirection = reflect(-lightDirection, normal);
float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
vLightWeighting += uPointLightingColors[7] * diffuseLightWeighting + uSpecularColors[7] * specularLightWeighting;
}
if(uLightIndex-9.0>-0.01){
vec3 lightDirection = normalize(uPointLightingLocations[8] - position.xyz);
vec3 reflectionDirection = reflect(-lightDirection, normal);
float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
vLightWeighting += uPointLightingColors[8] * diffuseLightWeighting + uSpecularColors[8] * specularLightWeighting;
}
if(uLightIndex-10.0>-0.01){
vec3 lightDirection = normalize(uPointLightingLocations[9] - position.xyz);
vec3 reflectionDirection = reflect(-lightDirection, normal);
float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), uShininess);
float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
vLightWeighting += uPointLightingColors[9] * diffuseLightWeighting + uSpecularColors[9] * specularLightWeighting;
}
}