import { useState, useEffect } from 'react';
import { useDojoSDK } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { useEntityQuery, useEventQuery } from "@dojoengine/sdk/react";
import { KeysClause, ToriiQueryBuilder } from "@dojoengine/sdk";
import { ModelsMapping } from "./typescript/models.gen";
import { CairoCustomEnum } from "starknet";
import { useSystemCalls } from './useSystemCalls';
import { getEntityIdFromKeys } from "@dojoengine/utils";

export function Board() {
    const { useDojoStore } = useDojoSDK();
    const entities = useDojoStore((state) => state.entities);

    const { initialize, play } = useSystemCalls();
    const { account } = useAccount();

    const [selectedPlayer, setSelectedPlayer] = useState<'X' | 'O' | null>(null);
    const [gameWon, setGameWon] = useState<{player: string, lastCell: {position: [number, number]}} | null>(null);

    // Sticky board state
    const [board, setBoard] = useState<string[][]>([
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ]);

    // Subscribe to all cell, player, and game state entities
    useEntityQuery(
        new ToriiQueryBuilder()
            .withClause(
                KeysClause(
                    [ModelsMapping.Cell, ModelsMapping.GameState],
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

    // Helper to get cell player from entities
    const getCellPlayer = (x: number, y: number): string => {
        const entityId = getEntityIdFromKeys([BigInt(x), BigInt(y)]);
        const cell = entities[entityId]?.models?.dojo_starter?.Cell;
        if (!cell) return '';
        if (cell.player && typeof cell.player === 'object' && cell.player.Success) {
            return cell.player.Success;
        }
        if (typeof cell.player === 'string' && (cell.player === 'X' || cell.player === 'O')) {
            return cell.player;
        }
        return '';
    };

    // On backend update, update only non-empty cells in local board
    useEffect(() => {
        setBoard(prev => {
            return prev.map((row, i) =>
                row.map((cell, j) => {
                    const backendValue = getCellPlayer(i, j);
                    // If backend has a value, use it; otherwise, keep previous
                    return backendValue !== '' ? backendValue : cell;
                })
            );
        });
    }, [entities]);

    // Get game state from entities
    const gameStateEntityId = getEntityIdFromKeys([BigInt(1)]);
    const gameState = entities[gameStateEntityId]?.models?.dojo_starter?.GameState;
    const currentPlayer = gameState?.player_turn === 'X' ? 'X' : 'O';

    // Watch for game won state
    useEffect(() => {
        if (gameState?.has_x_won || gameState?.has_o_won) {
            setGameWon({
                player: gameState.has_x_won ? 'X' : 'O',
                lastCell: { position: [0, 0] }
            });
        } else {
            setGameWon(null);
        }
    }, [gameState]);

    // Reset state on game initialize
    const handleRestart = async () => {
        if (account) {
            await initialize();
            setSelectedPlayer(null);
            setGameWon(null);
        }
    };

    const handlePlayerSelect = (player: 'X' | 'O') => {
        setSelectedPlayer(player);
    };

    const handleCellClick = async (row: number, col: number) => {
        if (!account || board[row][col] !== '' || !selectedPlayer || gameWon) return;
        // Optimistic UI update
        setBoard(prev =>
            prev.map((r, i) =>
                r.map((c, j) => (i === row && j === col ? selectedPlayer : c))
            )
        );
        try {
            await play(new CairoCustomEnum({ [selectedPlayer]: "()" }), row, col);
        } catch (error) {
            // Optionally revert on error
            setBoard(prev =>
                prev.map((r, i) =>
                    r.map((c, j) => (i === row && j === col ? '' : c))
                )
            );
            console.error('Error making move:', error);
        }
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