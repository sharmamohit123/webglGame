var cubeRotation = 0;
var cubeTranslation = 0.0;
var tunnel_length = 100;
var color_type = 0;
var zrotate = 0.1;
var tunnel_texture,texture, texture1;
var score = 10;
var lives = 3;
var ctx;
var blink=false;
var gray_scale=false;
var blink_time=0;
var cubeTranslationy=0;
var speedy=0;
var gravity=0;
var tunnel_speed = 10;
var level=1;
main();

//
// Start here
//

Mousetrap.bind('a', function () {
    cubeRotation+=zrotate;
    cubeRotation1+=zrotate;
    cubeRotation2+=zrotate;
})

Mousetrap.bind('d', function () {
    cubeRotation-=zrotate;
    cubeRotation1-=zrotate;
    cubeRotation2-=zrotate;
})

Mousetrap.bind('w', function () {
    speedy=0.25;
    gravity=-0.02;
})

Mousetrap.bind('t', function () {
  if(tunnel_texture==texture)
    tunnel_texture=texture1;
  else if(tunnel_texture==texture1)
    tunnel_texture=texture2;
  else
    tunnel_texture=texture;
})

Mousetrap.bind('g', function () {
  if(gray_scale)
    gray_scale=false;
  else
    gray_scale=true;
})

