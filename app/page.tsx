"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MaterialKey =
  | "sand"
  | "water"
  | "oil"
  | "fire"
  | "smoke"
  | "steam"
  | "ice"
  | "snow"
  | "stone"
  | "wood"
  | "metal"
  | "glass"
  | "rubber"
  | "lava"
  | "acid"
  | "slime"
  | "plant"
  | "electricity"
  | "magnet"
  | "mud";

type ToolKey =
  | "brush"
  | "line"
  | "circle"
  | "rect"
  | "heat"
  | "freeze"
  | "wind"
  | "magnet"
  | "erase"
  | "fill";

type Cell = {
  id: MaterialKey;
  temp: number;
  charge: number;
  life: number;
  vx: number;
  vy: number;
};

type Material = {
  id: MaterialKey;
  name: string;
  color: string;
  glow: string;
  density: number;
  friction: number;
  elasticity: number;
  conductivity: number;
  viscosity: number;
  solid?: boolean;
  gas?: boolean;
  liquid?: boolean;
  powder?: boolean;
};

const WIDTH = 220;
const HEIGHT = 132;
const EMPTY = 0;
const SAVE_KEY = "physics-playground-worlds";

const materials: Material[] = [
  { id: "sand", name: "Sand", color: "#d8b16a", glow: "#ffc55a", density: 8, friction: 0.82, elasticity: 0.08, conductivity: 0.1, viscosity: 0.2, powder: true },
  { id: "water", name: "Water", color: "#47b7ff", glow: "#80d8ff", density: 3, friction: 0.08, elasticity: 0.18, conductivity: 0.8, viscosity: 0.2, liquid: true },
  { id: "oil", name: "Oil", color: "#b88b31", glow: "#ffc75f", density: 2, friction: 0.04, elasticity: 0.12, conductivity: 0.05, viscosity: 0.34, liquid: true },
  { id: "fire", name: "Fire", color: "#ff6b2a", glow: "#ffb03a", density: 1, friction: 0.01, elasticity: 0.4, conductivity: 0.05, viscosity: 0.05, gas: true },
  { id: "smoke", name: "Smoke", color: "#7e8798", glow: "#c5ccdc", density: 1, friction: 0.02, elasticity: 0.1, conductivity: 0.02, viscosity: 0.5, gas: true },
  { id: "steam", name: "Steam", color: "#b9f2ff", glow: "#d8fbff", density: 1, friction: 0.02, elasticity: 0.14, conductivity: 0.22, viscosity: 0.18, gas: true },
  { id: "ice", name: "Ice", color: "#a8e9ff", glow: "#ccf6ff", density: 4, friction: 0.02, elasticity: 0.18, conductivity: 0.3, viscosity: 0, solid: true },
  { id: "snow", name: "Snow", color: "#edf8ff", glow: "#ffffff", density: 5, friction: 0.55, elasticity: 0.03, conductivity: 0.08, viscosity: 0.12, powder: true },
  { id: "stone", name: "Stone", color: "#7c838d", glow: "#b6bdc7", density: 10, friction: 0.9, elasticity: 0.02, conductivity: 0.1, viscosity: 0, solid: true },
  { id: "wood", name: "Wood", color: "#9a5e34", glow: "#d69555", density: 7, friction: 0.74, elasticity: 0.1, conductivity: 0.03, viscosity: 0, solid: true },
  { id: "metal", name: "Metal", color: "#b6c4d0", glow: "#f0f7ff", density: 12, friction: 0.38, elasticity: 0.2, conductivity: 1, viscosity: 0, solid: true },
  { id: "glass", name: "Glass", color: "#93f3ff", glow: "#d6feff", density: 8, friction: 0.2, elasticity: 0.05, conductivity: 0.05, viscosity: 0, solid: true },
  { id: "rubber", name: "Rubber", color: "#34323c", glow: "#9f8cff", density: 6, friction: 0.95, elasticity: 0.8, conductivity: 0.01, viscosity: 0, solid: true },
  { id: "lava", name: "Lava", color: "#ff3d1f", glow: "#ffd166", density: 6, friction: 0.16, elasticity: 0.04, conductivity: 0.5, viscosity: 0.55, liquid: true },
  { id: "acid", name: "Acid", color: "#a4ff4a", glow: "#d8ff83", density: 3, friction: 0.06, elasticity: 0.08, conductivity: 0.4, viscosity: 0.25, liquid: true },
  { id: "slime", name: "Slime", color: "#4ee28a", glow: "#9dffba", density: 4, friction: 0.4, elasticity: 0.55, conductivity: 0.18, viscosity: 0.82, liquid: true },
  { id: "plant", name: "Plants", color: "#5bd66d", glow: "#b6ff8c", density: 5, friction: 0.5, elasticity: 0.08, conductivity: 0.18, viscosity: 0, solid: true },
  { id: "electricity", name: "Electric", color: "#a375ff", glow: "#ebd7ff", density: 1, friction: 0.01, elasticity: 0.3, conductivity: 1, viscosity: 0, gas: true },
  { id: "magnet", name: "Magnet", color: "#ff5e9d", glow: "#ffc0d9", density: 9, friction: 0.45, elasticity: 0.22, conductivity: 0.7, viscosity: 0, solid: true },
  { id: "mud", name: "Mud", color: "#7a5737", glow: "#bf8b55", density: 7, friction: 0.72, elasticity: 0.04, conductivity: 0.18, viscosity: 0.72, powder: true },
];

