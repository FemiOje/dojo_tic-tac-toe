use dojo_starter::models::{ Player };

#[starknet::interface]
pub trait IActions<T> {
    fn initialize(ref self: T);
    fn play(ref self: T, player: Player, x:u8, y:u8);
}

#[dojo::contract]
pub mod actions {
    use dojo_starter::models::{Player, GameState, Cell};
    use dojo::model::{ModelStorage};
    use dojo::event::EventStorage;

    #[derive(Serde, Copy, Drop)]
    #[dojo::event]
    pub struct Played {
        #[key]
        pub player: Player,
        pub cell: Cell,
    }
    
    #[derive(Serde, Copy, Drop)]
    #[dojo::event]
    pub struct GameWon {
        #[key]
        pub player: Player,
        pub last_cell: Cell,
    }

    #[abi(embed_v0)]
    impl ActionsImpl of super::IActions<ContractState> {
        fn initialize(ref self: ContractState) {
            let mut world = self.world(@"dojo_starter");

            for x in 0..3_u8 {
                for y in 0..3_u8 {
                    world.write_model(@Cell { position: (x, y), player: Player::None });
                }
            };

            // Default state of the game
            world.write_model(
                @GameState { 
                    game_id: 1,
                    is_active: true,
                    // Player X turn
                    player_turn: Player::X,
                    has_x_won: false,
                    has_o_won: false
                }
            );
        }

        fn play(ref self: ContractState, player: Player, x:u8, y:u8) {
            let mut world = self.world(@"dojo_starter");
            let mut cell: Cell = world.read_model((x, y));
            let mut game_state: GameState = world.read_model(1);
            
            // Assert that the gamestate is active
            assert(game_state.is_active == true, 'Game is over!');

            // Assert that it is the player's turn
            assert(game_state.player_turn == player, 'It is not your turn to play yet');

            // Assert that the cell is not out of bounds
            assert(x < 3, 'Index out of bounds');
            assert(y < 3, 'Index out of bounds');

            // Assert that the cell is empty
            assert(cell.player == Player::None, 'Cell has already been marked');
            
            // Create new cell with updated player
            let new_cell = Cell { position: (x, y), player };
            
            // Mark the cell as played
            world.write_model(@new_cell);

            world.emit_event(@Played { player, cell:new_cell });
            
            // Check the game state for win conditions
            self.check_game_state(player, x, y);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Use the default namespace "dojo_starter". This function is handy since the ByteArray
        /// can't be const.
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"dojo_starter")
        }

        fn check_game_state(ref self: ContractState, player: Player, x:u8, y:u8) {
            let mut world = self.world(@"dojo_starter");
            let mut game_state: GameState = world.read_model(1);
            let mut game_won = false;
            
            // Check horizontal wins
            for y in 0..3_u8 {
                let cell1: Cell = world.read_model((0, y));
                let cell2: Cell = world.read_model((1, y));
                let cell3: Cell = world.read_model((2, y));
                
                if cell1.player != Player::None && cell1.player == cell2.player && cell2.player == cell3.player {
                    if cell1.player == Player::X {
                        game_state.has_x_won = true;
                    } else {
                        game_state.has_o_won = true;
                    }
                    game_state.is_active = false;
                    world.write_model(@game_state);
        
                    world.emit_event(@GameWon{player, last_cell: Cell { position: (x, y), player}});
                    game_won = true;
                    break;
                }
            };
            // TODO: Confirm that the flow stops here if the game is won
            
            if !game_won {
                // Check vertical wins
                for x in 0..3_u8 {
                    let cell1: Cell = world.read_model((x, 0));
                    let cell2: Cell = world.read_model((x, 1));
                    let cell3: Cell = world.read_model((x, 2));
                    
                    if cell1.player != Player::None && cell1.player == cell2.player && cell2.player == cell3.player {
                        if cell1.player == Player::X {
                            game_state.has_x_won = true;
                        } else {
                            game_state.has_o_won = true;
                        }
                        game_state.is_active = false;
                        world.write_model(@game_state);
                        world.emit_event(@GameWon{player, last_cell: Cell { position: (x, y), player}});
                        game_won = true;
                        break;
                    }
                };
            }
            
            if !game_won {
                // Check diagonal wins (top-left to bottom-right)
                let cell1: Cell = world.read_model((0, 0));
                let cell2: Cell = world.read_model((1, 1));
                let cell3: Cell = world.read_model((2, 2));
                
                if cell1.player != Player::None && cell1.player == cell2.player && cell2.player == cell3.player {
                    if cell1.player == Player::X {
                        game_state.has_x_won = true;
                    } else {
                        game_state.has_o_won = true;
                    }
                    game_state.is_active = false;
                    world.write_model(@game_state);
                    world.emit_event(@GameWon{player, last_cell: Cell { position: (x, y), player}});

                    game_won = true;
                }
            }
            
            if !game_won {
                // Check diagonal wins (top-right to bottom-left)
                let cell1: Cell = world.read_model((2, 0));
                let cell2: Cell = world.read_model((1, 1));
                let cell3: Cell = world.read_model((0, 2));
                
                if cell1.player != Player::None && cell1.player == cell2.player && cell2.player == cell3.player {
                    if cell1.player == Player::X {
                        game_state.has_x_won = true;
                    } else {
                        game_state.has_o_won = true;
                    }
                    game_state.is_active = false;
                    world.write_model(@game_state);
                    world.emit_event(@GameWon{player, last_cell: Cell { position: (x, y), player}});

                    game_won = true;
                }
            }
            
            // If no win condition is met, switch player turn
            if !game_won {
                match game_state.player_turn {
                    Player::X => game_state.player_turn = Player::O,
                    Player::O => game_state.player_turn = Player::X,
                    _ => (),
                }
                world.write_model(@game_state);
            }
        }
    }
}

