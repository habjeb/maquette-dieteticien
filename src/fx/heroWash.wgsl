struct Params {
  time: f32,
  width: f32,
  height: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

fn hash(cell: vec2f) -> f32 {
  return fract(sin(dot(cell, vec2f(127.1, 311.7))) * 43758.5453);
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let ivory = vec3f(1.0, 0.99215686, 0.96078431);
  let sage = vec3f(0.8666667, 0.9019608, 0.8627451);
  let sand = vec3f(0.772549, 0.6470588, 0.4784314);
  let forest = vec3f(0.1411765, 0.2941177, 0.2588235);

  let t = params.time * 0.22;
  let drift = vec2f(sin(uv.y * 2.2 + t), cos(uv.x * 1.8 - t * 0.75)) * 0.16;
  let q = uv + drift;
  let wave = sin(q.x * 2.6 + t) * 0.5 + sin(q.y * 2.1 - t * 0.8) * 0.5;
  let along = smoothstep(-0.15, 0.95, wave * 0.5 + 0.42 + uv.x * 0.18 + (1.0 - uv.y) * 0.22);
  let calm = mix(0.62, 1.0, smoothstep(0.0, 0.8, uv.x));
  let fade = 1.0 - smoothstep(0.62, 1.0, uv.y);
  let amount = clamp(along * calm * fade, 0.0, 0.62);

  var color = mix(ivory, sage, amount);
  let warmth = sin(q.x * 1.7 + q.y * 1.1 - t * 0.6) * 0.5 + 0.5;
  color = mix(color, sand, warmth * amount * 0.08);
  color = mix(color, forest, amount * 0.05);

  let px = vec2f(floor(uv.x * max(params.width, 1.0)), floor(uv.y * max(params.height, 1.0)));
  color = clamp(color + vec3f(hash(px) - 0.5) * 0.03, vec3f(0.0), vec3f(1.0));
  return vec4f(color, 1.0);
}
