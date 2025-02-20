// src/chessMoves.js

export const createEmptyBoard = () =>
  Array(8).fill(null).map(() => Array(8).fill(""));

// Pawn Moves
export function getPawnMoves(row, col, board, piece) {
  const moves = [];
  const direction = piece === "♙" ? -1 : 1; // White moves UP (-1), Black moves DOWN (+1)
  // One square forward
  if (
    row + direction >= 0 &&
    row + direction < 8 &&
    board[row + direction][col] === ""
  ) {
    moves.push([row + direction, col]);
  }
  // Two squares forward from starting row:
  if ((piece === "♙" && row === 6) || (piece === "♟" && row === 1)) {
    if (
      board[row + direction][col] === "" &&
      board[row + direction * 2][col] === ""
    ) {
      moves.push([row + direction * 2, col]);
    }
  }
  // Diagonal captures
  [-1, 1].forEach((offset) => {
    const targetRow = row + direction;
    const targetCol = col + offset;
    if (
      targetRow >= 0 &&
      targetRow < 8 &&
      targetCol >= 0 &&
      targetCol < 8
    ) {
      const target = board[targetRow][targetCol];
      if (target && target !== piece) {
        moves.push([targetRow, targetCol]);
      }
    }
  });
  return moves;
}

export function getRookMoves(row, col, board) {
  return getSlidingMoves(row, col, board, [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]);
}

export function getBishopMoves(row, col, board) {
  return getSlidingMoves(row, col, board, [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ]);
}

export function getQueenMoves(row, col, board) {
  return getSlidingMoves(row, col, board, [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ]);
}

export function getKingMoves(row, col, board) {
  const moves = [];
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      moves.push([newRow, newCol]);
    }
  });
  return moves;
}

export function getKnightMoves(row, col, board) {
  const moves = [];
  const knightJumps = [
    [-2, -1],
    [-2, 1],
    [2, -1],
    [2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
  ];
  knightJumps.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      moves.push([newRow, newCol]);
    }
  });
  return moves;
}

function getSlidingMoves(row, col, board, directions) {
  const moves = [];
  directions.forEach(([dx, dy]) => {
    let newRow = row + dx;
    let newCol = col + dy;
    while (
      newRow >= 0 &&
      newRow < 8 &&
      newCol >= 0 &&
      newCol < 8
    ) {
      moves.push([newRow, newCol]);
      if (board[newRow][newCol] !== "") break;
      newRow += dx;
      newCol += dy;
    }
  });
  return moves;
}

// Basic Castling Moves (simplified)
export function getCastlingMoves(row, col, board, turn, moved) {
  const moves = [];
  if (turn === "white" && row === 7 && col === 4 && !moved.kingWhite) {
    if (!moved.rookWhiteRight && board[7][5] === "" && board[7][6] === "") {
      moves.push([7, 6]);
    }
    if (!moved.rookWhiteLeft && board[7][1] === "" && board[7][2] === "" && board[7][3] === "") {
      moves.push([7, 2]);
    }
  }
  if (turn === "black" && row === 0 && col === 4 && !moved.kingBlack) {
    if (!moved.rookBlackRight && board[0][5] === "" && board[0][6] === "") {
      moves.push([0, 6]);
    }
    if (!moved.rookBlackLeft && board[0][1] === "" && board[0][2] === "" && board[0][3] === "") {
      moves.push([0, 2]);
    }
  }
  return moves;
}

// En Passant Moves (simplified)
export function getEnPassantMoves(row, col, board, piece, lastMove) {
  const moves = [];
  if (!lastMove) return moves;
  // For white pawn (♙): en passant available on row 3 if a black pawn moved from row 1 to row 3.
  if (
    piece === "♙" &&
    row === 3 &&
    lastMove.piece === "♟" &&
    lastMove.from[0] === 1 &&
    lastMove.to[0] === 3 &&
    Math.abs(col - lastMove.to[1]) === 1
  ) {
    moves.push([2, lastMove.to[1]]);
  }
  // For black pawn (♟): en passant available on row 4 if a white pawn moved from row 6 to row 4.
  if (
    piece === "♟" &&
    row === 4 &&
    lastMove.piece === "♙" &&
    lastMove.from[0] === 6 &&
    lastMove.to[0] === 4 &&
    Math.abs(col - lastMove.to[1]) === 1
  ) {
    moves.push([5, lastMove.to[1]]);
  }
  return moves;
}

