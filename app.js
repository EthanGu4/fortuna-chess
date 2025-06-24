const modeSelection = document.getElementById('mode-selection');
const container = document.getElementById('container');
const gameBoardClassic = document.querySelector('#classic-gameboard')
const gameBoardFantasy = document.querySelector('#fantasy-gameboard')
const infoDisplay = document.querySelector('#info-display')
const playerDisplay = document.querySelector('#player')
const restartBtn = document.getElementById('restart-btn');

let width
let playerTurn = "white"
let gameOver = false
let castlingMove = null
let lastMove = { from: null, to: null }

playerDisplay.textContent = 'white'

let selectedPiece = null
let captureDelay = 550;

// castling logic
let hasMoved = {
    whiteKing: false,
    whiteRookA: false,
    whiteRookH: false,
    blackKing: false,
    blackRookA: false,
    blackRookH: false
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.mode-btn').forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.set;
            startGameWithMode(mode);
        });
    });

    restartBtn.addEventListener('click', restartGame);
});

function startGameWithMode(mode) {

    modeSelection.style.display = 'none';
    container.style.display = 'flex';
    document.body.classList.remove('classic-mode', 'fantasy-mode');

    gameBoardClassic.innerHTML = '';
    gameBoardFantasy.innerHTML = '';
    infoDisplay.textContent = '';
    playerDisplay.textContent = 'white';

    if (mode === 'classic') {
        width = 8;

        document.querySelector('#fantasy-gameboard').classList.add('hidden');
        document.querySelector('#classic-gameboard').classList.remove('hidden');

        document.body.classList.remove('fantasy-mode');
        document.body.classList.add('classic-mode');

        createClassicBoard();

    } else if (mode == 'fantasy') {
        width = 12;

        document.querySelector('#classic-gameboard').classList.add('hidden');
        document.querySelector('#fantasy-gameboard').classList.remove('hidden');

        document.body.classList.remove('classic-mode');
        document.body.classList.add('fantasy-mode');

        createFantasyBoard();
    }
}
function createClassicBoard() {

    const startPieces = [
        rook, knight, bishop, queen, king, bishop, knight, rook,
        pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '',
        pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
        rook, knight, bishop, queen, king, bishop, knight, rook
    ]
    
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div')
        square.classList.add('square')
        square.innerHTML = startPiece
        square.firstChild?.setAttribute('draggable', true) 
        square.setAttribute('square-id', i)
        const row = Math.floor( (63 - i) / 8) + 1
        
        if (row % 2 === 0) {
            square.classList.add(i % 2 === 0 ? "light" : "dark")
        } else {
            square.classList.add(i % 2 === 0 ? "dark" : "light")
        }
        if (i <= 15) {
            if (square.firstChild) square.firstChild.classList.add('black')
        }

        if (i >= 48) {
            if (square.firstChild) square.firstChild.classList.add('white')
        }
        gameBoardClassic.appendChild(square)
    })

    squareFunctionality()

    if (playerTurn === 'white') {
        reverseIds()
    }
}

function createFantasyBoard() {

    // random approach for water squares
    const min = 35;
    const max = 107;
    const waterCount = 12;
    const excludedSquares = [49, 58, 85, 94]; // example squares to exclude

    function getRandomWaterSquares(count, min, max, excluded) {
        const validSquares = [];
        for (let i = min; i <= max; i++) {
            if (!excluded.includes(i)) {
            validSquares.push(i);
            }
        }

        const result = new Set();
        while (result.size < count && result.size < validSquares.length) {
            const randIndex = Math.floor(Math.random() * validSquares.length);
            result.add(validSquares[randIndex]);
        }

        return Array.from(result);
    }

    const waterSquares = getRandomWaterSquares(waterCount, min, max, excludedSquares);
    const magicSquares = [0, 1, width - 1, width - 2, width * width - 1, width * width - 2, width * width - width, width * width - width + 1];
    magicSquares.push(...excludedSquares);

    // different game modes within fantasy, like medieval vs nature? initial board set-up here
    
    // TEST BOARD 
    
    // const startPieces = [
    //     fish, fish, guitar, jedi, wizard, staffSnake, priest, wizard, khanda, tornado, fish, fish,
    //     bomb, gryphon, jester, pirate, pirate, otter, otter, pirate, pirate, jester, dragon, bomb,
    //     pirate, viking, pirate, '', '', viking, viking, '', '', pirate, viking, pirate,
    //     '', '', '', '', '', '', '', '', '', '', '', '',
    //     '', frog, '', '', '', '', '', '', '', '', frog, '',
    //     '', '', '', '', '', '', pirate, '', '', '', '', '',
    //     '', '', '', '', '', pirate, '', '', '', '', '', '',
    //     '', frog, '', phoenix, '', '', '', '', '', '', frog, '',
    //     '', '', '', '', '', '', '', '', '', '', '', '',
    //     '', '', '', '', '', '', pirate, '', '', '', '', '',
    //     bomb, dragon, jester, pirate, pirate, otter, otter, pirate, pirate, jester, gryphon, bomb,
    //     fish, fish, tornado, khanda, wizard, staffSnake, priest, wizard, jedi, guitar, fish, fish
    // ]

    const startPieces = [
        fish, fish, guitar, jedi, wizard, staffSnake, priest, wizard, khanda, tornado, fish, fish,
        bomb, gryphon, jester, pirate, pirate, otter, otter, pirate, pirate, jester, dragon, bomb,
        pirate, viking, pirate, '', '', viking, viking, '', '', pirate, viking, pirate,
        '', '', '', '', '', '', '', '', '', '', '', '',
        '', frog, '', '', '', '', '', '', '', '', frog, '',
        '', '', '', '', '', '', pirate, '', '', '', '', '',
        '', '', '', '', '', pirate, '', '', '', '', '', '',
        '', frog, '', '', '', '', '', '', '', '', frog, '',
        '', '', '', '', '', '', '', '', '', '', '', '',
        pirate, viking, pirate, '', '', viking, viking, '', '', pirate, viking, pirate,
        bomb, dragon, jester, pirate, pirate, otter, otter, pirate, pirate, jester, gryphon, bomb,
        fish, fish, tornado, khanda, wizard, staffSnake, priest, wizard, jedi, guitar, fish, fish
    ]

    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div')
        square.classList.add('square')

        if (waterSquares.includes(i)) {
            square.classList.add('water');
        }
        if (magicSquares.includes(i)) {
            square.classList.add('magic');
        }

        square.innerHTML = startPiece
        square.firstChild?.setAttribute('draggable', true) 
        square.setAttribute('square-id', i)
        // square.setAttribute('static-square-id', i)

        const row = Math.floor(((width * width - 1) - i) / width) + 1
        
        if (row % 2 === 0) {
            square.classList.add(i % 2 === 0 ? "light" : "dark")
        } else {
            square.classList.add(i % 2 === 0 ? "dark" : "light")
        }
        if (i <= (width * width) / 2 - 1) {
            if (square.firstChild) square.firstChild.classList.add('black')
        }

        if (i >= (width * width) / 2) {
            if (square.firstChild) square.firstChild.classList.add('white')
        }
        gameBoardFantasy.appendChild(square)
    })

    squareFunctionality()
    updateSquares()

    if (playerTurn === 'white') {
        reverseIds()
    }
}

function squareFunctionality() {
    const allSquares = document.querySelectorAll(".square")

    allSquares.forEach(square => {
        square.addEventListener('dragstart', dragStart)
        square.addEventListener('dragover', dragOver)
        square.addEventListener('drop', dragDrop)
    })
}

let startPositionId
let draggedElement

function dragStart(e) {
    startPositionId = e.target.parentNode.getAttribute('square-id')
    draggedElement = e.target
}

function dragOver(e) {
    e.preventDefault()
}

function dragDrop(e) {
    e.stopPropagation()
    
    const pieceType = draggedElement.id
    const fromSquare = document.querySelector(`[square-id="${startPositionId}"]`);
    const toSquare = e.target.classList.contains('square') ? e.target : e.target.parentNode
    const correctTurn = draggedElement.classList.contains(playerTurn)
    const valid = checkIfValid(draggedElement, fromSquare, toSquare)
    const targetPiece = toSquare.querySelector('.piece');
    
    if (!correctTurn) {
        return;
    }

    if (!valid) {
        infoDisplay.textContent = "Invalid move";
        flashInvalid(toSquare)
        return;
    }

    if (targetPiece && targetPiece.classList.contains(playerTurn)) {
        infoDisplay.textContent = "You can't capture your own piece";
        flashInvalid(toSquare)
        setTimeout(() => infoDisplay.textContent = "", 2000);
        return;
    }

    const captured = toSquare.querySelector('.piece');
    const fantasyCaptured = toSquare.querySelector('.fantasy-piece');

    fromSquare.removeChild(draggedElement);

    if (captured) {
        toSquare.removeChild(captured);
        toSquare.appendChild(draggedElement);

        runGameChecks(toSquare);
        updateSquares();
        changePlayer();
        checkGameStatus();

    } else if (fantasyCaptured) {

        fantasyCaptured.classList.add('captured')

        document.querySelectorAll('.fantasy-piece').forEach(p => {
            p.style.pointerEvents = 'none';
        });

        if (!handleFantasyCapture(toSquare, fantasyCaptured)) {

            fantasyCaptured.classList.remove('captured');

            // adding the old piece back to its original square
            fromSquare.appendChild(draggedElement);
            
            restoreInteraction();
            updateSquares();

            return;
        }

        if (fantasyCaptured.dataset.evasion === 'true') {
            if (fantasyCaptured.id === 'phoenix' ) {
                fantasyCaptured.classList.remove('captured');
                handlePhoenixRebirth(fantasyCaptured, toSquare);
            }
            if (fantasyCaptured.id === 'otter' ) {
                fantasyCaptured.classList.remove('captured');
                handleOtterEvasion(fantasyCaptured, toSquare);
            } 
        }

        setTimeout(() => {

            if (toSquare.contains(fantasyCaptured)) {
                toSquare.removeChild(fantasyCaptured);
            }
            toSquare.appendChild(draggedElement);
            
            restoreInteraction();

            runGameChecks(toSquare);
            updateSquares();
            changePlayer();
            checkGameStatus();

        }, captureDelay);

    } else {
        toSquare.appendChild(draggedElement);

        runGameChecks(toSquare);
        updateSquares();
        changePlayer();
        checkGameStatus();
    }
    
}

function runGameChecks(toSquare) {

    const pieceType = draggedElement.id
    const fromSquare = document.querySelector(`[square-id="${startPositionId}"]`);
    const endRow = getRow(Number(toSquare.getAttribute('square-id')))
    const stillInCheck = isKingInCheck(playerTurn);
    
    if (stillInCheck) {
        undoMove(fromSquare, toSquare, draggedElement, captured);
        infoDisplay.textContent = 'You cannot move into check';
        flashInvalid(toSquare)
        setTimeout(() => infoDisplay.textContent = '', 2000);
        return;
    }

    if (pieceType === 'pawn' && endRow === width - 1) {
        handlePawnPromotion(toSquare, playerTurn)
    }
    if (pieceType === 'pirate' && endRow === width - 1) {
        handleFantasyEvolution(toSquare, playerTurn, draggedElement)
    }
    if (pieceType === 'viking' && endRow === width - 1) {
        handleFantasyEvolution(toSquare, playerTurn, draggedElement)
    }

    if (draggedElement.id === 'king') {
        hasMoved[`${playerTurn}King`] = true
    }

    if (draggedElement.id === 'rook') {
        const from = Number(startPositionId)
        if (from % width === 0) hasMoved[`${playerTurn}RookA`] = true
        if (from % width === width - 1) hasMoved[`${playerTurn}RookH`] = true
    }

    if (castlingMove) {
        const rookSquare = document.querySelector(`[square-id="${castlingMove.rookStart}"]`)
        const rook = rookSquare.querySelector('.piece')
        const targetSquare = document.querySelector(`[square-id="${castlingMove.rookTarget}"]`)
        targetSquare.appendChild(rook)
        castlingMove = null
    }

    document.querySelectorAll('.last-move-from, .last-move-to').forEach(square => {
        square.classList.remove('last-move-from', 'last-move-to');
    });

    fromSquare.classList.add('last-move-from');
    toSquare.classList.add('last-move-to');
    draggedElement.dataset.moved = 'true';
}

