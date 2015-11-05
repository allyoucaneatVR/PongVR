precision mediump float;

varying vec2 vTextureCoord;
varying float vTextureIndex;

uniform sampler2D uSampler[6];
uniform float uTime;

void main(void) {
	float factor = ((sin((mod(uTime, 60000.0)/60000.0)*3.14*2.0))+1.0)/2.0;
	vec4 fragmentColor;
	if (vTextureCoord.x > -0.5 && vTextureCoord.y > -0.5) {
		vec4 tex = vec4(0.0);
		float i = vTextureIndex;
		if(i-0.0 < 0.01){
			tex = texture2D(uSampler[0], vec2(vTextureCoord.s, vTextureCoord.t));
		}
		else if(i-1.0 < 0.01){
			tex = texture2D(uSampler[1], vec2(vTextureCoord.s, vTextureCoord.t));
		}
		else if(i-2.0 < 0.01){
			tex = texture2D(uSampler[2], vec2(vTextureCoord.s, vTextureCoord.t));
		}
		else if(i-3.0 < 0.01){
			tex = texture2D(uSampler[3], vec2(vTextureCoord.s, vTextureCoord.t));
		}
		else if(i-4.0 < 0.01){
			tex = texture2D(uSampler[4], vec2(vTextureCoord.s, vTextureCoord.t));
		}
		else if(i-5.0 < 0.01){
			tex = texture2D(uSampler[5], vec2(vTextureCoord.s, vTextureCoord.t));
		}
		fragmentColor = tex;

		fragmentColor.r = fragmentColor.r - 0.5*factor;
		fragmentColor.g = fragmentColor.g - 0.5*factor;
		fragmentColor.b = fragmentColor.b - 0.5*factor;
	}
	 else {
		fragmentColor = vec4(0.5, 0.5, 0.5, 1.0);
	}
	gl_FragColor = vec4(fragmentColor.rgb, fragmentColor.a);
}