// Evaluation: simple material count.
const pieceValues = {
  "♙": 1, "♟": -1,
  "♘": 3, "♞": -3,
  "♗": 3, "♝": -3,
  "♖": 5, "♜": -5,
  "♕": 9, "♛": -9,
  "♔": 1000, "♚": -1000,
};

export function evaluateBoard(board) {
  let score = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece in pieceValues) score += pieceValues[piece];
    }
  }
  return score;
}

// Generate all legal moves for a given color.
export function getAllLegalMoves(board, color) {
  const moves = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const isWhite = "♙♖♘♗♕♔".includes(piece);
        if ((color === "white" && isWhite) || (color === "black" && !isWhite)) {
          let pieceMoves = [];
          if ("♙♟".includes(piece)) pieceMoves = getPawnMoves(i, j, board, piece);
          else if ("♜♖".includes(piece)) pieceMoves = getRookMoves(i, j, board);
          else if ("♝♗".includes(piece)) pieceMoves = getBishopMoves(i, j, board);
          else if ("♛♕".includes(piece)) pieceMoves = getQueenMoves(i, j, board);
          else if ("♚♔".includes(piece)) pieceMoves = getKingMoves(i, j, board);
          else if ("♞♘".includes(piece)) pieceMoves = getKnightMoves(i, j, board);
          pieceMoves.forEach(([r, c]) => {
            // Filter out moves capturing own piece
            const target = board[r][c];
            const isTargetWhite = "♙♖♘♗♕♔".includes(target);
            const isTargetBlack = "♟♜♞♝♛♚".includes(target);
            const isMovingWhite = isWhite;
            if (!target || (isMovingWhite && !isTargetWhite) || (!isMovingWhite && !isTargetBlack)) {
              moves.push({ from: [i, j], to: [r, c], piece });
            }
          });
        }
      }
    }
  }
  return moves;
}

export function applyMove(board, move) {
  const newBoard = board.map((row) => [...row]);
  const [fromRow, fromCol] = move.from;
  const [toRow, toCol] = move.to;
  newBoard[toRow][toCol] = board[fromRow][fromCol];
  newBoard[fromRow][fromCol] = "";
  return newBoard;
}

export function minimax(board, depth, maximizingPlayer, alpha, beta, color) {
  if (depth === 0) return evaluateBoard(board);
  const legalMoves = getAllLegalMoves(board, color);
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const newBoard = applyMove(board, move);
      const evalVal = minimax(newBoard, depth - 1, false, alpha, beta, color === "white" ? "black" : "white");
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const newBoard = applyMove(board, move);
      const evalVal = minimax(newBoard, depth - 1, true, alpha, beta, color === "white" ? "black" : "white");
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function findBestMove(board, depth, color) {
  const legalMoves = getAllLegalMoves(board, color);
  let bestMove = null;
  let bestEval = color === "white" ? -Infinity : Infinity;
  for (const move of legalMoves) {
    const newBoard = applyMove(board, move);
    const evalVal = minimax(newBoard, depth - 1, color === "black", -Infinity, Infinity, color === "white" ? "black" : "white");
    if (color === "white" && evalVal > bestEval) {
      bestEval = evalVal;
      bestMove = move;
    }
    if (color === "black" && evalVal < bestEval) {
      bestEval = evalVal;
      bestMove = move;
    }
  }
  return bestMove;
}

export function isKingInCheck(board, color) {
  const kingSymbol = color === "white" ? "♔" : "♚";
  let kingPos = null;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j] === kingSymbol) {
        kingPos = [i, j];
        break;
      }
    }
    if (kingPos) break;
  }
  if (!kingPos) return false;
  const opponentPieces = color === "white" ? "♟♜♞♝♛♚" : "♙♖♘♗♕♔";
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece && opponentPieces.includes(piece)) {
        let moves = [];
        switch (piece) {
          case "♟":
            moves = getPawnMoves(i, j, board, piece);
            break;
          case "♜":
            moves = getRookMoves(i, j, board);
            break;
          case "♞":
            moves = getKnightMoves(i, j, board);
            break;
          case "♝":
            moves = getBishopMoves(i, j, board);
            break;
          case "♛":
            moves = getQueenMoves(i, j, board);
            break;
          case "♚":
            moves = getKingMoves(i, j, board);
            break;
          default:
            moves = [];
        }
        if (moves.some(([r, c]) => r === kingPos[0] && c === kingPos[1])) {
          return true;
        }
      }
    }
  }
  return false;
}
