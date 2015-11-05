attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
attribute vec3 aSide;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat3 uNMatrix;
uniform vec3 uAmbientColor;
uniform vec3 uPointLightingLocations[10];
uniform vec3 uPointLightingColors[10];
uniform vec3 uSpecularColors[10];
uniform float uShininess;
uniform float uLightIndex;
uniform float uTime;
uniform float uTimeChangeEffect;
uniform float uTimeEffectDuration;
uniform int uEffectNr;
uniform int uOldEffectNr;

varying vec4 vColor;
varying vec3 vLightWeighting;

vec3 getEffectColor(int effect);

void main(void) {
	
	if(uTime < uTimeChangeEffect+uTimeEffectDuration){
		float p = (uTime-uTimeChangeEffect)/uTimeEffectDuration;
		vec4 oldEffect = vec4(getEffectColor(uOldEffectNr), aVertexColor.a);
		vec4 newEffect = vec4(getEffectColor(uEffectNr), aVertexColor.a);
		vColor = mix(oldEffect, newEffect, p);
	}
	else{
		vColor = vec4(getEffectColor(uEffectNr), aVertexColor.a);
	}
	
	//Wave position
	float time = uTime;
    float random = fract(aTextureCoord.y);
    float duration = 4000.0 + 1500.0 * random;
	float factor = ((mod(time, duration)/duration)*3.14*2.0)-3.14;
    vec3 offset = (0.1*sin(factor + aVertexPosition.y + random)) * aSide;
                    
	vec4 position = uMVMatrix * vec4(aVertexPosition+offset, 1.0);
	gl_Position = uPMatrix * position;
    
    
    //Light calculation
	vLightWeighting = uAmbientColor;
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
    vLightWeighting = vLightWeighting * 0.9;
}

