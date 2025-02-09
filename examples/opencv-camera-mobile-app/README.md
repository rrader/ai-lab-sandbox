# Посібник з переходу від простого алгоритму до Q-learning

## Вступ

У цьому посібнику ми розглянемо, як перейти від простого алгоритму для гри в хрестики-нулики до більш складного алгоритму Q-learning. Ми пояснимо основні поняття Q-learning, а також розглянемо призначення кожної функції та змінної в нашому коді.

## Що таке Q-learning?

Q-learning - це метод навчання з підкріпленням, який використовується для навчання агентів приймати оптимальні рішення. Агент навчається шляхом взаємодії з середовищем і отримання винагород за свої дії. Основна ідея Q-learning полягає в тому, щоб створити Q-таблицю, яка зберігає значення стан-дія. Ці значення використовуються для вибору найкращих дій у кожному стані.

## Простий алгоритм

Почнемо з простого алгоритму, який робить хід на першу доступну позицію. Ось приклад коду з файлу example.py:

```python
async def ai_move(board):
    # найпростіша логіка, яка робить хід на першу доступну позицію
    await sleep(1)

    for y in range(3):
        for x in range(3):
            if board.board[y][x] is None:
                board.board[y][x] = 'X'
                board.user_move = True
                return
```

## Перехід до Q-learning

Тепер ми розглянемо, як перейти від простого алгоритму до Q-learning. Ось кроки, які ми виконаємо:

### Крок 1: Визначення глобальних змінних

Спочатку ми визначимо глобальні змінні, які будуть використовуватися в нашому алгоритмі Q-learning:

```python
Q_TABLE = {}
LEARNING_RATE = 0.1
DISCOUNT_FACTOR = 0.9
```

### Крок 2: Функція для конвертації дошки в стан

Ми створимо функцію board_to_state, яка конвертує дошку в рядок для використання як ключ в Q-таблиці:

```python
def board_to_state(board, symbol):
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
```

Зверніть увагу, що замість символів 'X' і 'O' ми використовуємо '+', '-' і '0'. Це дозволяє нам використовувати навчену модель для гри будь-яким гравцем.

### Крок 3: Функція для отримання доступних ходів

Ми створимо функцію get_valid_moves, яка повертає список доступних ходів:

```python
def get_valid_moves(board):
    return [(x, y) for y in range(3) for x in range(3) if board.board[y][x] is None]
```

### Крок 4: Функція для отримання Q-значення

Ми створимо функцію get_q_value, яка отримує Q-значення для пари стан-дія:

```python
def get_q_value(state, action):
    return Q_TABLE.get((state, action), 1.0)
```

### Крок 5: Функція для оновлення Q-значення

Ми створимо функцію update_q_value, яка оновлює Q-значення використовуючи формулу Q-learning:

```python
def update_q_value(moves, reward):
    for state, action, next_state in moves:
        current_q = get_q_value(state, action)
        max_next_q = max([get_q_value(next_state, (x, y)) for x, y in get_valid_moves(board)], default=0)
        new_q = current_q + LEARNING_RATE * (reward + DISCOUNT_FACTOR * max_next_q - current_q)
        Q_TABLE[(state, action)] = new_q
```

### Крок 6: Функція для ходу AI

Ми створимо функцію ai_move, яка робить хід AI:

```python
async def ai_move(board, symbol, train=False):
    if board.game_over:
        return

    if not train:
        await sleep(1)

    print(f"Хід {symbol}")
    current_state = board_to_state(board, symbol)
    valid_moves = get_valid_moves(board)

    if train and random.random() < 0.1:
        move = random.choice(valid_moves)
    else:
        q_values = [get_q_value(current_state, m) for m in valid_moves]
        max_q_value = max(q_values)
        move = [m for m, q in zip(valid_moves, q_values) if q == max_q_value][0]
    x, y = move
    
    board.board[y][x] = symbol
    board.user_move = True
    new_state = board_to_state(board, symbol)
    if symbol == 'O':
        board.moves_o.append([current_state, move, new_state])
    else:
        board.moves_x.append([current_state, move, new_state])
    
    winner = check_win(board)
    
    if winner:
        board.game_over = True
        if winner == 'O':
            update_q_value(board.moves_o, 1)    
            update_q_value(board.moves_x, -1)
        else:
            update_q_value(board.moves_o, -1)
            update_q_value(board.moves_x, 1)
    elif not get_valid_moves(board):
        board.game_over = True
        reward = 0.1
        update_q_value(board.moves_o, reward)
        update_q_value(board.moves_x, reward)
```

### Крок 7: Функція для тренування AI

Ми створимо асинхронну функцію train, яка тренує AI:

```python   
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
```

### Висновок

Тепер ви знаєте, як перейти від простого алгоритму до Q-learning. Ми розглянули основні поняття Q-learning, а також призначення кожної функції та змінної в нашому коді. Сподіваємося, що цей посібник був корисним для вас!

# Варіації

 - гра https://en.wikipedia.org/wiki/Duck_Hunt, качка з штучним інтелектом. гравець цілиться в качку, а качка втікає. гравець може стріляти, але повинен враховувати вітер. качка може ухилитись, але має обмеження законами фізики гри.
 - шашки з штучним інтелектом