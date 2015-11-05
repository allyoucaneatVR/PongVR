precision mediump float;

varying vec3 vLightWeighting;
varying vec4 vColor;
varying vec2 vTextureCoord;
varying float vTextureIndex;

uniform sampler2D uSampler[3];
uniform float uTime;

void main(void) {
	vec4 fragmentColor;
	float p = mod(uTime/8000.0, 1.0);
	float pp = p*p*p;
	float q = 1.0-p;
	
	vec4 t1 = texture2D(uSampler[0], vec2(vTextureCoord.s*70.0, vTextureCoord.t*70.0)) * vec4(0.2, 0.8, 0.0, 0.9);
	
	float f = q*q*q*30.0;
	vec4 t2 = texture2D(uSampler[1], vec2((0.5-vTextureCoord.s)*f + 0.5, (0.5-vTextureCoord.t)*f + 0.5));
	
	float s = vTextureCoord.s*p + vTextureCoord.t*q;//*p) + (vTextureCoord.t*q);
	float t = vTextureCoord.t*p + (1.0-vTextureCoord.s)*q;//*p) - (vTextureCoord.s*q);
	vec4 t3 = texture2D(uSampler[2], vec2(s, t));
	t3.a = t3.a*0.3;
		
	fragmentColor = t1 * t2 + t1 * t3;
	//fragmentColor = vColor;
	
	gl_FragColor = vec4(fragmentColor.rgb * vLightWeighting, fragmentColor.a);
}