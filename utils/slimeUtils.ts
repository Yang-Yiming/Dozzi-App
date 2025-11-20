
import { SlimePoint, VisualParams } from '../types';

// --- Constants ---
const MOSAIC_SIZE = 6; // Slightly smaller than Python's 8 for better detail on web
const FEATURE_PROBABILITIES = {
  spots: 0.4,
  rainbowEdge: 0.2,
  flowers: 0.35
};

// --- Helpers ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;
const randomColor = (): [number, number, number] => [randomInt(0, 255), randomInt(0, 255), randomInt(0, 255)];

const colorToString = (rgb: [number, number, number], alpha = 1) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;

// --- Generation Logic ---

const generateSlimeShape = (baseRadius: number, complexity: number): SlimePoint[] => {
  const points: SlimePoint[] = [];
  const numPoints = randomInt(8, 12) + complexity;
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const radiusVariation = 0.5 + Math.random() * 0.8;
    const radius = baseRadius * radiusVariation;

    const verticalPosition = Math.sin(angle);
    let weight = 0.2 + (verticalPosition + 1) * 0.4;
    const finalWeight = Math.abs(verticalPosition) < 0.3 ? 0.6 : weight;

    points.push({
      angle: angle,
      baseRadius: radius,
      originalAngle: angle,
      weight: finalWeight
    });
  }
  return points;
};

const generateColorLayers = (baseColor: [number, number, number], isNightmare: boolean = false): [number, number, number][] => {
  const [r, g, b] = baseColor;
  
  if (isNightmare) {
      // For nightmares, we actually lighten the inner layers to create a glowing core effect or just contrast
      // Or we darken them further. Let's darken for a shadow blob look.
      const d1 = 20;
      const d2 = 40;
       return [
        baseColor,
        [Math.max(0, r - d1), Math.max(0, g - d1), Math.max(0, b - d1)],
        [Math.max(0, r - d2), Math.max(0, g - d2), Math.max(0, b - d2)]
      ];
  }

  const darkening1 = randomInt(30, 60);
  const darkening2 = randomInt(60, 90);
  return [
    baseColor,
    [Math.max(0, r - darkening1), Math.max(0, g - darkening1), Math.max(0, b - darkening1)],
    [Math.max(0, r - darkening2), Math.max(0, g - darkening2), Math.max(0, b - darkening2)]
  ];
};

const generateRandomFeatures = (isNightmare: boolean = false): string[] => {
  const features: string[] = [];
  
  if (isNightmare) {
      // Nightmares mostly get spots (like warts or glowing pores)
      if (Math.random() < 0.8) features.push('spots');
      // Rarely rainbow
      if (Math.random() < 0.1) features.push('rainbowEdge');
      return features;
  }

  if (Math.random() < FEATURE_PROBABILITIES.spots) features.push('spots');
  if (Math.random() < FEATURE_PROBABILITIES.rainbowEdge) features.push('rainbowEdge');
  if (Math.random() < FEATURE_PROBABILITIES.flowers) features.push('flowers');
  return features;
};

