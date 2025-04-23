import { KeysClause, ToriiQueryBuilder } from "@dojoengine/sdk";
import { useEntityId, useEventQuery, useModel } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { addAddressPadding } from "starknet";
import { ModelsMapping } from "./typescript/models.gen";

export function Events() {
    const { account } = useAccount();
    const entityId = useEntityId(account?.address ?? "0");
    useEventQuery(
        new ToriiQueryBuilder()
            .withClause(
                KeysClause(
                    [],
                    [addAddressPadding(account?.address ?? "0")],
                    "VariableLen"
                ).build()
            )
            .includeHashedKeys()
    );
    const played = useModel(entityId, ModelsMapping.Played);
    if (!account) {
        return (
            <div className="mt-6">
                <h2 className="text-white">Please connect your wallet</h2>
            </div>
        );
    }
    return (
        <div className="mt-6">
            <h2 className="text-white">
                Last Player to play : {played && played.player}{" "}
                Last Player's position : {played && played.cell.position}{" "}
            </h2>

            {/* {events.map((e: ParsedEntity<SchemaType>, key) => {
                return <Event event={e} key={key} />;
            })} */}
        </div>
    );
}
