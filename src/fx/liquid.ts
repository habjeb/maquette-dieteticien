export type Liquid = {
  draw: (time: number, amount: number, crop: [number, number, number, number]) => void;
  destroy: () => void;
};

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, aPos.y * 0.5 + 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform float uTime;
uniform float uAmt;
uniform vec4 uCrop;
varying vec2 vUv;
void main() {
  vec2 uv = mix(uCrop.xy, uCrop.zw, vUv);
  float wave = sin(uv.y * 11.0 + uTime * 4.2) * uAmt;
  float wave2 = sin(uv.y * 23.0 - uTime * 2.6) * uAmt * 0.4;
  uv.x += (wave + wave2) * 0.02;
  uv = clamp(uv, 0.001, 0.999);
  gl_FragColor = texture2D(uTex, uv);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createLiquid(canvas: HTMLCanvasElement, image: HTMLImageElement): Liquid | null {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const parent = canvas.parentElement;
  const boxW = parent?.clientWidth || window.innerWidth;
  const boxH = parent?.clientHeight || window.innerHeight;
  canvas.width = Math.max(2, Math.round(boxW * dpr));
  canvas.height = Math.max(2, Math.round(boxH * dpr));
  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true, antialias: false });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture();
  const source = document.createElement("canvas");
  source.width = image.naturalWidth || image.width;
  source.height = image.naturalHeight || image.height;
  const ctx = source.getContext("2d");
  if (!ctx || source.width === 0 || source.height === 0) return null;
  ctx.drawImage(image, 0, 0, source.width, source.height);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  } catch {
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    return null;
  }
  const uTime = gl.getUniformLocation(program, "uTime");
  const uAmt = gl.getUniformLocation(program, "uAmt");
  const uCrop = gl.getUniformLocation(program, "uCrop");
  gl.useProgram(program);
  gl.uniform1i(gl.getUniformLocation(program, "uTex"), 0);

  return {
    draw(time, amount, crop) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uAmt, amount);
      gl.uniform4f(uCrop, crop[0], crop[1], crop[2], crop[3]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    destroy() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
