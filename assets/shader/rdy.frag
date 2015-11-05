precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vColor;

uniform sampler2D uSampler;

void main(void) {
	gl_FragColor.rgb = vColor;
	gl_FragColor.a = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)).a;
}