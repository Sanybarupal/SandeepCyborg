from PySide6.QtWidgets import QMainWindow, QLabel, QVBoxLayout, QWidget
from PySide6.QtCore import Qt

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Sanjeev AI - Core")
        self.resize(800, 600)
        self.setStyleSheet("background-color: #121212; color: #FFFFFF;")
        
        # Central Widget
        central = QWidget()
        layout = QVBoxLayout()
        
        # Placeholder UI
        label = QLabel("Sanjeev AI Digital Clone Initialized.")
        label.setAlignment(Qt.AlignCenter)
        label.setStyleSheet("font-size: 24px; font-weight: bold; color: #00FFCC;")
        
        layout.addWidget(label)
        central.setLayout(layout)
        self.setCentralWidget(central)
