module.exports = {
    PORT: 8000,
    SECRET: 'facefeka',
    TOKEN_COOKIE_NAME: 'token',
    SOCKET_EVENTS: {
        GAME_INIT: 'game_init',
        GAME_READY: 'game_ready',
        PLAYERS_NAMES: 'players_names',
        PLAYER_NOTIFY_GAME_TURN: 'player_notify_game_turn',
        CHANGE_GAME_STATE: 'change_game_state',
    }
}