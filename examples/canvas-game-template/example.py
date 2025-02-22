# ================================
# Штучний інтелект опонента

Q = {}
LEARNING_RATE = 0.01
DISCOUNT_FACTOR = 0.7
EXPLORATION_RATE = 0.9

def board_to_state(board, symbol):
    # Конвертуємо дошку в рядок для використання як ключ в Q-таблиці
    state = []
    for row in board.board:
        for cell in row:
            if cell is not None:
                state.append(cell)
            else:
                state.append('_')
    return ''.join(state)


def get_valid_moves(board):
    # Повертає список доступних ходів
    return [(x, y) for y in range(3) for x in range(3) if board.board[y][x] is None]


def get_q_value(state, action):
    # Отримуємо Q-значення для пари стан-дія
    if state not in Q:
        Q[state] = {}
    if action not in Q[state]:
        Q[state][action] = 0.0
    return Q[state][action]


def update_q_value(board, current_state, next_state, action, reward):
    print("Оновлюємо Q-значення для", current_state, "->", action, "зі значенням", reward)
    valid_moves = get_valid_moves(board)
    if not valid_moves:
        return
    
    q = get_q_value(current_state, action)
    
    if reward > 0:
        q_next = max(get_q_value(next_state, (x,y)) for x in range(3) for y in range(3))
    else:
        q_next = min(get_q_value(next_state, (x,y)) for x in range(3) for y in range(3))

    Q[current_state][action] = (
        q + LEARNING_RATE * (reward + DISCOUNT_FACTOR * q_next - q)
    )
    print(q, "->", Q[current_state][action])


async def ai_move(board, symbol, exploration_rate=0.0):
    current_state = board_to_state(board, symbol)
    valid_moves = get_valid_moves(board)

    if not valid_moves:
        return
    if board.game_over:
        return

    if random.random() < exploration_rate:
        print("Випадковий хід")
        move = random.choice(valid_moves)
    else:
        q_values = {move: Q.get(current_state, {}).get(move, 0.0) for move in valid_moves}
        print(q_values)
        if symbol == 'X':
            move = max(q_values.items(), key=lambda x: x[1])[0]
        else:
            move = min(q_values.items(), key=lambda x: x[1])[0]

    if exploration_rate == 0:
        # вивести всі можливі ходи та їх Q-значення
        print("Можливі ходи та їх Q-значення:")
        for _move, q_value in q_values.items():
            print(f"Хід {_move}: {q_value:.3f}")
        print(f"Хід {symbol} на позицію {move}")
        print() 

    x, y = move

    board.board[y][x] = symbol
    board.user_move = True

    if check_win(board):
        board.game_over = True

    next_state = board_to_state(board, symbol)
    return current_state, next_state, (x, y)


def check_end_game(board):
    winner = check_win(board)

    if winner:
        board.game_over = True
    elif not get_valid_moves(board):  # Нічия
        board.game_over = True


X_REWARD = 10
O_REWARD = -10

@when("click", "#train")
async def train(event):

    print("Тренування...")
    epochs = 500000
    for i in range(epochs):
        print(f"Гра {i}...")
        board = Board()
        current_player = random.choice(['O', 'X'])
        current_state1, next_state1, action1 = None, None, None
        current_state2, next_state2, action2 = None, None, None

        while not board.game_over:
            current_player = 'X' if current_player == 'O' else 'O'
            current_state2, next_state2, action2 = current_state1, next_state1, action1
            current_state1, next_state1, action1 = await ai_move(board, current_player, exploration_rate=(1 - i / epochs))

            check_end_game(board)

            winner = check_win(board)
            if winner:
                if winner == 'X':
                    update_q_value(board, current_state1, next_state1, action1, X_REWARD)
                    update_q_value(board, current_state2, next_state2, action2, X_REWARD)
                if winner == 'O':
                    update_q_value(board, current_state1, next_state1, action1, O_REWARD)
                    update_q_value(board, current_state2, next_state2, action2, O_REWARD)

            elif not get_valid_moves(board):  # Нічия
                if current_player == 'X':
                    update_q_value(board, current_state1, next_state1, action1, X_REWARD / 2)
                    update_q_value(board, current_state2, next_state2, action2, O_REWARD / 2)
                else:
                    update_q_value(board, current_state1, next_state1, action1, O_REWARD / 2)
                    update_q_value(board, current_state2, next_state2, action2, X_REWARD / 2)
            else: # гра ще не завершена
                if current_player == 'X':
                    update_q_value(board, current_state1, next_state1, action1, X_REWARD / 8)
                    update_q_value(board, current_state2, next_state2, action2, O_REWARD / 8)
                else:
                    update_q_value(board, current_state1, next_state1, action1, O_REWARD / 8)
                    update_q_value(board, current_state2, next_state2, action2, X_REWARD / 8)

        print(f"Гра {i} завершена")
    print(len(Q))