const materialById = Object.fromEntries(materials.map((item) => [item.id, item])) as Record<MaterialKey, Material>;
const materialIndex = Object.fromEntries(materials.map((item, index) => [item.id, index + 1])) as Record<MaterialKey, number>;
const materialIds = Object.fromEntries(materials.map((item, index) => [index + 1, item.id])) as Record<number, MaterialKey>;

const tools: Array<{ id: ToolKey; name: string; glyph: string }> = [
  { id: "brush", name: "Brush", glyph: "B" },
  { id: "line", name: "Line", glyph: "/" },
  { id: "circle", name: "Circle", glyph: "O" },
  { id: "rect", name: "Rectangle", glyph: "R" },
  { id: "heat", name: "Heat", glyph: "H" },
  { id: "freeze", name: "Freeze", glyph: "F" },
  { id: "wind", name: "Wind", glyph: "W" },
  { id: "magnet", name: "Magnet field", glyph: "M" },
  { id: "erase", name: "Delete", glyph: "X" },
  { id: "fill", name: "Fill bucket", glyph: "P" },
];

function makeCell(id: MaterialKey): Cell {
  const base = materialById[id];
  return {
    id,
    temp: id === "fire" ? 920 : id === "lava" ? 1200 : id === "ice" || id === "snow" ? -20 : 22,
    charge: id === "electricity" ? 1 : 0,
    life: id === "fire" ? 90 : id === "smoke" || id === "steam" ? 180 : id === "electricity" ? 28 : 9999,
    vx: (Math.random() - 0.5) * (base.gas ? 0.8 : 0.22),
    vy: base.gas ? -0.45 : 0,
  };
}

function cloneGrid(grid: Uint8Array) {
  return new Uint8Array(grid);
}

function indexOf(x: number, y: number) {
  return y * WIDTH + x;
}

function inBounds(x: number, y: number) {
  return x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT;
}

