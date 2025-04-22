import { useState } from 'react';

export function Board() {
    const [board, setBoard] = useState<string[][]>([
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ]);

    const handleCellClick = (row: number, col: number) => {
        const newBoard = [...board];
        newBoard[row][col] = 'X'; // For now, just place X. This will be connected to the contract later
        setBoard(newBoard);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-2xl">
                <div className="grid grid-cols-3 gap-4">
                    {board.map((row, rowIndex) => (
                        row.map((cell, colIndex) => (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                className="w-24 h-24 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-lg 
                                         flex items-center justify-center text-4xl font-bold transition-all duration-200
                                         hover:scale-105 hover:shadow-md active:scale-95"
                            >
                                {cell}
                            </button>
                        ))
                    ))}
                </div>
            </div>
        </div>
    );
} 