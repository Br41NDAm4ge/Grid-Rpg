let tokensLibrary = [];
let selectedGridToken = null;
const TILE_SIZE = 40; // Tamanho em pixels de cada casa do grid

// --- CRIAÇÃO DE TOKEN A PARTIR DO FORMULÁRIO ---
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
        // Corta a imagem em formato quadrado/circular via Canvas
        cropImageToSquare(e.target.result, (croppedSrc) => {
            const newToken = {
                id: 'token_' + Date.now(),
                name: name,
                size: size,
                imageSrc: croppedSrc
            };

            tokensLibrary.push(newToken);
            renderSidebarToken(newToken);

            // Reseta o formulário
            nameInput.value = '';
            fileInput.value = '';
        });
    };

    reader.readAsDataURL(file);
}

// Recorta a imagem em um quadrado centralizado automaticamente
function cropImageToSquare(imageSrc, callback) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const minDim = Math.min(img.width, img.height);
        canvas.width = 200;
        canvas.height = 200;

        const ctx = canvas.getContext('2d');
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 200, 200);
        callback(canvas.toDataURL('image/png'));
    };
    img.src = imageSrc;
}

// Exibe o token na Barra Lateral (Sidebar)
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

    // Eventos de Drag & Drop para arrastar até o Grid
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(token));
    });

    tokenList.appendChild(item);
}

// Configura o Grid para receber o Token Arrastado
function setupGridDropEvents() {
    const grid = document.getElementById('grid');

    grid.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    grid.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        const tokenData = JSON.parse(data);
        const rect = grid.getBoundingClientRect();

        // Calcula qual linha e coluna foi solto
        const col = Math.floor((e.clientX - rect.left) / TILE_SIZE);
        const row = Math.floor((e.clientY - rect.top) / TILE_SIZE);

        spawnTokenOnGrid(tokenData, col, row);
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

    // Tamanho proporcional ao grid
    const pxSize = tokenData.size * TILE_SIZE;
    tokenElem.style.width = `${pxSize}px`;
    tokenElem.style.height = `${pxSize}px`;

    // Posicionamento absoluto no grid
    tokenElem.style.left = `${col * TILE_SIZE}px`;
    tokenElem.style.top = `${row * TILE_SIZE}px`;

    tokenElem.innerHTML = `
        <img class="grid-token-img" src="${tokenData.imageSrc}" alt="${tokenData.name}">
        <div class="grid-token-label">${tokenData.name}</div>
    `;

    // Evento de seleção ao clicar no token
    tokenElem.addEventListener('click', (e) => {
        e.stopPropagation();
        selectGridToken(tokenElem);
    });

    grid.appendChild(tokenElem);
    selectGridToken(tokenElem);
}

// Seleciona um Token para movimentação
function selectGridToken(tokenElem) {
    if (selectedGridToken) {
        selectedGridToken.classList.remove('selected');
    }
    selectedGridToken = tokenElem;
    selectedGridToken.classList.add('selected');
}

// Desseleciona token ao clicar em área vazia do grid
document.addEventListener('click', (e) => {
    if (!e.target.closest('.grid-token') && selectedGridToken) {
        selectedGridToken.classList.remove('selected');
        selectedGridToken = null;
    }
});

// --- MOVIMENTAÇÃO DO TOKEN POR TECLADO (SETINHAS) ---
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

    // Atualiza posição no DOM
    selectedGridToken.dataset.col = col;
    selectedGridToken.dataset.row = row;
    selectedGridToken.style.left = `${col * TILE_SIZE}px`;
    selectedGridToken.style.top = `${row * TILE_SIZE}px`;
});