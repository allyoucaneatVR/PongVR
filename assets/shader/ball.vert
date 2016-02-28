attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform vec3 uAmbientColor;
uniform vec3 uPointLightingLocations[1];
uniform vec3 uPointLightingColors[1];
varying vec4 vColor;
varying vec3 vLightWeighting;
uniform float uTime;

void main(void) {
    vec4 position = uMVMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * position;
    vColor = aVertexColor;
    if(vColor.a > 0.99){
        vColor.r = (sin(((mod(uTime, 3000.0)/3000.0)*3.14*2.0)-3.14)+1.0)/2.0;
        vColor.g = (sin(((mod(uTime+1000.0, 3000.0)/3000.0)*3.14*2.0)-3.14)+1.0)/2.0;
        vColor.b = (sin(((mod(uTime+2000.0, 3000.0)/3000.0)*3.14*2.0)-3.14)+1.0)/2.0;
    }
    vLightWeighting = uAmbientColor;
    vec3 transformedNormal = uNMatrix * aVertexNormal;
    vec3 normal = normalize(transformedNormal);
    vec3 eyeDirection = normalize(-position.xyz);
    if(vColor.a < 0.99){
        vec3 lightDirection = normalize(uPointLightingLocations[0] - position.xyz);
        vec3 reflectionDirection = reflect(-lightDirection, normal);
        float diffuseLightWeighting = max(dot(normalize(transformedNormal), lightDirection), 0.0);
        vLightWeighting += uPointLightingColors[0] * diffuseLightWeighting;
    }else{
        vLightWeighting = vec3(1.0, 1.0, 1.0);
        vColor.rgb += vec3(0.5,0.5,0.5);
    }
}