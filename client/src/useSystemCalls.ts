import { getEntityIdFromKeys } from "@dojoengine/utils";
import { v4 as uuidv4 } from "uuid";
import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { CairoCustomEnum } from "starknet";

/**
 * Custom hook to handle system calls and state management in the Dojo application.
 * Provides functionality for spawning entities and managing optimistic updates.
 *
 * @returns An object containing system call functions:
 *   - spawn: Function to spawn a new entity with initial moves
 */
export const useSystemCalls = () => {
    const { useDojoStore, client } = useDojoSDK();
    const state = useDojoStore((state) => state);

    const { account } = useAccount();


    /**
     * Initializes the game by calling the contract's initialize system.
     * Resets the board and game state for all players.
     */
    const initialize = async () => {
        try {
            // Call the contract's initialize system
            await client.actions.initialize(account!);
        } catch (error) {
            console.error("Error executing initialize:", error);
            throw error;
        }
    };

     /**
     * Places a player's mark/letter on the grid
     * @returns {Promise<void>}
     * @throws {Error} If the play action fails
     */
     const play = async (player: CairoCustomEnum, x: number, y: number) => {
        // Generate the entity ID for the cell at (x, y)
        const entityId = getEntityIdFromKeys([BigInt(x), BigInt(y)]);

        // Generate a unique transaction ID
        const transactionId = uuidv4();

        // The value to optimistically update the cell's player to
        const playerValue = player.variant.Success;

        // Apply an optimistic update to the state
        // state.applyOptimisticUpdate(transactionId, (draft) => {
        //     if (draft.entities[entityId]?.models?.dojo_starter?.Cell) {
        //         draft.entities[entityId].models.dojo_starter.Cell.player = playerValue;
        //     }
        // });

        try {
            // Call the play action on the contract
            await client.actions.play(account!, player, x, y);

            // Wait for the cell to be updated with the new player
            // await state.waitForEntityChange(entityId, (entity) => {
            //     return entity?.models?.dojo_starter?.Cell?.player === playerValue;
            // });
        } catch (error) {
            // Revert the optimistic update if an error occurs
            state.revertOptimisticUpdate(transactionId);
            console.error("Error executing play:", error);
            throw error;
        } finally {
            // Confirm the transaction if successful
            state.confirmTransaction(transactionId);
        }
    };

    return {
        initialize,
        play,
    };
};
