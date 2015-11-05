precision mediump float;

varying vec3 vLightWeighting;
varying float vAlpha;

void main(void) {
	vec4 fragmentColor;
	gl_FragColor = vec4(vec3(0.008, 0.137, 0.682), vAlpha);
}