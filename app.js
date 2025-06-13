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
    container.style.display = 'block';
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

    // different game modes within fantasy, like medieval vs nature?
    const startPieces = [
        umbrella, pegasus, dragon, staffSnake, wizard, tornado, bomb, guitar, pope, pirateKing, knight, rook,
        pirate, pirate, pirate, pirate, pirate, pirate, pirate, pirate, pirate, pirate, pirate, pirate,
        '', '', '', '', '', '', '', '', '', bomb, '', '',
        '', '', '', '', '', '', '', '', '', '', '', '',
        '', frog, '', '', '', '', '', '', '', '', frog, '',
        '', '', '', '', '', '', '', '', '', '', '', '',
        '', '', '', '', '', '', '', '', '', '', '', '',
        '', frog, '', '', '', '', '', '', '', '', frog, '',
        '', '', '', '', '', '', '', '', '', '', '', '',
        '', '', '', '', '', bomb, '', '', '', '', '', '',
        pirate, pirate, pirate, pirate, pirate, pirate, pirate, pirate, pirate, pirate, pirate, pirate,
        umbrella, otter, dragon, khanda, tornado, jedi, whale, queen, pope, fish, witch, umbrella
    ]

    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div')
        square.classList.add('square')

        if (waterSquares.includes(i)) {
            square.classList.add('water');
        }

        square.innerHTML = startPiece
        square.firstChild?.setAttribute('draggable', true) 
        square.setAttribute('square-id', i)
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
    updateEvolvedSquares()

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
    const startRow = getRow(startPositionId)
    const endRow = getRow(Number(toSquare.getAttribute('square-id')))
    
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

    } else if (fantasyCaptured) {

        fantasyCaptured.classList.add('captured')

        document.querySelectorAll('.fantasy-piece').forEach(p => {
            p.style.pointerEvents = 'none';
        });

        setTimeout(() => {
            toSquare.removeChild(fantasyCaptured);
            toSquare.appendChild(draggedElement);

            updateEvolvedSquares();

            document.querySelectorAll('.fantasy-piece').forEach(p => {
                p.style.pointerEvents = '';
            });

        }, 550);

    } else {
        toSquare.appendChild(draggedElement);
    }

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
        handlePirateEvolution(toSquare, playerTurn)
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

    updateEvolvedSquares();
    changePlayer();
    checkGameStatus();
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
        case 'whale':
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

