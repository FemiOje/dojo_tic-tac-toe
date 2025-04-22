#[derive(Copy, Drop, Serde, Debug, Introspect, PartialEq)]
pub enum Player {
    #[default]
    None,
    X,
    O,
}

#[derive(Copy, Drop, Serde, Debug, Introspect)]
#[dojo::model]
pub struct Cell {
    #[key]
    pub position: (u8, u8),
    pub player: Player,
}

#[derive(Drop, Serde, Debug, Introspect)]
#[dojo::model]
pub struct GameState {
    #[key]
    pub game_id: u8,
    pub is_active: bool,
    pub player_turn: Player,
    pub has_x_won: bool,
    pub has_o_won: bool,
}