function checkIfValid(piece, from, to) {
    const pieceType = piece.id
    const pieceColor = piece.classList[1]
    const opponentColor = pieceColor === 'white' ? 'black' : 'white'
    const startId = Number(from.getAttribute('square-id'))
    const targetId = Number(to.getAttribute('square-id'))

    if (isWaterSquare(to) && !isFantasyPiece(piece)) {
        return false;
    }
    if (isWaterSquare(to) && isFantasyPiece(piece) && !canWalkOnWater(piece)) {
        return false;
    }

    switch(pieceType) {
        
        // CLASSIC BOARD

        case 'pawn':
            const startRow = Array.from({ length: width }, (_, i) => 1 * width + i);
            const startCol = getCol(startId);
            const targetCol = getCol(targetId);

            if (
                startId + width === targetId &&
                !document.querySelector(`[square-id="${startId + width}"]`).firstChild
            ) {
                return true;
            }
            // Move forward 2 (only from start row)
            if (
                startRow.includes(startId) &&
                startId + width * 2 === targetId &&
                !document.querySelector(`[square-id="${startId + width}"]`).firstChild &&
                !document.querySelector(`[square-id="${startId + width * 2}"]`).firstChild
            ) {
                return true;
            }
            // Capture diagonally left
            if (
                targetId === startId + width - 1 &&
                targetCol === startCol - 1 &&
                document.querySelector(`[square-id="${targetId}"]`).firstChild
            ) {
                return true;
            }
            // Capture diagonally right
            if (
                targetId === startId + width + 1 &&
                targetCol === startCol + 1 && // Ensure it’s actually one column right
                document.querySelector(`[square-id="${targetId}"]`).firstChild
            ) {
                return true;
            }

            break;
        
        case 'knight':
        case 'otter':
            const knightMoves = [
                [-2, -1], [-2, 1],
                [-1, -2], [-1, 2],
                [1, -2], [1, 2],
                [2, -1], [2, 1],
            ];

            const startKnightRow = getRow(startId);
            const startKnightCol = getCol(startId);

            for (const [rowDirection, colDirection] of knightMoves) {
                
                const row = startKnightRow + rowDirection;
                const col = startKnightCol + colDirection;

                if (row < 0 || row >= width || col < 0 || col >= width) {
                    continue;
                }

                const nextId = row * width + col

                if (nextId === targetId) {

                    const square = document.querySelector(`[square-id="${nextId}"]`)
                    const piece = square.firstChild

                    if (!piece || !piece.classList.contains(pieceColor)) {
                        return true;
                    }
                }
                
            }

            break;

        case 'bishop':
            const bishopMoves = [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]

            for (const [rowDirection, colDirection] of bishopMoves) {
                let row = getRow(startId)
                let col = getCol(startId)

                while (true) {
                    row += rowDirection
                    col += colDirection

                    if (row < 0 || row >= width || col < 0 || col >= width) {
                        break;
                    }

                    const nextId = row * width + col
                    const square = document.querySelector(`[square-id="${nextId}"]`)
                    const piece = square.firstChild

                    if (nextId === targetId) {
                        // Can move to empty square or take opponent piece
                        if (!piece || !piece.classList.contains(pieceColor)) {
                            return true
                        } else {
                            break;
                        }
                    }

                    if (piece) {
                        break;
                    }
                }
            }

            break;

        case 'rook':
        case 'phoenix':
            const rookMoves = [
                [-1, 0], 
                [1, 0],  
                [0, -1], 
                [0, 1] 
            ]

            for (const [rowDirection, colDirection] of rookMoves) {
                let row = getRow(startId)
                let col = getCol(startId)

                while (true) {
                    row += rowDirection
                    col += colDirection

                    if (row < 0 || row >= width || col < 0 || col >= width) {
                        break;
                    }

                    const nextId = row * width + col
                    const square = document.querySelector(`[square-id="${nextId}"]`)
                    const piece = square.firstChild

                    if (nextId === targetId) {
                        if (!piece || !piece.classList.contains(pieceColor)) {
                            return true
                        } else {
                            break;
                        }
                    }

                    if (piece) {
                        break;
                    }
                }
            }

            break;
        
        case 'pirateKing':
        case 'mace':
        case 'whale':
        case 'crocodile':
        case 'witch':
        case 'violin':
        case 'queen':
            let queenMoves = [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1], 
                [-1, 0],
                [1, 0],
                [0, -1], 
                [0, 1]
            ]

            for (const [rowDirection, colDirection] of queenMoves) {
                let row = getRow(startId)
                let col = getCol(startId)

                while (true) {
                    row += rowDirection
                    col += colDirection

                    if (row < 0 || row >= width || col < 0 || col >= width) {
                        break;
                    }

                    const nextId = row * width + col
                    const square = document.querySelector(`[square-id="${nextId}"]`)
                    const piece = square.firstChild

                    if (nextId === targetId) {
                        if (!piece || !piece.classList.contains(pieceColor)) {
                            return true
                        } else {
                            break;
                        }
                    }

                    if (piece) {
                        break;
                    }
                }
            }

            break;
        
        case 'king':
            const colDiff = Math.abs((startId % 8) - (targetId % 8))
            const rowDiff = Math.abs(Math.floor(startId / 8) - Math.floor(targetId / 8))
            
            if (colDiff <= 1 && rowDiff <= 1) {
                return true
            }

            if (!hasMoved[`${playerTurn}King`] && rowDiff === 0 && colDiff === 2) {
                const rookStart = targetId > startId ? startId + 3 : startId - 4
                const rookSquare = document.querySelector(`[square-id="${rookStart}"]`)
                const rook = rookSquare?.querySelector('.piece')

                if (
                    rook &&
                    rook.id === 'rook' &&
                    rook.classList.contains(pieceColor) &&
                    !hasMoved[`${playerTurn}Rook${targetId < startId ? 'A' : 'H'}`]
                ) {
                    const step = targetId > startId ? 1 : -1
                    const midId = startId + step
                    const mid2Id = startId + step * 2

                    if (
                        isEmpty(midId) &&
                        isEmpty(mid2Id) &&
                        (step === 1 || isEmpty(startId - 3)) 
                    ) {

                        if (
                            !isUnderAttack(startId, pieceColor) &&
                            !isUnderAttack(midId, pieceColor) &&
                            !isUnderAttack(mid2Id, pieceColor)
                        ) {
                            castlingMove = {rookStart, rookTarget: startId + (step === 1 ? 1 : -1)}
                            return true
                        }
                    }
                }
            }

            break;


        // FANTASY CASES

        case 'pirate':
            const startPirateRow = Array.from({ length: width }, (_, i) => 1 * width + i);
            const startPirateCol = getCol(startId);
            const targetPirateCol = getCol(targetId);

            if (
                startId + width === targetId &&
                !document.querySelector(`[square-id="${startId + width}"]`).firstChild
            ) {
                return true;
            }

            if (
                (startPirateRow.includes(startId) &&
                startId + width * 2 === targetId &&
                !document.querySelector(`[square-id="${startId + width}"]`).firstChild &&
                !document.querySelector(`[square-id="${startId + width * 2}"]`).firstChild) ||
                (startPirateRow.includes(startId) &&
                startId + width * 3 === targetId &&
                !document.querySelector(`[square-id="${startId + width}"]`).firstChild &&
                !document.querySelector(`[square-id="${startId + width * 2}"]`).firstChild &&
                !document.querySelector(`[square-id="${startId + width * 3}"]`).firstChild)
            ) {
                return true;
            }

            if (
                targetId === startId + width - 1 &&
                targetPirateCol === startPirateCol - 1 &&
                document.querySelector(`[square-id="${targetId}"]`).firstChild
            ) {
                return true;
            }

            if (
                targetId === startId + width + 1 &&
                targetPirateCol === startPirateCol + 1 &&
                document.querySelector(`[square-id="${targetId}"]`).firstChild
            ) {
                return true;
            }

            break;
        
        case 'viking':
            const startVikingRow = getRow(startId);
            const startVikingCol = getCol(startId);

            let vikingMoves = [
                [1, 0],    
                [1, -1], 
                [1, 1],   
                [0, -1],
                [0, 1], 
            ];

            for (const [rowDirection, colDirection] of vikingMoves) {
                let row = startVikingRow;
                let col = startVikingCol;

                for (let i = 1; i <= 2; i++) {
                    row += rowDirection;
                    col += colDirection;

                    if (row < 0 || row >= width || col < 0 || col >= width) break;

                    const nextId = row * width + col;
                    const square = document.querySelector(`[square-id="${nextId}"]`);
                    const target = square.firstChild;

                    if (nextId === targetId) {
                        if (!target) {
                            return true;

                        } else {
                            break; 

                        }
                    }

                    if (target) break; // stop if something's in the way
                }
            }

            for (let dx = -1; dx <= 1; dx++) {
                let row = startVikingRow + 1;
                let col = startVikingCol + dx;

                if (row < 0 || row >= width || col < 0 || col >= width) return;

                const captureId = row * width + col;

                if (captureId === targetId) {
                    const square = document.querySelector(`[square-id="${captureId}"]`);
                    const targetPiece = square.firstChild;

                    if (targetPiece && !targetPiece.classList.contains(pieceColor)) {
                        return true;
                    }
                }
            }

            break;
    }
}

function handlePawnPromotion(square, color) {
    square.innerHTML = '';
    
    const promotion = prompt("Promote to: queen, rook, bishop, or knight", "queen");
    const choice = ['queen', 'rook', 'bishop', 'knight'].includes(promotion) ? promotion : 'queen';

    const pieceMap = { queen, rook, bishop, knight };
    
    square.innerHTML = pieceMap[choice];

    square.classList.add('square');

    const piece = square.firstChild;
    if (piece) {
        piece.setAttribute('draggable', true);
        piece.classList.add(color); // Add black or white class
    }
    
    square.firstChild?.setAttribute('draggable', true);
}

function handleFantasyEvolution(square, color, piece) {

    const pieceId = piece.id;

    square.classList.add('evolving-effect');

    setTimeout(() => {

        const temp = document.createElement('div');
        temp.innerHTML = evolutionMap[pieceId].trim();
        const evolvedPiece = temp.firstChild;
        evolvedPiece.setAttribute('draggable', true);
        evolvedPiece.classList.add(color);

        square.replaceChildren(evolvedPiece);
        square.classList.add('square');
        square.classList.remove('evolving-effect');
    }, captureDelay + 5);
}

function isEmpty(squareId) {
    const square = document.querySelector(`[square-id="${squareId}"]`)
    return square && !square.querySelector('.piece')
}

function isUnderAttack(squareId, color) {
    const opponentColor = color === 'white' ? 'black' : 'white'
    const allSquares = document.querySelectorAll('.square')

    for (const square of allSquares) {
        const piece = square.querySelector('.piece')
        const toSquare = document.querySelector(`[square-id="${squareId}"]`)

        if (piece && piece.classList.contains(opponentColor)) {
            if (checkIfValid(piece, square, toSquare)) {
                return true
            }
        }
    }

    return false
}

function undoMove(fromSquare, toSquare, movedPiece, capturedPiece = null) {

    toSquare.removeChild(movedPiece);
    fromSquare.appendChild(movedPiece);

    if (capturedPiece) {
        toSquare.appendChild(capturedPiece);
    }
}

function changePlayer() {
    const state = guitarState[playerTurn];
    const protectedPieces = Array.from(document.querySelectorAll('.fantasy-piece'))
        .filter(p => p.dataset.divineProtected !== undefined);
    
    // this is extra shit
    if (state.encoreActive) {
        state.encoreMovesUsed += 1;

        if (state.encoreMovesUsed < 2) {
            console.log(`${playerTurn} Encore move ${state.encoreMovesUsed}/2`);
            return; 

        } else {
            state.encoreActive = false;
            state.encoreMovesUsed = 0;
        }
    }

    protectedPieces.forEach(piece => {
        // essentially a mark for protection to ensure that the shield stays for a turn
        // > 0 here means still protected, and if it hits 0 the shield is removed, all updated in fantasyCapture function
        
        if (piece.dataset.divineProtected > 0) {
            piece.dataset.divineProtected -= 1;

        } else {
            piece.classList.remove('divine-shield');
            delete piece.dataset.divineProtected;
        }
    });
    
    updateEyeEvolutionTracking();

    // Switch players
    if (playerTurn === 'black') {
        reverseIds();
        playerTurn = 'white';
    } else {
        revertIds();
        playerTurn = 'black';
    }

    // Activate Encore if it was queued
    const newState = guitarState[playerTurn];

    if (newState.encoreNextTurn) {
        newState.encoreActive = true;
        newState.encoreMovesUsed = 0;
        newState.encoreNextTurn = false;
        console.log(`${playerTurn} has ENCORE active! Two moves this turn.`);
    }

    updateSquares();
    updateGameState();
    playerDisplay.textContent = playerTurn;

    if (gameBoardFantasy && gameBoardFantasy.offsetParent !== null) {
        console.log('Turn: ' + gameState.turnCount);
    }

}

function reverseIds() {
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square, i) => {
        const row = Math.floor(i / width);
        const col = i % width;
        const flippedRow = width - 1 - row;
        const newId = flippedRow * width + col;
        square.setAttribute('square-id', newId);
    });
}

function revertIds() {
    const allSquares = document.querySelectorAll(".square")
    allSquares.forEach((square, i) => 
        square.setAttribute('square-id', i))
}

function getCol(squareId) {
  return squareId % width;
}

function getRow(squareId) {
  return Math.floor(squareId / width);
}

function isKingInCheck(playerColor) {
    const opponentColor = playerColor === 'white' ? 'black' : 'white'
    const allSquares = document.querySelectorAll('.square')

    // Find the king element and its square
    let kingSquare = null

    allSquares.forEach(sq => {
        const piece = sq.querySelector('.piece')
        if (piece && piece.id === 'king' && piece.classList.contains(playerColor)) {
            kingSquare = sq
        }
    })

    if (!kingSquare) return false // fallback

    for (const square of allSquares) {
        const piece = square.querySelector('.piece')
        if (piece && piece.classList.contains(opponentColor)) {
            const fromSquare = square
            const toSquare = kingSquare
            changePlayer()
            const valid = checkIfValid(piece, fromSquare, toSquare)
            changePlayer()
            if (valid) {
                return true
            }
        }
    }
    return false
}

function hasAnyLegalMoves(playerColor) {

    // temp fix to stalemate?
    if (document.body.classList.contains('fantasy-mode')) {
        return true;
    }

    const allSquares = document.querySelectorAll('.square')
    const ownSquares = Array.from(allSquares).filter(sq => {
        const piece = sq.querySelector('.piece')
        return piece && piece.classList.contains(playerColor)
    })

    for (const fromSquare of ownSquares) {
        const piece = fromSquare.querySelector('.piece')
        for (const toSquare of allSquares) {
            if (checkIfValid(piece, fromSquare, toSquare)) {
                // Simulate move
                const captured = toSquare.querySelector('.piece')

                if (captured && captured.classList.contains(playerColor)) {
                    continue;
                }

                fromSquare.removeChild(piece)
                if (captured) toSquare.removeChild(captured)
                toSquare.appendChild(piece)

                const kingStillInCheck = isKingInCheck(playerColor)

                // Undo move
                toSquare.removeChild(piece)
                fromSquare.appendChild(piece)
                if (captured) {
                    toSquare.appendChild(captured)
                }

                // If this move resolves check, it's legal
                if (!kingStillInCheck) {
                    return true
                }
            }
        }
    }
    return false
}

// Fantasy piece specific code starts here

const gameState = {
    currentPlayer: 'white',
    selectedPiece: null,
    eyeOfStorm: {
        square: null,
        tracker: new Map()
    },
    swampGate: {
        portals: [],  
        teleportWatcher: null 
    },
    turnCount: 0,
    specialEffects: [],
    gameOver: false,
    abilityCharges: {

    }
};

