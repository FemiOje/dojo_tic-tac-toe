import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { CairoCustomEnum, BigNumberish } from 'starknet';

// Type definition for `dojo_starter::models::Cell` struct
export interface Cell {
	position: [BigNumberish, BigNumberish];
	player: PlayerEnum;
}

// Type definition for `dojo_starter::models::CellValue` struct
export interface CellValue {
	player: PlayerEnum;
}

// Type definition for `dojo_starter::models::GameState` struct
export interface GameState {
	game_id: BigNumberish;
	is_active: boolean;
	player_turn: PlayerEnum;
	has_x_won: boolean;
	has_o_won: boolean;
}

// Type definition for `dojo_starter::models::GameStateValue` struct
export interface GameStateValue {
	is_active: boolean;
	player_turn: PlayerEnum;
	has_x_won: boolean;
	has_o_won: boolean;
}

// Type definition for `dojo_starter::systems::actions::actions::GameWon` struct
export interface GameWon {
	player: PlayerEnum;
	last_cell: Cell;
}

// Type definition for `dojo_starter::systems::actions::actions::GameWonValue` struct
export interface GameWonValue {
	last_cell: Cell;
}

// Type definition for `dojo_starter::systems::actions::actions::Played` struct
export interface Played {
	player: PlayerEnum;
	cell: Cell;
}

// Type definition for `dojo_starter::systems::actions::actions::PlayedValue` struct
export interface PlayedValue {
	cell: Cell;
}

// Type definition for `dojo_starter::models::Player` enum
export const player = [
	'None',
	'X',
	'O',
] as const;
export type Player = { [key in typeof player[number]]: string };
export type PlayerEnum = CairoCustomEnum;

export interface SchemaType extends ISchemaType {
	dojo_starter: {
		Cell: Cell,
		CellValue: CellValue,
		GameState: GameState,
		GameStateValue: GameStateValue,
		GameWon: GameWon,
		GameWonValue: GameWonValue,
		Played: Played,
		PlayedValue: PlayedValue,
	},
}
export const schema: SchemaType = {
	dojo_starter: {
		Cell: {
			position: [0, 0],
		player: new CairoCustomEnum({ 
					None: "",
				X: undefined,
				O: undefined, }),
		},
		CellValue: {
		player: new CairoCustomEnum({ 
					None: "",
				X: undefined,
				O: undefined, }),
		},
		GameState: {
			game_id: 0,
			is_active: false,
		player_turn: new CairoCustomEnum({ 
					None: "",
				X: undefined,
				O: undefined, }),
			has_x_won: false,
			has_o_won: false,
		},
		GameStateValue: {
			is_active: false,
		player_turn: new CairoCustomEnum({ 
					None: "",
				X: undefined,
				O: undefined, }),
			has_x_won: false,
			has_o_won: false,
		},
		GameWon: {
		player: new CairoCustomEnum({ 
					None: "",
				X: undefined,
				O: undefined, }),
		last_cell: { position: [0, 0], player: new CairoCustomEnum({ 
					None: "",
				X: undefined,
				O: undefined, }), },
		},
		GameWonValue: {
		last_cell: { position: [0, 0], player: new CairoCustomEnum({ 
					None: "",
				X: undefined,
				O: undefined, }), },
		},
		Played: {
		player: new CairoCustomEnum({ 
					None: "",
				X: undefined,
				O: undefined, }),
		cell: { position: [0, 0], player: new CairoCustomEnum({ 
					None: "",
				X: undefined,
				O: undefined, }), },
		},
		PlayedValue: {
		cell: { position: [0, 0], player: new CairoCustomEnum({ 
					None: "",
				X: undefined,
				O: undefined, }), },
		},
	},
};
export enum ModelsMapping {
	Cell = 'dojo_starter-Cell',
	CellValue = 'dojo_starter-CellValue',
	GameState = 'dojo_starter-GameState',
	GameStateValue = 'dojo_starter-GameStateValue',
	Player = 'dojo_starter-Player',
	GameWon = 'dojo_starter-GameWon',
	GameWonValue = 'dojo_starter-GameWonValue',
	Played = 'dojo_starter-Played',
	PlayedValue = 'dojo_starter-PlayedValue',
}