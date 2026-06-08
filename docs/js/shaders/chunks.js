/**
 * Chunk GLSL condivisi: vertex shader pianeti e atmosfera Fresnel.
 */

/* ─── Vertex shader pianeti ─── */
export const PLANET_VERT = /* glsl */`
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vLocalPosition;
  varying vec3 vViewDir;
  varying vec2 vUv;

  void main() {
    vUv             = uv;
    vLocalPosition  = position;

    vec4 worldPos   = modelMatrix * vec4(position, 1.0);
    vWorldPosition  = worldPos.xyz;
    vWorldNormal    = normalize(mat3(modelMatrix) * normal);

    vec4 mvPos      = viewMatrix * worldPos;
    vViewDir        = normalize(cameraPosition - vWorldPosition);

    gl_Position     = projectionMatrix * mvPos;
  }
`;

/* ─── Vertex shader atmosfera (sfera leggermente più grande) ─── */
export const ATMOSPHERE_VERT = /* glsl */`
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDir;

  void main() {
    vec4 worldPos  = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vWorldNormal   = normalize(mat3(modelMatrix) * normal);
    vViewDir       = normalize(cameraPosition - vWorldPosition);
    gl_Position    = projectionMatrix * viewMatrix * worldPos;
  }
`;

/* ─── Fragment shader atmosfera Fresnel con sun-side highlight ─── */
export const ATMOSPHERE_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform vec3  uSunDirection;
  uniform float uIntensity;
  uniform float uPower;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDir;
  void main() {
    vec3  N       = normalize(vWorldNormal);
    vec3  V       = normalize(vViewDir);
    float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), uPower);
    float sunSide = smoothstep(-0.1, 0.55, dot(N, uSunDirection));
    /* alpha = 0 sul lato buio → niente bolla sul retro */
    float alpha   = fresnel * uIntensity * sunSide;
    gl_FragColor  = vec4(uColor * (0.4 + sunSide * 0.6), alpha);
  }
`;