// PIECE REMOVAL FUNCTION ACROSS ALL PLATFORMS
function handleFantasyCapture(targetSquare, target) {

    if (!target) {
        console.log('No target piece to capture!');
        return false;
    }

    if (target.classList.contains(playerTurn)) {
        console.log('Cannot capture own piece!');
        return false;
    }

    if (target.dataset.divineProtected) {
        console.log("🛡️ Capture blocked by DIVINE PROTECTION!");

        targetSquare.classList.add('shield-block');
        targetSquare.addEventListener('animationend', () => {
            targetSquare.classList.remove('shield-block');
            delete target.dataset.divineProtected;
            target.classList.remove('divine-shield');
            console.log('DIVINE PROTECTION stopped this attack!');

        }, { once: true });
        
        changePlayer();
        return false;
    }
    
    return true;
}

function updateEyeEvolutionTracking() {
    const { square, tracker } = gameState.eyeOfStorm;
    if (!square || !tracker) return;

    const piece = square.querySelector('.fantasy-piece');

    if (!piece || !tracker.has(piece)) {
        tracker.clear(); 
        return;
    }

    const count = tracker.get(piece) + 1;

    // 4 turns to evolve without moving
    if (count >= 8) {

        if (piece.classList.contains('evolved') || !evolutionMap[piece.id]) {
            return;
        }

        const evolvedHTML = evolutionMap[piece.id];
        const temp = document.createElement('div');
        temp.innerHTML = evolvedHTML.trim();
        const evolvedElement = temp.firstChild;

        const color = piece.classList.contains('white') ? 'white' : 'black';
        evolvedElement.classList.add(color);
        evolvedElement.classList.add('evolution-flare');

        piece.parentElement.replaceChild(evolvedElement, piece);
        
        evolvedElement.addEventListener('animationend', () => {
            evolvedElement.classList.remove('evolution-flare');
        }, { once: true });

        tracker.delete(piece);

    } else {
        tracker.set(piece, count);
    }
}

function linkSwampPortals() {
    const portals = Array.from(document.querySelectorAll('.square.swamp-portal'));

    if (portals.length !== 2) return; // Need exactly two portals

    const squareA = portals[0];
    const squareB = portals[1];

    const idA = squareA.getAttribute('square-id');
    const idB = squareB.getAttribute('square-id');

    gameState.swampGate.portals = [squareA, squareB];

    delete squareA.dataset.linkedPortal;
    delete squareB.dataset.linkedPortal;

    squareA.dataset.linkedPortal = idB;
    squareB.dataset.linkedPortal = idA;
}

// PASSIVES
function handleOtterEvasion(otter, originSquare) {

    const waterSquares = Array.from(document.querySelectorAll('.square.water'));
    const unoccupied = waterSquares.filter(square => {
        return !square.querySelector('.fantasy-piece');
    });

    if (unoccupied.length === 0) {
        console.log("No unoccupied water squares available! Evasion fails!");
        return;
    }

    const escapeSquare = unoccupied[Math.floor(Math.random() * unoccupied.length)];

    originSquare.removeChild(otter);
    escapeSquare.appendChild(otter);

    otter.classList.remove('select-glow')
    otter.classList.add('otter-evasion');
    escapeSquare.classList.add('evasion-glow');
    otter.dataset.evasion = 'false';

    otter.addEventListener('animationend', () => {
        otter.classList.remove('otter-evasion');
    }, { once: true });

    escapeSquare.addEventListener('animationend', () => {
        escapeSquare.classList.remove('evasion-glow');
    }, { once: true });
}

function handlePhoenixRebirth(phoenix, originSquare) {

    const lavaSquares = Array.from(document.querySelectorAll('.square.lava'));
    const unoccupied = lavaSquares.filter(square => {
        return !square.querySelector('.fantasy-piece');
    });

    if (unoccupied.length === 0) {
        console.log("No unoccupied lava squares available! Rebirth fails!");
        return;
    }

    const escapeSquare = unoccupied[Math.floor(Math.random() * unoccupied.length)];

    originSquare.removeChild(phoenix);
    escapeSquare.appendChild(phoenix);

    // this select-glow shit was the dumbest fucking fix i've ever seen
    phoenix.classList.remove('select-glow')
    phoenix.classList.add('phoenix-rebirth');
    escapeSquare.classList.add('evasion-glow');
    phoenix.dataset.evasion = 'false';

    phoenix.addEventListener('animationend', () => {
        console.log('reached')
        phoenix.classList.remove('phoenix-rebirth');
    }, { once: true });

    escapeSquare.addEventListener('animationend', () => {
        escapeSquare.classList.remove('evasion-glow');
    }, { once: true });
}

// maps one-to-one
const evolutionMap = {
    bomb: dynamite,
    dragon: phoenix,
    fish: koi,
    frog: crocodile,
    gryphon: hamsa,
    guitar: violin,
    jedi: sith,
    jester: joker,
    khanda: zulfiqar,
    otter: whale,
    pirate: pirateKing,
    priest: pope,
    staffSnake: kraken,
    tornado: thunder,
    umbrella: balloon,
    viking: mace,
    wizard: witch
}

const devolutionMap = {
    dynamite: bomb,
    phoenix: dragon,
    koi: fish,
    crocodile: frog,
    hamsa: gryphon,
    violin: guitar,
    sith: jedi,
    joker: jester,
    zulfiqar: khanda,
    whale: otter,
    pirateKing: pirate,
    pope: priest,
    kraken: staffSnake,
    thunder: tornado,
    balloon: umbrella,
    mace: viking,
    witch: wizard
}

// declaration of ability-sepcific variables
let canCastAbility = true;
let canCastSpecialAbility = true;
let canCastUltimateAbility = true;
let abilityDelay = 450;

const guitarState = {
    white: { encoreNextTurn: false, encoreActive: false, movesUsed: 0 },
    black: { encoreNextTurn: false, encoreActive: false, movesUsed: 0 }
};

