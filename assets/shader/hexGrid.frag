precision mediump float;

varying vec3 vLightWeighting;
varying vec4 vColor;
varying vec2 vTextureCoord;
varying float vTextureIndex;
varying vec2 vFragmentCoord;

uniform sampler2D uSampler[1];
uniform float uTime;

void main(void) {
	float distance = sqrt(pow(vFragmentCoord.x-0.5,2.0)+pow(vFragmentCoord.y-0.5,2.0));
	vec4 fragmentColor = texture2D(uSampler[0], vec2(vTextureCoord.s, vTextureCoord.t));
	float r = 1.0;
	float g = 0.0;
	float b = 0.0;
	float width = 0.3;
	float factor = (mod(uTime, 3000.0)/3000.0)*(1.0+width)-width;
	fragmentColor.rgb = vec3(
		r*fragmentColor.r+(1.0-r)*abs(distance-factor)*1.0/width,
		g*fragmentColor.g+(1.0-g)*abs(distance-factor)*1.0/width,
		b*fragmentColor.b+(1.0-b)*abs(distance-factor)*1.0/width);
	if(distance>0.5){
		fragmentColor.a = 0.0;
	}
//	gl_FragColor = vec4(fragmentColor.rgb, fragmentColor.a*(0.5-distance)*2.0);
	gl_FragColor = vec4(fragmentColor.rgb, fragmentColor.a);
//	gl_FragColor = vec4(1.0,1.0,1.0,1.0);
}