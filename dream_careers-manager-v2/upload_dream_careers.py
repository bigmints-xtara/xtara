#!/usr/bin/env python3

import os
import json
import sys
import argparse
from pathlib import Path
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

def upload_dream_careers(env='dev'):
    """Upload refined dream careers to Firestore collection"""
    
    env_upper = env.upper()
    print(f"🔥 Firebase Dream Careers Uploader ({env_upper})")
    print("=" * 50)
    
    try:
        # Initialize Firebase Admin SDK with appropriate credentials
        cred_filename = f"serviceAccountKey_{env_upper}.json"
        cred_path = Path(__file__).parent.parent / "credentials" / cred_filename
        
        if not cred_path.exists():
            print(f"❌ Credentials file not found: {cred_path}")
            return False
            
        cred = credentials.Certificate(str(cred_path))
        
        # Initialize app if not already initialized
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        
        # Path to refined careers (same directory as this script)
        refined_careers_dir = Path(__file__).parent / "refined_careers"
        
        if not refined_careers_dir.exists():
            print(f"❌ Directory not found: {refined_careers_dir}")
            return False
        
        # Get all JSON files
        json_files = list(refined_careers_dir.glob("*.json"))
        json_files.sort()
        
        print(f"📁 Found {len(json_files)} refined dream career files")
        
        # Delete existing collection
        print("🗑️  Deleting existing dream_careers collection...")
        collection_ref = db.collection('dream_careers')
        
        # Get all documents and delete them
        docs = collection_ref.stream()
        deleted_count = 0
        
        for doc in docs:
            doc.reference.delete()
            deleted_count += 1
            if deleted_count % 100 == 0:
                print(f"   Deleted {deleted_count} documents...")
        
        if deleted_count > 0:
            print(f"✅ Deleted {deleted_count} existing documents")
        else:
            print("   Collection is already empty")
        
        # Upload new documents
        print("📤 Uploading refined dream careers...")
        uploaded_count = 0
        
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    dream_career = json.load(f)
                
                # Use the career ID as document ID
                doc_id = dream_career.get('id') or dream_career.get('dreamJobId')
                if not doc_id:
                    print(f"⚠️  Skipping {json_file.name} - no ID found")
                    continue
                
                # Add timestamp fields
                dream_career['updatedAt'] = firestore.SERVER_TIMESTAMP
                dream_career['uploadedAt'] = firestore.SERVER_TIMESTAMP
                dream_career['refined'] = True
                
                # Upload to Firestore
                doc_ref = collection_ref.document(doc_id)
                doc_ref.set(dream_career)
                uploaded_count += 1
                
                if uploaded_count % 50 == 0:
                    print(f"   Uploaded {uploaded_count} documents...")
                
            except Exception as e:
                print(f"❌ Error processing {json_file.name}: {e}")
                continue
        
        print("")
        print("✅ Upload Complete!")
        print(f"📊 Successfully uploaded: {uploaded_count} dream careers")
        print(f"🔥 Collection: dream_careers ({env_upper} environment)")
        project_name = "compass-bigmints" if env == 'dev' else "bigmints-xtara"
        print(f"🌍 Project: {project_name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return False

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Upload dream careers to Firestore')
    parser.add_argument('--env', choices=['dev', 'prod'], default='dev', 
                       help='Environment to upload to (dev or prod)')
    args = parser.parse_args()
    
    success = upload_dream_careers(env=args.env)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