// list of abilities for each piece
const abilityMap = {

    bomb : {
        name : "DOWN THE LINE",
        charges: 3,
        effect: function (piece, finished) {
            if (abilityMap.bomb.charges <= 0) {
                console.log(`No charges left for ${abilityMap.bomb.name}!`);
                return;
            }

            const originId = Number(piece.parentElement.getAttribute('square-id'));
            const col = originId % width;
            let currentRow = Math.floor(originId / width);
            let nextRow = currentRow + 1;

            const path = [];

            while (nextRow < width) {
                const nextId = nextRow * width + col;
                const nextSquare = document.querySelector(`[square-id="${nextId}"]`);
                const pieceInNext = nextSquare.querySelector('.piece, .fantasy-piece');

                if (pieceInNext) break;

                path.push(nextSquare);
                currentRow = nextRow;
                nextRow++;
            }

            let i = 0;

            function slideStep() {
                if (i < path.length) {
                    const nextSquare = path[i];
                    piece.parentElement.removeChild(piece);
                    nextSquare.appendChild(piece);
                    i++;
                    setTimeout(slideStep, 100);
                } else {
                    triggerExplosion(currentRow, col);
                }
            }

            slideStep();

            function triggerExplosion(row, col) {
                const splashRadius = [-1, 0, 1];
                const affectedSquares = [];
                
                document.body.classList.add('shake');
                setTimeout(() => document.body.classList.remove('shake'), 400);

                splashRadius.forEach(dy => {
                    splashRadius.forEach(dx => {
                        const r = row + dy;
                        const c = col + dx;
                        if (r >= 0 && r < width && c >= 0 && c < width) {
                            const targetId = r * width + c;
                            const square = document.querySelector(`[square-id="${targetId}"]`);
                            if (square) affectedSquares.push(square);
                        }
                    });
                });

                affectedSquares.forEach((square, i) => {
                    setTimeout(() => {
                        square.classList.add('explosion-zone');

                        const target = square.querySelector('.piece, .fantasy-piece');
                        if (target) {
                            square.removeChild(target);
                            updateSquares();
                        }
                        

                        const explosion = document.createElement('div');
                        explosion.textContent = '💥';
                        explosion.style.position = 'absolute';
                        explosion.style.top = '50%';
                        explosion.style.left = '50%';
                        explosion.style.transform = 'translate(-50%, -50%) scale(2.2)';
                        explosion.style.fontSize = '3.5rem';
                        explosion.style.pointerEvents = 'none';
                        explosion.style.zIndex = '999';
                        explosion.style.animation = 'cannon-pulse-glow 0.5s ease-out';

                        const ring = document.createElement('div');
                        ring.classList.add('explosion-ring');
                        square.appendChild(ring);
                        square.appendChild(explosion);

                        setTimeout(() => {
                            explosion.remove();
                            ring.remove();
                            square.classList.remove('explosion-zone');
                        }, 600);
                    }, i * 100);
                });
                
                console.log(`💣 Bomb used ${abilityMap.bomb.name}!`);

                abilityMap.bomb.charges -= 1;
                console.log(`Charges remaining: ${abilityMap.bomb.charges}`);
                finished();
            }
        }
    },

    dragon : {
        name : "LANE OF FIRE",
        charges: 4,
        // cooldown: 10,
        effect: (piece, finished) => {

            if (abilityMap.dragon.charges <= 0) {
                console.log(`No charges left for ${abilityMap.dragon.name}!`);
                return;
            }

            const randomCol = Math.floor(Math.random() * width); // column 0–7
            
            flashColumn(randomCol);
            
            setTimeout(() => {
                const allSquares = document.querySelectorAll(`[square-id]`);
                allSquares.forEach(square => {
                    const squareId = Number(square.getAttribute('square-id'));
                    const col = squareId % width;

                    if (col === randomCol) {
                        const target = square.querySelector('.piece, .fantasy-piece');
                        if (target && target.dataset.fireproof !== 'true') {
                            square.removeChild(target);
                            updateSquares();
                        }
                    }
                });
            }, 90 * width);

            console.log(`🔥 Dragon casts ${abilityMap.dragon.name} on column ${randomCol + 1}!`);
            
            abilityMap.dragon.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.dragon.charges}`);
            finished();
        }
    },

    fish : {
        name : "SINK AND RISE",
        charges: Infinity, 
        effect: function (piece, finished) {
            
            if (abilityMap.fish.charges <= 0) {
                console.log(`No charges left for ${abilityMap.fish.name}!`);
                return;
            }

            const waterSquares = Array.from(document.querySelectorAll('.square.water'));

            const unoccupied = waterSquares.filter(square => {
                return !square.querySelector('.fantasy-piece');
            });

            if (unoccupied.length === 0) {
                console.log("🐟 No unoccupied water squares available!");
                return;
            }

            const randomSquare = unoccupied[Math.floor(Math.random() * unoccupied.length)];

            const currentSquare = piece.parentNode;
            currentSquare.removeChild(piece);
            randomSquare.appendChild(piece);

            randomSquare.classList.add('fish-teleport');
            setTimeout(() => randomSquare.classList.remove('fish-teleport'), 300);

            console.log(`🐟 Fish used ${abilityMap.fish.name}!`);

            abilityMap.fish.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.fish.charges}`);
            finished();
        }
    },

    frog : {
        name : "SWAMP SWAP",
        charges: Infinity,
        effect: function (piece, finished) {

            const selectedPiece = piece;
            const selectedSquare = selectedPiece.parentElement;

            selectedSquare.classList.add('swapping-frog');
            document.querySelectorAll('.fantasy-piece').forEach(p => p.setAttribute('draggable', false));

            const handleSwapClick = (e) => {
                const target = e.target;
                const clickedPiece = target.closest('.fantasy-piece');
                const clickedSquare = target.closest('.square');

                if (!clickedPiece || clickedPiece === selectedPiece) {
                    console.log(`${abilityMap.frog.name} canceled.`);
                    cleanup();
                    return;
                }

                if (!clickedPiece.classList.contains(playerTurn)) {
                    console.log("You can only swap with an ally.");
                    return;
                }

                const fromSquare = selectedPiece.parentElement;
                const toSquare = clickedPiece.parentElement;

                fromSquare.appendChild(clickedPiece);
                toSquare.appendChild(selectedPiece);
                finished();

                cleanup();
            };

            function cleanup() {
                document.removeEventListener('click', handleSwapClick);
                selectedSquare.classList.remove('swapping-frog');
                document.querySelectorAll('.fantasy-piece').forEach(p => p.setAttribute('draggable', true));
                updateSquares();
            }

            setTimeout(() => document.addEventListener('click', handleSwapClick), 0);

            console.log(`🐸 Frog used ${abilityMap.frog.name}!`);

            abilityMap.frog.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.frog.charges}`);
        }
    },

    gryphon : {
        name : "SKY DIVE",
        charges: 99,    
        effect: function (piece, finished) {

            if (abilityMap.gryphon.charges <= 0) {
                console.log(`No charges left for ${abilityMap.gryphon.name}!`);
                return;
            }

            const squares = document.querySelectorAll('.square');

            squares.forEach(square => {
                if (square.firstChild && !square.firstChild.classList.contains(playerTurn)) {
                    square.classList.add('gryphon-targetable');
                }
            });

            function handleTargetClick(e) {
                const square = e.currentTarget;
                const target = square.querySelector('.fantasy-piece');

                squares.forEach(sq => {
                    sq.classList.remove('gryphon-targetable');
                    sq.removeEventListener('click', handleTargetClick);
                });

                if (target && !target.classList.contains(playerTurn) && !target.classList.contains('evolved')) {

                    square.classList.add('gryphon-hit');
                    square.removeChild(target);

                    setTimeout(() => {
                        square.classList.remove('gryphon-hit');
                    }, 500);

                    console.log(`🦅 Gryphon obliterated an enemy piece using ${abilityMap.gryphon.name}!`);

                    abilityMap.gryphon.charges -= 1;
                    console.log(`Charges remaining: ${abilityMap.gryphon.charges}`);

                    updateSquares();
                    finished();

                } else {
                    console.log(`🦅 ${abilityMap.gryphon.name} landed, but no enemy was hit.`);
                }
            }

            squares.forEach(square => {
                square.addEventListener('click', handleTargetClick);
            });
        }
    },

    guitar : {
        name : "ENCORE",
        charges: 5,
        effect: function (piece, finished) {

            if (abilityMap.guitar.charges <= 0) {
                console.log(`No charges left for ${abilityMap.guitar.name}!`);
                return;
            }

            guitarState[playerTurn].encoreNextTurn = true;

            piece.parentElement.classList.add('encore-cast');
            setTimeout(() => piece.parentElement.classList.remove('encore-cast'), 800);

            console.log(`🎸 ${playerTurn} activated ${abilityMap.guitar.name}! They will get two moves on their next turn.`);

            abilityMap.guitar.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.guitar.charges}`);
            finished();
        }
    },

    jedi : {
        name : "FORCE PUSH",
        charges: Infinity,
        effect: function (piece, finished) {

            if (abilityMap.jedi.charges <= 0) {
                console.log(`No charges left for ${abilityMap.jedi.name}!`);
                return;
            }

            const enemyColor = playerTurn === 'white' ? 'black' : 'white';
            const shouldPush = (row) => row < width / 2;
            
            const allPieces = Array.from(document.querySelectorAll(`.fantasy-piece.${enemyColor}`));

            allPieces.forEach(target => {
                const startSquare = target.parentElement;
                const startId = Number(startSquare.getAttribute('square-id'));
                const row = getRow(startId);
                const col = getCol(startId);

                if (!shouldPush(row)) return; 

                const newRow = row + 1;
                if (newRow < 0 || newRow >= width) return; 

                const endId = newRow * width + col;
                const endSquare = document.querySelector(`[square-id="${endId}"]`);

                if (endSquare && !endSquare.querySelector('.fantasy-piece')) {
                    startSquare.removeChild(target);
                    endSquare.appendChild(target);

                    target.classList.add('force-push');
                    target.parentElement.classList.add('force-push');

                    setTimeout(() => {
                        target.classList.remove('force-push');
                        target.parentElement.classList.remove('force-push');
                    }, 400);
                }
            });

            console.log(`🙌 Jedi pushed an enemy piece using ${abilityMap.jedi.name}!`);

            abilityMap.jedi.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.jedi.charges}`);
            finished();
        }
    },

    jester : {
        name : "JOKES ON YOU",
        charges: 100,
        effect: function (piece, finished) {

            if (abilityMap.jester.charges <= 0) {
                console.log(`No charges left for ${abilityMap.jester.name}!`);
                return;
            }

            const enemyColor = playerTurn === 'white' ? 'black' : 'white';
            const enemyPieces = Array.from(document.querySelectorAll(`.fantasy-piece.${enemyColor}`));
            
            if (enemyPieces.length < 2) return;

            const [firstTarget, secondTarget] = enemyPieces
                .sort(() => 0.5 - Math.random())
                .slice(0, 2);
            
            const firstSquare = firstTarget.parentElement;
            const secondSquare = secondTarget.parentElement;

            firstSquare.replaceChild(secondTarget, firstTarget);
            secondSquare.appendChild(firstTarget);

            firstSquare.classList.add('jester-swap');
            secondSquare.classList.add('jester-swap');

            firstSquare.addEventListener('animationend', () => {
                firstSquare.classList.remove('jester-swap');
            }, { once: true });

            secondSquare.addEventListener('animationend', () => {
                secondSquare.classList.remove('jester-swap');
            }, { once: true });

            console.log(`🎭 Jester used ${abilityMap.jester.name}!`);

            abilityMap.jester.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.jester.charges}`);
            updateSquares();
            finished();
        }
    },

    khanda : {
        name : "BALANCE THE SCALES",
        charges: 2,
        effect: function (piece, finished) {
            if (abilityMap.khanda.charges <= 0) {
                console.log("No charges left for BALANCE THE SCALES!");
                return;
            }

            const allPieces = [...document.querySelectorAll('.fantasy-piece')];
            const whitePieces = allPieces.filter(piece => piece.classList.contains('white'));
            const blackPieces = allPieces.filter(piece => piece.classList.contains('black'));

            const diff = Math.abs(whitePieces.length - blackPieces.length);

            if (diff === 0) {
                console.log("The board is already balanced.");
                return;
            }

            const sideToCut = whitePieces.length > blackPieces.length ? whitePieces : blackPieces;

            const candidates = sideToCut.filter(p => {
                return !p.classList.contains('ultimate') &&
                    !p.dataset.divineProtected &&
                    !p.classList.contains('khanda'); 
            });

            if (candidates.length < diff) {
                return;
            }

            const toEliminate = [];
            while (toEliminate.length < diff) {
                const pick = candidates[Math.floor(Math.random() * candidates.length)];
                if (!toEliminate.includes(pick)) toEliminate.push(pick);
            }

            toEliminate.forEach((target, i) => {
                const square = target.parentElement;

                target.classList.add('khanda-strike'); 
                square.classList.add('khanda-glow');

                target.addEventListener('animationend', () => {
                    if (square.contains(target)) {
                        square.removeChild(target);
                    }
                    updateSquares();
                }, { once: true });

                square.addEventListener('animationend', () => {
                    square.classList.remove('khanda-glow');
                }, { once: true });

            });

            console.log(`⚖️ Khanda used ${abilityMap.khanda.name} to balance the battlefield!`)

            abilityMap.khanda.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.khanda.charges}`);
            finished();
        }
    },

    otter : {
        name : "PLAYFUL NATURE",
        charges: Infinity,
        effect: function (piece, finished) {

            if (abilityMap.otter.charges <= 0) {
                console.log(`No charges left for ${abilityMap.otter.name}!`);
                return;
            }

            const selectedPiece = piece;
            const selectedSquare = selectedPiece.parentElement;

            selectedSquare.classList.add('enhancing-otter');
            document.querySelectorAll('.fantasy-piece').forEach(p => p.setAttribute('draggable', false));

            const handleSwapClick = (e) => {
                const target = e.target;
                const clickedPiece = target.closest('.fantasy-piece');
                const clickedSquare = target.closest('.square');

                if (!clickedPiece || clickedPiece === selectedPiece) {
                    console.log(`${abilityMap.otter.name} canceled.`);
                    cleanup();
                    return;
                }

                if (!clickedPiece.classList.contains(playerTurn)) {
                    console.log("You can only enhance an ally.");
                    return;
                }
                
                clickedPiece.dataset.waterWalking = 'true';
                clickedSquare.classList.add('water-upgrade');

                clickedSquare.addEventListener('animationend', () => {
                    clickedSquare.classList.remove('water-upgrade');
                }, { once: true });

                finished();
                cleanup();
            };

            function cleanup() {
                document.removeEventListener('click', handleSwapClick);
                selectedSquare.classList.remove('enhancing-otter');
                document.querySelectorAll('.fantasy-piece').forEach(p => p.setAttribute('draggable', true));
                updateSquares();
            }

            setTimeout(() => document.addEventListener('click', handleSwapClick), 0);

            console.log(`🦦 Otter used ${abilityMap.otter.name}!`);

            abilityMap.otter.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.otter.charges}`);
        }
    },

    pirate : {
        name : "FRONTAL SLASH",
        charges: 8,
        effect: function (piece, finished) {

            if (abilityMap.pirate.charges <= 0) {
                console.log(`No charges left for ${abilityMap.pirate.name}!`);
                return;
            }

            const originId = Number(piece.parentElement.getAttribute('square-id'));
            const row = getRow(originId);
            const col = getCol(originId);
            
            const color = piece.classList.contains('white') ? 'white' : 'black';
            
            const frontRow = row + 1;

            if (frontRow >= width) {
                return;
            }

            for (let diffCol = -1; diffCol <= 1; diffCol++) {
                const targetCol = col + diffCol;

                if (targetCol < 0 || targetCol >= width) continue;

                const targetId = frontRow * width + targetCol;
                const targetSquare = document.querySelector(`[square-id="${targetId}"]`);
                
                if (targetSquare) {
                    targetSquare.classList.add('sweep-strike');

                    targetSquare.addEventListener('animationend', () => {
                        targetSquare.classList.remove('sweep-strike');
                    }, { once: true });

                    const target = targetSquare?.querySelector('.fantasy-piece');

                    if (target && !target.classList.contains(color)) {
                        setTimeout(() => targetSquare.removeChild(target), 150);
                    }

                    setTimeout(() => updateSquares(), 200);

                }
            }

            console.log(`🏴‍☠️ Pirate used ${abilityMap.pirate.name}!`);

            abilityMap.pirate.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.pirate.charges}`);
            finished();
        }
    },

    priest : {
        name: "DIVINE PROTECTION",
        charges: 3,
        effect: function (piece, finished) {

            if (abilityMap.priest.charges <= 0) {
                console.log(`No charges left for ${abilityMap.priest.name}!`);
                return;
            }

            const allUnmoved = Array.from(document.querySelectorAll('.fantasy-piece'))
                .filter(piece => 
                    !piece.dataset.moved &&
                    piece.classList.contains(playerTurn)
                );

            allUnmoved.forEach(piece => {

                if (piece.dataset.divineProtected !== undefined) {
                    return;
                }
                piece.classList.add('divine-shield');
                piece.dataset.divineProtected = 2;

                const square = piece.parentElement;
                square.classList.add('divine-upgrade');
                square.addEventListener('animationend', () => {
                    square.classList.remove('divine-upgrade');
                }, { once: true });
            });

            console.log(`⛪ Priest cast ${abilityMap.priest.name} on ${allUnmoved.length} unmoved piece(s)!`);
            
            abilityMap.priest.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.priest.charges}`);
            updateSquares();
            finished();
        }
    },

    staffSnake : {
        name : "SNAKE BITE",
        charges: 9,
        effect: function (piece, finished) {

            if (abilityMap.staffSnake.charges <= 0) {
                console.log(`No charges left for ${abilityMap.staffSnake.name}!`);
                return;
            }

            const clickHandler = (e) => {
                const target = e.target.closest('.fantasy-piece');

                if (!target) return;

                const type = target.id;
                const isEvolved = target.classList.contains('evolved');

                if (target === piece || !target.classList.contains(playerTurn) || !type || isEvolved || !evolutionMap[type]) {
                    document.removeEventListener('click', clickHandler);
                    return;
                }

                const evolvedHTML = evolutionMap[type];
                const temp = document.createElement('div');
                temp.innerHTML = evolvedHTML.trim();
                const evolvedElement = temp.firstChild;

                const color = target.classList.contains('white') ? 'white' : 'black';
                evolvedElement.classList.add(color);
                evolvedElement.classList.add('evolution-flare');

                target.parentElement.replaceChild(evolvedElement, target);
                
                evolvedElement.addEventListener('animationend', () => {
                    evolvedElement.classList.remove('evolution-flare');
                }, { once: true });

                console.log(`⚕️ Staff Snake used ${abilityMap.staffSnake.name}! It transformed a ${type} into a ${evolvedElement.id}!`);
                
                abilityMap.staffSnake.charges -= 1;
                console.log(`Charges remaining: ${abilityMap.staffSnake.charges}`);

                document.removeEventListener('click', clickHandler);
                updateSquares();
                finished();
            };

            setTimeout(() => {
                document.addEventListener('click', clickHandler);
            }, 0);
        }
    },

    tornado : {
        name : "HEAVY WINDS",
        charges: 5,
        effect: function (piece, finished) {

            if (abilityMap.tornado.charges <= 0) {
                console.log(`No charges left for ${abilityMap.tornado.name}!`);
                return;
            }

            const middleRowRange = [...Array(width * 4).keys()].map(i => i + width * 4); 
            const allSquares = middleRowRange
                .map(id => document.querySelector(`[square-id="${id}"]`))
                .filter(square => square && square !== piece.closest('.square'));

            let allTargets = allSquares
                .map(square => square.querySelector('.fantasy-piece'))
                .filter(target => target && target !== piece);

            const availableSquares = [...allSquares];
            for (let i = availableSquares.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableSquares[i], availableSquares[j]] = [availableSquares[j], availableSquares[i]];
            }

            const waterSquares = Array.from(document.querySelectorAll('#fantasy-gameboard .square.water'));
            const lavaSquares = Array.from(document.querySelectorAll('#fantasy-gameboard .square.lava'));
            const magicSquares = Array.from(document.querySelectorAll('#fantasy-gameboard .square.magic'));
            
            allSquares.forEach(square => {
                square.classList.add('tornado-zone'); 

                square.classList.remove('water');
                square.classList.remove('lava');
                square.classList.remove('magic')

                setTimeout(() => {
                    square.classList.remove('tornado-zone');
                    if (square && waterSquares.includes(square)) square.classList.add('water');
                    if (square && lavaSquares.includes(square)) square.classList.add('lava');
                    if (square && magicSquares.includes(square)) square.classList.add('magic');
                }, 1500); // Match the duration of spiralSpin
                
            });

            allTargets.forEach((target, index) => {
                const oldSquare = target.parentElement;
                const newSquare = availableSquares[index];

                target.classList.add('tornado-fling');
                target.style.pointerEvents = 'none';

                target.addEventListener('animationend', () => {
                    oldSquare.removeChild(target);
                    newSquare.appendChild(target);
                    updateSquares();
                    target.classList.remove('tornado-fling');
                    target.style.pointerEvents = '';
                }, { once: true });

            });

            console.log(`🌪️ Tornado scattered the center with ${abilityMap.tornado.name}!`);
            
            abilityMap.tornado.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.tornado.charges}`);
            finished();
        }
    },

    viking : {
        name : "FROSTAL SMASH",
        charges: Infinity,
        effect: function (piece, finished) {
            
            if (abilityMap.viking.charges <= 0) {
                console.log(`No charges left for ${abilityMap.viking.name}!`);
                return;
            }

            const originId = Number(piece.parentElement.getAttribute('square-id'));
            const row = getRow(originId);
            const col = getCol(originId);

            const color = piece.classList.contains('white') ? 'white' : 'black';

            for (let i = 1; i <= 2; i++) {
                const targetRow = row + i;

                if (targetRow < 0 || targetRow >= width) continue;

                const targetId = targetRow * width + col;
                const targetSquare = document.querySelector(`[square-id="${targetId}"]`);
                const target = targetSquare?.querySelector('.fantasy-piece');
                
                targetSquare.classList.add('frost-smash');

                if (targetSquare && target && !target.classList.contains(color)) {
                    targetSquare.removeChild(target)
                }

                targetSquare.addEventListener('animationend', () => {
                    targetSquare.classList.remove('frost-smash');
                }, { once: true });

                updateSquares();
            }

            console.log(`❄️ Viking used ${abilityMap.viking.name}!`);

            abilityMap.viking.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.viking.charges}`);
            finished();
        }
    },

    wizard : {
        name : "MAGIC MISSILE",
        charges: Infinity,
        effect: function (piece, finished) {

            if (abilityMap.wizard.charges <= 0) {
                console.log(`No charges left for ${abilityMap.wizard.name}!`);
                return;
            }

            const targets = Array.from(document.querySelectorAll(`.fantasy-piece.${playerTurn}`)).filter(piece => {
                const type = piece.id;
                return !piece.classList.contains('evolved') && evolutionMap[type];
            });

            if (targets.length === 0) {
                finished();
                return;
            }

            const target = targets[Math.floor(Math.random() * targets.length)];
            const type = target.id;
            const evolvedHTML = evolutionMap[type];

            const temp = document.createElement('div');
            temp.innerHTML = evolvedHTML.trim();
            const evolvedElement = temp.firstChild;

            const color = target.classList.contains('white') ? 'white' : 'black';
            evolvedElement.classList.add(color);
            evolvedElement.classList.add('evolution-flare');

            target.parentElement.replaceChild(evolvedElement, target);

            evolvedElement.addEventListener('animationend', () => {
                evolvedElement.classList.remove('evolution-flare');
            }, { once: true });

            console.log(`${abilityMap.wizard.name} randomly evolved ${type} to ${evolvedElement.id}!`);
            
            abilityMap.wizard.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.wizard.charges}`);
            updateSquares();
            finished();
        }
    }
}

const specialAbilityMap = {

    dynamite: {
        name: "FIVE BIG BOOMS",
        charges: 5,
        effect: function (piece, finished) {

            if (specialAbilityMap.dynamite.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.dynamite.name}!`);
                return;
            }

            const originId = Number(piece.parentElement.getAttribute('square-id'));
            const col = getCol(originId);
            let currentRow = getRow(originId);
            let nextRow = currentRow + 1;

            const path = [];

            while (nextRow < width) {
                const nextId = nextRow * width + col;
                const nextSquare = document.querySelector(`[square-id="${nextId}"]`);
                const pieceInNext = nextSquare.querySelector('.piece, .fantasy-piece');

                if (pieceInNext) break;

                path.push(nextSquare);
                currentRow = nextRow;
                nextRow++;
            }

            let i = 0;

            function slideStep() {
                if (i < path.length) {

                    const nextSquare = path[i];
                    console.log(piece.parentElement)
                    piece.parentElement.removeChild(piece);
                    console.log('reached')
                    triggerExplosion(getRow(nextSquare.getAttribute('square-id')), col);
                    nextSquare.appendChild(piece);
                    i++;
                    setTimeout(slideStep, 301); 
                } else {
                    piece.parentElement.removeChild(piece);
                    triggerClusterExplosions();
                }
            }

            slideStep();

            function triggerExplosion(row, col) {

                const splashRadius = [-1, 0, 1];

                splashRadius.forEach(dy => {
                    splashRadius.forEach(dx => {
                        const r = row + dy;
                        const c = col + dx;
                        if (r >= 0 && r < width && c >= 0 && c < width) {
                            const targetId = r * width + c;
                            const square = document.querySelector(`[square-id="${targetId}"]`);

                            if (square) {
                                square.classList.remove('explosion-zone');
                                void square.offsetWidth; 
                                square.classList.add('explosion-zone');

                                const target = square.querySelector('.fantasy-piece');

                                if (target) {
                                    square.removeChild(target);
                                    updateSquares();
                                }

                                const explosion = document.createElement('div');

                                explosion.style.position = 'absolute';
                                explosion.style.top = '50%';
                                explosion.style.left = '50%';
                                explosion.style.transform = 'translate(-50%, -50%) scale(2.5)';
                                explosion.style.fontSize = '3.5rem';
                                explosion.style.pointerEvents = 'none';
                                explosion.style.zIndex = '999';
                                explosion.style.animation = 'cannon-pulse-glow 0.5s ease-out';

                                const ring = document.createElement('div');
                                ring.classList.add('explosion-ring');
                                square.appendChild(ring);
                                square.appendChild(explosion);

                                setTimeout(() => {
                                    explosion.remove();
                                    ring.remove();
                                    square.classList.remove('explosion-zone');
                                }, 300);

                            }
                        }
                    });
                });

                document.body.classList.add('shake');
                setTimeout(() => document.body.classList.remove('shake'), 400);

                
            }

            function triggerClusterExplosions() {
                const enemyStart = Math.floor(width / 2);
                const enemyEnd = width; 
                const allEnemySquares = [];

                for (let row = enemyStart; row < enemyEnd; row++) {
                    for (let col = 0; col < width; col++) {
                        const id = row * width + col;
                        const square = document.querySelector(`[square-id="${id}"]`);
                        if (square) allEnemySquares.push(square);
                    }
                }

                const clusterTargets = [];
                while (clusterTargets.length < 5 && allEnemySquares.length > 0) {
                    const randIndex = Math.floor(Math.random() * allEnemySquares.length);
                    clusterTargets.push(allEnemySquares.splice(randIndex, 1)[0]);
                }

                clusterTargets.forEach((square, idx) => {
                    setTimeout(() => {

                        square.classList.add('explosion-zone');
                        
                        target = square.querySelector('.fantasy-piece');

                        if (target) square.removeChild(target);

                        square.addEventListener('animationend', () => {
                            square.classList.remove('explosion-zone');
                        }, { once: true });

                        updateSquares();
                    }, 300 * idx);
                });

                console.log(`🧨 Dynamite exploded and used ${specialAbilityMap.dynamite.name}!`);

                abilityMap.bomb.charges -= 1;
                console.log(`Charges remaining: ${specialAbilityMap.dynamite.charges}`);
                finished();
            }
        }
    },

    phoenix : {
        name : "DIVINE EMBER",
        charges: 2,
        effect: function (piece, finished) {

            if (specialAbilityMap.phoenix.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.phoenix.name}!`);
                return;
            }

            const start = width * 6;
            const end = width * 9;

            for (let id = start; id < end; id++) {
                if (Math.random() < 0.3) {
                    const targetSquare = document.querySelector(`[square-id="${id}"]`);

                    if (targetSquare) {
                        targetSquare.classList.add('lava');
                        targetSquare.classList.add('lava-burst');
                        
                        targetSquare.addEventListener('animationend', () => {
                            targetSquare.classList.remove('lava-burst');
                            updateSquares();
                        }, { once: true });
                    }
                }
            }
            // allows rebirth again 🔥
            piece.dataset.evasion = 'true';

            console.log(`🔥 PHOENIX casted ${specialAbilityMap.phoenix.name}!`);

            specialAbilityMap.phoenix.charges -= 1;
            console.log(`Charges remaining: ${specialAbilityMap.phoenix.charges}`);
            finished();
        }
    },

    koi : {
        name : "DUAL AFFINITY",
        charges: 30,
        effect: function (piece, finished) {

            if (specialAbilityMap.koi.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.koi.name}!`);
                return;
            }

            const pieceColor = piece.classList.contains('white') ? 'white' : 'black';
            const allSquares = Array.from(document.querySelectorAll('.square'));

            const validTargets = allSquares.filter(sq => {

                if (sq.classList.contains('water')) return false;

                const target = sq.querySelector('.fantasy-piece, .piece');
                if (!target) return true;
                return !target.classList.contains(pieceColor);
            });

            if (validTargets.length < 2) {
                return;
            }

            const shuffled = validTargets.sort(() => 0.5 - Math.random());
            const [firstTarget, secondTarget] = [shuffled[0], shuffled[1]];

            const strike = (square, i) => {
                setTimeout(() => {
                    square.classList.add('water-strike');
                    setTimeout(() => square.classList.remove('water-strike'), 500);

                    const targetPiece = square.querySelector('.fantasy-piece');
                    if (targetPiece) {
                        const isEnemy = !targetPiece.classList.contains(pieceColor);
                        const isWaterWalker = targetPiece.dataset.waterWalking === 'true';

                        if (isEnemy && !isWaterWalker) {
                            square.removeChild(targetPiece)
                            square.classList.add('water');

                            const temp = document.createElement('div');
                            temp.innerHTML = koi.trim();
                            const koiClone = temp.firstChild;
                            koiClone.setAttribute('draggable', true);
                            koiClone.classList.add(pieceColor);
                            koiClone.classList.remove('evolved');

                            square.replaceChildren(koiClone);
                            square.classList.add('square');

                            updateSquares();

                        } else {
                            square.classList.add('water');
                        }
                        
                    } else {
                        square.classList.add('water');
                    }

                    if (i === 1) {
                        setTimeout(finished(), 300);
                    }
                }, i * 400);
            };

            strike(firstTarget, 0);
            strike(secondTarget, 1);
            
            console.log(`🐟 KOI used ${specialAbilityMap.koi.name}!`);

            specialAbilityMap.koi.charges -= 1;
            console.log(`Charges remaining: ${specialAbilityMap.koi.charges}`);
        }
    },

    crocodile: {
        name: "SWAMPGATE",
        charges: 2,
        effect: function (piece, finished) {

            if (specialAbilityMap.crocodile.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.crocodile.name}!`);
                return;
            }

            let selectedSquares = [];

            if (gameState.swampGate.portals.length === 2) {
                linkSwampPortals();
                gameState.swampGate.portals.forEach(square => {
                    square.classList.remove('swamp-portal');
                    delete square.dataset.linkedPortal;
                });
                gameState.swampGate.portals = [];
            }

            if (gameState.swampGate.teleportWatcher) {
                gameState.swampGate.teleportWatcher.disconnect();
                gameState.swampGate.teleportWatcher = null;
            }

            function selectPortalSquare(e) {
                const square = e.target.closest('.square');
                if (!square || selectedSquares.includes(square)) return;

                square.classList.add('swamp-portal');
                selectedSquares.push(square);

                if (selectedSquares.length === 2) {
                    document.removeEventListener('click', selectPortalSquare);

                    const [squareA, squareB] = selectedSquares;

                    squareA.dataset.linkedPortal = squareB.getAttribute('square-id');
                    squareB.dataset.linkedPortal = squareA.getAttribute('square-id');

                    gameState.swampGate.portals = [squareA, squareB];

                    const teleportWatcher = new MutationObserver(mutations => {
                        for (const mutation of mutations) {
                            if (mutation.type === "childList") {
                                for (const node of mutation.addedNodes) {
                                    const movedPiece = node.closest?.('.fantasy-piece');
                                    
                                    if (!movedPiece || movedPiece.dataset.justTeleported === 'true') continue;

                                    const parent = movedPiece.closest('.square');
                                    const linkId = parent?.dataset.linkedPortal;
                                    const destination = document.querySelector(`[square-id="${linkId}"]`);

                                    if (linkId && destination && !destination.querySelector('.fantasy-piece')) {
                                        movedPiece.dataset.justTeleported = 'true';
                                        parent.removeChild(movedPiece);

                                        destination.classList.add('swamp-teleport');
                                        destination.appendChild(movedPiece);
                                        
                                        destination.addEventListener('animationend', () => {
                                            destination.classList.remove('swamp-teleport');
                                        })

                                        setTimeout(() => {
                                            movedPiece.dataset.justTeleported = 'false';
                                        }, 100);
                                    }
                                }
                            }
                        }
                    });

                    teleportWatcher.observe(document.querySelector('#fantasy-gameboard'), {
                        childList: true,
                        subtree: true
                    });

                    gameState.swampGate.teleportWatcher = teleportWatcher;
                    
                    console.log(`🐊 Crocodile cast ${specialAbilityMap.crocodile.name}!`);
                    
                    specialAbilityMap.crocodile.charges -= 1;
                    console.log(`Charges remaining: ${specialAbilityMap.crocodile.charges}`);
                    updateSquares();
                    finished();
                }
            }

            document.addEventListener('click', selectPortalSquare);
        }
    },

    sith : {
        name : "WELCOME TO THE DARK SIDE",
        charges: 6,
        effect: function (piece, finished) {
            if (specialAbilityMap.sith.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.sith.name}!`);
                return;
            }

            const enemyColor = playerTurn === 'white' ? 'black' : 'white';
            const allEnemies = Array.from(document.querySelectorAll(`.fantasy-piece.${enemyColor}`));

            const evolvedTargets = allEnemies.filter(p => p.classList.contains('evolved'));
            const basicTargets = allEnemies.filter(p => !p.classList.contains('evolved'));
            
            const chosenEvolved = evolvedTargets.length > 0
                ? [evolvedTargets[Math.floor(Math.random() * evolvedTargets.length)]]
                : [];

            const chosenBasics = basicTargets
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 3)); 

            const toConvert = [...chosenEvolved, ...chosenBasics];

            toConvert.forEach(target => {
                const square = target.parentElement;

                const replacement = target.cloneNode(true);
                replacement.classList.remove(enemyColor);
                replacement.classList.add(playerTurn);

                square.classList.add('dark-conversion');

                square.replaceChild(replacement, target);
                
                square.addEventListener('animationend', () => {
                    square.classList.remove('dark-conversion');
                }, { once: true });


            });

            console.log(`🩸 Sith used ${specialAbilityMap.sith.name} to convert ${toConvert.length} enemies!`);

            specialAbilityMap.sith.charges -= 1;
            console.log(` Charges remaining: ${specialAbilityMap.sith.charges}`);
            updateSquares();
            finished();
        }
    },

    joker : {
        name: "CHAOS REIGNS",
        charges: 3,
        effect: function (piece, finished) {

            if (specialAbilityMap.joker.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.joker.name}!`);
                return;
            }

            const enemyColor = playerTurn === 'white' ? 'black' : 'white';
            const enemyPieces = Array.from(document.querySelectorAll(`.fantasy-piece.${enemyColor}`));

            if (enemyPieces.length < 2) return;

            const originalSquares = enemyPieces.map(p => p.parentElement);

            const shuffledPieces = [...enemyPieces].sort(() => 0.5 - Math.random());

            originalSquares.forEach(square => {
                const target = square.querySelector(`.fantasy-piece.${enemyColor}`);
                if (target) square.removeChild(target);
            });

            originalSquares.forEach((square, i) => {
                square.appendChild(shuffledPieces[i]);
                square.classList.add('joker-swap'); 

                square.addEventListener('animationend', () => {
                    square.classList.remove('joker-swap');
                }, { once: true });
            });

            console.log(`🃏 Joker used ${specialAbilityMap.joker.name}!`);

            specialAbilityMap.joker.charges -= 1;
            console.log(` Charges remaining: ${specialAbilityMap.joker.charges}`);
            updateSquares();
            finished();
        }
    },

    hamsa: {
        name: "HAND OF FATE",
        charges: 5,
        effect: function (piece, finished) {

            if (specialAbilityMap.hamsa.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.hamsa.name}!`);
                return;
            }

            const terrainClasses = ['water', 'lava', 'magic', 'swamp-portal'];

            const allSquares = Array.from(document.querySelectorAll('#fantasy-gameboard .square'));
            
            const squaresWithTerrain = allSquares.filter(square => 
                terrainClasses.some(clss => square.classList.contains(clss))
            );

            const terrains = squaresWithTerrain.map(square => {
                for (const clss of terrainClasses) {
                    if (square.classList.contains(clss)) return clss;
                }
                return null;
            });

            // Shuffle terrain array (Fisher-Yates shuffle)
            for (let i = terrains.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [terrains[i], terrains[j]] = [terrains[j], terrains[i]];
            }

            squaresWithTerrain.forEach((square, idx) => {
                square.classList.add('hamsa-spin')

                square.addEventListener('animationend', () => {
                    square.classList.remove('hamsa-spin');
                }, { once: true });

                terrainClasses.forEach(cls => square.classList.remove(cls));
                if (terrains[idx]) {
                    square.classList.add(terrains[idx]);
                }
            });

            console.log(`🎲 Hamsa shuffled all terrain squares with ${specialAbilityMap.hamsa.name}!`);
            
            specialAbilityMap.hamsa.charges -= 1;
            console.log(` Charges remaining: ${specialAbilityMap.hamsa.charges}`);
            updateSquares();
            finished();
        }
    },

    violin: {
        name: "ARIA OF ASCENSION",
        charges: 3,
        effect: function (piece, finished) {

            if (specialAbilityMap.violin.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.violin.name}!`);
                return;
            }

            const violinSquare = piece.closest('.square');
            const originId = violinSquare.getAttribute('square-id');
            const color = piece.classList.contains('white') ? 'white' : 'black';
            const enemyColor = color === 'white' ? 'black' : 'white';

            const direction = prompt("Cast direction? (up, down, left, right)").toLowerCase();
            const validDirections = ['up', 'down', 'left', 'right'];

            if (!validDirections.includes(direction)) {
                console.log("Invalid direction.");
                return;
            }

            const row = getRow(originId);
            const col = getCol(originId);

            const cone = [];
            const maxDepth = 6;

            for (let d = 1; d < maxDepth; d++) {
                const range = 1 + 2 * (Math.ceil(maxDepth / 2) - Math.abs(d - Math.ceil(maxDepth / 2))); // 3→5→7→5→3
                const half = Math.floor(range / 2);

                for (let i = -half; i <= half; i++) {
                    let nx = col;
                    let ny = row;

                    if (direction === 'up') {
                        nx += i;
                        ny += d;
                    } else if (direction === 'down') {
                        nx += i;
                        ny -= d;
                    } else if (direction === 'left') {
                        nx -= d;
                        ny += i;
                    } else if (direction === 'right') {
                        nx += d;
                        ny += i;
                    }

                    if (nx >= 0 && nx < width && ny >= 0 && ny < width) {
                        cone.push(ny * width + nx);
                    }
                }
            }

            cone.forEach(id => {

                const square = document.querySelector(`[square-id="${id}"]`);

                if (!square) return;

                square.classList.add('musical-cone-hit');

                square.addEventListener('animationend', () => {
                    square.classList.remove('musical-cone-hit');
                }, { once: true });

                const targetPiece = square.querySelector('.fantasy-piece');

                if (!targetPiece) return;

                if (targetPiece.classList.contains(color)) {

                    if (!targetPiece.classList.contains('evolved') && targetPiece.id in evolutionMap) {
                        const evolvedHTML = evolutionMap[targetPiece.id];
                        const temp = document.createElement('div');
                        temp.innerHTML = evolvedHTML.trim();
                        const evolvedElement = temp.firstChild;

                        evolvedElement.classList.add(color);
                        evolvedElement.classList.add('evolution-flare');

                        targetPiece.parentElement.replaceChild(evolvedElement, targetPiece);
                        
                        evolvedElement.addEventListener('animationend', () => {
                            evolvedElement.classList.remove('evolution-flare');
                        }, { once: true });
                    }

                } else {

                    if (targetPiece.classList.contains('evolved') && targetPiece.id in devolutionMap) {
                        const devolvedHTML = devolutionMap[targetPiece.id];
                        const temp = document.createElement('div');
                        temp.innerHTML = devolvedHTML.trim();
                        const devolvedElement = temp.firstChild;

                        devolvedElement.classList.add(enemyColor);
                        devolvedElement.classList.add('devolve-flare');

                        square.replaceChild(devolvedElement, targetPiece);

                        devolvedElement.addEventListener('animationend', () => {
                            devolvedElement.classList.remove('devolve-flare');
                        }, { once: true });

                    } else {

                        targetPiece.classList.add('musical-death');
                        
                        if (color === 'black' && targetPiece.classList.contains('white')) {
                            targetPiece.classList.add('outline-white');
                        }

                        targetPiece.addEventListener('animationend', () => {
                            square.removeChild(targetPiece);
                            targetPiece.classList.remove('musical-death');
                            targetPiece.classList.remove('outline-white');
                        }, { once: true });
                    }
                }
            });

            violinSquare.classList.add('aria-cast');

            violinSquare.addEventListener('animationend', () => {
                violinSquare.classList.remove('aria-cast');
            }, { once: true });

            console.log(`🎻 Violin cast ARIA OF ${specialAbilityMap.violin.name} to the ${direction}`);
            
            specialAbilityMap.violin.charges -= 1;
            console.log(`Charges remaining: ${specialAbilityMap.violin.charges}`);

            setTimeout(() => {
                finished();
            }, 800);
        }
    },

    zulfiqar : {
        name : "DIVINE JUDGEMENT",
        charges: 2,
        effect: function (piece, finished) {

            if (specialAbilityMap.zulfiqar.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.zulfiqar.name}!`);
                return;
            }

            const allPieces = document.querySelectorAll('.fantasy-piece');
            const playerPieces = Array.from(allPieces).filter(piece => piece.classList.contains(playerTurn));
            const opponentPieces = Array.from(allPieces).filter(piece => !piece.classList.contains(playerTurn));

            const diagonals = [[], []]; 

            for (let i = 0; i < width; i++) {
                diagonals[0].push(i * width + i); 
                diagonals[1].push(i * width + (width - 1 - i)); 
            }

            const runSlash = (diagIndex) => {
                diagonals[diagIndex].forEach(id => {
                    const square = document.querySelector(`[square-id="${id}"]`);
                    if (!square) return;

                    square.classList.add('zulfiqar-split'); 

                    const target = square.querySelector('.fantasy-piece');

                    if (target && !target.classList.contains(playerTurn)) {
                        if (target.classList.contains('evolved')) {

                            if (target.id in devolutionMap) {
                                const evolvedEnemyHTML = devolutionMap[target.id]; 
                                const temp = document.createElement('div');
                                temp.innerHTML = evolvedEnemyHTML.trim();
                                const newEnemyPiece = temp.firstChild;
                                newEnemyPiece.classList.add(target.classList.contains('white') ? 'white' : 'black');
                                newEnemyPiece.classList.add('devolve-flare');
                                newEnemyPiece.addEventListener('animationend', () => {
                                    newEnemyPiece.classList.remove('devolve-flare');
                                }, { once: true });
                                
                                target.parentElement.replaceChild(newEnemyPiece, target);
                            }
                            
                        } else {
                            square.removeChild(target);
                        }
                    }

                    if (target && target.classList.contains(playerTurn)) {
                        if (!target.classList.contains('evolved')) {
                            
                            if (target.id in evolutionMap) {
                                const evolvedAlliedHTML = evolutionMap[target.id]; 
                                const temp = document.createElement('div');
                                temp.innerHTML = evolvedAlliedHTML.trim();
                                const newAlliedPiece = temp.firstChild;
                                newAlliedPiece.classList.add(target.classList.contains('white') ? 'white' : 'black');
                                newAlliedPiece.classList.add('evolution-flare');
                                newAlliedPiece.addEventListener('animationend', () => {
                                    newAlliedPiece.classList.remove('evolution-flare');
                                }, { once: true });

                                target.parentElement.replaceChild(newAlliedPiece, target);
                            }

                        }
                    }

                    square.addEventListener('animationend', () => {
                        square.classList.remove('zulfiqar-split');
                    }, { once: true });
                });
            };

            const shouldDoubleSlash = playerPieces.length <= opponentPieces.length;
            const delay = 600;

            if (shouldDoubleSlash) {
                runSlash(0);
                setTimeout(() => runSlash(1), delay / 2);
                } else {
                const chosen = Math.random() < 0.5 ? 0 : 1;
                runSlash(chosen);
            }

            specialAbilityMap.zulfiqar.charges -= 1;

            console.log(`⚔️ Zulfiqar unleashed ${specialAbilityMap.zulfiqar.name}!`);
            
            specialAbilityMap.joker.charges -= 1;
            console.log(` Charges remaining: ${specialAbilityMap.zulfiqar.charges}`);

            setTimeout(() => {
                updateSquares();
                finished();
            }, delay);
        }
    },

    whale : {
        name : "TIDAL WAVE",
        charges: 6,
        effect: function (piece, finished) {

            if (specialAbilityMap.whale.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.whale.name}!`);
                return;
            }

            const originId = Number(piece.parentElement.getAttribute('square-id'));
            const splashRadius = [-1, 0, 1];
            const affectedSquares = [];

            splashRadius.forEach(dy => {
                splashRadius.forEach(dx => {
                    const row = Math.floor(originId / width);
                    const col = originId % width;
                    const newRow = row + dy;
                    const newCol = col + dx;
                    if (newRow >= 0 && newRow < width && newCol >= 0 && newCol < width) {
                        const targetId = newRow * width + newCol;
                        const square = document.querySelector(`[square-id="${targetId}"]`);
                        if (square) {
                            affectedSquares.push(square);
                            square.classList.add('water');
                        }
                    }
                });
            });

            // Animate + eliminate logic
            affectedSquares.forEach((square, i) => {
                setTimeout(() => {
                    square.classList.add('splash-zone');

                    const target = square.querySelector('.piece, .fantasy-piece');
                    if (target && target.dataset.waterWalking !== 'true') {
                        square.removeChild(target);
                    }

                    // Splash emoji (optional)
                    const splash = document.createElement('div');
                    splash.textContent = '💦';
                    splash.style.position = 'absolute';
                    splash.style.top = '50%';
                    splash.style.left = '50%';
                    splash.style.transform = 'translate(-50%, -50%) scale(1.4)';
                    splash.style.fontSize = '2rem';
                    splash.style.pointerEvents = 'none';
                    splash.style.zIndex = '999';
                    square.appendChild(splash);
                    setTimeout(() => {
                        splash.remove();
                        square.classList.remove('splash-zone');
                        updateSquares();
                    }, 500);
                }, i * 80);

            });
            
            console.log(`🐋 Whale unleashed a ${specialAbilityMap.whale.name}!`);
            
            specialAbilityMap.whale.charges -= 1;
            console.log(`Charges remaining: ${specialAbilityMap.whale.charges}`);
            finished();
        }
    },

    pirateKing : {
        name : "CANNONBALL BARRAGE",
        charges: 7,
        effect: function (piece, finished) {

            if (specialAbilityMap.pirateKing.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.pirateKing.name}!`);
                return;
            }

            const allSquares = document.querySelectorAll(`[square-id]`);
            const numberOfTargets = Math.floor(Math.random() * 4) + 8;
            const selectedSquares = [];

            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 400);

            while (selectedSquares.length < numberOfTargets) {
                const randomSquare = allSquares[Math.floor(Math.random() * allSquares.length)];
                if (!selectedSquares.includes(randomSquare)) {
                    selectedSquares.push(randomSquare);
                }
            }

            selectedSquares.forEach((square, i) => {
                setTimeout(() => {
                    square.classList.add('barrage-target');

                    const cannonball = document.createElement('div');
                    cannonball.classList.add('cannonball');
                    square.appendChild(cannonball);
                    setTimeout(() => cannonball.remove(), 750);

                    setTimeout(() => {
                        const target = square.querySelector('.piece, .fantasy-piece');
                        if (target && !target.id.includes('pirateKing')) {
                            square.removeChild(target);
                            updateSquares();
                        }
                            square.classList.remove('barrage-target');
                    }, 1000);
                }, i * 200);
            });

            console.log(`🏴‍☠️ PirateKing launched ${specialAbilityMap.pirateKing.name} on ${numberOfTargets} squares!`);
            
            specialAbilityMap.pirateKing.charges -= 1;
            console.log(`Charges remaining: ${specialAbilityMap.pirateKing.charges}`);
            finished();
        }
    },

    pope : {
        name : "LINE OF LIGHT",
        charges: 3,
        effect: function (piece, finished) {

            if (specialAbilityMap.pope.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.pope.name}!`);
                return;
            }

            const row = getRow(piece.parentElement.getAttribute('square-id')); 
            const allSquares = Array.from(document.querySelectorAll(`.square`));
            const color = piece.classList.contains('white') ? 'white' : 'black';

            const rowSquares = allSquares.filter(square => {
                const id = square.getAttribute('square-id');
                return id && getRow(id) === row;
            });

            rowSquares.forEach(square => {
                const piece = square.querySelector('.fantasy-piece');

                if (piece && piece.classList.contains(color)) {
                    piece.dataset.divineProtected = Infinity;
                    piece.classList.add('divine-shield');
                }
                square.classList.add('divine-upgrade');
                square.addEventListener('animationend', () => {
                    square.classList.remove('divine-upgrade');
                }, { once: true });
            });

            console.log(`🔔 Pope cast ${specialAbilityMap.pope.name}, granting Divine Protection across the row!`);

            specialAbilityMap.pope.charges -= 1;
            console.log(`🕊️ Remaining sacred charges: ${specialAbilityMap.pope.charges}`);  
            updateSquares();
            finished();
        }
    },

    kraken : {
        name : "DROWNED ASCENT",
        charges: 5,
        effect: function (piece, finished) {

            if (specialAbilityMap.kraken.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.kraken.name}!`);
                return;
            }

            const color = piece.classList.contains('white') ? 'white' : 'black';
            const enemyColor = color === 'white' ? 'black' : 'white';
            const squares = document.querySelectorAll('.square');

            squares.forEach(square => {
                if (!square.classList.contains('water')) return;

                const target = square.querySelector('.fantasy-piece');
                if (!target) return;

                const type = target.id;
                const isEnemy = target.classList.contains(enemyColor);
                const isEvolved = target.classList.contains('evolved');

                if (isEnemy) {
                    if (isEvolved && devolutionMap[type]) {

                        const devolvedHTML = devolutionMap[type];
                        const temp = document.createElement('div');
                        temp.innerHTML = devolvedHTML.trim();
                        const devolvedElement = temp.firstChild;

                        devolvedElement.classList.add(enemyColor);
                        devolvedElement.classList.add('devolve-flare');

                        square.replaceChild(devolvedElement, target);

                        devolvedElement.addEventListener('animationend', () => {
                            devolvedElement.classList.remove('devolve-flare');
                        }, { once: true });

                    } else {

                        target.classList.add('devolve-flare');

                        target.addEventListener('animationend', () => {
                            target.classList.remove('devolve-flare');
                                if (square.contains(target)) {
                                    square.removeChild(target);
                                }
                        }, { once: true });
                    }
                }
            });

            console.log(`🦑 Kraken casted ${specialAbilityMap.kraken.name}!`);

            specialAbilityMap.kraken.charges -= 1;
            console.log(`Charges remaining: ${specialAbilityMap.kraken.charges}`);
            updateSquares();
            finished();
        }
    },

    thunder : {
        name : "EYE OF THE STORM",
        charges: 2,
        effect: function (piece, finished) {

            if (specialAbilityMap.thunder.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.thunder.name}!`);
                return;
            }

            const middleRows = [width / 2 - 2, width / 2 - 1, width / 2, width / 2 + 1];
            const color = piece.classList.contains('white') ? 'white' : 'black';
            
            const onClick = (e) => {

                const origin = e.target.closest('.square');
                if (!origin) return;

                const originId = origin.getAttribute('square-id');
                const row = getRow(originId)

                if (!middleRows.includes(row)) {
                    console.log("⚡ You must choose a square in the middle 4 rows.");
                    return;
                }

                document.removeEventListener('click', onClick);

                specialAbilityMap.thunder.charges -= 1;
                console.log(`⚡ ${specialAbilityMap.thunder.name} cast!`);
                console.log(`⚡ Charges remaining: ${specialAbilityMap.thunder.charges}`);

                const centerCol = getCol(originId)
                const centerRow = getRow(originId)
                const strikeOffsets = [
                    [-1, -1], [0, -1], [1, -1],
                    [-1, 0],           [1, 0],
                    [-1, 1],  [0, 1],  [1, 1],
                    [0, -2], [0, 2], [-2, 0], [2, 0]
                ];

                const strikeSquares = [];

                strikeOffsets.forEach(([dx, dy]) => {
                    const newCol = centerCol + dx;
                    const newRow = centerRow + dy;
                    const id = newRow * width + newCol;

                    if (newCol >= 0 && newCol < width && newRow >= 0 && newRow < width) {
                        const target = document.querySelector(`[square-id="${id}"]`);

                        if (target) {
                            strikeSquares.push(target);
                        }
                    }
                });

                strikeSquares.forEach(strikeSquare => {
                    strikeSquare.classList.add('lightning-strike');

                    const targetPiece = strikeSquare.querySelector('.fantasy-piece');
                    if (targetPiece) {

                        if (!targetPiece.classList.contains(color)) {
                            strikeSquare.removeChild(targetPiece);
                            updateSquares();
                        }
                    }

                    strikeSquare.addEventListener('animationend', () => {
                        strikeSquare.classList.remove('lightning-strike');
                    }, { once: true });
                });

                if (gameState.eyeOfStorm.square) {
                    gameState.eyeOfStorm.square.classList.remove('eye-of-storm');
                }

                origin.classList.add('eye-of-storm');
                gameState.eyeOfStorm.square = origin;
                gameState.eyeOfStorm.tracker.clear();

                const eyePiece = origin.querySelector('.fantasy-piece');

                if (eyePiece) {
                    gameState.eyeOfStorm.tracker.set(eyePiece, 0);
                }

                finished();
            };

            document.addEventListener('click', onClick);
        }
    },

    mace : {
        name : "MACE OF THE GODS",
        charges: 5,
        effect: function (piece, finished) {

            if (specialAbilityMap.mace.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.mace.name}!`);
                return;
            }

            const originId = Number(piece.parentElement.getAttribute('square-id'));
            const startRow = getRow(originId);
            const startCol = getCol(originId);

            const color = piece.classList.contains('white') ? 'white' : 'black';

            const maceHits = [
                [-2, 0], [2, 0], [0, -2], [0, 2],
                [-1, -1], [-1, 1], [1, -1], [1, 1]
            ];

            for (const [dx, dy] of maceHits) {

                const row = startRow + dx;
                const col = startCol + dy;
                
                if (row < 0 || row >= width || col < 0 || col >= width) continue;

                const targetId = row * width + col;
                const targetSquare = document.querySelector(`[square-id="${targetId}"]`);
                const target = targetSquare?.querySelector('.fantasy-piece');
                
                targetSquare.classList.add('mace-hit');

                if (targetSquare && target && !target.classList.contains(color)) {
                    targetSquare.removeChild(target)
                }

                targetSquare.addEventListener('animationend', () => {
                    targetSquare.classList.remove('mace-hit');
                }, { once: true });

                updateSquares();
                
            };

            console.log(`💥 Mace used ${specialAbilityMap.mace.name}!`);

            specialAbilityMap.mace.charges -= 1;
            console.log(`Charges remaining: ${specialAbilityMap.mace.charges}`);
            updateSquares();
            finished();
        }
    },

    witch : {
        name : "HEXSHIFT",
        charges: 3,
        effect: function (piece, finished) {

            if (specialAbilityMap.witch.charges <= 0) {
                console.log(`No charges left for ${specialAbilityMap.witch.name}!`);
                return;
            }

            console.log("Select a magic square to relocate...");

            const magicSquares = document.querySelectorAll('.square.magic');
            magicSquares.forEach(square => square.classList.add('witch-highlight'));

            const onMagicClick = (e) => {
                const selectedMagicSquare = e.currentTarget;
                magicSquares.forEach(s => s.classList.remove('witch-highlight'));
                magicSquares.forEach(s => s.removeEventListener('click', onMagicClick));

                const allSquares = document.querySelectorAll('.square');
                allSquares.forEach(square => square.classList.add('witch-highlight-destination'));

                const onDestinationClick = (e2) => {
                    const targetSquare = e2.currentTarget;

                    allSquares.forEach(s => s.classList.remove('witch-highlight-destination'));
                    allSquares.forEach(s => s.removeEventListener('click', onDestinationClick));
                    
                    selectedMagicSquare.classList.remove('magic');

                    if (targetSquare.classList.contains('magic') || selectedMagicSquare === targetSquare) {
                        selectedMagicSquare.classList.add('magic');
                        return;
                    }

                    targetSquare.classList.add('magic');

                    selectedMagicSquare.classList.add('hexshift-flash');
                    targetSquare.classList.add('hexshift-flash');

                    selectedMagicSquare.addEventListener('animationend', () => {
                        selectedMagicSquare.classList.remove('hexshift-flash');
                        targetSquare.classList.remove('hexshift-flash');
                    })

                    console.log(`🔮 Witch used ${specialAbilityMap.witch.name} to shift magic square to ${targetSquare.getAttribute('square-id')}!`);
                    
                    specialAbilityMap.witch.charges -= 1;
                    console.log(`Charges remaining: ${specialAbilityMap.witch.charges}`);
                    updateSquares();
                    finished();
                };

                allSquares.forEach(square => {
                    square.addEventListener('click', onDestinationClick, { once: true });
                });
            };

            magicSquares.forEach(square => {
                square.addEventListener('click', onMagicClick, { once: true });
            });
        }
    }
}

