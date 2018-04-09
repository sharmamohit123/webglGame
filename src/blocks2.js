var cubeTranslation2 = 0.0;
var cubeRotation2 = 0.0;
var nblock1 = 10;
//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers2(gl) {

  // Create a buffer for the cube's vertex positions.

  const positionBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.


  const blocks = [
    // Front face
    -2.5, -4.0,  0.5,
    -0.7, -4.0,  0.5,
    -0.7,  4.0,  0.5,
    -2.5,  4.0,  0.5,

    // Back face
    -2.5, -4.0, -0.5,
    -2.5,  4.0, -0.5,
    -0.7,  4.0, -0.5,
    -0.7, -4.0, -0.5,

    // Top face
    -2.5,  4.0, -0.5,
    -2.5,  4.0,  0.5,
    -0.7,  4.0,  0.5,
    -0.7,  4.0, -0.5,

    // Bottom face
    -2.5, -4.0, -0.5,
    -0.7, -4.0, -0.5,
    -0.7, -4.0,  0.5,
    -2.5, -4.0,  0.5,

    // Right face
    -0.7, -4.0, -0.5,
    -0.7,  4.0, -0.5,
    -0.7,  4.0,  0.5,
    -0.7, -4.0,  0.5,

    // Left face
    -2.5, -4.0, -0.5,
    -2.5, -4.0,  0.5,
    -2.5,  4.0,  0.5,
    -2.5,  4.0, -0.5,
/////////////////////////////////////////////////////////////////////
    2.5, -4.0,  0.5,
    0.7, -4.0,  0.5,
    0.7,  4.0,  0.5,
    2.5,  4.0,  0.5,

    // Back face
    2.5, -4.0, -0.5,
    2.5,  4.0, -0.5,
    0.7,  4.0, -0.5,
    0.7, -4.0, -0.5,

    // Top face
    2.5,  4.0, -0.5,
    2.5,  4.0,  0.5,
    0.7,  4.0,  0.5,
    0.7,  4.0, -0.5,

    // Bottom face
    2.5, -4.0, -0.5,
    0.7, -4.0, -0.5,
    0.7, -4.0,  0.5,
    2.5, -4.0,  0.5,

    // Right face
    0.7, -4.0, -0.5,
    0.7,  4.0, -0.5,
    0.7,  4.0,  0.5,
    0.7, -4.0,  0.5,

    // Left face
    2.5, -4.0, -0.5,
    2.5, -4.0,  0.5,
    2.5,  4.0,  0.5,
    2.5,  4.0, -0.5,
  ];

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blocks), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.


  const blockColors = [
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
    [0.0,  204/255,  102/255,  1.0],    // Front face: white
  ];

  // Convert the array of colors into a table for all the vertices.
  var colors = [];

  for (var j = 0; j < blockColors.length; ++j) {
    const c = blockColors[j];

    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

    var len = indices.length;
    for (i = 0 ; i < len ; i++) {
      indices.push(indices[i]+24);
    }


  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

//
// Draw the scene.
//
var newTranslate=[];
newTranslate[0]=-100;
var newRotate=[];
newRotate[0]=50;
for(i=1;i<nblock1;i++){
  newTranslate[i] = newTranslate[i-1]-100;
  newRotate[i] = newRotate[i-1]-20;
}

function drawScene2(gl, programInfo, buffers, deltaTime) {
  
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
    
    for(i=0;i<nblock;i++){
      //newTranslate-=100;
      const modelViewMatrix = mat4.create();
  
      // Now move the drawing position a bit to where we want to
      // start drawing the square.
  
      mat4.translate(modelViewMatrix,     // destination matrix
              modelViewMatrix,     // matrix to translate
              [ 0.0, 1.0-cubeTranslationy, cubeTranslation2+newTranslate[i]]);  // amount to translate
      mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation2+newRotate[i],     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
      mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              0,// amount to rotate in radians
              [0, 1, 0]);       // axis to rotate around (X)
  
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
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
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
  
      {
        const vertexCount = 72;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
      }
  
      // Update the rotation for the next draw
        var angle = ((cubeRotation2+newRotate[i])*(180/3.1415))%180;
        if((cubeTranslation2+newTranslate[i]>-0.5) && (cubeTranslation2+newTranslate[i]<0.5) && !game_over){
            if(25<angle && angle<165){
            lives-=0.33;
            } 
        }   
      
    }
    cubeRotation2 += deltaTime*3;
    cubeTranslation2 += deltaTime*tunnel_speed;
    if(cubeTranslation2>=1000)
        cubeTranslation2=0;
    
  }
  
//
// Initialize a shader program, so WebGL knows how to draw our data
//