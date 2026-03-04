import firebase_admin
from firebase_admin import credentials, firestore
import os

def clear_users():
    cert_path = 'firebase_config/serviceAccountKey.json'
    if not os.path.exists(cert_path):
        print("❌ Service account key not found.")
        return

    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(cert_path)
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        users_ref = db.collection('users')
        
        # Get all documents in the collection
        docs = users_ref.list_documents()
        deleted_count = 0
        
        for doc in docs:
            doc.delete()
            deleted_count += 1
            
        print(f"✅ Cleaned up {deleted_count} users. Database is now NULL/Empty.")
    except Exception as e:
        print(f"❌ Error clearing database: {e}")

if __name__ == "__main__":
    confirm = input("Are you sure you want to delete ALL users from the database? (y/n): ")
    if confirm.lower() == 'y':
        clear_users()
    else:
        print("Deletion cancelled.")
