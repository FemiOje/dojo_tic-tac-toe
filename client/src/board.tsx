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

    // Fetch cell models for each position
    const cell00Id = useEntityId(0,0);
    const cell00 = useModel(cell00Id as string, ModelsMapping.Cell);
    const cell01Id = useEntityId(0,1);
    const cell01 = useModel(cell01Id as string, ModelsMapping.Cell);
    const cell02Id = useEntityId(0,2);
    const cell02 = useModel(cell02Id as string, ModelsMapping.Cell);
    const cell10Id = useEntityId(1,0);
    const cell10 = useModel(cell10Id as string, ModelsMapping.Cell);
    const cell11Id = useEntityId(1,1);
    const cell11 = useModel(cell11Id as string, ModelsMapping.Cell);
    const cell12Id = useEntityId(1,2);
    const cell12 = useModel(cell12Id as string, ModelsMapping.Cell);
    const cell20Id = useEntityId(2,0);
    const cell20 = useModel(cell20Id as string, ModelsMapping.Cell);
    const cell21Id = useEntityId(2,1);
    const cell21 = useModel(cell21Id as string, ModelsMapping.Cell);
    const cell22Id = useEntityId(2,2);
    const cell22 = useModel(cell22Id as string, ModelsMapping.Cell);

    // Query for all cells (if needed for subscriptions)
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
        
    // Get game state and cells from contract
    const gameId = useEntityId(1);
    const gameWonEvent = useModel(gameId as string, ModelsMapping.GameWon);
    const gameState = useModel(gameId as string, ModelsMapping.GameState);
    
    const initializeGame = async () => {
        if (account) {
            try {
                console.log("Initializing game...");
                await client.actions.initialize(account!);
                console.log("Game initialized successfully");
                setBoard([
                    ['', '', ''],
                    ['', '', ''],
                    ['', '', '']
                ]);
                setSelectedPlayer(null);
                setGameWon(null);
                
                setTimeout(() => {
                    if (gameState) {
                        console.log("Game state after initialization:", gameState);
                    }
                }, 1000);
            } catch (error) {
                console.error("Error initializing game:", error);
            }
        }
    };

    useEffect(() => {
        initializeGame();
    }, [account, client]);

    useEffect(() => {
        if (gameState) {
            setCurrentPlayer(gameState.player_turn === 'X' ? 'X' : 'O');
            
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

    useEffect(() => {
        if (gameWonEvent) {
            setGameWon({
                player: gameWonEvent.player,
                lastCell: gameWonEvent.last_cell.position
            });
        }
    }, [gameWonEvent]);

// Update board when cell models change
useEffect(() => {
    const parsePlayer = (playerEnum: CairoCustomEnum | undefined): string => {
        if (!playerEnum) return '';
        const variant = playerEnum.variant;
        return variant.Success === 'X' ? 'X' : variant.Success === 'O' ? 'O' : '';
    };

    const newBoard = [
        [parsePlayer(cell00?.player), parsePlayer(cell01?.player), parsePlayer(cell02?.player)],
        [parsePlayer(cell10?.player), parsePlayer(cell11?.player), parsePlayer(cell12?.player)],
        [parsePlayer(cell20?.player), parsePlayer(cell21?.player), parsePlayer(cell22?.player)]
    ];
    
    setBoard(newBoard);
}, [cell00, cell01, cell02, cell10, cell11, cell12, cell20, cell21, cell22]);

    const handleCellClick = async (row: number, col: number) => {
        if (!account || board[row][col] !== '' || !selectedPlayer || gameWon) return;
        
        // Optimistic UI update
        const newBoard = [...board];
        newBoard[row][col] = selectedPlayer;
        setBoard(newBoard);

        try {
            await client.actions.play(
                account!,
                new CairoCustomEnum({ [selectedPlayer]: "()" }),
                row,
                col
            );
        } catch (error) {
            console.error('Error making move:', error);
            // TODO: Handle error state in UI
            // Rollback UI if transaction fails
            const rollbackBoard = [...board];
            rollbackBoard[row][col] = '';
            setBoard(rollbackBoard);
        }
    };

    const handleRestart = async () => {
        if (account) {
            await client.actions.initialize(account);
            // Force clear the board immediately
            setBoard([
                ['', '', ''],
                ['', '', ''],
                ['', '', '']
            ]);
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