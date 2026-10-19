let currentTerrain = 'grama';
let isMouseDown = false;

document.addEventListener('DOMContentLoaded', () => {
    generateProceduralTerrain();
    
    document.body.addEventListener('mousedown', (e) => {
        if (e.target.closest('#controls')) return;
        isMouseDown = true;
    });

    document.body.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
});

function selectTerrain(type, element) {
    currentTerrain = type;
    document.querySelectorAll('.terrain-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

// GERAÇÃO PROCEDURAL COM BORDAS E POÇAS
function generateProceduralTerrain() {
    const cols = parseInt(document.getElementById('grid-cols').value) || 22;
    const rows = parseInt(document.getElementById('grid-rows').value) || 16;
    const genType = document.getElementById('gen-type').value;
    const grid = document.getElementById('grid');

    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 40px)`;

    // Matriz 2D temporária
    let map = Array(rows).fill(null).map(() => Array(cols).fill('grama'));

    if (genType === 'grama') {
        // Preenche com Grama e adiciona poças orgânicas d'água e caminho de terra
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                map[r][c] = 'grama';
            }
        }

        // Gerar 2 a 4 poças d'água circulares/orgânicas
        const numPuddles = Math.floor(Math.random() * 3) + 2;
        for (let p = 0; p < numPuddles; p++) {
            const centerX = Math.floor(Math.random() * (cols - 4)) + 2;
            const centerY = Math.floor(Math.random() * (rows - 4)) + 2;
            const radius = Math.floor(Math.random() * 2) + 1.8;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const dist = Math.hypot(c - centerX, r - centerY);
                    if (dist < radius + (Math.random() * 0.5)) {
                        map[r][c] = 'agua';
                    } else if (dist < radius + 1.2 && map[r][c] !== 'agua') {
                        map[r][c] = 'terra'; // Borda de terra úmida ao redor da poça
                    }
                }
            }
        }
    } 
    else if (genType === 'castelo') {
        // Gera um Castelo com pátio interno e muralhas de pedra com cantos
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1 || r === 1 || r === rows - 2 || c === 1 || c === cols - 2) {
                    map[r][c] = 'pedra'; // Paredes exteriores
                } else if ((r === 2 || r === rows - 3) && (c > 3 && c < cols - 4)) {
                    map[r][c] = 'pedra';
                } else {
                    map[r][c] = (Math.random() > 0.8) ? 'terra' : 'areia'; // Pátio
                }
            }
        }
    } 
    else if (genType === 'masmorra') {
        // Gera câmaras escavadas de masmorra
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                map[r][c] = 'pedra'; // Paredes densas
            }
        }

        // Escavar salas com piso de masmorra
        const numRooms = 4;
        for (let i = 0; i < numRooms; i++) {
            const w = Math.floor(Math.random() * 4) + 4;
            const h = Math.floor(Math.random() * 4) + 4;
            const rx = Math.floor(Math.random() * (cols - w - 2)) + 1;
            const ry = Math.floor(Math.random() * (rows - h - 2)) + 1;

            for (let r = ry; r < ry + h; r++) {
                for (let c = rx; c < rx + w; c++) {
                    map[r][c] = 'masmorra';
                }
            }
        }
    }

    // Renderizar no DOM e aplicar suavização nas bordas
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            const type = map[r][c];
            
            cell.className = `cell ${type}`;
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Arredondamento dinâmico de bordas conforme os vizinhos
            applyOrganicCorners(cell, map, r, c, rows, cols, type);

            cell.addEventListener('mousedown', () => paintArea(r, c, cols, rows));
            cell.addEventListener('mouseenter', () => {
                if (isMouseDown) paintArea(r, c, cols, rows);
            });

            grid.appendChild(cell);
        }
    }
}

// Aplica cantos arredondados suavizados quando o terreno muda
function applyOrganicCorners(cell, map, r, c, maxR, maxC, type) {
    const topSame = r > 0 && map[r-1][c] === type;
    const bottomSame = r < maxR - 1 && map[r+1][c] === type;
    const leftSame = c > 0 && map[r][c-1] === type;
    const rightSame = c < maxC - 1 && map[r][c+1] === type;

    if (!topSame && !leftSame) cell.classList.add('rounded-top-left');
    if (!topSame && !rightSame) cell.classList.add('rounded-top-right');
    if (!bottomSame && !leftSame) cell.classList.add('rounded-bottom-left');
    if (!bottomSame && !rightSame) cell.classList.add('rounded-bottom-right');
}

function paintArea(startRow, startCol, maxCols, maxRows) {
    const brushSize = parseInt(document.getElementById('brush-size').value) || 1;

    for (let r = 0; r < brushSize; r++) {
        for (let c = 0; c < brushSize; c++) {
            const targetRow = startRow + r;
            const targetCol = startCol + c;

            if (targetRow < maxRows && targetCol < maxCols) {
                const selector = `.cell[data-row="${targetRow}"][data-col="${targetCol}"]`;
                const cell = document.querySelector(selector);
                if (cell) {
                    cell.className = `cell ${currentTerrain}`;
                }
            }
        }
    }
}

function toggleGridLines() {
    const showLines = document.getElementById('toggle-grid-lines').checked;
    const grid = document.getElementById('grid');
    if (showLines) {
        grid.classList.remove('hide-lines');
    } else {
        grid.classList.add('hide-lines');
    }
}