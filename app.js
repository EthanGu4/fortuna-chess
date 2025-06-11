const modeSelection = document.getElementById('mode-selection');
const container = document.getElementById('container');
const gameBoard = document.querySelector('#gameboard')
const infoDisplay = document.querySelector('#info-display')
const playerDisplay = document.querySelector('#player')
const restartBtn = document.getElementById('restart-btn');

let width
let playerTurn = "white"
let gameOver = false
let castlingMove = null
let lastMove = { from: null, to: null }
playerDisplay.textContent = 'white'


// const startPieces = [
//     '', '', '', queen, king, '', '', '',
//     pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
//     '', '', '', '', '', '', '', '',
//     '', '', '', '', '', '', '', '',
//     '', '', '', '', '', '', '', '',
//     '', '', '', '', '', '', '', '',
//     '', '', '', '', '', '', '', '',
//     rook, knight, bishop, queen, king, bishop, knight, rook
// ]

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

    gameBoard.innerHTML = '';
    infoDisplay.textContent = '';
    playerDisplay.textContent = 'white';

    if (mode === 'classic') {
        width = 8;
        document.body.classList.remove('fantasy-mode');
        document.body.classList.add('classic-mode');

        createClassicBoard();

    } else if (mode == 'fantasy') {
        width = 8;
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
        gameBoard.appendChild(square)
    })

    squareFunctionality()

    if (playerTurn === 'white') {
        reverseIds()
    }
}

function createFantasyBoard() {
    const startPieces = [
        frog, knight, bishop, queen, king, bishop, knight, rook,
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
        gameBoard.appendChild(square)
    })

    squareFunctionality()

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

    fromSquare.removeChild(draggedElement);
    if (captured) toSquare.removeChild(captured);
    toSquare.appendChild(draggedElement);

    const stillInCheck = isKingInCheck(playerTurn);
    
    if (stillInCheck) {
        undoMove(fromSquare, toSquare, draggedElement, captured);
        infoDisplay.textContent = 'You cannot move into check';
        flashInvalid(toSquare)
        setTimeout(() => infoDisplay.textContent = '', 2000);
        return;
    }

    if (pieceType === 'pawn' && endRow === 7) {
        handlePawnPromotion(toSquare, playerTurn)
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

    changePlayer();
    checkGameStatus();
}