const ultimateAbilityMap = {

    alien : {
        name : "UFO SHOWER",
        charges: 3,
        effect: function (piece, finished) {

            if (ultimateAbilityMap.alien.charges <= 0) {
                console.log(`No charges left for ${ultimateAbilityMap.alien.name}!`);
                return;
            }

            const allSquares = document.querySelectorAll(`[square-id]`);
            const numberOfTargets = Math.floor(Math.random() * 20) + 40;
            const selectedSquares = [];

            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 400);

            while (selectedSquares.length < numberOfTargets) {
                const randomSquare = allSquares[Math.floor(Math.random() * allSquares.length)];
                if (!selectedSquares.includes(randomSquare)) {
                    selectedSquares.push(randomSquare);
                }
            }

            selectedSquares.forEach((square, i) => {
                setTimeout(() => {
                    square.classList.add('alien-beam');

                    setTimeout(() => {
                        const target = square.querySelector('.piece, .fantasy-piece');
                        if (target && !target.id.includes('alien')) {
                            square.removeChild(target);
                            updateSquares();
                        }
                            square.classList.remove('alien-beam');
                    }, 800);
                }, i * 100);
            });

            console.log(`🛸 ALIEN launched ${ultimateAbilityMap.alien.name} on ${numberOfTargets} squares!`);
            
            ultimateAbilityMap.alien.charges -= 1;
            console.log(`Charges remaining: ${ultimateAbilityMap.alien.charges}`);
            finished();
        }
    },

    anubis : {

    },

    reaper : {
        name : "SOUL ROULETTE",
        charges: 2,
        effect: function (piece, finished) {

            if (ultimateAbilityMap.reaper.charges <= 0) {
                console.log(`No charges left for ${ultimateAbilityMap.reaper.name}!`);
                return;
            }

            const squares = document.querySelectorAll('.square');

            squares.forEach(square => {

                const target = square.firstChild;
                if (!target) return;

                if (target.classList.contains('evolved') | target.classList.contains('ultimate')) return;

                square.classList.add('reaper-strike');

                square.removeChild(target);

                square.addEventListener('animationend', () => {
                    square.classList.remove('reaper-strike');
                }, { once: true });

                // don't think this is necessary but good practice..?
                updateSquares();

            });

            console.log(`☠️ REAPER used ${ultimateAbilityMap.reaper.name}!`);
            
            ultimateAbilityMap.reaper.charges -= 1;
            console.log(`Charges remaining: ${ultimateAbilityMap.reaper.charges}`);
            finished();
        }
    },

    sagrada : {
        name : "SACRED EVOLUTION",
        charges: 2,
        effect: function (piece, finished) {

            if (ultimateAbilityMap.sagrada.charges <= 0) {
                console.log(`No charges left for ${ultimateAbilityMap.sagrada.name}!`);
                return;
            }

            const color = piece.classList.contains('white') ? 'white' : 'black';
            const squares = document.querySelectorAll('.square');

            squares.forEach(square => {
                
                const target = square.firstChild;
                if (!target || target.classList.contains('evolved') || !target.classList.contains(color)) return;

                const targetId = target.id;
                const targetColor = target.classList.contains('white') ? 'white' : 'black';

                if (!(targetId in evolutionMap)) return;

                const evolvedHTML = evolutionMap[targetId];
                const temp = document.createElement('div');
                temp.innerHTML = evolvedHTML.trim();
                const evolvedPiece = temp.firstChild;
                evolvedPiece.classList.add(targetColor);
                
                evolvedPiece.classList.add('evolution-flare');
                
                square.replaceChild(evolvedPiece, target);

                evolvedPiece.addEventListener('animationend', () => {
                    evolvedPiece.classList.remove('evolution-flare');
                }, { once: true });

                updateSquares();
            });

            console.log(`🪽 SAGRADA used ${ultimateAbilityMap.sagrada.name}!`);
            
            ultimateAbilityMap.sagrada.charges -= 1;
            console.log(`Charges remaining: ${ultimateAbilityMap.sagrada.charges}`);
            finished();
        }
    },

    darkVoid : {
        name: "DISORDER",
        charges: 2,
        effect: function (piece, finished) {

            if (ultimateAbilityMap.darkVoid.charges <= 0) {
                console.log(`No charges left for ${ultimateAbilityMap.darkVoid.name}!`);
                return;
            }

            const allSquares = Array.from(document.querySelectorAll('.square'));
            const allPieces = [];

            allSquares.forEach(square => {
                const piece = square.querySelector('.fantasy-piece');
                if (piece) {
                    allPieces.push(piece);
                    square.removeChild(piece);
                }
                square.classList.add('void-chaos');

                square.addEventListener('animationend', () => {
                    square.classList.remove('void-chaos');
                }, { once: true });
            });

            for (let i = allPieces.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allPieces[i], allPieces[j]] = [allPieces[j], allPieces[i]];
            }

            const shuffledSquares = [...allSquares];
            for (let i = shuffledSquares.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledSquares[i], shuffledSquares[j]] = [shuffledSquares[j], shuffledSquares[i]];
            }

            for (let i = 0; i < allPieces.length; i++) {
                shuffledSquares[i].appendChild(allPieces[i]);
            }

            console.log(`🌑🌀🕳️ DARK VOID cast ${ultimateAbilityMap.darkVoid.name}, the board has been shuffled!`);

            ultimateAbilityMap.darkVoid.charges -= 1;
            console.log(`Charges remaining: ${ultimateAbilityMap.darkVoid.charges}`);
            updateSquares();
            finished();
        }
    }
}

