class ChessBoard {
    constructor() {
        this.board = document.getElementById('board');
        this.selectedPiece = null;
        this.turn = 'white'; // Track whose turn it is (white starts)
        this.gameState = Array(8).fill(null).map(() => Array(8).fill(null)); // 8x8 array to store piece positions
        this.setupBoard();
    }

    setupBoard() {
        const initialPosition = {
            0: ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            1: ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            6: ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            7: ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        };
    
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
    
                if (initialPosition[row]) {
                    const piece = document.createElement('div');
                    piece.className = 'piece';
                    piece.textContent = initialPosition[row][col];
                    piece.dataset.color = row < 2 ? 'black' : 'white'; // Assign color
                    this.gameState[row][col] = { piece: piece.textContent, color: piece.dataset.color }; // Store as object
                    square.appendChild(piece);
                } else {
                    this.gameState[row][col] = null; // Empty square
                }
    
                square.addEventListener('click', () => this.handleClick(square));
                this.board.appendChild(square);
            }
        }
    }

    handleClick(square) {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
    
        if (this.selectedPiece) {
            const fromRow = parseInt(this.selectedPiece.parentElement.dataset.row);
            const fromCol = parseInt(this.selectedPiece.parentElement.dataset.col);
    
            if (this.isLegalMove(this.selectedPiece, fromRow, fromCol, row, col)) {
                // Handle capture if there's a piece in the target square
                if (square.children.length > 0) {
                    const capturedPiece = square.children[0];
                    capturedPiece.remove(); // Remove captured piece from the DOM
                }
    
                // Move selected piece to the target square
                square.appendChild(this.selectedPiece);
                this.gameState[fromRow][fromCol] = null; // Clear original position in game state
                this.gameState[row][col] = {
                    piece: this.selectedPiece.textContent,
                    color: this.selectedPiece.dataset.color
                }; // Update new position in game state
    
                this.selectedPiece.parentElement.classList.remove('selected');
                this.selectedPiece = null;
    
                // Switch turn
                this.turn = this.turn === 'white' ? 'black' : 'white';
            } else {
                alert("Illegal move!");
                this.selectedPiece.parentElement.classList.remove('selected');
                this.selectedPiece = null;
            }
        } else if (square.children.length > 0) {
            const piece = square.children[0];
            if (piece.dataset.color === this.turn) {
                this.selectedPiece = piece;
                square.classList.add('selected');
            } else {
                alert(`It's ${this.turn}'s turn!`);
            }
        }
    }

    isLegalMove(piece, fromRow, fromCol, toRow, toCol) {
        const deltaRow = toRow - fromRow;
        const deltaCol = toCol - fromCol;
        const targetSquare = this.gameState[toRow][toCol];
    
        // Prevent moving onto a piece of the same color
        if (targetSquare && targetSquare.color === piece.dataset.color) {
            return false;
        }
    
        switch (piece.textContent) {
            // Pawn
            case '♙': case '♟': {
                const direction = piece.dataset.color === 'white' ? -1 : 1;
                const startRow = piece.dataset.color === 'white' ? 6 : 1;
    
                // Forward move
                if (toCol === fromCol && !targetSquare) {
                    if (deltaRow === direction) return true; // Single step
                    if (fromRow === startRow && deltaRow === 2 * direction && !this.gameState[fromRow + direction][toCol]) {
                        return true; // Double step from start
                    }
                }
    
                // Diagonal capture
                if (Math.abs(deltaCol) === 1 && deltaRow === direction && targetSquare) {
                    return true;
                }
                break;
            }
    
            // Rook
            case '♖': case '♜': {
                if (deltaRow === 0 || deltaCol === 0) { // Horizontal or vertical move
                    return this.isPathClear(fromRow, fromCol, toRow, toCol);
                }
                break;
            }
    
            // Knight
            case '♘': case '♞': {
                if ((Math.abs(deltaRow) === 2 && Math.abs(deltaCol) === 1) ||
                    (Math.abs(deltaRow) === 1 && Math.abs(deltaCol) === 2)) {
                    return true;
                }
                break;
            }
    
            // Bishop
            case '♗': case '♝': {
                if (Math.abs(deltaRow) === Math.abs(deltaCol)) { // Diagonal move
                    return this.isPathClear(fromRow, fromCol, toRow, toCol);
                }
                break;
            }
    
            // Queen
            case '♕': case '♛': {
                if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
                    // Horizontal, vertical, or diagonal
                    return this.isPathClear(fromRow, fromCol, toRow, toCol);
                }
                break;
            }
    
            // King
            case '♔': case '♚': {
                if (Math.abs(deltaRow) <= 1 && Math.abs(deltaCol) <= 1) {
                    return true; // Single square in any direction
                }
                break;
            }
        }
    
        return false; // Default to illegal move
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const deltaRow = toRow - fromRow === 0 ? 0 : (toRow - fromRow) / Math.abs(toRow - fromRow);
        const deltaCol = toCol - fromCol === 0 ? 0 : (toCol - fromCol) / Math.abs(toCol - fromCol);
    
        let currentRow = fromRow + deltaRow;
        let currentCol = fromCol + deltaCol;
    
        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.gameState[currentRow][currentCol] !== null) {
                return false; // Path is blocked
            }
            currentRow += deltaRow;
            currentCol += deltaCol;
        }
    
        return true; // Path is clear
    }

    // Function to change the theme of the board
    changeTheme(theme) {
        const board = document.getElementById('board');
        board.classList.remove('ice-theme', 'fire-theme', 'green-theme', 'blue-theme'); // Remove all themes
        board.classList.add(theme); // Add the selected theme
    }
}

// Initialize the chessboard
const game = new ChessBoard();

// Event listener for the theme selector dropdown
document.getElementById('theme-select').addEventListener('change', (event) => {
    const selectedTheme = event.target.value;
    game.changeTheme(selectedTheme);
});

// Initial theme setup (Ice theme)
game.changeTheme('ice-theme');
