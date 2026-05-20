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
    float fresnel = pow(1.0 - clamp(dot(vWorldNormal, vViewDir), 0.0, 1.0), uPower);

    // Più brillante sul lato illuminato dal sole
    float sunDot  = max(dot(vWorldNormal, uSunDirection), 0.0);
    float sunSide = smoothstep(-0.3, 0.4, dot(normalize(vWorldNormal), uSunDirection));

    float alpha = fresnel * uIntensity * (0.3 + sunSide * 1.0);
    gl_FragColor = vec4(uColor * (0.5 + sunSide * 0.8), alpha);
  }
`;
