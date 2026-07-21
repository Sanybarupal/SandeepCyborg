from ui.tkinter_main_window import MainWindow
from database.engine import init_db

if __name__ == '__main__':
    print("Initializing Database...")
    init_db()
    print("Starting UI...")
    app = MainWindow()
    app.mainloop()
