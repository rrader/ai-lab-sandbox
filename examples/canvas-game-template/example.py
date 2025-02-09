# Додаємо глобальну Q-таблицю для зберігання значень стан-дія
Q_TABLE = {}
LEARNING_RATE = 0.1
DISCOUNT_FACTOR = 0.9

def board_to_state(board, symbol):
    # Конвертуємо дошку в рядок для використання як ключ в Q-таблиці
    state = []
    for row in board.board:
        for cell in row:
            if cell == symbol:
                state.append('+')
            elif cell and cell != symbol:
                state.append('-')
            else:
                state.append('0')
    return ''.join(state)

def get_valid_moves(board):
    # Повертає список доступних ходів
    return [(x, y) for y in range(3) for x in range(3) if board.board[y][x] is None]

def get_q_value(state, action):
    # Отримуємо Q-значення для пари стан-дія
    return Q_TABLE.get((state, action), 1.0)

def update_q_value(board, moves, reward):
    # Оновлюємо Q-значення використовуючи формулу Q-learning
    for state, action, next_state in moves:
        current_q = get_q_value(state, action)
        max_next_q = max([get_q_value(next_state, (x, y)) for x, y in get_valid_moves(board)], default=0)
        new_q = current_q + LEARNING_RATE * (reward + DISCOUNT_FACTOR * max_next_q - current_q)
        Q_TABLE[(state, action)] = new_q


async def ai_move(board, symbol, train=False):
    if board.game_over:
        return

    if not train:
        await sleep(1)  # затримка на 1 секунду для візуального ефекту міркування

    print(f"Хід {symbol}")
    current_state = board_to_state(board, symbol)
    valid_moves = get_valid_moves(board)

    # Вибираємо хід з найвищим Q-значенням, але іноді випадковий для дослідження
    if train and random.random() < 0.1:  # 10% шанс вибрати випадковий хід для дослідження
        move = random.choice(valid_moves)
    else:
        q_values = [get_q_value(current_state, m) for m in valid_moves]
        max_q_value = max(q_values)
        move = [m for m, q in zip(valid_moves, q_values) if q == max_q_value][0]
    x, y = move
    
    # Робимо хід
    board.board[y][x] = symbol
    board.user_move = True
    new_state = board_to_state(board, symbol)
    if symbol == 'O':
        board.moves_o.append([current_state, move, new_state])
    else:
        board.moves_x.append([current_state, move, new_state])
    
    # Перевіряємо результат
    winner = check_win(board)
    
    if winner:
        board.game_over = True
        # Якщо ми виграли, даємо позитивну винагороду тому хто виграв, і негативну тому хто програв
        if winner == 'O':
            update_q_value(board, board.moves_o, 1)    
            update_q_value(board, board.moves_x, -1)
        else:
            update_q_value(board, board.moves_o, -1)
            update_q_value(board, board.moves_x, 1)

    elif not get_valid_moves(board):  # Нічия
        board.game_over = True
        reward = 0.1  # маленька винагорода обом за нічию
        update_q_value(board, board.moves_o, reward)
        update_q_value(board, board.moves_x, reward)


@when("click", "#train")
async def train(event):

    print("Тренування...")
    for i in range(20000):
        print(f"Гра {i}...")
        board = Board()
        while not board.game_over:
            await ai_move(board, 'O', train=True)
            await ai_move(board, 'X', train=True)

        print(f"Гра {i} завершена")
    print(Q_TABLE)