vec3 getEffectColor(int effect){
    //effect = 5;
	vec3 color = vec3(0.0);
	
	if(effect == 0){//TOP DOWN
		float time = uTime + floor(aTextureCoord.y)*500.0;
		float random = fract(aTextureCoord.y);
		
		float duration = 10000.0;//Speed
		float posColor = aVertexPosition.y/20.0;//Rainbow effect
		float colorShift = duration - 800.0 * random;
		
		color.r = (sin(posColor + ((mod(time                   , duration)/duration)*3.14*2.0))+1.0)/2.0;
		color.g = (sin(posColor + ((mod(time + colorShift*0.333, duration)/duration)*3.14*2.0))+1.0)/2.0;
		color.b = (sin(posColor + ((mod(time + colorShift*0.666, duration)/duration)*3.14*2.0))+1.0)/2.0;
	}
	else if(effect == 1){//circle Rainbow
		float time = (uTime - floor(aTextureCoord.y)*400.0)/1000.0;
		float offset = 400.0;
		
		float c1 = (aVertexPosition.y/5.0) * cos(time) + (aVertexPosition.x/5.0) * sin(time);
		float c2 = (aVertexPosition.y/5.0) * sin(-time) + (aVertexPosition.x/5.0) * cos(-time);
		color.r = c1 * c2;
		
		c1 = (aVertexPosition.y/5.0) * cos(time + offset) + (aVertexPosition.x/5.0) * sin(time + offset);
		c2 = (aVertexPosition.y/5.0) * sin(-time - offset) + (aVertexPosition.x/5.0) * cos(-time - offset);
		color.g = c1 * c2;
		
		c1 = (aVertexPosition.y/5.0) * cos(time + offset*2.0) + (aVertexPosition.x/5.0) * sin(time + offset*2.0);
		c2 = (aVertexPosition.y/5.0) * sin(-time - offset*2.0) + (aVertexPosition.x/5.0) * cos(-time - offset*2.0);
		color.b = c1 * c2;
		
		color.rgb = 0.4 - color.rgb*2.0;
	}
	else if(effect == 2){//Rainbow
		float time = uTime + floor(aTextureCoord.y)*500.0;
		float random = fract(aTextureCoord.y);
		
		float duration = 10000.0;
		float posColor = aVertexPosition.y;
		float colorShift = duration - 800.0 * random;
		
		color.r = (sin(posColor + ((mod(time                   , duration)/duration)*3.14*2.0))+1.0)/2.0;
		color.g = (sin(posColor + ((mod(time + colorShift*0.333, duration)/duration)*3.14*2.0))+1.0)/2.0;
		color.b = (sin(posColor + ((mod(time + colorShift*0.666, duration)/duration)*3.14*2.0))+1.0)/2.0;
	}
	else if(effect == 3){//BACK FORTH
		float time = uTime;// + floor(aTextureCoord.y)*500.0;
		float random = fract(aTextureCoord.y);
		
		float duration = 3000.0;
		float posColor = aVertexPosition.z/10.0;
		float colorShift = duration;// - 800.0 * random;
		
		color.r = (sin(posColor + ((mod(time                   , duration)/duration)*3.14*2.0))+1.0)/2.0;
		color.g = (sin(posColor + ((mod(time + colorShift*0.333, duration)/duration)*3.14*2.0))+1.0)/2.0;
		color.b = (sin(posColor + ((mod(time + colorShift*0.666, duration)/duration)*3.14*2.0))+1.0)/2.0;
	}
	else if(effect == 4){//
		float time = (uTime - floor(aTextureCoord.y)*400.0)/800.0;
		float offset = 200.0;
		
		float m1 = (aVertexPosition.y/5.0) * sin(time) + (aVertexPosition.x/5.0) * cos(time);
		float c1 = step(0.0, -aVertexPosition.x/5.0) * m1;
		
		float m2 = (aVertexPosition.y/5.0) * sin(time) - (aVertexPosition.x/5.0) * cos(time);
		float c2 = step(0.0,  aVertexPosition.x/5.0) * m2;
		
		color.r = c1 + c2;
		
		m1 = (aVertexPosition.y/5.0) * sin(time + offset) + (aVertexPosition.x/5.0) * cos(time + offset);
		c1 = step(0.0, -aVertexPosition.x/5.0) * m1;
		
		m2 = (aVertexPosition.y/5.0) * sin(time + offset) - (aVertexPosition.x/5.0) * cos(time + offset);
		c2 = step(0.0,  aVertexPosition.x/5.0) * m2;
		
		color.g = c1 + c2;
		
		m1 = (aVertexPosition.y/5.0) * sin(time + offset*2.0) + (aVertexPosition.x/5.0) * cos(time + offset*2.0);
		c1 = step(0.0, -aVertexPosition.x/5.0) * m1;
		
		m2 = (aVertexPosition.y/5.0) * sin(time + offset*2.0) - (aVertexPosition.x/5.0) * cos(time + offset*2.0);
		c2 = step(0.0,  aVertexPosition.x/5.0) * m2;
		
		color.b = c1 + c2;
		
		color.rgb = color.rgb*0.4 + vec3(0.4);
	}
	else if(effect == 5){//clock Rainbow
		float time = (uTime - floor(aTextureCoord.y)*400.0)/1000.0;///1500.0;
		
		float m1 = step(0.0,  (aVertexPosition.y/5.0) * sin(time) + (aVertexPosition.x/5.0) * cos(time)) * step(0.0, sin(time*0.5));
		float c1 = step(0.0, -aVertexPosition.x/5.0) * m1;
		
		float m2 = step(0.0,  (aVertexPosition.y/5.0) * sin(time) + (aVertexPosition.x/5.0) * cos(time)) * step(0.0, cos(time*0.5));
		float c2 = step(0.0,  aVertexPosition.x/5.0) * m2;
		
		float m3 = step(0.0,  (aVertexPosition.y/5.0) * sin(time-3.14) + (aVertexPosition.x/5.0) * cos(time-3.14)) * step(0.0, cos((time-3.14)*0.5));
		float c3 = step(0.0,  aVertexPosition.x/5.0) * m3;
		
		float m4 = step(0.0,  (aVertexPosition.y/5.0) * sin(time-3.14) + (aVertexPosition.x/5.0) * cos(time-3.14)) * step(0.0, sin((time-3.14)*0.5));
		float c4 = step(0.0, -aVertexPosition.x/5.0) * m4;
		
		color.rgb = mix(vec3(0.5, 0.0, 0.0), vec3( sin(mod(time, (3.14 * 8.0)))), c1 + c2 + c3 + c4);
	}
	else if(effect == 6){//clock Rainbow
		float time = (uTime - floor(aTextureCoord.y)*400.0)/1000.0;
		
		float m1 = step(0.0,  (aVertexPosition.y/5.0) * sin(time) + (aVertexPosition.x/5.0) * cos(time)) * step(0.0, sin(time*0.5));
		float c1 = step(0.0, -aVertexPosition.x/5.0) * m1;
		
		float m2 = step(0.0,  (aVertexPosition.y/5.0) * sin(time) + (aVertexPosition.x/5.0) * cos(time)) * step(0.0, cos(time*0.5));
		float c2 = step(0.0,  aVertexPosition.x/5.0) * m2;
		
		color.r = c1;
		color.g = c2;
	}
	
	return color;
}