function main() {
  document.getElementById('backaudio').play()
  const canvas = document.querySelector('#glcanvas');
  var textCanvas = document.getElementById("text");
  ctx = textCanvas.getContext("2d");
  
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program
  
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform bool blink;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;

      // Apply lighting effect

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor;
      if (blink) {
        directionalLightColor = vec3(2, 2, 2);        
      }
      else{
        directionalLightColor = vec3(1, 1, 1); 
      }

      highp vec3 directionalVector = normalize(vec3(0, -1.5, 10));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
  `;

  // Fragment shader program

  const fsSource = `
    precision mediump float;
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;
    uniform bool gray_scale;

    vec4 Grayscale(in vec4 color) {
			float bw = (color.r + color.g + color.b) / 3.0;
			return vec4(bw, bw, bw, 1.0);
			
		}
    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
    
      if(gray_scale){
				gl_FragColor = Grayscale(vec4(texelColor.rgb * vLighting, texelColor.a)); 	
      }
			else {
				gl_FragColor = vec4(texelColor.rgb *vLighting, texelColor.a);
			}
    }
  `;

  const vsSource1 = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource1 = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const shaderProgram1 = initShaderProgram(gl, vsSource1, fsSource1);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
      blink: gl.getUniformLocation(shaderProgram, 'blink'),
      gray_scale: gl.getUniformLocation(shaderProgram, 'gray_scale'),
    },
  };

  const programInfo1 = {
    program: shaderProgram1,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram1, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram1, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram1, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram1, 'uModelViewMatrix'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);
  const buffers1 = initBuffers1(gl);
  const buffers2 = initBuffers2(gl);

  texture = loadTexture(gl, './textures/tunnel.jpg');
  texture1 = loadTexture(gl, './textures/tunnel2.jpg');
  texture2 = loadTexture(gl, './textures/tunnel3.jpeg');
  tunnel_texture = texture;

  var then = 0;
  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
        
    blink_time++;
    if(blink_time>200 && blink_time<300){
      blink=true;
      if(blink_time==299){
        blink_time=0;
        blink=false;
      }
    }
    if(score==1000){
      level++;
    }
    else if(score==2000){
      level++;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    score+=1;    
    if(Math.round(lives)<=0){
      alert('Game Over\n' +'Your Score is '+ score);
    }
    drawScene(gl, programInfo, buffers, tunnel_texture, deltaTime);
    drawScene1(gl, programInfo1, buffers1, deltaTime);
    drawScene2(gl, programInfo1, buffers2, deltaTime);
    

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.

  var positions = [];
  var pos=0,i,k,n=8;
  var pi = 3.14159, angle = 0, theta=(2*pi)/n;
  for(i=0;i<n;i++){
      for(k=0;k<2;k++){
          positions[pos++]= 2*Math.cos(angle);
          positions[pos++]= 2*Math.sin(angle);
          positions[pos++]= -2.0;
          positions[pos++]= 2*Math.cos(angle);
          positions[pos++]= 2*Math.sin(angle);
          positions[pos++]=-6.0;
          angle += theta;
      }
      angle-=theta;
  }
  // console.log(positions);
  var len=positions.length;
  for (var j = 0; j < tunnel_length; j++) {
    for (var i = 0; i < len; i+=3 ) {
      positions.push(positions[i]);
      positions.push(positions[i+1]);
      positions.push(positions[i+2]-4*(j+1));
    }
  }


  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

  /*const faceColors = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
    [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
    [1.0,  0.0,  1.0,  1.0],    // Left face: purple
    [1.0,  0.5,  0.0,  1.0],    // Left face: purple
    [0.0,  0.2,  1.0,  1.0],    // Left face: purple
    [0.3,  0.2,  0.4,  1.0],    // Left face: purple
    [0.2,  0.5,  1.0,  1.0],    // Left face: purple
    [0.1,  0.2,  1.0,  1.0],    // Left face: purple
    [0.7,  0.6,  1.0,  1.0],    // Left face: purple
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [1.0,  0.0,  0.0,  1.0],    // Back face: red
    [0.0,  1.0,  0.0,  1.0],    // Top face: green
    [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
  ];
  const faceColors1 = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black

    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black 
    [1.0,  1.0,  1.0,  1.0],    // Front face: white    
  ];
  const faceColors2 = [
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black

    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
    [1.0,  1.0,  1.0,  1.0],    // Front face: white
    [0.0,  0.0,  0.0,  1.0],    // Back face: black
  ]

  // Convert the array of colors into a table for all the vertices.

  var colors = [];
  var c;
  for (var i = 0; i < tunnel_length; i++) {
    color_type++;
    for (var j = 0; j < faceColors.length; ++j) {
      if(color_type>=10 && color_type<20){
        c = faceColors1[j];
        //if(color_type==20)
         // color_type=0;
      }
      else if(color_type>=30 && color_type<40){
        c = faceColors2[j];
        if(color_type==39)
          color_type=0;
      }
      else
        c = faceColors[j];

    // Repeat each color four times for the four vertices of the face
      colors = colors.concat(c, c, c, c);
    }
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);*/

  // Set up the normals for the vertices, so that we can compute lighting.

  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  var vertexNormals = [
    // Face 1
    5.656850496748460, 2.343141997766190, 0,
    5.656850496748460, 2.343141997766190, 0,
    5.656850496748460, 2.343141997766190, 0,
    5.656850496748460, 2.343141997766190, 0,

    // Face 2
    2.343149503244498, 5.656847387874637, 0,
    2.343149503244498, 5.656847387874637, 0,
    2.343149503244498, 5.656847387874637, 0,
    2.343149503244498, 5.656847387874637, 0,

    // Face 3
    -2.343134492283756, 5.65685360561233, 0,
    -2.343134492283756, 5.65685360561233, 0,
    -2.343134492283756, 5.65685360561233, 0,
    -2.343134492283756, 5.65685360561233, 0,

    // Face 4
    -5.656844278990856, 2.34315700871868, 0,
    -5.656844278990856, 2.34315700871868, 0,
    -5.656844278990856, 2.34315700871868, 0,
    -5.656844278990856, 2.34315700871868, 0,

    // Face 5
    -5.65685671446623, -2.343126986797201, 0,
    -5.65685671446623, -2.343126986797201, 0,
    -5.65685671446623, -2.343126986797201, 0,
    -5.65685671446623, -2.343126986797201, 0,

    // Face 6
    -2.34316451418874, -5.656841170097116, 0,
    -2.34316451418874, -5.656841170097116, 0,
    -2.34316451418874, -5.656841170097116, 0,
    -2.34316451418874, -5.656841170097116, 0,

    // Face 7
    2.343119481306521, -5.656859823310183, 0,
    2.343119481306521, -5.656859823310183, 0,
    2.343119481306521, -5.656859823310183, 0,
    2.343119481306521, -5.656859823310183, 0,

    // Face 8
    5.656838061193419, -2.343172019654669, 0,
    5.656838061193419, -2.343172019654669, 0,
    5.656838061193419, -2.343172019654669, 0,
    5.656838061193419, -2.343172019654669, 0,
  ];

  var len = vertexNormals.length;
  for (j = 0; j < tunnel_length; j++) {
    for (i = 0 ; i < len ; i++) {
      vertexNormals.push(vertexNormals[i]);
    }
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                gl.STATIC_DRAW);

  // Now set up the texture coordinates for the faces.

  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
     // Right
     0.0,  0.0,
     1.0,  0.0,
     1.0,  1.0,
     0.0,  1.0,
     // Left
     0.0,  0.0,
     1.0,  0.0,
     1.0,  1.0,
     0.0,  1.0,
  ];

  var len = textureCoordinates.length;
  for (j = 0; j < tunnel_length; j++) {
    for (i = 0 ; i < len ; i++) {
      textureCoordinates.push(textureCoordinates[i]);
    }
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);


  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      1,  2,  3,    // front
    4,  5,  6,      5,  6,  7,    // back
    8,  9,  10,     9,  10, 11,   // top
    12, 13, 14,     13, 14, 15,   // bottom
    16, 17, 18,     17, 18, 19,   // right
    20, 21, 22,     21, 22, 23,   // left
    24, 25, 26,     25, 26, 27,   // left
    28, 29, 30,     29, 30, 31,   // left
  ];

  var len = indices.length;
  for (j = 0; j < tunnel_length; j++) {
    for (i = 0 ; i < len ; i++) {
      indices.push(indices[i]+(32*(j+1)));
    }
  }

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    normal: normalBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because images have to be download over the internet
  // they might take a moment until they are ready.
  // Until then put a single pixel in the texture so we can
  // use it immediately. When the image has finished downloading
  // we'll update the texture with the contents of the image.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}


//
// Draw the scene.
//
function drawScene(gl, programInfo, buffers, texture, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  

  //lives = Math.round(lives);
  ctx.font = "20px Times New Roman";
  ctx.fillStyle = "#ff9900";
  ctx.fillText("Score: "+score, 20, 50);
  ctx.fillText("Lives: "+Math.round(lives), 140, 50);
  ctx.fillText("Level: "+level, 230, 50);


  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
          modelViewMatrix,     // matrix to translate
          [ 0.0, 1.0-cubeTranslationy, cubeTranslation+tunnel_speed]);  // amount to translate
  mat4.rotate(modelViewMatrix,  // destination matrix
          modelViewMatrix,  // matrix to rotate
          cubeRotation,     // amount to rotate in radians
          [0, 0, 1]);       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix,  // destination matrix
          modelViewMatrix,  // matrix to rotate
          0,// amount to rotate in radians
          [0, 1, 0]);       // axis to rotate around (X)

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);
  console.log('rtunnel'+cubeRotation);


  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
  }

  // Tell WebGL how to pull out the normals from
  // the normal buffer into the vertexNormal attribute.
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexNormal);
  }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);
  

      // Specify the texture to map onto the faces.

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
  gl.uniform1i(programInfo.uniformLocations.blink, blink);
  gl.uniform1i(programInfo.uniformLocations.gray_scale, gray_scale);
  


  {
    const vertexCount = 48*tunnel_length;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw
  tunnel_speed+=0.01;
  cubeTranslation += deltaTime*tunnel_speed;
  if(cubeTranslation>=320)
    cubeTranslation=0;
  speedy += gravity;
  cubeTranslationy += speedy;
  if(cubeTranslationy<0){
    cubeTranslationy=0;
    speedy=0;
    gravity=0;
  }
  
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

