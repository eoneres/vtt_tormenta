'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { useTableStore } from '@/lib/store/table.store';
import type { RoomToken, RoomMapState } from '@/lib/colyseus/game-room-client';
import { COMMANDS } from '../../../lib/colyseus/commands';
import { LightingRenderer } from './lighting-renderer';
import { FogOfWarRenderer } from './fog-renderer';
import { MeasurementTool } from './measurement-tool';

const GRID_COLOR = 0x2a2d3a;
const GRID_ALPHA = 0.6;
const FOG_COLOR = 0x000000;
const FOG_ALPHA = 0.85;
const TOKEN_SELECTED_TINT = 0x7c3aed;
const GRID_SIZE_PX = 70;
const CELL_REAL_M = 1.5; // Tormenta20: 1 square = 1.5m

interface TokenSprite extends PIXI.Container {
  tokenId: string;
  isDragging: boolean;
  dragStart: { x: number; y: number };
  originalPos: { x: number; y: number };
}

export function VttCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const layersRef = useRef<{
    background: PIXI.Container;
    grid: PIXI.Graphics;
    tokens: PIXI.Container;
    fog: PIXI.Graphics;
    ui: PIXI.Container;
  } | null>(null);
  const tokenSpritesRef = useRef<Map<string, TokenSprite>>(new Map());

  // ─── Fase 02: Advanced renderers ──────────────────────────────────────────
  const lightingRendererRef = useRef<LightingRenderer | null>(null);
  const fogRendererRef = useRef<FogOfWarRenderer | null>(null);
  const measurementToolRef = useRef<MeasurementTool | null>(null);

  const { roomState, client, selectedTokenId, selectToken, toolMode, showFog } = useTableStore();

  // ─── Init PixiJS ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const app = new PIXI.Application({
      resizeTo: canvasRef.current,
      backgroundColor: 0x0f1117,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    canvasRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    const background = new PIXI.Container();
    const grid = new PIXI.Graphics();
    const tokens = new PIXI.Container();
    const fog = new PIXI.Graphics();
    const ui = new PIXI.Container();

    app.stage.addChild(background, grid, tokens, fog, ui);
    layersRef.current = { background, grid, tokens, fog, ui };

    // ─── Fase 02: Initialize advanced renderers ──────────────────────────
    const lightingRenderer = new LightingRenderer();
    lightingRendererRef.current = lightingRenderer;

    const fogRenderer = new FogOfWarRenderer();
    fogRendererRef.current = fogRenderer;

    const measureTool = new MeasurementTool({
      gridSize: GRID_SIZE_PX,
      cellRealSize: CELL_REAL_M,
      lineColor: 0x7c3aed,
      fillColor: 0x7c3aed,
    });
    measurementToolRef.current = measureTool;

    // Insert lighting and advanced fog between fog layer and ui
    app.stage.addChildAt(lightingRenderer.getContainer(), app.stage.getChildIndex(fog));
    app.stage.addChildAt(fogRenderer.getContainer(), app.stage.getChildIndex(fog) + 1);
    app.stage.addChild(measureTool.getContainer());

    // Viewport pan with middle mouse / right click
    let isPanning = false;
    let panStart = { x: 0, y: 0 };
    let stageStart = { x: 0, y: 0 };

    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;

    app.stage.on('rightdown', (e: PIXI.FederatedPointerEvent) => {
      isPanning = true;
      panStart = { x: e.globalX, y: e.globalY };
      stageStart = { x: app.stage.x, y: app.stage.y };
    });

    app.stage.on('pointermove', (e: PIXI.FederatedPointerEvent) => {
      if (isPanning) {
        app.stage.x = stageStart.x + (e.globalX - panStart.x);
        app.stage.y = stageStart.y + (e.globalY - panStart.y);
      }
      // Forward to measurement tool when in measure mode
      if (measurementToolRef.current && measurementToolRef.current.getMode() !== 'none') {
        const local = app.stage.toLocal({ x: e.globalX, y: e.globalY });
        measurementToolRef.current.updateMeasure(local.x, local.y);
      }
    });

    app.stage.on('rightup', () => { isPanning = false; });
    app.stage.on('rightupoutside', () => { isPanning = false; });

    // Measurement tool: left click start/end
    app.stage.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
      if (e.button !== 0) return;
      if (!measurementToolRef.current) return;
      if (measurementToolRef.current.getMode() === 'none') return;
      const local = app.stage.toLocal({ x: e.globalX, y: e.globalY });
      measurementToolRef.current.startMeasure(local.x, local.y);
    });

    app.stage.on('pointerup', (e: PIXI.FederatedPointerEvent) => {
      if (e.button !== 0) return;
      measurementToolRef.current?.endMeasure();
    });
    app.stage.on('rightupoutside', () => { isPanning = false; });

    // Zoom with wheel
    (app.view as HTMLCanvasElement).addEventListener('wheel', (e) => {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.2, Math.min(3, app.stage.scale.x * scaleFactor));
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;
      app.stage.x = mouseX - (mouseX - app.stage.x) * (newScale / app.stage.scale.x);
      app.stage.y = mouseY - (mouseY - app.stage.y) * (newScale / app.stage.scale.y);
      app.stage.scale.set(newScale);
    }, { passive: false });

    return () => {
      app.destroy(true, { children: true });
      lightingRendererRef.current?.destroy();
      lightingRendererRef.current = null;
      fogRendererRef.current?.destroy();
      fogRendererRef.current = null;
      appRef.current = null;
      layersRef.current = null;
      tokenSpritesRef.current.clear();
    };
  }, []);

  // ─── Render map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!layersRef.current || !roomState?.map.id) return;
    const { background, grid } = layersRef.current;
    const map = roomState.map;

    background.removeChildren();

    // Map image
    const sprite = PIXI.Sprite.from(map.imageUrl);
    sprite.width = map.width;
    sprite.height = map.height;
    background.addChild(sprite);

    // Grid
    drawGrid(grid, map);
  }, [roomState?.map.id, roomState?.map.imageUrl]);

  // ─── Render tokens ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!layersRef.current || !roomState) return;
    const { tokens: tokenLayer } = layersRef.current;
    const map = roomState.map;

    const currentIds = new Set(roomState.tokens.keys());

    // Remove stale sprites
    for (const [id, sprite] of tokenSpritesRef.current) {
      if (!currentIds.has(id)) {
        tokenLayer.removeChild(sprite);
        tokenSpritesRef.current.delete(id);
      }
    }

    // Add / update
    for (const [id, token] of roomState.tokens) {
      let sprite = tokenSpritesRef.current.get(id);

      if (!sprite) {
        sprite = createTokenSprite(token, map.gridSize);
        tokenLayer.addChild(sprite);
        tokenSpritesRef.current.set(id, sprite);
        attachTokenEvents(sprite, token, map.gridSize);
      }

      // Update position
      sprite.x = token.position.x;
      sprite.y = token.position.y;

      // Selection tint
      const circle = sprite.getChildAt(0) as PIXI.Graphics;
      circle.tint = id === selectedTokenId ? TOKEN_SELECTED_TINT : 0xffffff;

      // HP bar
      updateHpBar(sprite, token, map.gridSize);
    }
  }, [roomState?.tokens, selectedTokenId]);

  // ─── Render fog + lighting (Fase 02 advanced) ────────────────────────────────
  useEffect(() => {
    if (!layersRef.current || !roomState || !appRef.current) return;
    const { fog } = layersRef.current;
    const map = roomState.map;

    // ── Legacy simple fog (fallback when advanced renderers not ready) ──
    fog.clear();
    if (showFog && !fogRendererRef.current) {
      fog.beginFill(FOG_COLOR, FOG_ALPHA);
      fog.drawRect(0, 0, map.width, map.height);
      fog.endFill();
      fog.beginHole();
      for (const area of roomState.fog.revealedAreas) {
        const polygon = JSON.parse(area.polygon) as Array<{ x: number; y: number }>;
        if (polygon.length < 3) continue;
        fog.moveTo(polygon[0]!.x, polygon[0]!.y);
        for (let i = 1; i < polygon.length; i++) fog.lineTo(polygon[i]!.x, polygon[i]!.y);
        fog.closePath();
      }
      fog.endHole();
    }

    // ── Advanced FogOfWarRenderer (Fase 02) ──
    if (fogRendererRef.current && appRef.current && showFog) {
      const cols = Math.ceil(map.width / GRID_SIZE_PX);
      const rows = Math.ceil(map.height / GRID_SIZE_PX);
      // Re-init only on map change
      fogRendererRef.current.init(cols, rows, GRID_SIZE_PX, appRef.current);

      // Reveal circles around player tokens
      const playerTokens = Object.values(roomState.tokens).filter((t) => t.isPlayerToken);
      for (const token of playerTokens) {
        const visionPx = (token.visionRadius ?? 9) / CELL_REAL_M * GRID_SIZE_PX;
        fogRendererRef.current.revealCircle(token.x, token.y, visionPx);
      }
      fogRendererRef.current.setVisible(showFog);
    } else {
      fogRendererRef.current?.setVisible(false);
    }

    // ── Advanced LightingRenderer (Fase 02) ──
    if (lightingRendererRef.current && roomState.lights) {
      lightingRendererRef.current.setMapSize(map.width, map.height);
      const walls = (roomState.walls ?? []).filter((w: { blocksLight: boolean }) => w.blocksLight);
      // The scene result would come from vtt-engine-service in prod
      // For now, render ambient darkness with light sources from room state
      lightingRendererRef.current.render(
        { lightResults: [], ambientColor: { r: 0, g: 0, b: 0, a: 0 }, computeTimeMs: 0 },
        roomState.ambientLight ?? 0.88,
      );
    }
  }, [roomState?.fog, roomState?.tokens, roomState?.lights, showFog]);

  // ─── Sync toolMode with MeasurementTool ───────────────────────────────────
  useEffect(() => {
    if (!measurementToolRef.current) return;
    if (toolMode === 'measure') {
      measurementToolRef.current.setMode('line');
    } else if (toolMode === 'measure_circle') {
      measurementToolRef.current.setMode('circle');
    } else if (toolMode === 'measure_cone') {
      measurementToolRef.current.setMode('cone');
    } else {
      measurementToolRef.current.setMode('none');
    }
  }, [toolMode]);

  // ─── Token event handlers ───────────────────────────────────────────────────
  const attachTokenEvents = useCallback(
    (sprite: TokenSprite, token: RoomToken, gridSize: number) => {
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';

      sprite.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
        if (e.button !== 0) return;
        selectToken(token.id);

        if (toolMode !== 'select') return;
        sprite.isDragging = true;
        sprite.dragStart = { x: e.globalX, y: e.globalY };
        sprite.originalPos = { x: sprite.x, y: sprite.y };
        sprite.zIndex = 999;
      });

      sprite.on('pointermove', (e: PIXI.FederatedPointerEvent) => {
        if (!sprite.isDragging) return;
        const stage = appRef.current!.stage;
        const scale = stage.scale.x;
        sprite.x = sprite.originalPos.x + (e.globalX - sprite.dragStart.x) / scale;
        sprite.y = sprite.originalPos.y + (e.globalY - sprite.dragStart.y) / scale;
      });

      sprite.on('pointerup', () => {
        if (!sprite.isDragging) return;
        sprite.isDragging = false;
        sprite.zIndex = 0;

        // Snap to grid and send to server
        const snappedX = Math.round(sprite.x / gridSize) * gridSize;
        const snappedY = Math.round(sprite.y / gridSize) * gridSize;
        sprite.x = snappedX;
        sprite.y = snappedY;

        client?.send({
          type: COMMANDS.MOVE_TOKEN,
          tokenId: token.id,
          x: snappedX,
          y: snappedY,
        });
      });

      sprite.on('pointerupoutside', () => {
        if (!sprite.isDragging) return;
        sprite.isDragging = false;
        sprite.x = sprite.originalPos.x;
        sprite.y = sprite.originalPos.y;
      });
    },
    [client, selectToken, toolMode],
  );

  return (
    <div
      ref={canvasRef}
      className="w-full h-full overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function drawGrid(g: PIXI.Graphics, map: RoomMapState): void {
  g.clear();
  g.lineStyle(1, GRID_COLOR, GRID_ALPHA);

  for (let x = 0; x <= map.width; x += map.gridSize) {
    g.moveTo(x, 0);
    g.lineTo(x, map.height);
  }
  for (let y = 0; y <= map.height; y += map.gridSize) {
    g.moveTo(0, y);
    g.lineTo(map.width, y);
  }
}

