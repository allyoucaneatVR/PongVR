precision mediump float;

varying vec3 vColor;
varying vec2 vTextureCoord;
varying float vDigit;

uniform sampler2D uSampler;
uniform float uDigits[2];


void main(void) {
	float sOffset;
	float tOffset;
	if(vDigit == 0.0){
		sOffset = mod(uDigits[0],3.0);
    	tOffset = floor(uDigits[0]/3.0);
	}else {
		sOffset = mod(uDigits[1],3.0);
		tOffset = floor(uDigits[1]/3.0);
	}

	gl_FragColor = vec4(vColor, texture2D(uSampler, vec2(vTextureCoord.s+0.33*sOffset, vTextureCoord.t-0.25*tOffset)).a);
}