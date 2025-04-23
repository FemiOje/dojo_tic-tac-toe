import { useState, useEffect } from 'react';
import { useDojoSDK } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { useEntityQuery, useModel, useEntityId, useEventQuery } from "@dojoengine/sdk/react";
import { KeysClause, ToriiQueryBuilder } from "@dojoengine/sdk";
import { ModelsMapping } from "./typescript/models.gen";
import { CairoCustomEnum } from "starknet";

export function Board() {
    const { client } = useDojoSDK();
    const { account } = useAccount();
    const [board, setBoard] = useState<string[][]>([
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ]);
    const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
    const [selectedPlayer, setSelectedPlayer] = useState<'X' | 'O' | null>(null);
    const [gameWon, setGameWon] = useState<{player: string, lastCell: {position: [number, number]}} | null>(null);

    // Get game state and cells from contract
    const gameId = useEntityId(1);
    const gameState = useModel(gameId as string, ModelsMapping.GameState);

    // Query for all cells
    useEntityQuery(
        new ToriiQueryBuilder()
            .withClause(
                KeysClause(
                    [ModelsMapping.Cell],
                    [],
                    "FixedLen"
                ).build()
            )
            .includeHashedKeys()
    );

    // Subscribe to game events
    useEventQuery(
        new ToriiQueryBuilder()
            .withClause(
                KeysClause(
                    [ModelsMapping.Played, ModelsMapping.GameWon],
                    [],
                    "VariableLen"
                ).build()
            )
            .includeHashedKeys()
    );

    // Get game won event
    const gameWonEvent = useModel(gameId as string, ModelsMapping.GameWon);

    // Initialize game on component mount
    useEffect(() => {
        const initializeGame = async () => {
            if (account) {
                try {
                    console.log("Initializing game...");
                    await client.actions.initialize();
                    console.log("Game initialized successfully");
                    
                    // Wait a bit for the state to update
                    setTimeout(() => {
                        if (gameState) {
                            console.log("Game state after initialization:", gameState);
                        } else {
                            console.error("Game state not available after initialization");
                        }
                    }, 1000);
                } catch (error) {
                    console.error("Error initializing game:", error);
                }
            }
        };
        initializeGame();
    }, [account, client]);

    // Update board when game state changes
    useEffect(() => {
        if (gameState) {
            console.log("Game state updated:", gameState);
            // Update current player based on contract state
            setCurrentPlayer(gameState.player_turn === 'X' ? 'X' : 'O');
            
            // Update game won state
            if (gameState.has_x_won || gameState.has_o_won) {
                setGameWon({
                    player: gameState.has_x_won ? 'X' : 'O',
                    lastCell: { position: [0, 0] }
                });
            } else {
                setGameWon(null);
            }
        }
    }, [gameState]);

    // Update board when game won event is received
    useEffect(() => {
        if (gameWonEvent) {
            setGameWon({
                player: gameWonEvent.player,
                lastCell: gameWonEvent.last_cell.position
            });
        }
    }, [gameWonEvent]);

    // Update board cells
    useEffect(() => {
        const updateBoard = async () => {
            if (!gameState) return;

            const newBoard = [...board];
            // Query all cells and update the board
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    const cellId = useEntityId(`${x},${y}`);
                    const cell = useModel(cellId as string, ModelsMapping.Cell);
                    if (cell) {
                        newBoard[x][y] = cell.player === 'X' ? 'X' : cell.player === 'O' ? 'O' : '';
                    }
                }
            }
            setBoard(newBoard);
        };

        updateBoard();
    }, [gameState]);

    const handleCellClick = async (row: number, col: number) => {
        if (!account || board[row][col] !== '' || !selectedPlayer || gameWon) return;
        
        try {
            await client.actions.play(
                account,
                new CairoCustomEnum({ [selectedPlayer]: "()" }),
                row,
                col
            );
        } catch (error) {
            console.error('Error making move:', error);
        }
    };

    const handleRestart = async () => {
        if (account) {
            await client.actions.initialize();
            setSelectedPlayer(null);
            setGameWon(null);
        }
    };

    const handlePlayerSelect = (player: 'X' | 'O') => {
        setSelectedPlayer(player);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {gameWon && (
                <div className="mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                    <p className="mb-4">Player {gameWon.player} has won the game!</p>
                    <button
                        onClick={handleRestart}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Play Again
                    </button>
                </div>
            )}

            <div className="mb-8 flex gap-4">
                <button
                    className={`px-6 py-2 rounded-lg font-bold text-lg transition-all duration-200
                              ${selectedPlayer === 'X' 
                                ? 'bg-blue-500 text-white shadow-md cursor-not-allowed' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    onClick={() => handlePlayerSelect('X')}
                    disabled={selectedPlayer !== null || gameWon !== null}
                >
                    {selectedPlayer === 'X' ? 'Playing as X' : 'Play as X'}
                </button>
                <button
                    className={`px-6 py-2 rounded-lg font-bold text-lg transition-all duration-200
                              ${selectedPlayer === 'O' 
                                ? 'bg-red-500 text-white shadow-md cursor-not-allowed' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    onClick={() => handlePlayerSelect('O')}
                    disabled={selectedPlayer !== null || gameWon !== null}
                >
                    {selectedPlayer === 'O' ? 'Playing as O' : 'Play as O'}
                </button>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-2xl">
                <div className="grid grid-cols-3 gap-4">
                    {board.map((row, rowIndex) => (
                        row.map((cell, colIndex) => (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                className={`w-24 h-24 border-2 border-gray-200 rounded-lg 
                                         flex items-center justify-center text-4xl font-bold transition-all duration-200
                                         hover:scale-105 hover:shadow-md active:scale-95
                                         ${cell === 'X' ? 'bg-blue-100 text-blue-600' : 
                                           cell === 'O' ? 'bg-red-100 text-red-600' : 
                                           'bg-gray-50 hover:bg-gray-100'}`}
                                disabled={!selectedPlayer || currentPlayer !== selectedPlayer || gameWon !== null}
                            >
                                {cell}
                            </button>
                        ))
                    ))}
                </div>
            </div>

            <button
                onClick={handleRestart}
                className="mt-8 px-6 py-2 bg-green-500 text-white rounded-lg font-bold text-lg
                         hover:bg-green-600 transition-all duration-200 hover:shadow-md"
            >
                Restart Game
            </button>
        </div>
    );
} 