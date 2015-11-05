precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler[2];
uniform float uTime[3];
uniform vec3 uCenter[3];
uniform vec3 uZIndicators;

void main(void) {

	vec4 fragmentColor = vec4(1.0,1.0,1.0,texture2D(uSampler[0], vec2(vTextureCoord.s, vTextureCoord.t)).a);

	vec2 textureSizeXY = vec2(12.0,10.0);
	float textureSizeZ = 80.0;
	float textureOffsetZ = -79.0;
	float duration = 700.0;
	float speed = 0.02;	//lower is faster

	for(int i=0;i<8;i++){
		if(uTime[i]<duration){
			vec2 centerTexCoord = vec2(99.0,99.0);		//reset coord
			vec2 centerTexCoordOF = vec2(99.0,99.0);	//reset overflow coordinate
			float factor = (uTime[i]*speed);
			float width = 1.0;

			if(uCenter[i].x==0.0){			//left wall
				centerTexCoord = vec2( textureSizeXY.y*(1.0-uCenter[i].y), uCenter[i].z*textureSizeZ+textureOffsetZ );
				centerTexCoordOF = vec2( centerTexCoord.x+44.0, uCenter[i].z*textureSizeZ+textureOffsetZ );
				float overflowDist = distance(vTextureCoord, centerTexCoordOF);
				if(overflowDist<duration*0.01-width&&abs(overflowDist-factor)<width){
					fragmentColor.a+=texture2D(uSampler[1], vec2(vTextureCoord.s, vTextureCoord.t)).a;
				}
			}else if(uCenter[i].y==0.0){	//bottom wall
				centerTexCoord = vec2( textureSizeXY.y+textureSizeXY.x*uCenter[i].x, uCenter[i].z*textureSizeZ+textureOffsetZ );
			}else if(uCenter[i].x==1.0){	//right wall
				centerTexCoord = vec2( textureSizeXY.y+textureSizeXY.x+textureSizeXY.y*uCenter[i].y, uCenter[i].z*textureSizeZ+textureOffsetZ );
			}else if(uCenter[i].y==1.0){	//top wall
				centerTexCoord = vec2( textureSizeXY.y+textureSizeXY.x+textureSizeXY.y+textureSizeXY.x*(1.0-uCenter[i].x), uCenter[i].z*textureSizeZ+textureOffsetZ );
				centerTexCoordOF = vec2( centerTexCoord.x-44.0, uCenter[i].z*textureSizeZ+textureOffsetZ );
				float overflowDist = distance(vTextureCoord, centerTexCoordOF);
				if(overflowDist<duration*0.01-width&&abs(overflowDist-factor)<width){
					fragmentColor.a+=texture2D(uSampler[1], vec2(vTextureCoord.s, vTextureCoord.t)).a;
				}
			}

			float dist = distance(vTextureCoord, centerTexCoord);

			if(dist<duration*0.01-width&&abs(dist-factor)<width){
				fragmentColor.a+=texture2D(uSampler[1], vec2(vTextureCoord.s, vTextureCoord.t)).a;
			}

		}
	}

	//######## Ball z indicator #########
	float thickness0 = 0.004*40.0;
	float thickness1 = 0.3*40.0;
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