function heatColor(hex: string, heat: number) {
  if (heat <= 0.2) return hex;
  const raw = hex.replace("#", "");
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  const mix = Math.min(0.46, heat * 0.42);
  const nr = Math.round(r + (255 - r) * mix);
  const ng = Math.round(g + (240 - g) * mix);
  const nb = Math.round(b + (168 - b) * mix);
  return `rgb(${nr}, ${ng}, ${nb})`;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gridRef = useRef(new Uint8Array(WIDTH * HEIGHT));
  const dataRef = useRef<Array<Cell | null>>(Array(WIDTH * HEIGHT).fill(null));
  const historyRef = useRef<Array<Uint8Array<ArrayBuffer>>>([]);
  const redoRef = useRef<Array<Uint8Array<ArrayBuffer>>>([]);
  const drawingRef = useRef(false);
  const anchorRef = useRef<{ x: number; y: number } | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const cameraRef = useRef({ zoom: 3.5, x: 0, y: 0 });
  const statsRef = useRef({ fps: 60, count: 0, reactions: 0 });
  const [material, setMaterial] = useState<MaterialKey>("sand");
  const [tool, setTool] = useState<ToolKey>("brush");
  const [brush, setBrush] = useState(7);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [wind, setWind] = useState(0.12);
  const [gravity, setGravity] = useState(1);
  const [stats, setStats] = useState(statsRef.current);
  const [saveName, setSaveName] = useState("Aurora sandbox");
  const [savedWorlds, setSavedWorlds] = useState<Array<{ name: string; date: string; grid: number[] }>>([]);

  const selected = materialById[material];

  const pushHistory = useCallback(() => {
    historyRef.current = [...historyRef.current.slice(-24), cloneGrid(gridRef.current)];
    redoRef.current = [];
  }, []);

  const place = useCallback((x: number, y: number, id: MaterialKey | null) => {
    if (!inBounds(x, y)) return;
    const i = indexOf(x, y);
    gridRef.current[i] = id ? materialIndex[id] : EMPTY;
    dataRef.current[i] = id ? makeCell(id) : null;
  }, []);

  const paint = useCallback((cx: number, cy: number, radius: number, id: MaterialKey | null) => {
    const jitter = tool === "brush" ? 0.72 : 1;
    for (let y = cy - radius; y <= cy + radius; y += 1) {
      for (let x = cx - radius; x <= cx + radius; x += 1) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= radius * radius && Math.random() <= jitter) {
          place(x, y, id);
        }
      }
    }
  }, [place, tool]);

  const line = useCallback((from: { x: number; y: number }, to: { x: number; y: number }, radius: number, id: MaterialKey | null) => {
    const steps = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y), 1);
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      paint(Math.round(from.x + (to.x - from.x) * t), Math.round(from.y + (to.y - from.y) * t), radius, id);
    }
  }, [paint]);

  const canvasPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    return {
      x: Math.floor(px * WIDTH),
      y: Math.floor(py * HEIGHT),
    };
  }, []);

  const fillArea = useCallback((startX: number, startY: number, id: MaterialKey) => {
    if (!inBounds(startX, startY)) return;
    const target = gridRef.current[indexOf(startX, startY)];
    const replacement = materialIndex[id];
    if (target === replacement) return;
    const queue = [[startX, startY]];
    let filled = 0;
    while (queue.length && filled < 3500) {
      const [x, y] = queue.pop()!;
      if (!inBounds(x, y)) continue;
      const i = indexOf(x, y);
      if (gridRef.current[i] !== target) continue;
      gridRef.current[i] = replacement;
      dataRef.current[i] = makeCell(id);
      filled += 1;
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }, []);

  const applyTool = useCallback((point: { x: number; y: number }, final = false) => {
    if (tool === "heat" || tool === "freeze" || tool === "wind" || tool === "magnet") {
      for (let y = point.y - brush * 2; y <= point.y + brush * 2; y += 1) {
        for (let x = point.x - brush * 2; x <= point.x + brush * 2; x += 1) {
          if (!inBounds(x, y)) continue;
          const i = indexOf(x, y);
          const cell = dataRef.current[i];
          if (!cell) continue;
          if (tool === "heat") cell.temp += 24;
          if (tool === "freeze") cell.temp -= 24;
          if (tool === "wind") cell.vx += Math.sign(x - point.x || 1) * 0.4 + wind;
          if (tool === "magnet" && materialById[cell.id].conductivity > 0.45) {
            cell.vx += (point.x - x) * 0.015;
            cell.vy += (point.y - y) * 0.015;
            cell.charge = Math.min(1, cell.charge + 0.08);
          }
        }
      }
      return;
    }
    if (tool === "fill") {
      if (final) fillArea(point.x, point.y, material);
      return;
    }
    const id = tool === "erase" ? null : material;
    if (tool === "brush" || tool === "erase") paint(point.x, point.y, brush, id);
  }, [brush, fillArea, material, paint, tool, wind]);

  const drawShape = useCallback((to: { x: number; y: number }) => {
    const from = anchorRef.current;
    if (!from) return;
    const id = tool === "erase" ? null : material;
    if (tool === "line") line(from, to, Math.max(1, Math.floor(brush / 2)), id);
    if (tool === "circle") {
      const r = Math.round(Math.hypot(to.x - from.x, to.y - from.y));
      paint(from.x, from.y, Math.max(2, r), id);
    }
    if (tool === "rect") {
      const x0 = Math.min(from.x, to.x);
      const x1 = Math.max(from.x, to.x);
      const y0 = Math.min(from.y, to.y);
      const y1 = Math.max(from.y, to.y);
      for (let y = y0; y <= y1; y += 1) {
        for (let x = x0; x <= x1; x += 1) place(x, y, id);
      }
    }
  }, [brush, line, material, paint, place, tool]);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = canvasPoint(event);
    pushHistory();
    drawingRef.current = true;
    anchorRef.current = point;
    lastPointRef.current = point;
    applyTool(point, true);
  }, [applyTool, canvasPoint, pushHistory]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const point = canvasPoint(event);
    if (tool === "brush" || tool === "erase") {
      const last = lastPointRef.current ?? point;
      line(last, point, brush, tool === "erase" ? null : material);
    } else {
      applyTool(point);
    }
    lastPointRef.current = point;
  }, [applyTool, brush, canvasPoint, line, material, tool]);

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = canvasPoint(event);
    if (drawingRef.current && ["line", "circle", "rect"].includes(tool)) drawShape(point);
    drawingRef.current = false;
    anchorRef.current = null;
    lastPointRef.current = null;
  }, [canvasPoint, drawShape, tool]);

  const clearWorld = useCallback(() => {
    pushHistory();
    gridRef.current.fill(EMPTY);
    dataRef.current.fill(null);
  }, [pushHistory]);

  const undo = useCallback(() => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    redoRef.current.push(cloneGrid(gridRef.current));
    gridRef.current = previous;
    dataRef.current = Array.from(previous, (value) => value ? makeCell(materialIds[value]) : null);
  }, []);

  const redo = useCallback(() => {
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push(cloneGrid(gridRef.current));
    gridRef.current = next;
    dataRef.current = Array.from(next, (value) => value ? makeCell(materialIds[value]) : null);
  }, []);

  const saveWorld = useCallback(() => {
    const next = [
      {
        name: saveName.trim() || "Untitled world",
        date: new Date().toLocaleString(),
        grid: Array.from(gridRef.current),
      },
      ...savedWorlds,
    ].slice(0, 8);
    localStorage.setItem(SAVE_KEY, JSON.stringify(next));
    setSavedWorlds(next);
  }, [saveName, savedWorlds]);

  const loadWorld = useCallback((world: { grid: number[] }) => {
    pushHistory();
    gridRef.current = Uint8Array.from(world.grid);
    dataRef.current = Array.from(gridRef.current, (value) => value ? makeCell(materialIds[value]) : null);
  }, [pushHistory]);

  const exportImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "physics-playground.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const seedChallenge = useCallback((kind: string) => {
    pushHistory();
    gridRef.current.fill(EMPTY);
    dataRef.current.fill(null);
    if (kind === "bridge") {
      for (let x = 20; x < 70; x += 1) place(x, 94, "stone");
      for (let x = 150; x < 200; x += 1) place(x, 94, "stone");
      for (let x = 92; x < 128; x += 1) place(x, 30, "sand");
    }
    if (kind === "bulb") {
      for (let x = 30; x < 190; x += 1) place(x, 96, "metal");
      for (let y = 54; y < 96; y += 1) place(188, y, "metal");
      paint(28, 96, 8, "electricity");
      paint(188, 50, 10, "glass");
      paint(188, 50, 5, "fire");
    }
    if (kind === "rocket") {
      for (let y = 44; y < 82; y += 1) {
        place(108, y, "metal");
        place(109, y, "metal");
        place(110, y, "metal");
      }
      paint(109, 84, 7, "oil");
      paint(109, 94, 5, "fire");
    }
  }, [paint, place, pushHistory]);

  useEffect(() => {
    try {
      setSavedWorlds(JSON.parse(localStorage.getItem(SAVE_KEY) || "[]"));
    } catch {
      setSavedWorlds([]);
    }
    for (let x = 0; x < WIDTH; x += 1) {
      place(x, HEIGHT - 1, "stone");
    }
    for (let x = 24; x < 88; x += 1) place(x, 94, "glass");
    paint(52, 44, 12, "water");
    paint(112, 30, 8, "sand");
    paint(158, 42, 10, "lava");
    paint(172, 82, 11, "wood");
  }, [paint, place]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
        setPaused((value) => !value);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") undo();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") redo();
      if (event.key === "Escape") setTool("brush");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redo, undo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = WIDTH * 4 * dpr;
    canvas.height = HEIGHT * 4 * dpr;
    canvas.style.aspectRatio = `${WIDTH} / ${HEIGHT}`;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let last = performance.now();
    let frame = 0;

    const swap = (a: number, b: number) => {
      const grid = gridRef.current;
      const data = dataRef.current;
      const tv = grid[a];
      grid[a] = grid[b];
      grid[b] = tv;
      const td = data[a];
      data[a] = data[b];
      data[b] = td;
    };

    const transform = (i: number, id: MaterialKey | null) => {
      gridRef.current[i] = id ? materialIndex[id] : EMPTY;
      dataRef.current[i] = id ? makeCell(id) : null;
    };

    const react = (i: number, x: number, y: number, cell: Cell) => {
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (!inBounds(nx, ny)) continue;
        const ni = indexOf(nx, ny);
        const otherId = materialIds[gridRef.current[ni]];
        if (!otherId) continue;
        const other = dataRef.current[ni];
        if (other) {
          const transfer = (cell.temp - other.temp) * 0.018 * Math.max(materialById[cell.id].conductivity, materialById[other.id].conductivity);
          cell.temp -= transfer;
          other.temp += transfer;
        }
        if (cell.id === "water" && otherId === "sand") {
          transform(i, "mud");
          statsRef.current.reactions += 1;
        }
        if (cell.id === "fire" && otherId === "wood" && Math.random() < 0.08) {
          transform(ni, "fire");
          statsRef.current.reactions += 1;
        }
        if (cell.id === "fire" && otherId === "oil") {
          transform(ni, "fire");
          paint(nx, ny, 4, "smoke");
          statsRef.current.reactions += 1;
        }
        if ((cell.id === "water" && otherId === "fire") || (cell.id === "fire" && otherId === "water")) {
          transform(i, "steam");
          transform(ni, "steam");
          statsRef.current.reactions += 1;
        }
        if ((cell.id === "lava" && otherId === "water") || (cell.id === "water" && otherId === "lava")) {
          transform(i, "stone");
          transform(ni, "steam");
          statsRef.current.reactions += 1;
        }
        if (cell.id === "acid" && ["metal", "stone", "glass"].includes(otherId) && Math.random() < 0.04) {
          transform(ni, Math.random() < 0.45 ? "smoke" : null);
          statsRef.current.reactions += 1;
        }
        if (cell.id === "fire" && otherId === "ice") transform(ni, "water");
        if (cell.id === "plant" && otherId === "water" && y > 4 && Math.random() < 0.012) transform(indexOf(x, y - 1), "plant");
        if (cell.id === "electricity" && materialById[otherId].conductivity > 0.35 && other) {
          other.charge = 1;
          if (otherId === "water" && Math.random() < 0.18) transform(ni, "steam");
        }
      }
      if ((cell.id === "ice" || cell.id === "snow") && cell.temp > 2) transform(i, "water");
      if (cell.id === "water" && cell.temp > 110) transform(i, "steam");
      if (cell.id === "steam" && cell.temp < 55 && Math.random() < 0.04) transform(i, "water");
      if (cell.id === "wood" && cell.temp > 310) transform(i, "fire");
      if (cell.id === "oil" && cell.temp > 250) transform(i, "fire");
    };

    const stepCell = (x: number, y: number) => {
      const i = indexOf(x, y);
      const value = gridRef.current[i];
      if (!value) return;
      const id = materialIds[value];
      const cell = dataRef.current[i] ?? makeCell(id);
      dataRef.current[i] = cell;
      const meta = materialById[id];
      react(i, x, y, cell);
      if (gridRef.current[i] === EMPTY || gridRef.current[i] !== value) return;

      cell.life -= meta.gas || id === "fire" || id === "electricity" ? 1 : 0;
      cell.vx *= 0.96;
      cell.vy *= 0.96;
      cell.vx += wind * (meta.gas ? 0.08 : 0.012);
      if (id === "electricity") cell.vx += (Math.random() - 0.5) * 1.4;

      if (cell.life <= 0) {
        transform(i, id === "fire" ? "smoke" : null);
        return;
      }

      if (meta.solid && id !== "electricity") return;

      const down = indexOf(x, Math.min(HEIGHT - 1, y + 1));
      const up = indexOf(x, Math.max(0, y - 1));
      const dir = Math.random() < 0.5 ? -1 : 1;
      const sideA = inBounds(x + dir, y) ? indexOf(x + dir, y) : i;
      const sideB = inBounds(x - dir, y) ? indexOf(x - dir, y) : i;
      const diagA = inBounds(x + dir, y + 1) ? indexOf(x + dir, y + 1) : i;
      const diagB = inBounds(x - dir, y + 1) ? indexOf(x - dir, y + 1) : i;
      const upA = inBounds(x + dir, y - 1) ? indexOf(x + dir, y - 1) : i;

      const canMoveInto = (target: number) => {
        const targetValue = gridRef.current[target];
        if (!targetValue) return true;
        const targetMeta = materialById[materialIds[targetValue]];
        return !meta.gas && meta.density > targetMeta.density && !targetMeta.solid;
      };

      if (meta.gas) {
        if (canMoveInto(up)) swap(i, up);
        else if (canMoveInto(upA)) swap(i, upA);
        else if (canMoveInto(sideA)) swap(i, sideA);
        return;
      }

      const gravityGate = gravity >= 1 || Math.random() < gravity;
      if (gravityGate && (meta.powder || meta.liquid) && canMoveInto(down)) {
        swap(i, down);
        return;
      }
      if (gravityGate && meta.powder && canMoveInto(diagA)) {
        swap(i, diagA);
        return;
      }
      if (gravityGate && meta.powder && canMoveInto(diagB)) {
        swap(i, diagB);
        return;
      }
      if (meta.liquid) {
        const drift = Math.abs(cell.vx) > 0.5 ? Math.sign(cell.vx) : dir;
        const side = inBounds(x + drift, y) ? indexOf(x + drift, y) : sideA;
        if (canMoveInto(side)) swap(i, side);
        else if (canMoveInto(sideB)) swap(i, sideB);
      }
    };

    const simulate = () => {
      const passes = Math.max(1, Math.round(speed));
      for (let pass = 0; pass < passes; pass += 1) {
        for (let y = HEIGHT - 2; y >= 1; y -= 1) {
          const leftToRight = (y + frame) % 2 === 0;
          for (let c = 0; c < WIDTH; c += 1) {
            const x = leftToRight ? c : WIDTH - 1 - c;
            stepCell(x, y);
          }
        }
      }
    };

    const render = (now: number) => {
      const dt = now - last;
      last = now;
      frame += 1;
      if (!paused) simulate();

      const pixel = 4;
      const width = WIDTH * pixel;
      const height = HEIGHT * pixel;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#080b12");
      gradient.addColorStop(0.5, "#111827");
      gradient.addColorStop(1, "#06070b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      let count = 0;
      for (let y = 0; y < HEIGHT; y += 1) {
        for (let x = 0; x < WIDTH; x += 1) {
          const value = gridRef.current[indexOf(x, y)];
          if (!value) continue;
          count += 1;
          const id = materialIds[value];
          const meta = materialById[id];
          const cell = dataRef.current[indexOf(x, y)];
          const heat = Math.max(0, Math.min(1, ((cell?.temp ?? 20) - 40) / 600));
          ctx.fillStyle = heatColor(meta.color, heat);
          ctx.globalAlpha = meta.gas ? 0.42 : id === "glass" || id === "ice" ? 0.72 : 0.95;
          ctx.fillRect(x * pixel, y * pixel, pixel, pixel);
          if (id === "fire" || id === "electricity" || id === "lava") {
            ctx.globalAlpha = 0.16;
            ctx.fillStyle = meta.glow;
            ctx.fillRect(x * pixel - pixel, y * pixel - pixel, pixel * 3, pixel * 3);
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(255,255,255,.055)";
      ctx.lineWidth = 1;
      for (let x = 0; x < WIDTH; x += 12) {
        ctx.beginPath();
        ctx.moveTo(x * pixel, 0);
        ctx.lineTo(x * pixel, height);
        ctx.stroke();
      }

      statsRef.current = {
        fps: Math.round(1000 / Math.max(dt, 1)),
        count,
        reactions: statsRef.current.reactions,
      };
      if (frame % 12 === 0) setStats({ ...statsRef.current });
      cameraRef.current.zoom = pixel;
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [gravity, paint, paused, speed, wind]);

  const propertyRows = useMemo(() => [
    ["Density", selected.density],
    ["Friction", selected.friction],
    ["Elasticity", selected.elasticity],
    ["Conductivity", selected.conductivity],
    ["Viscosity", selected.viscosity],
  ], [selected]);

  return (
    <main className="playground-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar glass">
        <div>
          <p className="eyebrow">Physics Playground</p>
          <h1>Material sandbox</h1>
        </div>
        <div className="transport" aria-label="Simulation controls">
          <button className="glass-button primary" onClick={() => setPaused((value) => !value)}>{paused ? "Play" : "Pause"}</button>
          <button className="glass-button" onClick={() => setSpeed((value) => value === 0.5 ? 1 : value === 1 ? 2 : 0.5)}>Speed {speed}x</button>
          <button className="glass-button" onClick={undo}>Undo</button>
          <button className="glass-button" onClick={redo}>Redo</button>
          <button className="glass-button danger" onClick={clearWorld}>Reset</button>
        </div>
      </header>

      <section className="stage-grid">
        <aside className="left-toolbar glass" aria-label="Tools">
          {tools.map((item) => (
            <button
              key={item.id}
              className={`tool-button ${tool === item.id ? "active" : ""}`}
              title={item.name}
              aria-label={item.name}
              onClick={() => setTool(item.id)}
            >
              <span>{item.glyph}</span>
            </button>
          ))}
        </aside>

        <section className="canvas-wrap glass">
          <canvas
            ref={canvasRef}
            className="world-canvas"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-label="Interactive physics canvas"
          />
          <div className="minimap">
            <span />
          </div>
          <div className="canvas-hud">
            <span>{tool}</span>
            <span>{selected.name}</span>
            <span>{brush}px</span>
          </div>
        </section>

        <aside className="right-panel glass">
          <div className="panel-section">
            <div className="section-title">
              <span>Materials</span>
              <b style={{ background: selected.glow }} />
            </div>
            <div className="material-grid">
              {materials.map((item) => (
                <button
                  key={item.id}
                  className={`material-chip ${material === item.id ? "active" : ""}`}
                  onClick={() => setMaterial(item.id)}
                  style={{ "--chip": item.color, "--glow": item.glow } as React.CSSProperties}
                >
                  <span />
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section controls">
            <label>
              <span>Brush</span>
              <input type="range" min="1" max="18" value={brush} onChange={(event) => setBrush(Number(event.target.value))} />
            </label>
            <label>
              <span>Wind</span>
              <input type="range" min="-1" max="1" step="0.02" value={wind} onChange={(event) => setWind(Number(event.target.value))} />
            </label>
            <label>
              <span>Gravity</span>
              <input type="range" min="0" max="2" step="0.05" value={gravity} onChange={(event) => setGravity(Number(event.target.value))} />
            </label>
          </div>

          <div className="panel-section properties">
            <div className="section-title"><span>{selected.name} properties</span></div>
            {propertyRows.map(([label, value]) => (
              <div className="meter" key={label}>
                <span>{label}</span>
                <i><b style={{ width: `${Number(value) * 8.3}%` }} /></i>
              </div>
            ))}
          </div>

          <div className="panel-section saves">
            <div className="section-title"><span>Worlds</span></div>
            <div className="save-row">
              <input value={saveName} onChange={(event) => setSaveName(event.target.value)} aria-label="World name" />
              <button className="glass-button primary" onClick={saveWorld}>Save</button>
            </div>
            <div className="world-list">
              {savedWorlds.length === 0 ? <p>No saved worlds yet.</p> : savedWorlds.map((world) => (
                <button key={`${world.name}-${world.date}`} onClick={() => loadWorld(world)}>
                  <span>{world.name}</span>
                  <small>{world.date}</small>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <footer className="bottombar glass">
        <div className="stat"><span>FPS</span><b>{stats.fps}</b></div>
        <div className="stat"><span>Particles</span><b>{stats.count.toLocaleString()}</b></div>
        <div className="stat"><span>Reactions</span><b>{stats.reactions.toLocaleString()}</b></div>
        <div className="stat"><span>Tool</span><b>{tool}</b></div>
        <div className="challenge-strip">
          <button onClick={() => seedChallenge("bridge")}>Bridge</button>
          <button onClick={() => seedChallenge("bulb")}>Power bulb</button>
          <button onClick={() => seedChallenge("rocket")}>Launch rocket</button>
          <button onClick={exportImage}>Export image</button>
        </div>
      </footer>
    </main>
  );
}
