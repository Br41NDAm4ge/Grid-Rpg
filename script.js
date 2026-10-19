let currentTerrain = 'grama';
let isMouseDown = false;

document.addEventListener('DOMContentLoaded', () => {
    resizeGrid();
    
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

// Cria o grid perfeitamente alinhado e preenchido
function resizeGrid() {
    const cols = parseInt(document.getElementById('grid-cols').value) || 20;
    const rows = parseInt(document.getElementById('grid-rows').value) || 15;
    const grid = document.getElementById('grid');

    grid.innerHTML = '';
    
    // Define linhas e colunas exatas para o CSS Grid não quebrar
    grid.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 40px)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            
            // Gera já totalmente preenchido
            cell.className = `cell ${currentTerrain}`;
            cell.dataset.row = r;
            cell.dataset.col = c;

            cell.addEventListener('mousedown', () => paintArea(r, c, cols, rows));
            cell.addEventListener('mouseenter', () => {
                if (isMouseDown) {
                    paintArea(r, c, cols, rows);
                }
            });

            grid.appendChild(cell);
        }
    }
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