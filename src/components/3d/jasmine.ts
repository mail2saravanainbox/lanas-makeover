import * as THREE from "three";

/**
 * PROCEDURAL JASMINE
 *
 * One beautifully-made object rather than a hundred cheap particles (§10).
 * Built as real geometry — a cupped, tapered petal surface swept six times —
 * so it catches light like a flower instead of reading as a billboard sprite.
 *
 * ~1.4k triangles per bloom. No downloaded asset, no texture, no loader.
 */

/** A single cupped petal, generated from a parametric grid. */
function petalGeometry(segU = 14, segV = 22): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const point = (u: number, v: number): THREE.Vector3 => {
    // Outline: narrow at the base, widest at ~65%, rounded tip.
    const width = 0.34 * Math.sin(Math.pow(v, 0.62) * Math.PI) + 0.02;
    const x = (u - 0.5) * 2 * width;
    const y = v * 1.0;
    // Cup along the length, plus a lateral curl toward the edges.
    const curl = -0.30 * Math.pow(v, 1.7) + 0.34 * Math.pow((u - 0.5) * 2, 2) * v;
    // Slight twist so no two edges are parallel — kills the "CG" look.
    const twist = Math.sin(v * Math.PI) * (u - 0.5) * 0.1;
    return new THREE.Vector3(x, y, curl + twist);
  };

  const eps = 1e-3;
  for (let j = 0; j <= segV; j++) {
    const v = j / segV;
    for (let i = 0; i <= segU; i++) {
      const u = i / segU;
      const p = point(u, v);
      positions.push(p.x, p.y, p.z);
      uvs.push(u, v);

      const du = point(Math.min(1, u + eps), v).sub(point(Math.max(0, u - eps), v));
      const dv = point(u, Math.min(1, v + eps)).sub(point(u, Math.max(0, v - eps)));
      const n = new THREE.Vector3().crossVectors(du, dv).normalize();
      normals.push(n.x, n.y, n.z);
    }
  }

  const stride = segU + 1;
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * stride + i;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(indices);
  g.computeBoundingSphere();
  return g;
}

/**
 * A full bloom: six petals in two offset ranks, plus a small throat.
 * Returned as a Group so the caller can animate petals individually.
 */
export function createJasmineBloom(seed = 0): THREE.Group {
  const group = new THREE.Group();
  const petal = petalGeometry();

  const petalMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#f6f1e8"),
    roughness: 0.62,
    metalness: 0,
    sheen: 0.75,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color("#e0cdb2"),
    clearcoat: 0.14,
    clearcoatRoughness: 0.7,
    side: THREE.DoubleSide,
    flatShading: false,
  });

  const ranks = [
    { count: 6, tilt: 0.62, scale: 1.0, offset: 0 },
    { count: 6, tilt: 0.95, scale: 0.78, offset: Math.PI / 6 },
  ];

  ranks.forEach((rank, r) => {
    for (let i = 0; i < rank.count; i++) {
      const mesh = new THREE.Mesh(petal, petalMaterial);
      const a = (i / rank.count) * Math.PI * 2 + rank.offset + seed * 0.31;
      // Wobble so the bloom is never mechanically symmetrical.
      const wobble = Math.sin(a * 3.1 + seed) * 0.07;

      mesh.rotation.order = "YXZ";
      mesh.rotation.y = a;
      mesh.rotation.x = rank.tilt + wobble;
      mesh.rotation.z = wobble * 0.5;
      mesh.scale.setScalar(rank.scale * (0.94 + Math.sin(a * 2.3 + seed) * 0.06));
      mesh.position.y = r * -0.02;
      mesh.userData.baseTilt = mesh.rotation.x;
      mesh.userData.phase = a;
      group.add(mesh);
    }
  });

  // Throat — a small warm core so the centre isn't a hole.
  const throat = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 20, 14),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#e8d9b8"),
      roughness: 0.5,
      emissive: new THREE.Color("#5a4526"),
      emissiveIntensity: 0.35,
    }),
  );
  throat.position.y = 0.03;
  group.add(throat);

  return group;
}

/**
 * A JASMINE STRAND — the kunjalam-style string that runs down a jadai.
 *
 * Blooms and buds threaded along a gentle curve. This is the object the
 * opening sequence travels along: one flower at first, then the discovery that
 * it belongs to a strand, then the strand itself crossing the frame.
 *
 * Returned with the blooms in order so the caller can reveal them one by one.
 */
export function createJasmineStrand(count = 7): {
  group: THREE.Group;
  blooms: THREE.Group[];
  curve: THREE.CatmullRomCurve3;
} {
  const group = new THREE.Group();

  // A slack, hanging line — never a straight axis.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.4, 1.5, -1.2),
    new THREE.Vector3(-1.7, 0.35, -0.35),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(1.7, 0.22, -0.45),
    new THREE.Vector3(3.4, 1.25, -1.35),
  ]);

  // The thread itself — barely visible, but the eye needs it to read as a strand.
  const thread = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 96, 0.008, 6, false),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#6d6250"),
      roughness: 0.9,
      metalness: 0,
    }),
  );
  group.add(thread);

  const blooms: THREE.Group[] = [];

  for (let i = 0; i < count; i++) {
    // Centre bloom sits at t = 0.5 so the sequence opens on it.
    const t = count === 1 ? 0.5 : i / (count - 1);
    const bloom = createJasmineBloom(i * 1.7);
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);

    bloom.position.copy(point);
    // Blooms hang off the thread rather than sitting on it.
    bloom.position.y -= 0.06;
    bloom.rotation.z = Math.atan2(tangent.y, tangent.x) * 0.35;
    bloom.rotation.y = i * 0.9;

    // The centre bloom is the hero; the rest recede.
    const distanceFromCentre = Math.abs(t - 0.5) * 2;
    bloom.scale.setScalar(0.36 * (1 - distanceFromCentre * 0.34));

    bloom.userData.t = t;
    bloom.userData.index = i;
    blooms.push(bloom);
    group.add(bloom);
  }

  // A few closed buds for realism — a real strand is never all open flowers.
  const budGeometry = new THREE.CapsuleGeometry(0.022, 0.05, 4, 8);
  const budMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#eee8db"),
    roughness: 0.7,
  });
  for (let i = 0; i < count * 2; i++) {
    const t = (i + 0.5) / (count * 2);
    const bud = new THREE.Mesh(budGeometry, budMaterial);
    bud.position.copy(curve.getPointAt(t));
    bud.position.y -= 0.045;
    bud.rotation.z = Math.sin(i * 2.1) * 0.5;
    group.add(bud);
  }

  return { group, blooms, curve };
}

/** Frees the geometry/material a bloom owns. */
export function disposeBloom(group: THREE.Group): void {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const mat = mesh.material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat?.dispose();
  });
}