function handlePirateEvolution(square, color) {

    // this broken as fuck idkkk
    const temp = document.createElement('div');
    temp.innerHTML = pirateKing.trim();
    const evolvedPiece = temp.firstChild;
    evolvedPiece.setAttribute('draggable', true);
    evolvedPiece.classList.add(color);

    square.replaceChildren(evolvedPiece);
    square.classList.add('square');

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
    if (playerTurn === 'black') {
        reverseIds()
        playerTurn = 'white'
    } else {
        revertIds()
        playerTurn = 'black'
    }
    playerDisplay.textContent = playerTurn
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

// list of abilities for each piece
const abilityMap = {

    bomb : {
        name : "DOWN THE LINE",
        charges: 3,
        effect: function (piece) {
            if (abilityMap.bomb.charges <= 0) {
                console.log("No charges left for DOWN THE LINE!");
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
                            updateEvolvedSquares();
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

                abilityMap.bomb.charges -= 1;
                console.log(`💣 Bomb exploded! Charges left: ${abilityMap.bomb.charges}`);
            }
        }
    },

    dragon : {
        name : "LANE OF FIRE",
        charges: 4,
        // cooldown: 10,
        effect: (piece) => {

            if (abilityMap.dragon.charges <= 0) {
                console.log("No charges left for LANE OF FIRE!");
                return;
            }

            const randomCol = Math.floor(Math.random() * width); // column 0–7
            console.log(`🔥 Dragon casts LANE OF FIRE on column ${randomCol + 1}!`);
            
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
                        }
                    }
                });
            }, 90 * width);

            abilityMap.dragon.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.dragon.charges}`);
        }
    },

    fish : {
        name : "SINK AND RISE",
        charges: Infinity, 
        effect: function (piece) {
            
            if (abilityMap.fish.charges <= 0) {
                console.log("No charges left for SINK AND RISE!");
                return;
            }

            const waterSquares = Array.from(document.querySelectorAll('.square.water'));

            const unoccupied = waterSquares.filter(square => {
                return !square.querySelector('.piece, .fantasy-piece');
            });

            if (unoccupied.length === 0) {
                console.log("🐟 No unoccupied water squares available!");
                return;
            }

            const randomSquare = unoccupied[Math.floor(Math.random() * unoccupied.length)];

            const currentSquare = piece.parentNode;
            currentSquare.removeChild(piece);
            randomSquare.appendChild(piece);

            // Optional visual effect
            randomSquare.classList.add('fish-teleport');
            setTimeout(() => randomSquare.classList.remove('fish-teleport'), 300);

            console.log("🐟 Fish used SINK AND RISE!");

            abilityMap.fish.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.fish.charges}`);
        }
    },

    frog : {
        name : "SWAMP SWAP",
        charges: Infinity,
        effect: function (piece) {

            const selectedPiece = piece;
            const selectedSquare = selectedPiece.parentElement;

            selectedSquare.classList.add('swapping-frog');
            document.querySelectorAll('.fantasy-piece').forEach(p => p.setAttribute('draggable', false));

            const handleSwapClick = (e) => {
                const target = e.target;
                const clickedPiece = target.closest('.fantasy-piece');
                const clickedSquare = target.closest('.square');

                if (!clickedPiece || clickedPiece === selectedPiece) {
                    console.log("SWAMP SWAP canceled.");
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

                cleanup();
            };

            function cleanup() {
                document.removeEventListener('click', handleSwapClick);
                selectedSquare.classList.remove('swapping-frog');
                document.querySelectorAll('.fantasy-piece').forEach(p => p.setAttribute('draggable', true));
                updateEvolvedSquares();
            }

            setTimeout(() => {
                document.addEventListener('click', handleSwapClick);
            }, 0);
        }
    },

    pirate : {
        name : "FRONTAL SWEEP",
        charges: 8,
        effect: function (piece) {

            if (abilityMap.pirate.charges <= 0) {
                console.log("No charges left for FRONTAL SWEEP!");
                return;
            }

            const originId = Number(piece.parentElement.getAttribute('square-id'));
            const row = getRow(originId);
            const col = getCol(originId);
            
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

                    if (target) {
                        setTimeout(() => targetSquare.removeChild(target), 150);
                    }
                }
            }

            abilityMap.pirate.charges -= 1;
            console.log(`🚴‍♀️ Pirate used FRONTAL SWEEP! Charges left: ${abilityMap.pirate.charges}`);
        }
    },

    pirateKing : {
        name : "CANNONBALL BARRAGE",
        charges: 7,
        effect: function (piece) {

            if (abilityMap.pirateKing.charges <= 0) {
                console.log("No charges left for CANNONBALL BARRAGE!");
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
                    }
                        square.classList.remove('barrage-target');
                    }, 1500);
                }, i * 200);
            });

            console.log(`🏴‍☠️ PirateKing launched CANNONBALL BARRAGE on ${numberOfTargets} squares!`);
            
            abilityMap.pirateKing.charges -= 1;
            console.log(`Charges remaining: ${abilityMap.pirateKing.charges}`);
        }
    },

    whale : {
        name : "TIDAL WAVE",
        charges: 6,
        effect: function (piece) {

            if (abilityMap.whale.charges <= 0) {
                console.log("No charges left for TIDAL WAVE!");
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
                }, 500);
            }, i * 80);
            });

            abilityMap.whale.charges -= 1;
            console.log(`🐋 Whale unleashed a tidal wave! Charges left: ${abilityMap.whale.charges}`);
            updateEvolvedSquares();
        }
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
    const pieceId = selectedPiece.id;
    const ability = abilityMap[pieceId];
    const pieceColor = selectedPiece.classList.contains('white') ? 'white' : 'black';

    if (pieceColor !== playerTurn) {
        console.log(`It's ${playerTurn}'s turn! Cannot cast this ability!`);
        return;
    }

    if (ability) {
        ability.effect(selectedPiece, () => {
            changePlayer();
        });
    }

    updateEvolvedSquares();

    // do cooldown logic later just cast for now
    // if (ability) {
    //   const currentTurn = getCurrentTurn();
    //   const cooldownRemaining = ability.cooldown - (currentTurn - ability.lastUsedTurn);

    //   if (cooldownRemaining <= 0) {
    //     ability.effect(selectedPiece);
    //     ability.lastUsedTurn = currentTurn;
    //     showCooldownFeedback(selectedPiece, ability.cooldown);
    //   } else {
    //     console.log(`Ability on cooldown: ${cooldownRemaining} turn(s) left.`);
    //   }
    // }
  }
});

function isFantasyPiece(piece) {
  return piece.classList.contains('fantasy-piece');
}

function updateEvolvedSquares() {
    document.querySelectorAll('#fantasy-gameboard .square').forEach(square => {
        const piece = square.querySelector('.fantasy-piece');
        if (piece && piece.classList.contains('evolved')) {
            square.classList.add('evolved');
        } else {
            square.classList.remove('evolved');
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

document.addEventListener('click', (e) => {
  const piece = e.target.closest('.fantasy-piece');
  if (piece) {
    selectedPiece = piece;
    console.log(selectedPiece);
  }
});