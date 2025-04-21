use starknet::{ContractAddress};
use dojo_starter::models::{PlayerType};

const MAX_NUM_OF_PLAYERS: u8 = 2;

#[starknet::interface]
pub trait IActions<T> {
    fn join_game(ref self: T, player: ContractAddress);
    fn play(ref self: T, player: ContractAddress);
}

#[dojo::contract]
pub mod actions {
    use starknet::{ContractAddress, get_caller_address};
    use dojo_starter::models::{PlayerType, Player, GameState, Position};

    use dojo::model::{ModelStorage};
    use dojo::event::EventStorage;

    #[derive(Serde, Copy, Drop)]
    #[dojo::event]
    pub struct Played {
        #[key]
        pub player: ContractAddress,
        pub position: Position,
    }

    #[derive(Serde, Copy, Drop)]
    #[dojo::event]
    pub struct GameWon {
        #[key]
        pub player: ContractAddress,
        pub position: Position,
    }

    #[abi(embed_v0)]
    impl ActionsImpl of super::IActions<ContractState> {
        fn join_game(ref self: ContractState, player: ContractAddress) {
        // If player 1 is zero address, assign the caller as player 1

        // Else, if player 2 is zero address, assign the caller as player 2

        // Else, Return with error

        }
        fn play(ref self: ContractState, player: ContractAddress) {
        // Assert that the gamestate is active

        // Assert that it is the player's turn

        // Assert that the cell is not empty

        // Mark the cell as played, and register the caller

        // Check the game state for win conditions
        }
    }
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Use the default namespace "dojo_starter". This function is handy since the ByteArray
        /// can't be const.
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"dojo_starter")
        }
    }
}

fn check_game_state() {
// Check if any of the winning conditions match the current state

// If no, return

// If yes, register last person to play as winner and emit win event

}
