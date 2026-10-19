let currentTerrain = 'grama';
let isMouseDown = false;

// Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Cria o primeiro grid preenchido automaticamente
    resizeGrid();
    
    // Controle global do estado do mouse (para pintar ao clicar e arrastar)
    document.body.addEventListener('mousedown', (e) => {
        if (e.target.closest('#controls')) return;
        isMouseDown = true;
    });

    document.body.addEventListener('mouseup', () => {
        isMouseDown = false;
    });
});

// Altera o terreno selecionado no painel
function selectTerrain(type, element) {
    currentTerrain = type;
    document.querySelectorAll('.terrain-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

// Gera o novo grid totalmente PINTADO com o terreno atualmente selecionado
function resizeGrid() {
    const cols = parseInt(document.getElementById('grid-cols').value) || 20;
    const rows = parseInt(document.getElementById('grid-rows').value) || 20;
    const grid = document.getElementById('grid');

    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${cols}, 40px)`;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            
            // O grid já é criado pintado com o terreno atual!
            cell.className = `cell ${currentTerrain}`;
            cell.dataset.row = r;
            cell.dataset.col = c;

            // Eventos do mouse para pintar células individualmente ou arrastando
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

// Pinta um bloco do tamanho definido no campo "Tamanho do Pincel"
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

// Oculta ou mostra as linhas divisórias do grid
function toggleGridLines() {
    const showLines = document.getElementById('toggle-grid-lines').checked;
    const grid = document.getElementById('grid');
    if (showLines) {
        grid.classList.remove('hide-lines');
    } else {
        grid.classList.add('hide-lines');
    }
}