const conjureAbilityMap = {
    // TODO
    bat : {

    },

    spirit : {

    },

    candle : {

    }
}

function flashColumn(colIndex, delay = 90) {
  const squares = Array.from(document.querySelectorAll('[square-id]'))
    .filter(sq => Number(sq.getAttribute('square-id')) % width === colIndex)
    .sort((a, b) => Number(a.getAttribute('square-id')) - Number(b.getAttribute('square-id')));

  squares.forEach((square, i) => {
    setTimeout(() => {
      square.classList.add('fire-column');
    }, delay * i);

    setTimeout(() => {
      square.classList.remove('fire-column');
    }, delay * i + delay * 0.8);
  });
}

// casting of abilities
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'a' && selectedPiece) {

    if (!canCastAbility) {
        return;
    }
    // if (!selectedPiece.parentElement.classList.contains('magic')) {
    //     console.log('You must be on a magic square to cast an ability!');
    //     return;
    // }
    
    let pieceId = selectedPiece.id;

    if (selectedPiece.classList.contains('evolved') || !(selectedPiece.id in evolutionMap)) {
        const devolutionHTML = devolutionMap[pieceId];

        if (devolutionHTML) {
            const temp = document.createElement('div');
            temp.innerHTML = devolutionHTML.trim();
            const baseElement = temp.firstChild;

            if (baseElement) {
                pieceId = baseElement.id;
            }
        }
    }

    let ability = abilityMap[pieceId];

    if (selectedPiece.classList.contains('conjure')) {
        ability = conjureAbilityMap[pieceId];
    }

    const pieceColor = selectedPiece.classList.contains('white') ? 'white' : 'black';

    if (pieceColor !== playerTurn) {
        console.log(`It's ${playerTurn}'s turn! Cannot cast this ability!`);
        return;
    }

    if (ability) {

        ability.effect(selectedPiece, () => {
            changePlayer();
            
            // time delay between abilities
            canCastAbility = false;

            setTimeout(() => {
                canCastAbility = true;
            }, abilityDelay);

        });
    }

  }
});