function checkIfValid(piece, from, to) {
    const pieceType = piece.id
    const pieceColor = piece.classList[1]
    const opponentColor = pieceColor === 'white' ? 'black' : 'white'
    const startId = Number(from.getAttribute('square-id'))
    const targetId = Number(to.getAttribute('square-id'))

    switch(pieceType) {
        case 'pawn':
            const startRow = [8, 9, 10, 11, 12, 13, 14, 15];
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

        // case 'knight':
        //     if (
        //         startId + width * 2 + 1 === targetId ||
        //         startId + width * 2 - 1 === targetId ||
        //         startId + width + 2 === targetId ||
        //         startId + width - 2 === targetId ||
        //         startId - width + 2 === targetId ||
        //         startId - width - 2 === targetId ||
        //         startId - width * 2 + 1 === targetId ||
        //         startId - width * 2 - 1 === targetId
        //     ) {
        //         return true
        //     }
        //     break;

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
        
        // case 'bishop':
        //     if (
        //         startId + width + 1 === targetId ||
        //         startId + width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild ||
        //         startId + width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild ||
        //         startId + width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild ||
        //         startId + width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 + 4}"]`).firstChild ||
        //         startId + width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 + 5}"]`).firstChild ||
        //         startId + width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 6 + 6}"]`).firstChild ||
                
        //         // 2nd diagonal

        //         startId - width - 1 === targetId ||
        //         startId - width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild ||
        //         startId - width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild ||
        //         startId - width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild ||
        //         startId - width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 - 4}"]`).firstChild ||
        //         startId - width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 - 5}"]`).firstChild ||
        //         startId - width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 6 - 6}"]`).firstChild ||
                
        //         // 3rd diagonal

        //         startId + width - 1 === targetId ||
        //         startId + width * 2 - 2 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild ||
        //         startId + width * 3 - 3 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild ||
        //         startId + width * 4 - 4 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild ||
        //         startId + width * 5 - 5 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 - 4}"]`).firstChild ||
        //         startId + width * 6 - 6 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 - 5}"]`).firstChild ||
        //         startId + width * 7 - 7 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2 - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3 - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4 - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 5 - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 6 - 6}"]`).firstChild ||

        //         // 4th diagonal

        //         startId - width + 1 === targetId ||
        //         startId - width * 2 + 2 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild ||
        //         startId - width * 3 + 3 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild ||
        //         startId - width * 4 + 4 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild ||
        //         startId - width * 5 + 5 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 + 4}"]`).firstChild ||
        //         startId - width * 6 + 6 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 + 5}"]`).firstChild ||
        //         startId - width * 7 + 7 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2 + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3 + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4 + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 5 + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 6 + 6}"]`).firstChild
        //     ) {
        //         return true
        //     }
        //     break;

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
                
        // case 'rook':
        //     if (
        //         startId + width === targetId ||
        //         startId + width * 2 === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild ||
        //         startId + width * 3 === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`).firstChild ||
        //         startId + width * 4 === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`).firstChild ||
        //         startId + width * 5 === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4}"]`).firstChild ||
        //         startId + width * 6 === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4}"]`).firstChild  && !document.querySelector(`[square-id="${startId + width * 5}"]`).firstChild ||
        //         startId + width * 7 === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 4}"]`).firstChild  && !document.querySelector(`[square-id="${startId + width * 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + width * 6}"]`).firstChild ||
                
        //         startId - width === targetId ||
        //         startId - width * 2 === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild ||
        //         startId - width * 3 === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`).firstChild ||
        //         startId - width * 4 === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`).firstChild ||
        //         startId - width * 5 === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4}"]`).firstChild ||
        //         startId - width * 6 === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4}"]`).firstChild  && !document.querySelector(`[square-id="${startId - width * 5}"]`).firstChild ||
        //         startId - width * 7 === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 4}"]`).firstChild  && !document.querySelector(`[square-id="${startId - width * 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - width * 6}"]`).firstChild ||
            
        //         startId + 1 === targetId ||
        //         startId + 2 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild ||
        //         startId + 3 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild ||
        //         startId + 4 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild ||
        //         startId + 5 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild ||
        //         startId + 6 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild  && !document.querySelector(`[square-id="${startId + 5}"]`).firstChild ||
        //         startId + 7 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild  && !document.querySelector(`[square-id="${startId + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + 6}"]`).firstChild ||
            
        //         startId - 1 === targetId ||
        //         startId - 2 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild ||
        //         startId - 3 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild ||
        //         startId - 4 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild ||
        //         startId - 5 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild ||
        //         startId - 6 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild  && !document.querySelector(`[square-id="${startId - 5}"]`).firstChild ||
        //         startId - 7 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild  && !document.querySelector(`[square-id="${startId - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - 6}"]`).firstChild
        //     ) {
        //         return true
        //     }
        //     break;

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


        // case 'king':
        //     const kingMoves = [
        //         [-1, -1], [-1, 0], [-1, 1],
        //         [0, -1],           [0, 1],
        //         [1, -1],  [1, 0],  [1, 1]
        //     ];

        //     const startKingRow = getRow(startId);
        //     const startKingCol = getCol(startId);

        //     for (const [rowDirection, colDirection] of kingMoves) {
        //         const row = startKingRow + rowDirection;
        //         const col = startKingCol + colDirection;

        //         if (row < 0 || row >= width || col < 0 || col >= width) {
        //             continue;
        //         }

        //         const target = row * width + col;

        //         if (target === targetId) {

        //             const square = document.querySelector(`[square-id="${target}"]`);
        //             const piece = square.firstChild;

        //             if (!piece || !piece.classList.contains(pieceColor)) {
        //                 return true;
        //             }
        //         }
        //     }

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

    gameBoard.innerHTML = '';
    infoDisplay.textContent = '';
    playerDisplay.textContent = '';

    playerTurn = 'white';
    gameOver = false;
    castlingMove = null;
    lastMove = { from: null, to: null };

    // gameBoard.innerHTML = ''
    // infoDisplay.textContent = ''
    // playerTurn = 'white'
    // gameOver = false
    // castlingMove = null
    // lastMove = { from: null, to: null }
    // playerDisplay.textContent = playerTurn

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
    void square.offsetWidth; // Force reflow
    square.classList.add('invalid-move');
}

const music = document.getElementById('background-music')

window.addEventListener('click', () => {
    music.volume = 0.3
    music.play()
}, { once: true })