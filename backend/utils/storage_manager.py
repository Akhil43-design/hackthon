import json
import os
import threading
from datetime import datetime

class StorageManager:
    def __init__(self, data_dir='backend/data'):
        self.data_dir = data_dir
        self.lock = threading.Lock()
        
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            
        # Initialize default files if they don't exist
        self.init_file('users.json', [])
        self.init_file('internships_posted.json', [])
        self.init_file('bookmarks.json', {})

    def init_file(self, filename, default_content):
        path = os.path.join(self.data_dir, filename)
        if not os.path.exists(path):
            with open(path, 'w') as f:
                json.dump(default_content, f, indent=4)

    def read(self, filename):
        path = os.path.join(self.data_dir, filename)
        with self.lock:
            try:
                with open(path, 'r') as f:
                    return json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                return None

    def write(self, filename, data):
        path = os.path.join(self.data_dir, filename)
        with self.lock:
            with open(path, 'w') as f:
                json.dump(data, f, indent=4)

    # Specific Helpers
    def add_to_list(self, filename, item):
        data = self.read(filename) or []
        if isinstance(data, list):
            data.append(item)
            self.write(filename, data)
            return True
        return False

    def get_user_by_email(self, email):
        users = self.read('users.json') or []
        return next((u for u in users if u['email'] == email), None)

    def save_user(self, user_data):
        return self.add_to_list('users.json', user_data)
        
    def save_internship(self, internship_data):
        return self.add_to_list('internships_posted.json', internship_data)

    def toggle_bookmark(self, user_id, internship):
        bookmarks = self.read('bookmarks.json') or {}
        if user_id not in bookmarks:
            bookmarks[user_id] = []
            
        # Unique ID for the internship
        intern_id = f"{internship.get('company')}_{internship.get('title')}"
        
        existing_idx = next((i for i, b in enumerate(bookmarks[user_id]) 
                           if f"{b.get('company')}_{b.get('title')}" == intern_id), -1)
        
        if existing_idx > -1:
            bookmarks[user_id].pop(existing_idx)
            self.write('bookmarks.json', bookmarks)
            return False # Removed
        else:
            bookmarks[user_id].append({
                **internship,
                "savedAt": datetime.now().isoformat()
            })
            self.write('bookmarks.json', bookmarks)
            return True # Added

    def get_bookmarks(self, user_id):
        bookmarks = self.read('bookmarks.json') or {}
        return bookmarks.get(user_id, [])

# Singleton instance
storage = StorageManager()