// special abilities for evolved units
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'q' && selectedPiece) {

    if (!canCastSpecialAbility || !selectedPiece.classList.contains('evolved')) {
        return;
    }
    // if (!selectedPiece.parentElement.classList.contains('magic')) {
    //     console.log('You must be on a magic square to cast an ability!');
    //     return;
    // }

    const pieceId = selectedPiece.id;
    const ability = specialAbilityMap[pieceId];
    const pieceColor = selectedPiece.classList.contains('white') ? 'white' : 'black';

    if (pieceColor !== playerTurn) {
        console.log(`It's ${playerTurn}'s turn! Cannot cast this ability!`);
        return;
    }

    if (ability) {
        
        ability.effect(selectedPiece, () => {
            changePlayer();
            
            canCastSpecialAbility = false;

            setTimeout(() => {
                canCastSpecialAbility = true;
            }, abilityDelay);

        });
    }
  }
});

// special abilities for ultimate units
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'u' && selectedPiece) {

    if (!canCastUltimateAbility || !selectedPiece.classList.contains('ultimate')) {
        return;
    }
    // if (!selectedPiece.parentElement.classList.contains('magic')) {
    //     console.log('You must be on a magic square to cast an ability!');
    //     return;
    // }

    const pieceId = selectedPiece.id;
    const ability = ultimateAbilityMap[pieceId];
    const pieceColor = selectedPiece.classList.contains('white') ? 'white' : 'black';

    if (pieceColor !== playerTurn) {
        console.log(`It's ${playerTurn}'s turn! Cannot cast this ability!`);
        return;
    }

    if (ability) {

        ability.effect(selectedPiece, () => {
            changePlayer();
            
            // time delay between abilities
            canCastUltimateAbility = false;

            setTimeout(() => {
                canCastUltimateAbility = true;
            }, abilityDelay);

        });
    }
  }
});

