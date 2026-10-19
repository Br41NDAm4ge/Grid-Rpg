let currentTerrain = 'grama';
let isMouseDown = false;

// Garante que o grid seja montado assim que a página carregar
document.addEventListener('DOMContentLoaded', () => {
    resizeGrid();
    
    // Controla se o mouse está pressionado para permitir "arrastar e pintar"
    document.body.addEventListener('mousedown', () => isMouseDown = true);
    document.body.addEventListener('mouseup', () => isMouseDown = false);
});

// Seleciona o tipo de terreno
function selectTerrain(type, element) {
    currentTerrain = type;
    document.querySelectorAll('.terrain-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

// Cria/Redimensiona o grid
function resizeGrid() {
    const cols = parseInt(document.getElementById('grid-cols').value) || 20;
    const rows = parseInt(document.getElementById('grid-rows').value) || 20;
    const grid = document.getElementById('grid');

    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${cols}, 35px)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Eventos do mouse para pintar
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

// Pinta um quadrado do tamanho especificado no campo "criar terreno de tamanho"
function paintArea(startRow, startCol, maxCols, maxRows) {
    const brushSize = parseInt(document.getElementById('brush-size').value) || 1;

    for (let r = 0; r < brushSize; r++) {
        for (let c = 0; c < brushSize; c++) {
            const targetRow = startRow + r;
            const targetCol = startCol + c;

            // Garante que não vai pintar fora dos limites do grid
            if (targetRow < maxRows && targetCol < maxCols) {
                const selector = `.cell[data-row="${targetRow}"][data-col="${targetCol}"]`;
                const cell = document.querySelector(selector);
                if (cell) {
                    // Remove classes de terrenos antigos e aplica o novo
                    cell.className = 'cell ' + currentTerrain;
                }
            }
        }
    }
}