export const generateVisualParams = (baseRadius: number = 100, providedColor?: [number, number, number], isNightmare: boolean = false): VisualParams => {
  const complexity = randomInt(0, 4) + (isNightmare ? 2 : 0); // Nightmares are a bit more wobbly
  
  let baseColor = providedColor;
  if (!baseColor) {
      if (isNightmare) {
          // Cute Nightmare Colors: Dark but saturated
          const nightmarePalettes: [number, number, number][] = [
              [45, 20, 45],   // Dark Plum
              [20, 25, 60],   // Deep Blue
              [40, 40, 40],   // Charcoal
              [60, 10, 10],   // Deep Red
              [10, 40, 20],   // Dark Slime Green
          ];
          baseColor = nightmarePalettes[Math.floor(Math.random() * nightmarePalettes.length)];
      } else {
          baseColor = randomColor();
      }
  }

  const features = generateRandomFeatures(isNightmare);

  const params: VisualParams = {
    baseRadius,
    baseColor,
    colors: generateColorLayers(baseColor, isNightmare),
    points: generateSlimeShape(baseRadius, complexity),
    features,
    eyeOffset: {
      x: (Math.random() - 0.5) * baseRadius * 0.3,
      y: (Math.random() - 0.5) * baseRadius * 0.3
    },
    eyeColors: isNightmare ? {
        sclera: '#FFFFE0', // Light Yellow
        pupil: '#FF4500',  // Orange Red
    } : undefined
  };

  if (features.includes('spots')) {
    const count = randomInt(5, 15);
    const spots = [];
    for (let i = 0; i < count; i++) {
      spots.push({
        angle: Math.PI / 2 + (Math.random() - 0.5) * Math.PI,
        dist: baseRadius * (0.3 + Math.random() * 0.6),
        size: Math.random() * (baseRadius * 0.18) + baseRadius * 0.08,
      });
    }
    
    // Nightmares get contrasting/glowing spots
    const spotColor: [number, number, number] = isNightmare 
        ? [randomInt(100, 255), randomInt(100, 255), randomInt(100, 255)] // Bright spots
        : randomColor();

    params.spotParams = { count, spots, spotColor };
  }

  if (features.includes('flowers')) {
    const count = randomInt(3, 6);
    const flowers = [];
    for (let i = 0; i < count; i++) {
      flowers.push({
        idealAngle: -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8,
        size: Math.random() * (baseRadius * 0.1) + baseRadius * 0.05,
        color: randomColor(),
      });
    }
    params.flowerParams = { count, flowers };
  }

  return params;
};

// --- Rendering Logic ---

// Quadratic Bezier Interpolation for smooth blob shapes
const drawSmoothShape = (ctx: CanvasRenderingContext2D, points: { x: number, y: number }[], color: string) => {
  if (points.length < 3) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  
  // Move to the midpoint between the last and first points
  const len = points.length;
  const p0 = points[len - 1];
  const p1 = points[0];
  const midX = (p0.x + p1.x) / 2;
  const midY = (p0.y + p1.y) / 2;
  ctx.moveTo(midX, midY);

  for (let i = 0; i < len; i++) {
    const pCurrent = points[i];
    const pNext = points[(i + 1) % len];
    const nextMidX = (pCurrent.x + pNext.x) / 2;
    const nextMidY = (pCurrent.y + pNext.y) / 2;
    
    ctx.quadraticCurveTo(pCurrent.x, pCurrent.y, nextMidX, nextMidY);
  }
  
  ctx.closePath();
  ctx.fill();
};

const drawPixelatedCircle = (ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) => {
  const startCol = Math.floor((cx - radius) / MOSAIC_SIZE);
  const endCol = Math.ceil((cx + radius) / MOSAIC_SIZE);
  const startRow = Math.floor((cy - radius) / MOSAIC_SIZE);
  const endRow = Math.ceil((cy + radius) / MOSAIC_SIZE);

  ctx.fillStyle = color;

  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      const x = c * MOSAIC_SIZE;
      const y = r * MOSAIC_SIZE;
      const cellCx = x + MOSAIC_SIZE / 2;
      const cellCy = y + MOSAIC_SIZE / 2;
      
      // Check if cell center is inside circle
      if ((cellCx - cx) ** 2 + (cellCy - cy) ** 2 < radius ** 2) {
        ctx.fillRect(x, y, MOSAIC_SIZE, MOSAIC_SIZE);
      }
    }
  }
};

