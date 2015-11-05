precision mediump float;

varying vec3 vLightWeighting;
varying vec4 vColor;

void main(void) {
	vec4 fragmentColor;
	fragmentColor = vColor;
	gl_FragColor = vec4(fragmentColor.rgb * vLightWeighting, fragmentColor.a);
}