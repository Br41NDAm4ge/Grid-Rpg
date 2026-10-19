let tokensLibrary = [];
let selectedGridToken = null;
const TILE_SIZE = 40;

document.addEventListener('DOMContentLoaded', () => {
    setupGridDropEvents();
});

// Adiciona um novo token a partir do formulário
function addTokenFromForm() {
    const nameInput = document.getElementById('token-name');
    const sizeSelect = document.getElementById('token-size');
    const fileInput = document.getElementById('token-file');

    const name = nameInput.value.trim() || 'Personagem';
    const size = parseInt(sizeSelect.value) || 1;

    if (!fileInput.files || !fileInput.files[0]) {
        alert('Por favor, selecione uma imagem para o token!');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        // Recorta a imagem circularmente via Canvas
        cropImageToCircle(e.target.result, (circularSrc) => {
            const newToken = {
                id: 'token_' + Date.now(),
                name: name,
                size: size,
                imageSrc: circularSrc
            };

            tokensLibrary.push(newToken);
            renderSidebarToken(newToken);

            nameInput.value = '';
            fileInput.value = '';
        });
    };

    reader.readAsDataURL(file);
}

// Recorta e gera a imagem física em círculo com borda dourada
function cropImageToCircle(imageSrc, callback) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        // Máscara Circular
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Desenha a imagem cortada
        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

        callback(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
}

// Renderiza o item do token na barra lateral
function renderSidebarToken(token) {
    const tokenList = document.getElementById('token-list');

    const item = document.createElement('div');
    item.className = 'sidebar-token-item';
    item.draggable = true;
    item.dataset.tokenId = token.id;

    item.innerHTML = `
        <img class="sidebar-token-avatar" src="${token.imageSrc}" alt="${token.name}">
        <div class="sidebar-token-info">
            <span class="sidebar-token-name">${token.name}</span>
            <span class="sidebar-token-size">Tamanho: ${token.size}x${token.size}</span>
        </div>
    `;

    // Eventos de Arrastar (Drag & Drop)
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(token));
    });

    tokenList.appendChild(item);
}

// Prepara a área do Grid para aceitar a soltura do token
function setupGridDropEvents() {
    const gridContainer = document.getElementById('grid-container');

    gridContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    gridContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        const tokenData = JSON.parse(data);
        const grid = document.getElementById('grid');
        const rect = grid.getBoundingClientRect();

        // Calcula coluna e linha relativas ao grid
        const col = Math.floor((e.clientX - rect.left) / TILE_SIZE);
        const row = Math.floor((e.clientY - rect.top) / TILE_SIZE);

        const colsMax = parseInt(document.getElementById('grid-cols').value) || 22;
        const rowsMax = parseInt(document.getElementById('grid-rows').value) || 16;

        if (col >= 0 && col < colsMax && row >= 0 && row < rowsMax) {
            spawnTokenOnGrid(tokenData, col, row);
        }
    });
}

// Cria o Token por cima do Grid
function spawnTokenOnGrid(tokenData, col, row) {
    const grid = document.getElementById('grid');

    const tokenElem = document.createElement('div');
    tokenElem.className = 'grid-token';
    tokenElem.dataset.col = col;
    tokenElem.dataset.row = row;
    tokenElem.dataset.size = tokenData.size;

    const pxSize = tokenData.size * TILE_SIZE;
    tokenElem.style.width = `${pxSize}px`;
    tokenElem.style.height = `${pxSize}px`;

    tokenElem.style.left = `${col * TILE_SIZE}px`;
    tokenElem.style.top = `${row * TILE_SIZE}px`;

    tokenElem.innerHTML = `
        <img class="grid-token-img" src="${tokenData.imageSrc}" alt="${tokenData.name}">
        <div class="grid-token-label">${tokenData.name}</div>
    `;

    tokenElem.addEventListener('click', (e) => {
        e.stopPropagation();
        selectGridToken(tokenElem);
    });

    grid.appendChild(tokenElem);
    selectGridToken(tokenElem);
}

function selectGridToken(tokenElem) {
    if (selectedGridToken) {
        selectedGridToken.classList.remove('selected');
    }
    selectedGridToken = tokenElem;
    selectedGridToken.classList.add('selected');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.grid-token') && selectedGridToken) {
        selectedGridToken.classList.remove('selected');
        selectedGridToken = null;
    }
});

// Movimentação pelas setas do teclado
document.addEventListener('keydown', (e) => {
    if (!selectedGridToken) return;

    const cols = parseInt(document.getElementById('grid-cols').value) || 22;
    const rows = parseInt(document.getElementById('grid-rows').value) || 16;

    let col = parseInt(selectedGridToken.dataset.col);
    let row = parseInt(selectedGridToken.dataset.row);
    const size = parseInt(selectedGridToken.dataset.size);

    switch (e.key) {
        case 'ArrowUp':
            if (row > 0) row--;
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (row + size < rows) row++;
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (col > 0) col--;
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (col + size < cols) col++;
            e.preventDefault();
            break;
        case 'Delete':
        case 'Backspace':
            selectedGridToken.remove();
            selectedGridToken = null;
            return;
    }

    selectedGridToken.dataset.col = col;
    selectedGridToken.dataset.row = row;
    selectedGridToken.style.left = `${col * TILE_SIZE}px`;
    selectedGridToken.style.top = `${row * TILE_SIZE}px`;
});