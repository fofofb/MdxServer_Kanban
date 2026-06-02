# -*- coding: utf-8 -*-
import sqlite3
import os
import time

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'words.db')

def get_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS words (
            word TEXT PRIMARY KEY,
            status TEXT NOT NULL,          -- 'new', 'learning', 'mastered'
            added_at INTEGER NOT NULL,      -- Unix timestamp
            ease_factor REAL NOT NULL,     -- SM-2 ease factor, default 2.5
            interval_val INTEGER NOT NULL,  -- Current interval in minutes
            next_review INTEGER NOT NULL,   -- Unix timestamp for next review
            repetition INTEGER NOT NULL     -- Count of consecutive successful reviews
        )
    ''')
    conn.commit()
    conn.close()

def add_or_update_word(word, status='new'):
    word = word.strip()
    if not word:
        return None
    
    conn = get_conn()
    cursor = conn.cursor()
    
    # Check if exists
    cursor.execute('SELECT * FROM words WHERE word = ?', (word,))
    row = cursor.fetchone()
    
    now = int(time.time())
    if row:
        # If exists, update status
        # If status is changed manually, reset interval accordingly
        if status == 'new':
            interval = 0
            next_review = now
            repetition = 0
        elif status == 'learning':
            interval = 15 # 15 minutes
            next_review = now + 15 * 60
            repetition = 1
        else: # mastered
            interval = 21600 # 15 days
            next_review = now + 21600 * 60
            repetition = 5
            
        cursor.execute('''
            UPDATE words 
            SET status = ?, interval_val = ?, next_review = ?, repetition = ? 
            WHERE word = ?
        ''', (status, interval, next_review, repetition, word))
    else:
        # Insert new
        if status == 'new':
            interval = 0
            next_review = now
            repetition = 0
        elif status == 'learning':
            interval = 15
            next_review = now + 15 * 60
            repetition = 1
        else:
            interval = 21600
            next_review = now + 21600 * 60
            repetition = 5
            
        cursor.execute('''
            INSERT INTO words (word, status, added_at, ease_factor, interval_val, next_review, repetition)
            VALUES (?, ?, ?, 2.5, ?, ?, ?)
        ''', (word, status, now, interval, next_review, repetition))
        
    conn.commit()
    
    # Fetch updated/inserted
    cursor.execute('SELECT * FROM words WHERE word = ?', (word,))
    new_row = dict(cursor.fetchone())
    conn.close()
    return new_row

def delete_word(word):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM words WHERE word = ?', (word,))
    conn.commit()
    conn.close()
    return True

def get_all_words():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM words ORDER BY added_at DESC')
    rows = cursor.fetchall()
    result = [dict(row) for row in rows]
    conn.close()
    return result

def review_word(word, score):
    # score: 1 (Forgot/Again), 2 (Hard/Fuzzy), 3 (Good/OK), 4 (Easy), 5 (Perfect/Mastered)
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM words WHERE word = ?', (word,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        # Word not in review list yet, add it first
        add_or_update_word(word, 'learning')
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM words WHERE word = ?', (word,))
        row = cursor.fetchone()
        
    row = dict(row)
    ease_factor = row['ease_factor']
    interval_val = row['interval_val']
    repetition = row['repetition']
    now = int(time.time())
    
    # Custom SM-2 logic for minutes
    if score == 1:
        # Forgot / Again
        repetition = 0
        interval_val = 1 # 1 minute
        ease_factor = max(1.3, ease_factor - 0.2)
        status = 'learning'
    elif score == 2:
        # Hard / Fuzzy
        repetition = 0
        interval_val = 5 # 5 minutes
        ease_factor = max(1.3, ease_factor - 0.15)
        status = 'learning'
    else:
        # Correct review
        if repetition == 0:
            # First success
            if score == 3:
                interval_val = 15 # 15 min
            elif score == 4:
                interval_val = 1440 # 1 day
            else: # score == 5
                interval_val = 5760 # 4 days
            repetition = 1
        elif repetition == 1:
            # Second success
            if score == 3:
                interval_val = 30 # 30 min
            elif score == 4:
                interval_val = 2880 # 2 days
            else:
                interval_val = 8640 # 6 days
            repetition = 2
        else:
            # Consecutive success
            if score == 3:
                interval_val = int(interval_val * 1.5)
            elif score == 4:
                interval_val = int(interval_val * ease_factor)
            else:
                interval_val = int(interval_val * ease_factor * 1.3)
            repetition += 1
            
        # Update ease factor based on score
        ease_factor = ease_factor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02))
        ease_factor = max(1.3, ease_factor)
        
        # If interval is >= 4 days (5760 minutes), automatically promote to mastered
        if interval_val >= 5760:
            status = 'mastered'
        else:
            status = 'learning'
            
    next_review = now + interval_val * 60
    
    cursor.execute('''
        UPDATE words
        SET status = ?, ease_factor = ?, interval_val = ?, next_review = ?, repetition = ?
        WHERE word = ?
    ''', (status, ease_factor, interval_val, next_review, repetition, word))
    
    conn.commit()
    
    # Fetch updated
    cursor.execute('SELECT * FROM words WHERE word = ?', (word,))
    new_row = dict(cursor.fetchone())
    conn.close()
    return new_row

def import_words(words_list):
    if not words_list:
        return True
    
    conn = get_conn()
    cursor = conn.cursor()
    now = int(time.time())
    
    data = []
    for w in words_list:
        w = w.strip()
        if w:
            data.append((w, 'new', now, 2.5, 0, now, 0))
            
    if data:
        try:
            cursor.executemany('''
                INSERT OR IGNORE INTO words (word, status, added_at, ease_factor, interval_val, next_review, repetition)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', data)
            conn.commit()
        except Exception as e:
            conn.rollback()
            conn.close()
            raise e
            
    conn.close()
    return True