export const drawSlime = (
  ctx: CanvasRenderingContext2D, 
  params: VisualParams, 
  time: number, 
  width: number, 
  height: number,
  scale: number = 1
) => {
  const centerX = width / 2;
  const centerY = height / 2;

  // 1. Create offscreen buffer for high-res drawing
  const bufferCanvas = document.createElement('canvas');
  bufferCanvas.width = width;
  bufferCanvas.height = height;
  const bufferCtx = bufferCanvas.getContext('2d', { willReadFrequently: true });
  if (!bufferCtx) return;

  // Update points for animation (wobble)
  // We don't persist these changes to params.points to avoid drift, we calculate transient positions
  const animatedPoints = params.points.map((p, i) => {
    const pulse = 1 + Math.sin(time * 5 + i * 0.5) * 0.15 * p.weight;
    const wobble = 1 + Math.sin(time * 12 + i) * 0.05 * p.weight;
    const angleOffset = Math.sin(time * 3 + i * 0.3) * 0.2 * p.weight;
    
    const r = p.baseRadius * pulse * wobble * scale;
    const a = p.originalAngle + angleOffset;
    
    return {
      x: centerX + Math.cos(a) * r,
      y: centerY + Math.sin(a) * r,
      baseX: Math.cos(a) * r, // Relative to center
      baseY: Math.sin(a) * r  // Relative to center
    };
  });

  // 2. Draw Layers
  const scalesOffsets = [[1.08, 0], [0.9, params.baseRadius * 0.22 * scale], [0.7, (1 - 0.7) * params.baseRadius * scale]];
  
  scalesOffsets.forEach((conf, i) => {
    const [layerScale, offsetY] = conf;
    const layerPoints = animatedPoints.map(p => ({
      x: centerX + p.baseX * layerScale,
      y: centerY - offsetY + p.baseY * layerScale
    }));
    drawSmoothShape(bufferCtx, layerPoints, colorToString(params.colors[2 - i]));
  });

  // 3. Features: Spots
  if (params.features.includes('spots') && params.spotParams) {
    const { count, spots, spotColor } = params.spotParams;
    
    // Create spot layer
    const spotCanvas = document.createElement('canvas');
    spotCanvas.width = width;
    spotCanvas.height = height;
    const spotCtx = spotCanvas.getContext('2d');

    if (spotCtx) {
        spots.forEach((spot, i) => {
          const weight = 0.6;
          const pulseFactor = 1 + Math.sin(time * 3 + i * 0.5) * 0.08 * weight;
          const wobbleFactor = 1 + Math.sin(time * 7 + i) * 0.03 * weight;
          const angleOffset = Math.sin(time * 2 + i * 0.3) * 0.1 * weight;

          const r = spot.dist * pulseFactor * wobbleFactor * scale;
          const a = spot.angle + angleOffset;

          const sx = centerX + Math.cos(a) * r;
          const sy = centerY + Math.sin(a) * r;

          spotCtx.fillStyle = colorToString(spotColor);
          spotCtx.beginPath();
          spotCtx.arc(sx, sy, spot.size * scale, 0, Math.PI * 2);
          spotCtx.fill();
        });

        // Create mask (using the largest layer shape)
        spotCtx.globalCompositeOperation = 'destination-in';
        const maskPoints = animatedPoints.map(p => ({
            x: centerX + p.baseX * 1.08,
            y: centerY + p.baseY * 1.08
        }));
        drawSmoothShape(spotCtx, maskPoints, '#FFFFFF');

        // Blit spots onto buffer
        bufferCtx.drawImage(spotCanvas, 0, 0);
    }
  }

  // 4. Eyes
  const eyeDistance = params.baseRadius * 0.25 * scale;
  const eyeY = centerY - params.baseRadius * 0.35 * scale;
  const eyeSize = params.baseRadius * 0.12 * scale;
  const { x: offX, y: offY } = params.eyeOffset;
  const eyeColors = params.eyeColors || { sclera: '#FFFFFF', pupil: '#000000' };

  const drawEye = (x: number, y: number) => {
     // Sclera
     bufferCtx.fillStyle = eyeColors.sclera;
     bufferCtx.beginPath();
     bufferCtx.arc(x, y, eyeSize, 0, Math.PI * 2);
     bufferCtx.fill();

     // Pupil
     const pupilSize = eyeSize * 0.5;
     const pX = Math.cos(time * 2) * pupilSize * 0.2;
     const pY = Math.sin(time * 1.5) * pupilSize * 0.1;
     
     bufferCtx.fillStyle = eyeColors.pupil;
     bufferCtx.beginPath();
     bufferCtx.arc(x + pX, y + pY, pupilSize, 0, Math.PI * 2);
     bufferCtx.fill();
  };

  drawEye(centerX - eyeDistance + offX * scale, eyeY + offY * scale);
  drawEye(centerX + eyeDistance + offX * scale, eyeY + offY * scale);



  // 5. Mosaic & Flowers
  // To do this efficiently in JS:
  // Get image data once
  const imgData = bufferCtx.getImageData(0, 0, width, height);
  const pixels = imgData.data;
  
  // We need a grid to store colors for processing edges/flowers
  const cols = Math.ceil(width / MOSAIC_SIZE);
  const rows = Math.ceil(height / MOSAIC_SIZE);
  const grid: (Uint8ClampedArray | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));

  // Scan grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        // Sample center pixel of the block (approximation for performance)
        const startY = r * MOSAIC_SIZE;
        const startX = c * MOSAIC_SIZE;
        
        // Sample center
        const py = Math.min(startY + MOSAIC_SIZE / 2, height - 1);
        const px = Math.min(startX + MOSAIC_SIZE / 2, width - 1);
        const idx = (Math.floor(py) * width + Math.floor(px)) * 4;
        
        if (pixels[idx + 3] > 64) {
             grid[r][c] = pixels.slice(idx, idx + 4);
        }
    }
  }

  const boundaryBlocks: {x: number, y: number, angle: number}[] = [];
  
  // Find boundary for flowers
  if (params.features.includes('flowers') && params.flowerParams) {
     for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c]) {
                const isEdge = (
                    r === 0 || !grid[r-1][c] ||
                    r === rows-1 || !grid[r+1][c] ||
                    c === 0 || !grid[r][c-1] ||
                    c === cols-1 || !grid[r][c+1]
                );
                if (isEdge) {
                    const bx = c * MOSAIC_SIZE + MOSAIC_SIZE/2;
                    const by = r * MOSAIC_SIZE + MOSAIC_SIZE/2;
                    boundaryBlocks.push({
                        x: bx, 
                        y: by, 
                        angle: Math.atan2(by - centerY, bx - centerX)
                    });
                }
            }
        }
     }
  }

  // Clear Destination
  ctx.clearRect(0, 0, width, height);

  // Draw Mosaic
  const rainbowEdge = params.features.includes('rainbowEdge');
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
        const color = grid[r][c];
        if (color) {
            const x = c * MOSAIC_SIZE;
            const y = r * MOSAIC_SIZE;
            
            const isEdge = (
                r === 0 || !grid[r-1][c] ||
                r === rows-1 || !grid[r+1][c] ||
                c === 0 || !grid[r][c-1] ||
                c === cols-1 || !grid[r][c+1]
            );

            if (rainbowEdge && isEdge) {
                 const hue = (time * 100 + (r + c) * 30) % 360;
                 ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            } else {
                 ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            }
            ctx.fillRect(x, y, MOSAIC_SIZE, MOSAIC_SIZE);
        }
    }
  }

  // Draw Flowers
  if (params.features.includes('flowers') && params.flowerParams && boundaryBlocks.length > 0) {
      const { flowers } = params.flowerParams;
      
      flowers.forEach(flower => {
          // Find best block
          let bestBlock = boundaryBlocks[0];
          let minDiff = 1000;
          
          for (const block of boundaryBlocks) {
              let diff = Math.abs(block.angle - flower.idealAngle);
              diff = Math.min(diff, 2 * Math.PI - diff);
              if (diff < minDiff) {
                  minDiff = diff;
                  bestBlock = block;
              }
          }

          // Smooth movement
          // Note: flower.x/y are absolute coordinates. If scale changes drastically, they might fly.
          // We could try to scale them, but for now let's let them interpolate.
          if (!flower.x) { flower.x = bestBlock.x; flower.y = bestBlock.y; }
          else {
              flower.x += (bestBlock.x - flower.x) * 0.1;
              flower.y += (bestBlock.y - flower.y) * 0.1;
          }

          // Draw flower
          const petalColor = colorToString(flower.color);
          for(let j=0; j<5; j++) {
             const ang = (Math.PI * 2 / 5) * j;
             const px = flower.x + Math.cos(ang) * flower.size * scale;
             const py = flower.y + Math.sin(ang) * flower.size * scale;
             drawPixelatedCircle(ctx, px, py, flower.size * 0.6 * scale, petalColor);
          }
          drawPixelatedCircle(ctx, flower.x, flower.y, flower.size * 0.4 * scale, '#FFFF00');
      });
  }
};
