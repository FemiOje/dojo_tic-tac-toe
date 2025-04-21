use starknet::{ContractAddress};

#[derive(Copy, Drop, Serde, Debug, Introspect)]
pub enum PlayerType {
    #[default]
    X,
    O,
}

#[derive(Copy, Drop, Serde, Debug, Introspect)]
#[dojo::model]
pub struct Player {
    #[key]
    player_id: ContractAddress,
    player_type: PlayerType,
}

#[derive(Drop, Serde, Debug, Introspect)]
#[dojo::model]
pub struct GameState {
    #[key]
    game_id: u32,
    board: Array<Array<PlayerType>>,
    players: Array<Player>,
    player_turn: PlayerType,
    has_empty_cell: bool,
    has_x_won: bool,
    has_o_won: bool,
}

#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Position {
    #[key]
    player: ContractAddress,
    x: u16,
    y: u16,
}