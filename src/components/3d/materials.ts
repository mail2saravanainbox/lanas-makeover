import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════════════════
   SHADERS
   Written by hand and kept small. Every one of them is GPU-cheap: no loops
   over lights, no post-processing stack, no render targets.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Shared 2D value noise + fbm. */
const NOISE = /* glsl */ `
  vec2 hash2(vec2 p){
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123) * 2.0 - 1.0;
  }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash2(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
          dot(hash2(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
      mix(dot(hash2(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
          dot(hash2(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * vnoise(p); p *= 2.02; a *= 0.5; }
    return v;
  }
`;

/* ── Atmosphere: the warm void the whole story sits inside ───────────────── */

export function createAtmosphereMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    depthWrite: false,
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uWarm: { value: new THREE.Color("#3a2a1a") },
      uDeep: { value: new THREE.Color("#0a0806") },
      uAccent: { value: new THREE.Color("#7a5a34") },
      uIntensity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uWarm, uDeep, uAccent;
      ${NOISE}
      void main(){
        vec2 p = vUv - 0.5;
        float t = uTime * 0.02;

        // Two slow, drifting light pools. Nothing spins, nothing pulses.
        float pool1 = smoothstep(0.72, 0.0, length(p * vec2(1.35, 1.0) - vec2(-0.12 + 0.05 * sin(t), 0.08 + 0.04 * cos(t * 0.8))));
        float pool2 = smoothstep(0.62, 0.0, length(p * vec2(1.1, 1.0) - vec2(0.22 + 0.04 * cos(t * 1.1), -0.18)));

        float grain = fbm(vUv * 3.2 + t * 0.4) * 0.5 + 0.5;

        vec3 col = uDeep;
        col = mix(col, uWarm, pool1 * 0.85 * uIntensity);
        col = mix(col, uAccent, pool2 * 0.32 * uIntensity);
        col += (grain - 0.5) * 0.035;

        // Vignette keeps the edges of the frame quiet.
        col *= smoothstep(1.15, 0.25, length(p * vec2(1.0, 1.25)));

        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

/* ── Silk: the transition fabric ─────────────────────────────────────────── */

export function createSilkMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uOpacity: { value: 1 },
      uColorA: { value: new THREE.Color("#3d2a17") },
      uColorB: { value: new THREE.Color("#c9a96a") },
      uColorC: { value: new THREE.Color("#e0cdb2") },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uProgress;
      varying vec2 vUv;
      varying float vFold;
      varying vec3 vNormalW;

      // Three overlapping wave trains — reads as fabric, costs almost nothing.
      float folds(vec2 uv, float t){
        float a = sin(uv.x * 7.5 + t * 0.75) * 0.5;
        float b = sin(uv.x * 13.0 - uv.y * 3.4 + t * 0.55) * 0.24;
        float c = sin(uv.y * 5.2 + t * 0.4) * 0.18;
        return a + b + c;
      }

      void main(){
        vUv = uv;
        vec3 pos = position;

        float amp = 0.16 + uProgress * 0.1;
        // Pinned at the top edge, free at the bottom — like hanging cloth.
        float hang = smoothstep(0.0, 0.85, 1.0 - uv.y);
        float f = folds(uv, uTime) * amp * hang;
        pos.z += f;
        vFold = f;

        // Cheap analytic normal from the same field.
        float e = 0.012;
        float fx = (folds(uv + vec2(e, 0.0), uTime) - folds(uv - vec2(e, 0.0), uTime)) * amp * hang;
        float fy = (folds(uv + vec2(0.0, e), uTime) - folds(uv - vec2(0.0, e), uTime)) * amp * hang;
        vNormalW = normalize(vec3(-fx / (2.0 * e), -fy / (2.0 * e), 1.0));

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      varying float vFold;
      varying vec3 vNormalW;
      uniform float uOpacity;
      uniform float uProgress;
      uniform vec3 uColorA, uColorB, uColorC;
      ${NOISE}
      void main(){
        vec3 L = normalize(vec3(-0.35, 0.55, 0.75));
        float lambert = clamp(dot(vNormalW, L), 0.0, 1.0);

        // Anisotropic sheen: what actually makes a surface read as silk.
        float sheen = pow(lambert, 3.5);
        float zari = pow(max(0.0, vNormalW.x * 0.8 + vNormalW.y * 0.6), 8.0);

        vec3 col = mix(uColorA, uColorB, lambert * 0.72 + vFold * 0.9 + 0.14);
        col = mix(col, uColorC, sheen * 0.55);
        col += uColorC * zari * 0.28;

        // Woven zari threads, very fine, almost subliminal.
        float weave = sin(vUv.x * 620.0) * sin(vUv.y * 520.0);
        col += weave * 0.014;
        col += fbm(vUv * 6.0) * 0.03;

        // Camera passes *through* the cloth: it opens from the centre outwards.
        float d = length(vUv - 0.5) * 1.7;
        float aperture = smoothstep(uProgress * 1.5 - 0.15, uProgress * 1.5 + 0.35, d);
        float edgeFade = smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.86, vUv.y);

        float alpha = uOpacity * aperture * edgeFade;
        if (alpha < 0.004) discard;

        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
}

/* ── Transformation: the five stages ─────────────────────────────────────── */

/**
 * Crossfades between two optional photographs with a noise-driven dissolve and
 * a barrel-ish displacement. When no photographs are supplied it renders a
 * procedural tonal study instead — abstract, never a fabricated face.
 */
export function createTransformationMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      /** Continuous 0→4 across the five stages. */
      uStage: { value: 0 },
      uOpacity: { value: 1 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1 },
      uTexA: { value: null as THREE.Texture | null },
      uTexB: { value: null as THREE.Texture | null },
      uHasTex: { value: 0 },
      uMix: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime, uStage, uOpacity, uAspect, uHasTex, uMix;
      uniform vec2 uMouse;
      uniform sampler2D uTexA, uTexB;
      ${NOISE}

      // 01 bare · 02 prepared · 03 defined · 04 adorned · 05 bridal
      vec3 stagePalette(float s, float shade, vec2 p){
        vec3 bare     = mix(vec3(0.09,0.085,0.082), vec3(0.42,0.39,0.37), shade);
        vec3 prepared = mix(vec3(0.12,0.105,0.09),  vec3(0.72,0.66,0.58), shade);
        vec3 defined  = mix(vec3(0.10,0.075,0.055), vec3(0.68,0.50,0.33), shade);
        vec3 adorned  = mix(vec3(0.12,0.08,0.045),  vec3(0.86,0.68,0.38), shade);
        vec3 bridal   = mix(vec3(0.16,0.06,0.045),  vec3(0.90,0.72,0.45), shade);

        vec3 c = bare;
        c = mix(c, prepared, smoothstep(0.0, 1.0, s));
        c = mix(c, defined,  smoothstep(1.0, 2.0, s));
        c = mix(c, adorned,  smoothstep(2.0, 3.0, s));
        c = mix(c, bridal,   smoothstep(3.0, 4.0, s));

        // Ornament arrives only in the last two stages, and stays quiet.
        float orn = smoothstep(2.4, 4.0, s);
        float lines = sin(p.x * 46.0 + p.y * 18.0) * sin(p.y * 38.0);
        c += vec3(0.85, 0.70, 0.40) * lines * 0.028 * orn;
        return c;
      }

      void main(){
        vec2 uv = vUv;
        vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);

        // Displacement: strongest mid-transition, resolved at each stage.
        float frac = fract(uStage);
        float turbulence = sin(frac * 3.14159);
        float n = fbm(p * 2.3 + uTime * 0.03);
        vec2 disp = vec2(n, fbm(p * 2.3 - 4.7)) * 0.045 * turbulence;
        disp += uMouse * 0.012;

        vec4 outCol;

        if (uHasTex > 0.5) {
          vec2 uvA = uv + disp;
          vec2 uvB = uv - disp;
          vec4 a = texture2D(uTexA, uvA);
          vec4 b = texture2D(uTexB, uvB);
          float edge = smoothstep(-0.25, 0.25, n * 0.6 + (uMix * 1.5 - 0.75));
          outCol = mix(a, b, edge);
        } else {
          // Procedural tonal study — light falling across form.
          vec2 sp = p + disp;
          float form = smoothstep(0.72, 0.02, length(sp * vec2(1.25, 0.92) - vec2(0.0, 0.03)));
          float key  = smoothstep(0.95, 0.05, length(sp - vec2(-0.18, 0.20)));
          float shade = clamp(form * 0.72 + key * 0.5 + fbm(sp * 3.0) * 0.16, 0.0, 1.0);
          shade = pow(shade, 1.25);
          outCol = vec4(stagePalette(uStage, shade, sp), 1.0);
        }

        // Grain, then vignette. Always in that order.
        outCol.rgb += (fbm(uv * 180.0 + uTime) ) * 0.018;
        outCol.rgb *= smoothstep(1.35, 0.35, length((uv - 0.5) * vec2(uAspect, 1.0) * 1.55));

        gl_FragColor = vec4(outCol.rgb, outCol.a * uOpacity);
        #include <colorspace_fragment>
      }
    `,
  });
}