function createTokenSprite(token: RoomToken, gridSize: number): TokenSprite {
  const container = new PIXI.Container() as TokenSprite;
  container.tokenId = token.id;
  container.isDragging = false;
  container.dragStart = { x: 0, y: 0 };
  container.originalPos = { x: 0, y: 0 };
  container.sortableChildren = true;

  const size = gridSize * token.size;

  // Circle background
  const circle = new PIXI.Graphics();
  circle.beginFill(0x1a1d27);
  circle.lineStyle(2, 0x7c3aed);
  circle.drawCircle(size / 2, size / 2, size / 2 - 2);
  circle.endFill();
  circle.zIndex = 0;
  container.addChild(circle);

  // Token image
  const sprite = PIXI.Sprite.from(token.imageUrl || '/token-default.png');
  sprite.width = size - 4;
  sprite.height = size - 4;
  sprite.x = 2;
  sprite.y = 2;
  sprite.mask = circle;
  sprite.zIndex = 1;
  container.addChild(sprite);

  // Name label
  const label = new PIXI.Text(token.name, {
    fontSize: 10,
    fill: 0xe2e8f0,
    align: 'center',
    dropShadow: true,
    dropShadowDistance: 1,
    dropShadowColor: 0x000000,
  });
  label.anchor.set(0.5, 0);
  label.x = size / 2;
  label.y = size + 2;
  label.zIndex = 2;
  container.addChild(label);

  // HP bar placeholder (updated separately)
  const hpBar = new PIXI.Graphics();
  hpBar.name = 'hpBar';
  hpBar.zIndex = 3;
  container.addChild(hpBar);

  return container;
}

function updateHpBar(sprite: TokenSprite, token: RoomToken, gridSize: number): void {
  const hpBar = sprite.getChildByName('hpBar') as PIXI.Graphics;
  if (!hpBar) return;
  hpBar.clear();

  if (!token.maxHp || token.maxHp <= 0) return;

  const size = gridSize * token.size;
  const barW = size - 4;
  const barH = 4;
  const barY = size - 6;
  const ratio = Math.max(0, Math.min(1, token.hp / token.maxHp));

  // Background
  hpBar.beginFill(0x1a1d27);
  hpBar.drawRect(2, barY, barW, barH);
  hpBar.endFill();

  // Fill
  const color = ratio > 0.5 ? 0x22c55e : ratio > 0.25 ? 0xf59e0b : 0xef4444;
  hpBar.beginFill(color);
  hpBar.drawRect(2, barY, barW * ratio, barH);
  hpBar.endFill();
}
