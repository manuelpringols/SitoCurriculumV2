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
  varying vec2 vUv;
  void main() {
    vUv = uv;
    /* Billboard always-facing-camera, rispetta la scala del bodyGroup */
    vec3 right   = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 up      = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    vec3 wCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
    float scale  = length(vec3(modelMatrix[0][0], modelMatrix[1][0], modelMatrix[2][0]));
    vec3 wPos    = wCenter + right * position.x * scale + up * position.y * scale;
    gl_Position  = projectionMatrix * viewMatrix * vec4(wPos, 1.0);
  }
`;

export const ATMOSPHERE_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform vec3  uSunDirection;
  uniform float uIntensity;
  uniform float uPlanetFrac;
  varying vec2  vUv;
  void main() {
    vec2  c = vUv - 0.5;
    float d = length(c) * 2.0;
    if (d > 1.0) discard;

    /* Anello sfumato: zero al centro, peak al bordo pianeta, dissolve fuori */
    float w     = 0.04;
    float inner = smoothstep(uPlanetFrac - w, uPlanetFrac + 0.02, d);
    float outer = 1.0 - smoothstep(uPlanetFrac + 0.02, uPlanetFrac + w * 0.85, d);
    float rim   = inner * outer;

    /* Modulazione solare approssimata */
    float sunDot = dot(normalize(c), normalize(uSunDirection.xy));
    float sunMod = clamp(sunDot * 0.25 + 0.85, 0.0, 1.0);

    float alpha  = rim * uIntensity * sunMod * 0.65;
    gl_FragColor = vec4(uColor * 0.55, alpha);
  }
`;