precision mediump float;

varying vec2 vTextureCoord;
varying vec3 vPosition;

uniform sampler2D uSampler;
uniform float uTimeStart[3];
uniform vec3 uCenter[3];
uniform vec3 uZIndicators;

//Ripple
const vec3 texSize = vec3(12.0, 10.0, 80.0);
const float textureOffsetZ = -79.0;
const float duration = 500.0;
const float speed = 0.008;	//lower is faster
const float width = 0.5;
//Ball
const float thickness0 = 0.004*40.0;
const float thickness1 = 0.3*40.0;
void main(void) {
	vec4 fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
	fragmentColor.a = texture2D(uSampler, vec2(vTextureCoord.s/2.5, vTextureCoord.t/2.5)).a;
	
	for(int i=0;i<3;i++){
		if(uTimeStart[i]<duration){
			float factor = (uTimeStart[i]*speed);
			vec2 centerTexCoord = vec2(99.0,99.0);		//reset coord
			vec2 centerTexCoordOF = vec2(99.0,99.0);	//reset overflow coordinate

			if(uCenter[i].x==0.0){			//left wall
				centerTexCoord = vec2( texSize.y*(1.0-uCenter[i].y), uCenter[i].z*texSize.z+textureOffsetZ );
				
                centerTexCoordOF = vec2( centerTexCoord.x+44.0, uCenter[i].z*texSize.z+textureOffsetZ );
                
                //set frag color
                float dist = distance(vTextureCoord, centerTexCoordOF);
                if(dist < (duration*0.01 - width) && abs(dist-factor) < width){
                    float smooth = (1.0 - uTimeStart[i]/duration) * (0.5+(dist-factor));
                    fragmentColor += vec4(-0.075, -0.05, 0.0, smooth);
                }
			}
			else if(uCenter[i].y==0.0){	//bottom wall
				centerTexCoord = vec2( texSize.y+texSize.x*uCenter[i].x, uCenter[i].z*texSize.z+textureOffsetZ );
			}
			else if(uCenter[i].x==1.0){	//right wall
				centerTexCoord = vec2( texSize.y+texSize.x+texSize.y*uCenter[i].y, uCenter[i].z*texSize.z+textureOffsetZ );
			}
			else if(uCenter[i].y==1.0){	//top wall
				centerTexCoord = vec2( texSize.y+texSize.x+texSize.y+texSize.x*(1.0-uCenter[i].x), uCenter[i].z*texSize.z+textureOffsetZ );
				
                centerTexCoordOF = vec2( centerTexCoord.x-44.0, uCenter[i].z*texSize.z+textureOffsetZ );
                
                //set frag color
                float dist = distance(vTextureCoord, centerTexCoordOF);
                if(dist < (duration*0.01 - width) && abs(dist-factor) < width){
                    float smooth = (1.0 - uTimeStart[i]/duration) * (0.5+(dist-factor));
                    fragmentColor += vec4(-0.075, -0.05, 0.0, smooth);
                }
			}

            //set frag color
			float dist = distance(vTextureCoord, centerTexCoord);
			if(dist < (duration*0.01 - width) && abs(dist-factor) < width){
                float smooth = (1.0 - uTimeStart[i]/duration) * (0.5+(dist-factor));
				fragmentColor += vec4(-0.075, -0.05, 0.0, smooth);
			}

		}
	}

	//######## Ball z indicator #########
	float normalizedZ = (vTextureCoord.t+79.0)/2.0;

	float ball =    smoothstep(uZIndicators.x*40.0-thickness0, uZIndicators.x*40.0, normalizedZ);
	ball = ball *   smoothstep(uZIndicators.x*40.0+thickness0, uZIndicators.x*40.0, normalizedZ);

	float ball2 =    smoothstep(uZIndicators.x*40.0-thickness1, uZIndicators.x*40.0, normalizedZ);
	ball2 = ball2 *  smoothstep(uZIndicators.x*40.0+thickness1, uZIndicators.x*40.0, normalizedZ);

	float pane1 =    smoothstep(uZIndicators.y*40.0-thickness0, uZIndicators.y*40.0, normalizedZ);
	pane1 = pane1 *  smoothstep(uZIndicators.y*40.0+thickness0, uZIndicators.y*40.0, normalizedZ);

	fragmentColor.a = fragmentColor.a + pane1 + ball + fragmentColor.a*ball2;

	//######## Output Color #########
	gl_FragColor = fragmentColor;
}