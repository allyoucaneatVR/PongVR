precision mediump float;

varying vec3 vLightWeighting;
varying vec4 vColor;
varying vec2 vTextureCoord;
varying vec3 vPosition;


uniform sampler2D uSampler;
uniform float uTime;

void main(void) {
  vec4 fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));

  float tau = 3.1415926535*2.0;

	//get the color
  float a = atan(vPosition.x, vPosition.z) / tau;
	float xCol = (a - (uTime / 8000.0)) * 3.0;
	xCol = mod(xCol, 3.0);
	vec3 horColour = vec3(0.25, 0.25, 0.25);

	if (xCol < 1.0) {

		horColour.r += 1.0 - xCol;
		horColour.g += xCol;
	}
	else if (xCol < 2.0) {

		xCol -= 1.0;
		horColour.g += 1.0 - xCol;
		horColour.b += xCol;
	}
	else {

		xCol -= 2.0;
		horColour.b += 1.0 - xCol;
		horColour.r += xCol;
	}


	//uv = (2.0 * uv) - 1.0;
	float beamWidth = abs(1.0/(vPosition.y - 16.6)*0.6) * (1.0 + (cos((uTime/1000.0) + a*50.0)+1.0)/3.0);
	vec3 horBeam = vec3(beamWidth);

  fragmentColor.rgb = fragmentColor.rgb*0.2 + (horBeam * horColour);


  gl_FragColor = fragmentColor;//vec4(horBeam * horColour, fragmentColor.a);
}
