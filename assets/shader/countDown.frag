precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float uFactor;

void main(void) {
	vec4 fragmentColor;
	fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
	fragmentColor.a*=(1.0-uFactor);
	gl_FragColor = fragmentColor;
}