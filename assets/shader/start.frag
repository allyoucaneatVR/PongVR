precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vColor;

uniform sampler2D uSampler;
uniform float uFillTime;

void main(void) {
	float factor = uFillTime*0.000166;
	if(vTextureCoord.t<factor){
		gl_FragColor.rgb = vec3(1.0,1.0,1.0);
	}else{
		gl_FragColor.rgb = vColor;
	}
	gl_FragColor.a = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)).a;
}