/**
 * diving.js — Diving Visualization Module
 * CSC316 Final Project - XiangyuShen's Component
 * 
 * Features:
 * - Custom diver cursor (above water: diving pose, below water: swimming with bubbles)
 * - Diving medal flow visualization
 * - Interactive waterline with different cursor states
 */

(function() {
  'use strict';

  // Wait for DOM and D3 to be ready
  if (typeof d3 === 'undefined') {
    console.error('D3.js is required for diving visualization');
    return;
  }

  // Module state
  let divingData = null;
  let isInitialized = false;

  // Color palette
  const COLORS = {
    usa: '#1f4ed8',
    chn: '#d32f2f',
    gold: '#d4af37',
    silver: '#b9b9b9',
    bronze: '#c27a35',
    water: '#5aa8ff',
  };

  const MEDAL_COLOR = {
    Gold: COLORS.gold,
    Silver: COLORS.silver,
    Bronze: COLORS.bronze,
  };

  /**
   * Initialize diving visualization
   */
  function initDiving() {
    if (isInitialized) return;
    
    const divingCard = document.getElementById('divingCard');
    const divingFlow = document.getElementById('divingFlow');
    
    if (!divingCard || !divingFlow) {
      console.warn('Diving elements not found in DOM');
      return;
    }

    // Setup custom cursors
    setupCustomCursors();
    
    // Load data and render
    loadDivingData();
    
    isInitialized = true;
  }

  /**
   * Setup custom cursor styles for diving visualization
   */
  function setupCustomCursors() {
    // Create style element if not exists
    let styleEl = document.getElementById('diving-cursor-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'diving-cursor-styles';
      document.head.appendChild(styleEl);
    }

    // Diver cursor (above water - diving pose)
    const diverCursorSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="8" cy="6" r="3" fill="${COLORS.usa}"/>
      <path d="M 8 10 Q 6 12 4 16 L 6 17 Q 8 13 8 13 Q 8 13 10 17 L 12 16 Q 10 12 8 10 Z M 8 13 L 8 20 L 10 20 L 10 13 Z M 10 20 L 12 26 L 14 25 L 11 20 Z M 8 20 L 6 26 L 4 25 L 7 20 Z" fill="${COLORS.usa}"/>
    </svg>`;

    // Swimmer cursor (below water - swimming pose with bubbles)
    const swimmerCursorSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="32" viewBox="0 0 40 32">
      <!-- Swimmer body (horizontal) -->
      <circle cx="8" cy="16" r="3" fill="${COLORS.usa}"/>
      <path d="M 11 16 L 20 16 M 20 13 L 25 11 M 20 19 L 25 21 M 13 16 L 13 20 M 17 16 L 17 20" stroke="${COLORS.usa}" stroke-width="2" stroke-linecap="round" fill="none"/>
      <!-- Bubbles -->
      <circle cx="28" cy="12" r="2" fill="${COLORS.water}" opacity="0.6"/>
      <circle cx="32" cy="10" r="1.5" fill="${COLORS.water}" opacity="0.5"/>
      <circle cx="35" cy="14" r="1" fill="${COLORS.water}" opacity="0.4"/>
    </svg>`;

    // Convert SVG to data URL
    const diverCursor = `url('data:image/svg+xml;utf8,${encodeURIComponent(diverCursorSVG)}'), auto`;
    const swimmerCursor = `url('data:image/svg+xml;utf8,${encodeURIComponent(swimmerCursorSVG)}'), auto`;

    // Apply styles
    styleEl.textContent = `
      #divingCard {
        position: relative;
      }
      
      #divingFlow {
        cursor: ${diverCursor};
        position: relative;
      }
      
      /* Default cursor for diving area */
      #divingFlow svg {
        cursor: ${diverCursor};
      }
      
      /* Swimmer cursor below waterline */
      #divingFlow .below-water {
        cursor: ${swimmerCursor} !important;
      }
      
      /* Add water zone for cursor change */
      #divingFlow .water-zone-below {
        cursor: ${swimmerCursor} !important;
      }
    `;

    // Add dynamic cursor switching based on mouse position
    setupDynamicCursor();
  }

  /**
   * Setup dynamic cursor switching based on waterline
   */
  function setupDynamicCursor() {
    const divingFlow = document.getElementById('divingFlow');
    if (!divingFlow) return;

    let waterlineY = null;

    divingFlow.addEventListener('mousemove', function(event) {
      const svg = this.querySelector('svg');
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const mouseY = event.clientY - rect.top;
      
      // Find waterline position (y=0 in the visualization)
      if (waterlineY === null) {
        const svgHeight = rect.height;
        waterlineY = svgHeight / 2; // Approximate middle
      }

      // Change cursor based on position relative to waterline
      if (mouseY > waterlineY) {
        // Below water
        svg.style.cursor = `url('data:image/svg+xml;utf8,${encodeURIComponent(getSwimmerCursorSVG())}'), auto`;
      } else {
        // Above water
        svg.style.cursor = `url('data:image/svg+xml;utf8,${encodeURIComponent(getDiverCursorSVG())}'), auto`;
      }
    });
  }

  /**
   * Get diver cursor SVG
   */
  function getDiverCursorSVG() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="8" cy="6" r="3" fill="${COLORS.usa}"/>
      <path d="M 8 10 Q 6 12 4 16 L 6 17 Q 8 13 8 13 Q 8 13 10 17 L 12 16 Q 10 12 8 10 Z M 8 13 L 8 20 L 10 20 L 10 13 Z M 10 20 L 12 26 L 14 25 L 11 20 Z M 8 20 L 6 26 L 4 25 L 7 20 Z" fill="${COLORS.usa}"/>
    </svg>`;
  }

  /**
   * Get swimmer cursor SVG with bubbles
   */
  function getSwimmerCursorSVG() {
    // Randomize bubble positions for animation effect
    const bubble1Y = 12 + Math.random() * 2;
    const bubble2Y = 10 + Math.random() * 2;
    const bubble3Y = 14 + Math.random() * 2;
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="32" viewBox="0 0 40 32">
      <circle cx="8" cy="16" r="3" fill="${COLORS.usa}"/>
      <path d="M 11 16 L 20 16 M 20 13 L 25 11 M 20 19 L 25 21 M 13 16 L 13 20 M 17 16 L 17 20" stroke="${COLORS.usa}" stroke-width="2" stroke-linecap="round" fill="none"/>
      <circle cx="28" cy="${bubble1Y}" r="2" fill="${COLORS.water}" opacity="0.6"/>
      <circle cx="32" cy="${bubble2Y}" r="1.5" fill="${COLORS.water}" opacity="0.5"/>
      <circle cx="35" cy="${bubble3Y}" r="1" fill="${COLORS.water}" opacity="0.4"/>
    </svg>`;
  }

  /**
   * Load diving data from CSV
   */
  function loadDivingData() {
    d3.csv('data/olympics_dataset_cleaned.csv', d3.autoType).then(data => {
      divingData = data.filter(d => 
        d.Sport === 'Diving' && 
        d.Medal && 
        d.Medal !== 'No medal' &&
        (d.NOC === 'USA' || d.NOC === 'CHN')
      );
      
      renderDivingVisualization(divingData);
    }).catch(err => {
      console.error('Failed to load diving data:', err);
    });
  }

  /**
   * Render diving visualization
   */
  function renderDivingVisualization(data) {
    const host = d3.select('#divingFlow');
    if (!host.node()) return;

    host.selectAll('*').remove();

    const years = d3.sort(Array.from(new Set(data.map(d => d.Year))));
    
    // Aggregate data by year and team
    const byYearTeam = d3.rollup(data, v => v.length, d => d.Year, d => d.NOC);
    
    const series = years.map(y => {
      const m = byYearTeam.get(y) || new Map();
      return {
        Year: y,
        CHN: m.get('CHN') || 0,
        USA: m.get('USA') || 0,
      };
    });

    // Dimensions
    const W = 1180;
    const H = 480;
    const margin = { top: 20, right: 24, bottom: 44, left: 64 };
    const width = W - margin.left - margin.right;
    const height = H - margin.top - margin.bottom;

    const svg = host.append('svg')
      .attr('width', W)
      .attr('height', H);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(series, d => d.Year))
      .range([0, width]);

    const maxCount = d3.max(series, d => Math.max(d.CHN, d.USA)) || 1;
    const y = d3.scaleLinear()
      .domain([-(maxCount * 1.35), maxCount * 1.35])
      .nice()
      .range([height, 0]);

    // Store waterline position for cursor
    const waterlineY = y(0);
    svg.node().__waterlineY = waterlineY;

    // Grid
    g.append('g')
      .attr('opacity', 0.25)
      .call(d3.axisLeft(y).ticks(10).tickSize(-width).tickFormat(''))
      .selectAll('.domain').remove();

    // Waterline
    g.append('line')
      .attr('class', 'waterline')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', waterlineY)
      .attr('y2', waterlineY)
      .attr('stroke', COLORS.water)
      .attr('stroke-width', 2)
      .attr('opacity', 0.5)
      .attr('stroke-dasharray', '8,4');

    // Water shimmer effect
    const shimmer = g.append('g').attr('class', 'water-shimmer');
    for (let i = 0; i < 5; i++) {
      shimmer.append('path')
        .attr('d', `M 0 ${waterlineY + i * 3} Q ${width / 4} ${waterlineY + i * 3 - 2} ${width / 2} ${waterlineY + i * 3} Q ${width * 3 / 4} ${waterlineY + i * 3 + 2} ${width} ${waterlineY + i * 3}`)
        .attr('fill', 'none')
        .attr('stroke', COLORS.water)
        .attr('stroke-width', 1)
        .attr('opacity', 0.15 - i * 0.02);
    }

    // Areas
    const areaCHN = d3.area()
      .x(d => x(d.Year))
      .y0(waterlineY)
      .y1(d => y(d.CHN))
      .curve(d3.curveBasis);

    const areaUSA = d3.area()
      .x(d => x(d.Year))
      .y0(waterlineY)
      .y1(d => y(-d.USA))
      .curve(d3.curveBasis);

    g.append('path')
      .datum(series)
      .attr('d', areaCHN)
      .attr('fill', COLORS.chn)
      .attr('opacity', 0.42);

    g.append('path')
      .datum(series)
      .attr('d', areaUSA)
      .attr('fill', COLORS.usa)
      .attr('opacity', 0.42);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format('d')));

    g.append('g')
      .call(d3.axisLeft(y).ticks(10).tickFormat(d => Math.abs(d)))
      .call(g => g.selectAll('.domain').remove());

    // Labels
    g.append('text')
      .attr('x', 0)
      .attr('y', -6)
      .attr('fill', '#666')
      .attr('font-size', 12)
      .text('Medals / year (Diving) — CHN above water, USA below water');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', 22)
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.chn)
      .attr('font-weight', 800)
      .attr('font-size', 26)
      .text('CHN');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', height - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', COLORS.usa)
      .attr('font-weight', 800)
      .attr('font-size', 26)
      .text('USA');

    // Medal dots
    renderMedalDots(g, data, x, y, waterlineY, years);

    // Animated bubbles below waterline
    addAnimatedBubbles(g, width, waterlineY, height);

    // Add diver decoration
    addDiverDecoration(g, x, y, waterlineY);

    // Setup dynamic cursor switching (after SVG is rendered)
    setupDynamicCursor();
  }

  /**
   * Render medal dots
   */
  function renderMedalDots(g, data, x, y, waterlineY, years) {
    const byYearTeamMedals = d3.group(data, d => d.Year, d => d.NOC);
    const dots = [];

    for (const year of years) {
      const byTeam = byYearTeamMedals.get(year);
      if (!byTeam) continue;

      ['CHN', 'USA'].forEach(team => {
        const medals = byTeam.get(team);
        if (!medals) return;

        const sorted = medals.slice().sort((a, b) => {
          const medalRank = { Gold: 0, Silver: 1, Bronze: 2 };
          return (medalRank[a.Medal] || 9) - (medalRank[b.Medal] || 9);
        });

        sorted.forEach((medal, i) => {
          const baseY = team === 'CHN' ? y(sorted.length) : y(-sorted.length);
          const offsetY = team === 'CHN' ? -i * 12 : i * 12;
          
          dots.push({
            cx: x(year),
            cy: baseY + offsetY,
            medal: medal.Medal,
            team: team,
            year: year,
            event: medal.Event,
          });
        });
      });
    }

    g.selectAll('circle.medal-dot')
      .data(dots)
      .enter()
      .append('circle')
      .attr('class', 'medal-dot')
      .attr('cx', d => d.cx)
      .attr('cy', d => d.cy)
      .attr('r', 6.2)
      .attr('fill', d => MEDAL_COLOR[d.medal] || '#ccc')
      .attr('stroke', 'rgba(255,255,255,0.9)')
      .attr('stroke-width', 1.8)
      .attr('opacity', 0.95);
  }

  /**
   * Add animated bubbles below waterline
   */
  function addAnimatedBubbles(g, width, waterlineY, height) {
    const bubblesGroup = g.append('g').attr('class', 'animated-bubbles');
    
    // Create multiple bubble streams
    for (let i = 0; i < 15; i++) {
      const startX = Math.random() * width;
      const startY = waterlineY + 20 + Math.random() * (height - waterlineY - 60);
      const size = 2 + Math.random() * 3;
      const duration = 2000 + Math.random() * 2000;
      const delay = Math.random() * 2000;

      const bubble = bubblesGroup.append('circle')
        .attr('cx', startX)
        .attr('cy', startY)
        .attr('r', size)
        .attr('fill', COLORS.water)
        .attr('opacity', 0);

      // Animate bubble rising
      function animateBubble() {
        bubble
          .attr('cy', startY)
          .attr('opacity', 0)
          .transition()
          .delay(delay)
          .duration(duration)
          .attr('cy', waterlineY)
          .attr('opacity', 0.4)
          .transition()
          .duration(200)
          .attr('opacity', 0)
          .on('end', animateBubble);
      }

      animateBubble();
    }
  }

  /**
   * Add diver decoration
   */
  function addDiverDecoration(g, x, y, waterlineY) {
    const diveYear = 1984;
    const diveX = x(diveYear);

    const diver = g.append('g').attr('opacity', 0.7);

    // Splash
    const splash = g.append('g').attr('opacity', 0.35);
    [18, 32, 46].forEach(r => {
      splash.append('circle')
        .attr('cx', diveX)
        .attr('cy', waterlineY)
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', COLORS.water)
        .attr('stroke-width', 2);
    });

    // Trajectory
    const tStart = { x: diveX - 95, y: y(14) };
    const tEnd = { x: diveX, y: waterlineY };
    
    diver.append('path')
      .attr('d', `M ${tStart.x} ${tStart.y} Q ${diveX - 40} ${y(9)} ${tEnd.x} ${tEnd.y}`)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(120,120,120,0.65)')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '7,7');

    // Diver body
    const bodyG = diver.append('g');
    const bodyAngle = -65;
    
    bodyG.attr('transform', `translate(${diveX - 38},${y(9)}) rotate(${bodyAngle})`);

    // Body parts
    bodyG.append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', 0).attr('y2', 70)
      .attr('stroke', 'rgba(70,70,70,0.75)')
      .attr('stroke-width', 7)
      .attr('stroke-linecap', 'round');

    bodyG.append('circle')
      .attr('cx', 0)
      .attr('cy', 80)
      .attr('r', 9)
      .attr('fill', 'rgba(70,70,70,0.75)');
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDiving);
  } else {
    // DOM already loaded
    setTimeout(initDiving, 100);
  }

  // Expose to global scope if needed
  window.DivingVisualization = {
    init: initDiving,
  };

})();
