precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform float uWin;

void main(void) {
    vec4 fragmentColor;
    fragmentColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t-uWin*0.5));
    gl_FragColor = fragmentColor;
}