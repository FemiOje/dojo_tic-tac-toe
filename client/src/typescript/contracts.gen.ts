import { DojoProvider, DojoCall } from "@dojoengine/core";
import { Account, AccountInterface, BigNumberish, CairoOption, CairoCustomEnum, ByteArray } from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {

	const build_actions_initialize_calldata = (): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "initialize",
			calldata: [],
		};
	};

	const actions_initialize = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_initialize_calldata(),
				"dojo_starter",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_play_calldata = (player: CairoCustomEnum, x: BigNumberish, y: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "play",
			calldata: [player, x, y],
		};
	};

	const actions_play = async (snAccount: Account | AccountInterface, player: CairoCustomEnum, x: BigNumberish, y: BigNumberish) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_play_calldata(player, x, y),
				"dojo_starter",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};



	return {
		actions: {
			initialize: actions_initialize,
			buildInitializeCalldata: build_actions_initialize_calldata,
			play: actions_play,
			buildPlayCalldata: build_actions_play_calldata,
		},
	};
}