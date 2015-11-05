precision mediump float;

varying vec3 vColor;
varying vec2 vTextureCoord;
varying float vDigit;

uniform sampler2D uSampler;
uniform float uDigits[4];

void main(void) {
	float sOffset;
	float tOffset;
	if(vDigit == 0.0){
		sOffset = mod(uDigits[0],3.0);
    	tOffset = floor(uDigits[0]/3.0);
	}else if(vDigit <= 1.0){
		sOffset = mod(uDigits[1],3.0);
		tOffset = floor(uDigits[1]/3.0);
	}else if(vDigit <= 2.0){
		sOffset = 0.0;		//dash
		tOffset = 0.0;
	}else if(vDigit <= 3.0){
		sOffset = mod(uDigits[2],3.0);
    	tOffset = floor(uDigits[2]/3.0);
	}else if(vDigit <= 4.0){
		sOffset = mod(uDigits[3],3.0);
    	tOffset = floor(uDigits[3]/3.0);
	}

	vec4 fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s+0.33*sOffset, vTextureCoord.t-0.25*tOffset));
	fragmentColor.rgb = vColor;
	gl_FragColor = vec4(fragmentColor.rgb, fragmentColor.a);
}