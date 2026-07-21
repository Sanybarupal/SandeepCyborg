import tkinter as tk
from tkinter import scrolledtext
from core.engine import CoreEngine

class MainWindow(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Sanjeev AI - Core (Tkinter Preview)")
        self.geometry("800x600")
        self.configure(bg="#121212")
        
        self.core = CoreEngine()

        # Chat display
        self.chat_display = scrolledtext.ScrolledText(self, bg="#1E1E1E", fg="#FFFFFF", font=("Helvetica", 12))
        self.chat_display.pack(padx=20, pady=20, fill=tk.BOTH, expand=True)
        self.chat_display.insert(tk.END, "System: Sanjeev AI Digital Clone Initialized.\n\n")
        self.chat_display.config(state=tk.DISABLED)

        # Input frame
        input_frame = tk.Frame(self, bg="#121212")
        input_frame.pack(fill=tk.X, padx=20, pady=(0, 20))

        self.input_field = tk.Entry(input_frame, font=("Helvetica", 14), bg="#2E2E2E", fg="#FFFFFF", insertbackground="white")
        self.input_field.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))
        self.input_field.bind("<Return>", self.send_message)

        send_btn = tk.Button(input_frame, text="Send", font=("Helvetica", 12, "bold"), bg="#00FFCC", fg="#000000", command=self.send_message)
        send_btn.pack(side=tk.RIGHT)

    def send_message(self, event=None):
        user_text = self.input_field.get().strip()
        if not user_text:
            return
        
        self.input_field.delete(0, tk.END)
        self.update_chat(f"You: {user_text}")
        
        # Process using core engine
        ai_response = self.core.process_text_input(user_text)
        self.update_chat(f"Sanjeev AI: {ai_response}")

    def update_chat(self, text):
        self.chat_display.config(state=tk.NORMAL)
        self.chat_display.insert(tk.END, text + "\n\n")
        self.chat_display.see(tk.END)
        self.chat_display.config(state=tk.DISABLED)