function isFantasyPiece(piece) {
  return piece.classList.contains('fantasy-piece');
}

function updateSquares() {
    
    checkVoidValidity();
    checkSwampValidity();
    checkMagicValidity();
    checkWaterValidity();
    checkLavaValidity();

    checkDivineProtection();
    checkStormValidity();
    linkSwampPortals();

    document.querySelectorAll('#fantasy-gameboard .square').forEach(square => {
        const piece = square.querySelector('.fantasy-piece');

        if (piece && piece.classList.contains('evolved')) {
            square.classList.add('evolved');

        } else if (piece && piece.classList.contains('ultimate')) {
            if (piece.classList.contains('white')) {
                square.classList.add('lightUltimate');
            } else {
                square.classList.add('shadowUltimate');            
            }

        } else {
            square.classList.remove('evolved');
            square.classList.remove('lightUltimate', 'shadowUltimate');
        }
        
        square.firstChild?.setAttribute('draggable', true) 
    });
}

function updateGameState() {
    gameState.currentPlayer = playerTurn;
    gameState.selectedPiece = selectedPiece;
    gameState.turnCount += 1;
}

function restoreInteraction() {
    document.querySelectorAll('.fantasy-piece').forEach(p => {
        p.style.pointerEvents = '';
    });
}

function checkVoidValidity() {
    const voidSquares = document.querySelectorAll('.square.void-chaos');

    voidSquares.forEach(square => {

        if (square.classList.contains('swamp-portal')) {
            square.classList.remove('swamp-portal')
            setTimeout(() => {
                square.classList.add('swamp-portal')
            }, 1200);
        }
        if (square.classList.contains('water')) {
            square.classList.remove('water')
            setTimeout(() => {
                square.classList.add('water')
            }, 1200);
        }
        if (square.classList.contains('lava')) {
            square.classList.remove('lava')
            setTimeout(() => {
                square.classList.add('lava')
            }, 1200);
        }
        if (square.classList.contains('magic')) {
            square.classList.remove('magic')
            setTimeout(() => {
                square.classList.add('magic')
            }, 1200);
        }
    });
}

function checkSwampValidity() {
    const swampSquares = document.querySelectorAll('.square.swamp-portal');

    swampSquares.forEach(square => {

        if (square.classList.contains('water')) {
            square.classList.remove('water')
        }
        if (square.classList.contains('lava')) {
            square.classList.remove('lava')
        }
        if (square.classList.contains('magic')) {
            square.classList.remove('magic')
        }
    });
}

function checkWaterValidity() {
    const waterSquares = document.querySelectorAll('.square.water');

    waterSquares.forEach(square => {

        if (square.classList.contains('lava')) {
            square.classList.remove('lava')
        }

        const piece = square.querySelector('.fantasy-piece');

        if (piece && piece.dataset.waterWalking !== 'true') {

            piece.classList.add('drown-animation');

            piece.addEventListener('animationend', () => {
                piece.classList.remove('drown-animation');
                if (piece.parentElement) {
                    piece.remove();
                    square.classList.remove('evolved', 'lightUltimate', 'shadowUltimate');
                }
            }, { once: true });
        }
    });
}

function checkLavaValidity() {
    const lavaSquares = document.querySelectorAll('.square.lava');

    lavaSquares.forEach(square => {
        const piece = square.querySelector('.fantasy-piece');

        if (piece && piece.dataset.fireproof !== 'true') {
            piece.classList.add('burn-animation');

            piece.addEventListener('animationend', () => {
                piece.classList.remove('burn-animation');
                if (piece.parentElement) {
                    piece.remove();
                    square.classList.remove('evolved', 'lightUltimate', 'shadowUltimate');
                }
            }, { once: true });
        }
    });
}

function checkMagicValidity() {
    // ensures that there is no overlay, so for example, if a piece is on a magic square, it cannot be also water or lava
    const magicSquares = document.querySelectorAll('.square.magic');

    magicSquares.forEach(square => {

        square.classList.remove('water');
        square.classList.remove('lava');

    });
}

function checkDivineProtection() {
    document.querySelectorAll('.fantasy-piece').forEach(piece => {

        if (piece.dataset.divineProtected) {
            piece.classList.add('divine-shield');
        } else {
            piece.classList.remove('divine-shield');
        }

    });
}

function checkStormValidity() {
    document.querySelectorAll('#fantasy-gameboard .square').forEach(square => {
        // Reset visual if it's not the active Eye
        if (square !== gameState.eyeOfStorm.square) {
            square.classList.remove('eye-of-storm');
            return;
        }

        square.classList.add('eye-of-storm');

        const currentEyePiece = square.querySelector('.fantasy-piece');
        const tracker = gameState.eyeOfStorm.tracker;

        if (!currentEyePiece) {
            tracker.clear();
            return;
        }

        const existingPiece = Array.from(tracker.keys())[0];
        if (existingPiece !== currentEyePiece) {
            tracker.clear();
            tracker.set(currentEyePiece, 0);
        }

    });
}

function isWaterSquare(square) {
  return square.classList.contains('water');
}

function canWalkOnWater(piece) {
  return piece.dataset.waterWalking === 'true';
}

function endGame(message) {
    gameOver = true
    infoDisplay.textContent = message
    document.querySelectorAll('.square').forEach(square => {
        square.removeEventListener('dragstart', dragStart)
        square.removeEventListener('dragover', dragOver)
        square.removeEventListener('drop', dragDrop)
    })
}

function checkGameStatus() {
    if (gameOver) {
        return
    }

    if (isKingInCheck(playerTurn)) {
        if (!hasAnyLegalMoves(playerTurn)) {
            endGame(`${playerTurn} is in checkmate! game over.`)
        } else {
            infoDisplay.textContent = `${playerTurn} is in check!`
        }
    } else {
        if (!hasAnyLegalMoves(playerTurn)) {
            endGame(`Stalemate! Game over.`)
        } else {
            infoDisplay.textContent = ``
        }
    }
}

function restartGame() {

    container.style.display = 'none';
    modeSelection.style.display = 'flex';

    gameBoardClassic.innerHTML = '';
    gameBoardFantasy.innerHTML = '';
    infoDisplay.textContent = '';
    playerDisplay.textContent = '';

    playerTurn = 'white';
    gameOver = false;
    castlingMove = null;
    lastMove = { from: null, to: null };

    document.body.classList.remove('classic-mode', 'fantasy-mode');


    if (typeof hasMoved !== 'undefined') {
        hasMoved = {
            whiteKing: false,
            blackKing: false,
            whiteRookA: false,
            whiteRookH: false,
            blackRookA: false,
            blackRookH: false
        }
    }
}

function flashInvalid(square) {
    square.classList.remove('invalid-move');
    void square.offsetWidth;
    square.classList.add('invalid-move');
}

const music = document.getElementById('background-music')

window.addEventListener('click', () => {
    music.volume = 0.3
    music.play()
}, { once: true })

// hotkey m to mute music
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'm') {
    music.muted = !music.muted;
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'w') {
    document.body.classList.toggle('cursor-reset');
  }
});

let sparklesEnabled = false;

// sparkle cursor!!
document.addEventListener('mousemove', (e) => {
  if (!document.body.classList.contains('fantasy-mode')) return;
  if (!sparklesEnabled) return;

  const colors = [
    '#ff3b3b', // red
    '#ff883b', // orange
    '#fff53b', // yellow
    '#3bff57', // green
    '#3b8bff', // blue
    '#8b3bff', // indigo
    '#ff3bff', // violet
  ];

  const sparkle = document.createElement('div');
  sparkle.classList.add('sparkle');
  sparkle.style.left = `${e.clientX}px`;
  sparkle.style.top = `${e.clientY}px`;

  const color = colors[Math.floor(Math.random() * colors.length)];
  sparkle.style.color = color;

  sparkle.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;

  const size = 4 + Math.random() * 4;
  sparkle.style.width = `${size}px`;
  sparkle.style.height = `${size}px`;

  const duration = 0.5 + Math.random() * 0.3;
  sparkle.style.animationDuration = `${duration}s`;

  const moveX = (Math.random() - 0.5) * 30 + 'px';
  const moveY = (Math.random() - 0.5) * 30 + 'px';
  sparkle.style.setProperty('--move-x', moveX);
  sparkle.style.setProperty('--move-y', moveY);

  document.body.appendChild(sparkle);

  setTimeout(() => sparkle.remove(), duration * 1000);
});

// hotkey s for starting sparkles
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 's') {
    sparklesEnabled = !sparklesEnabled;
  }
});

// selection piece glow for fantasy-piece
document.addEventListener('click', (e) => {
  const piece = e.target.closest('.fantasy-piece');

  if (selectedPiece) {
    selectedPiece.classList.remove('select-glow');
  }

  if (piece) {
    selectedPiece = piece;
    selectedPiece.classList.add('select-glow');
    gameState.selectedPiece = selectedPiece;

    const name = selectedPiece.id || 'Unknown';
    const color = selectedPiece.classList.contains('white') ? 'white' : 'black';
    const evolved = selectedPiece.classList.contains('evolved') ? 'yes' : 'no';

    document.getElementById('piece-name').textContent = name;
    document.getElementById('piece-color').textContent = color;
    document.getElementById('piece-evolved').textContent = evolved;

  } else {
    selectedPiece = null;
    
    document.getElementById('piece-name').textContent = 'None';
    document.getElementById('piece-color').textContent = '-';
    document.getElementById('piece-evolved').textContent = '-';

  }
});
