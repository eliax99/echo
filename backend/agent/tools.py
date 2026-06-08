from database.db import cursor

def get_game_context(game_id: int):
    cursor.execute(
        "SELECT message, response FROM chat_history WHERE game_id = %s ORDER BY id DESC LIMIT 5",
        (game_id,)
    )
    return cursor.fetchall()