from pyodide.ffi.wrappers import set_interval
from pyscript.web import page
from pyscript import when
import asyncio
import random
from asyncio import sleep

# ================================
# Штучний інтелект опонента

async def ai_move(board, symbol):
    # найпростіша логіка, яка робить хід на першу доступну позицію
    await sleep(1)

    for y in range(3):
        for x in range(3):
            if board.board[y][x] is None:
                board.board[y][x] = symbol
                board.user_move = True
                return


@when("click", "#train")
async def train(event):
    print("Тренування не реалізовано")


# ================================
# Механіка гри

# Стан гри: None = порожньо, 'O', 'X'
class Board:
    def __init__(self):
        self.board = [[None, None, None],
                      [None, None, None],
                      [None, None, None]]
        self.user_move = True
        self.game_over = False
        self.moves_o = []
        self.moves_x = []

board = Board()


def draw_grid(context):
    # Функція малює сітку 3x3 для гри у хрестики-нулики
    context.strokeStyle = "#000000"
    context.lineWidth = 2

    context.beginPath()
    
    # Малюємо вертикальні лінії
    context.moveTo(100, 0)
    context.lineTo(100, 300)
    
    context.moveTo(200, 0)
    context.lineTo(200, 300)
    
    # Малюємо горизонтальні лінії
    context.moveTo(0, 100)
    context.lineTo(300, 100)
    
    context.moveTo(0, 200)
    context.lineTo(300, 200)
    
    context.stroke()

def draw_symbol(context, x, y, symbol):
    # Малюємо символ на дошці
    context.fillStyle = "#000000"
    context.font = "48px Arial"
    context.textAlign = "center"
    context.textBaseline = "middle"
    
    context.fillText(symbol, x*100+50, y*100+50)



def check_win(board):
    # Перевірка рядків, стовпців та діагоналей
    for i in range(3):
        # Перевірка рядків
        if board.board[i][0] == board.board[i][1] == board.board[i][2] and board.board[i][0] is not None:
            print(f"Переможець: {board.board[i][0]}")
            return board.board[i][0]
            
        # Перевірка стовпців
        if board.board[0][i] == board.board[1][i] == board.board[2][i] and board.board[0][i] is not None:
            print(f"Переможець: {board.board[0][i]}")
            return board.board[0][i]
    
    # Перевірка діагоналей
    if board.board[0][0] == board.board[1][1] == board.board[2][2] and board.board[0][0] is not None:
        print(f"Переможець: {board.board[0][0]}")
        return board.board[0][0]
    if board.board[0][2] == board.board[1][1] == board.board[2][0] and board.board[0][2] is not None:
        print(f"Переможець: {board.board[0][2]}")
        return board.board[0][2]
    
    return None


def game():
    canvas = page.find("#gameCanvas")[0]
    # Встановлюємо внутрішні розміри холсту, щоб вони відповідали його відображаючим розмірам
    canvas.width = 300
    canvas.height = 300
    
    context = canvas.getContext("2d")
    
    # Очистити холст
    context.clearRect(0, 0, 300, 300)
    
    # Малюємо сітку
    draw_grid(context)
    
    # Малюємо всі символи на основі стану дошки
    for y in range(3):
        for x in range(3):
            if board.board[y][x]:
                draw_symbol(context, x, y, board.board[y][x])


@when("click", "#gameCanvas")
def handle_click(event):
    if not board.user_move or board.game_over:
        return

    canvas = page.find("#gameCanvas")[0]
    rect = canvas.getBoundingClientRect()
    x = int((event.clientX - rect.left) // 100)
    y = int((event.clientY - rect.top) // 100)
    
    # Перевіряємо, чи клітинка порожня
    if board.board[y][x] is None:
        # Робимо хід гравця
        board.board[y][x] = 'O'

        if check_win(board):
            board.game_over = True
            return
        
        # TODO: Реалізувати хід комп'ютера тут
        # Поки що просто вивести повідомлення
        print("Комп'ютер повинен зробити хід...")
        board.user_move = False
        asyncio.ensure_future(ai_move(board, 'X'))


@when("click", "#playagain")
def play_again(event):
    global board
    board = Board()


set_interval(game, 100)
