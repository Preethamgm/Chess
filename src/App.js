import React, { useState } from "react";
import "./App.css";
import {
  getPawnMoves,
  getRookMoves,
  getBishopMoves,
  getQueenMoves,
  getKingMoves,
  getKnightMoves,
  getCastlingMoves,
  getEnPassantMoves,
  isKingInCheck,
  findBestMove,
  applyMove,
  evaluateBoard,
} from "./chessMoves";

const initialPosition = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
];

function App() {
  const [board, setBoard] = useState(initialPosition);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [turn, setTurn] = useState("white");
  const [lastMove, setLastMove] = useState(null);
  const [moved, setMoved] = useState({
    kingWhite: false,
    rookWhiteLeft: false,
    rookWhiteRight: false,
    kingBlack: false,
    rookBlackLeft: false,
    rookBlackRight: false,
  });
  const [moveHistory, setMoveHistory] = useState([]);
  const [score, setScore] = useState(0);

  const getValidMoves = (row, col, piece) => {
    let moves = [];
    if (piece === "♙" || piece === "♟") {
      moves = getPawnMoves(row, col, board, piece);
      moves = moves.concat(getEnPassantMoves(row, col, board, piece, lastMove));
    } else if ("♜♖".includes(piece)) {
      moves = getRookMoves(row, col, board);
    } else if ("♝♗".includes(piece)) {
      moves = getBishopMoves(row, col, board);
    } else if ("♛♕".includes(piece)) {
      moves = getQueenMoves(row, col, board);
    } else if ("♚♔".includes(piece)) {
      moves = getKingMoves(row, col, board);
      moves = moves.concat(getCastlingMoves(row, col, board, turn, moved));
    } else if ("♞♘".includes(piece)) {
      moves = getKnightMoves(row, col, board);
    }
    return moves.filter(([r, c]) => {
      const target = board[r][c];
      if (!target) return true;
      const isWhiteTarget = "♙♖♘♗♕♔".includes(target);
      const isBlackTarget = "♟♜♞♝♛♚".includes(target);
      return turn === "white" ? isBlackTarget : isWhiteTarget;
    });
  };

  const handleDragStart = (event, row, col) => {
    const piece = board[row][col];
    if (!piece) return;
    const isWhitePiece = "♙♖♘♗♕♔".includes(piece);
    if ((turn === "white" && !isWhitePiece) || (turn === "black" && isWhitePiece))
      return;
    setSelectedPiece({ row, col, piece });
    const validMoves = getValidMoves(row, col, piece);
    setHighlightedSquares(validMoves);
    event.dataTransfer.setData("text/plain", `${row},${col}`);
  };

  const handleDrop = (event, row, col) => {
    event.preventDefault();
    if (!selectedPiece) return;
    const validMove = highlightedSquares.some(([r, c]) => r === row && c === col);
    if (validMove) {
      let newBoard = board.map((r) => [...r]);

      // En passant capture:
      if (
        selectedPiece.piece === "♙" &&
        row === 2 &&
        lastMove &&
        lastMove.piece === "♟" &&
        lastMove.from[0] === 1 &&
        lastMove.to[0] === 3 &&
        col === lastMove.to[1]
      ) {
        newBoard[3][lastMove.to[1]] = "";
      }
      if (
        selectedPiece.piece === "♟" &&
        row === 5 &&
        lastMove &&
        lastMove.piece === "♙" &&
        lastMove.from[0] === 6 &&
        lastMove.to[0] === 4 &&
        col === lastMove.to[1]
      ) {
        newBoard[4][lastMove.to[1]] = "";
      }

      // Castling:
      if (selectedPiece.piece === "♔" || selectedPiece.piece === "♚") {
        if (col === 6) {
          newBoard[row][5] = board[row][7];
          newBoard[row][7] = "";
          if (turn === "white") moved.rookWhiteRight = true;
          else moved.rookBlackRight = true;
        } else if (col === 2) {
          newBoard[row][3] = board[row][0];
          newBoard[row][0] = "";
          if (turn === "white") moved.rookWhiteLeft = true;
          else moved.rookBlackLeft = true;
        }
        if (turn === "white") moved.kingWhite = true;
        else moved.kingBlack = true;
      }

      newBoard[row][col] = board[selectedPiece.row][selectedPiece.col];
      newBoard[selectedPiece.row][selectedPiece.col] = "";

      // Pawn promotion: auto-promote to queen.
      if (selectedPiece.piece === "♙" && row === 0) {
        newBoard[row][col] = "♕";
      }
      if (selectedPiece.piece === "♟" && row === 7) {
        newBoard[row][col] = "♛";
      }

      const moveRecord = {
        from: [selectedPiece.row, selectedPiece.col],
        to: [row, col],
        piece: selectedPiece.piece,
      };
      setMoveHistory([...moveHistory, moveRecord]);

      const currentScore = evaluateBoard(newBoard);
      setScore(currentScore);

      setLastMove(moveRecord);

      if (isKingInCheck(newBoard, turn)) {
        alert("Illegal move: Your king would be in check!");
        setHighlightedSquares([]);
        setSelectedPiece(null);
        return;
      }
      setBoard(newBoard);
      setTurn(turn === "white" ? "black" : "white");

      // If it's computer's turn (black), let the computer move.
      if (turn === "white") {
        setTimeout(() => {
          const bestMove = findBestMove(newBoard, 3, "black");
          if (bestMove) {
            const compBoard = applyMove(newBoard, bestMove);
            setBoard(compBoard);
            setTurn("white");
            setMoveHistory([...moveHistory, bestMove]);
            setScore(evaluateBoard(compBoard));
          }
        }, 500);
      }
    }
    setHighlightedSquares([]);
    setSelectedPiece(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="container">
      <h1>Chessboard</h1>
      <div className="game-container">
        <div id="chessboard">
          {board.map((row, rowIndex) =>
            row.map((square, colIndex) => {
              const isHighlighted = highlightedSquares.some(
                ([r, c]) => r === rowIndex && c === colIndex
              );
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`square ${(rowIndex + colIndex) % 2 === 0 ? "light" : "dark"} ${
                    isHighlighted ? "highlight" : ""
                  }`}
                  data-testid={isHighlighted ? "highlight" : "square"}
                  onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                  onDragOver={handleDragOver}
                >
                  {square && (
                    <span
                      className="piece"
                      data-testid="piece"
                      draggable
                      onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                    >
                      {square}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div className="sidebar">
          <p>Turn: {turn === "white" ? "White (♙♖♘♗♕♔)" : "Black (♟♜♞♝♛♚)"}</p>
          <p>Score: {score}</p>
          <h2>Move History</h2>
          <ul>
            {moveHistory.map((move, index) => (
              <li key={index}>
                {move.piece} from {move.from[0]},{move.from[1]} to {move.to[0]},{move.to[1]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
