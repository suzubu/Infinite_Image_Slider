// === [ Vertex Shader ] ===
export const vertexShader = `
uniform float uScrollIntensity; // Controls wave distortion strength based on scroll velocity
varying vec2 vUv;               // Pass UV coordinates to fragment shader

void main() {
  vUv = uv; // Store UVs
  vec3 pos = position; // Get vertex position

  // Apply sinusoidal distortion to z-axis based on UV position
  float sideDistortion = sin(uv.y * 3.14159) * uScrollIntensity * 0.5;
  float topBottomDistortion = sin(uv.x * 3.14159) * uScrollIntensity * 0.2;
  pos.z += sideDistortion + topBottomDistortion; // Combine horizontal + vertical wave

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// === [ Fragment Shader ] ===
export const fragmentShader = `
uniform sampler2D uCurrentTexture; // Currently visible texture
uniform sampler2D uNextTexture;    // Next texture to transition to
uniform float uScrollPosition;     // Tracks scroll position between slides
varying vec2 vUv;                  // Interpolated UVs from vertex shader

void main() {
  float normalizedPosition = fract(uScrollPosition); // Get fractional part for transition

  // Scroll the two textures vertically based on scroll position
  vec2 currentUv = vec2(vUv.x, mod(vUv.y - normalizedPosition, 1.0));
  vec2 nextUv = vec2(vUv.x, mod(vUv.y + 1.0 - normalizedPosition, 1.0));

  // Mix textures vertically by sectioning them across Y axis
  if (vUv.y < normalizedPosition) {
    gl_FragColor = texture2D(uNextTexture, nextUv); // Reveal next image above
  } else {
    gl_FragColor = texture2D(uCurrentTexture, currentUv); // Show current image below
  }
}
`;
