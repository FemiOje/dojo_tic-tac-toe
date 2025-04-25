import { KeysClause, ToriiQueryBuilder } from "@dojoengine/sdk";
import { ModelsMapping } from "./typescript/models.gen.ts";
import { WalletAccount } from "./wallet-account.tsx";
import { HistoricalEvents } from "./historical-events.tsx";
import { useEntityQuery } from "@dojoengine/sdk/react";
import { Events } from "./events.tsx";
import { Board } from "./board.tsx";
import { getEntityIdFromKeys } from "@dojoengine/utils";

/**
 * Main application component that provides game functionality and UI.
 * Handles entity subscriptions, state management, and user interactions.
 *
 * @param props.sdk - The Dojo SDK instance configured with the game schema
 */
function App() {
    useEntityQuery(
        new ToriiQueryBuilder()
            .withClause(
                KeysClause(
                    [ModelsMapping.Player, ModelsMapping.Cell, ModelsMapping.GameState],
                    [],
                    "FixedLen"
                ).build()
            )
            .includeHashedKeys()
    );

    return (
        <div className="bg-black min-h-screen w-full p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <WalletAccount />
                <Board />

                <Events />
                {/* // Here sdk is passed as props but this can be done via contexts */}
                <HistoricalEvents />
            </div>
        // </div>
    );
}

export default App;
