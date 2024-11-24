
uniform sampler2D tDiffuse; // The rendered scene
uniform sampler2D tFluid;   // The fluid texture
varying vec2 vUv;

void main() {
  // Sample the fluid texture
  vec2 fluidUV = texture2D(tFluid, vUv).rg;

  // Apply distortion based on the fluid texture
  float distortionStrength = 0.1; // Adjust distortion strength as needed
  vec2 distortedUv = vUv + (fluidUV - 0.5) * distortionStrength;

  // Sample the scene texture with the distorted UVs
  vec4 color = texture2D(tDiffuse, distortedUv);

  gl_FragColor = color;
}