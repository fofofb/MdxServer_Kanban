# -*- coding: utf-8 -*-
# version: python 3.5

import threading
import re
import os
import sys


if sys.version_info < (3, 0, 0):
    import Tkinter as tk
    import tkFileDialog as filedialog
else:
    import tkinter as tk
    import tkinter.filedialog as filedialog

from wsgiref.simple_server import make_server
from file_util import *
from mdx_util import *
from mdict_query import IndexBuilder
import db
import json

# 尝试全局导入系统托盘依赖，确保 PyInstaller 能进行静态依赖分析并打包进 EXE
try:
    import pystray
    import pystray._win32  # 显式导入 win32 backend，防止 PyInstaller 动态加载丢失它
    from pystray import MenuItem as item
    from PIL import Image, ImageDraw
    import webbrowser
    HAS_TRAY = True
except ImportError:
    HAS_TRAY = False

"""
browser URL:
http://localhost:8000/test
"""

content_type_map = {
    'html': 'text/html; charset=utf-8',
    'js': 'application/x-javascript',
    'ico': 'image/x-icon',
    'css': 'text/css',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'mp3': 'audio/mpeg',
    'mp4': 'audio/mp4',
    'wav': 'audio/wav',
    'spx': 'audio/ogg',
    'ogg': 'audio/ogg',
    'eot': 'font/opentype',
    'svg': 'text/xml',
    'ttf': 'application/x-font-ttf',
    'woff': 'application/x-font-woff',
    'woff2': 'application/font-woff2',
}

if getattr(sys, 'frozen', False):
    # base_path 用来定位打包进 EXE 内部的静态网页资源
    base_path = getattr(sys, '_MEIPASS', os.path.dirname(sys.executable))
    # resource_path 定位外部同级的 mdx 词典文件夹
    resource_path = os.path.join(os.path.dirname(sys.executable), 'mdx')
else:
    base_path = os.path.dirname(os.path.abspath(__file__))
    resource_path = os.path.join(base_path, 'mdx')
        
print("resouce path : " + resource_path)
builder = None


def get_url_map():
    result = {}
    files = []

    # resource_path = '/mdx'
    file_util_get_files(resource_path, files)
    for p in files:
        if file_util_get_ext(p) in content_type_map:
            p = p.replace('\\', '/')
            result[re.match('.*?/mdx(/.*)', p).groups()[0]] = p
    return result


def application(environ, start_response):
    path_info = environ['PATH_INFO'].encode('iso8859-1').decode('utf-8')
    print(path_info)
    
    # helper for JSON responses
    def send_json(data, status='200 OK'):
        try:
            body = json.dumps(data, ensure_ascii=False).encode('utf-8')
            start_response(status, [
                ('Content-Type', 'application/json; charset=utf-8'),
                ('Access-Control-Allow-Origin', '*'),
                ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
                ('Access-Control-Allow-Headers', 'Content-Type')
            ])
            return [body]
        except Exception as e:
            start_response('500 Internal Server Error', [('Content-Type', 'text/plain; charset=utf-8')])
            return [str(e).encode('utf-8')]

    # Preflight for CORS if needed
    if environ['REQUEST_METHOD'] == 'OPTIONS':
        start_response('200 OK', [
            ('Access-Control-Allow-Origin', '*'),
            ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
            ('Access-Control-Allow-Headers', 'Content-Type')
        ])
        return [b'']

    # API Routing
    if path_info.startswith('/api/'):
        if path_info == '/api/words':
            if environ['REQUEST_METHOD'] == 'GET':
                try:
                    words = db.get_all_words()
                    return send_json({"success": True, "data": words})
                except Exception as e:
                    return send_json({"success": False, "error": str(e)}, '500 Internal Server Error')
            elif environ['REQUEST_METHOD'] == 'POST':
                try:
                    content_length = int(environ.get('CONTENT_LENGTH', 0))
                    post_data = environ['wsgi.input'].read(content_length)
                    params = json.loads(post_data.decode('utf-8'))
                    word = params.get('word')
                    status = params.get('status', 'new')
                    if not word:
                        return send_json({"success": False, "error": "Missing parameter: word"}, '400 Bad Request')
                    res = db.add_or_update_word(word, status)
                    return send_json({"success": True, "data": res})
                except Exception as e:
                    return send_json({"success": False, "error": str(e)}, '500 Internal Server Error')
        
        elif path_info == '/api/words/review' and environ['REQUEST_METHOD'] == 'POST':
            try:
                content_length = int(environ.get('CONTENT_LENGTH', 0))
                post_data = environ['wsgi.input'].read(content_length)
                params = json.loads(post_data.decode('utf-8'))
                word = params.get('word')
                score = params.get('score')
                if not word or score is None:
                    return send_json({"success": False, "error": "Missing parameter: word or score"}, '400 Bad Request')
                res = db.review_word(word, int(score))
                return send_json({"success": True, "data": res})
            except Exception as e:
                return send_json({"success": False, "error": str(e)}, '500 Internal Server Error')

        elif path_info == '/api/words/delete' and environ['REQUEST_METHOD'] == 'POST':
            try:
                content_length = int(environ.get('CONTENT_LENGTH', 0))
                post_data = environ['wsgi.input'].read(content_length)
                params = json.loads(post_data.decode('utf-8'))
                word = params.get('word')
                if not word:
                    return send_json({"success": False, "error": "Missing parameter: word"}, '400 Bad Request')
                db.delete_word(word)
                return send_json({"success": True})
            except Exception as e:
                return send_json({"success": False, "error": str(e)}, '500 Internal Server Error')
        
        elif path_info == '/api/words/import' and environ['REQUEST_METHOD'] == 'POST':
            try:
                content_length = int(environ.get('CONTENT_LENGTH', 0))
                post_data = environ['wsgi.input'].read(content_length)
                params = json.loads(post_data.decode('utf-8'))
                words = params.get('words')
                if not isinstance(words, list):
                    return send_json({"success": False, "error": "Parameter 'words' must be a list"}, '400 Bad Request')
                db.import_words(words)
                return send_json({"success": True})
            except Exception as e:
                return send_json({"success": False, "error": str(e)}, '500 Internal Server Error')
        
        return send_json({"success": False, "error": "Not Found"}, '404 Not Found')

    if path_info in ('/', '/index.html', '/index.css', '/index.js'):
        try:
            filename = 'index.html' if path_info in ('/', '/index.html') else path_info[1:]
            ext = file_util_get_ext(filename)
            content_type = content_type_map.get(ext, 'text/plain')
            if ext in ('html', 'css', 'js'):
                content_type += '; charset=utf-8'
            start_response('200 OK', [('Content-Type', content_type)])
            
            file_path = os.path.join(base_path, filename)
            if os.path.exists(file_path):
                with open(file_path, 'rb') as f:
                    return [f.read()]
            if os.path.exists(filename):
                with open(filename, 'rb') as f:
                    return [f.read()]
            start_response('404 Not Found', [('Content-Type', 'text/plain')])
            return [b'File not found']
        except Exception as e:
            print("Error serving static file:", e)
            import traceback
            traceback.print_exc()
            start_response('500 Internal Server Error', [('Content-Type', 'text/plain; charset=utf-8')])
            return [("Error: " + str(e)).encode('utf-8')]

    m = re.match('/(.*)', path_info)
    word = ''
    if m is not None:
        word = m.groups()[0]

    url_map = get_url_map()

    if path_info in url_map:
        url_file = url_map[path_info]
        content_type = content_type_map.get(file_util_get_ext(url_file), 'text/html; charset=utf-8')
        start_response('200 OK', [('Content-Type', content_type)])
        return [file_util_read_byte(url_file)]
    elif file_util_get_ext(path_info) in content_type_map:
        content_type = content_type_map.get(file_util_get_ext(path_info), 'text/html; charset=utf-8')
        start_response('200 OK', [('Content-Type', content_type)])
        return get_definition_mdd(path_info, builder)
    else:
        start_response('200 OK', [('Content-Type', 'text/html; charset=utf-8')])
        return get_definition_mdx(path_info[1:], builder)



# 新线程执行的代码
def loop():
    # 创建一个服务器，IP地址为空，端口是8000，处理函数是application:
    httpd = make_server('', 8000, application)
    print("Serving HTTP on port 8000...")
    # 开始监听HTTP请求:
    httpd.serve_forever()


def setup_tray(dict_name):
    if not HAS_TRAY:
        raise RuntimeError("Missing pystray or pillow library for system tray icon.")

    def on_open_web(icon, item):
        webbrowser.open("http://localhost:8000/")

    def on_exit(icon, item):
        icon.stop()
        os._exit(0)

    # 动态创建一个 64x64 的精美圆形书本图标
    width = 64
    height = 64
    image = Image.new('RGBA', (width, height), color=(0, 0, 0, 0))
    dc = ImageDraw.Draw(image)
    # 画 Indigo 渐变圆背景
    dc.ellipse([2, 2, 62, 62], fill=(99, 102, 241))
    # 画书本页面
    dc.rectangle([16, 20, 30, 44], fill=(255, 255, 255))
    dc.rectangle([34, 20, 48, 44], fill=(255, 255, 255))
    # 书脊线
    dc.line([32, 18, 32, 46], fill=(79, 70, 229), width=2)
    # 书页上的横线，营造字迹效果
    dc.line([20, 26, 26, 26], fill=(156, 163, 175), width=2)
    dc.line([20, 32, 26, 32], fill=(156, 163, 175), width=2)
    dc.line([20, 38, 26, 38], fill=(156, 163, 175), width=2)
    dc.line([38, 26, 44, 26], fill=(156, 163, 175), width=2)
    dc.line([38, 32, 44, 32], fill=(156, 163, 175), width=2)
    dc.line([38, 38, 44, 38], fill=(156, 163, 175), width=2)

    menu = pystray.Menu(
        item(f'词典: {os.path.basename(dict_name)}', lambda: None, enabled=False),
        item('打开查词网页', on_open_web, default=True),
        pystray.Menu.SEPARATOR,
        item('退出服务器', on_exit)
    )

    icon = pystray.Icon("mdx_server", image, "MDX Dict Server", menu)
    icon.run()


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("filename", nargs='?', help="mdx file name")
    args = parser.parse_args()

    # use GUI to select file, default to extract
    if not args.filename:
        root = tk.Tk()
        root.withdraw()
        args.filename = filedialog.askopenfilename(parent=root)
        root.destroy()  # 必须彻底销毁释放 Tkinter 的窗口，避免其 COM 线程与 pystray 的 win32 消息循环冲突导致托盘不显示

    if not os.path.exists(args.filename):
        print("Please specify a valid MDX/MDD file")
    else:
        db.init_db()
        builder = IndexBuilder(args.filename)
        
        # 1. 以守护线程启动 Web 监听，主线程(托盘)退出时子线程一并销毁
        t = threading.Thread(target=loop, args=())
        t.daemon = True
        t.start()

        # 2. 启动系统托盘图标
        try:
            setup_tray(args.filename)
        except Exception as e:
            print("System tray initialization skipped/failed: ", e)
            print("Web service is running. Press Ctrl+C in console to exit.")
            import time
            while True:
                try:
                    time.sleep(1)
                except KeyboardInterrupt:
                    print("Exiting...")
                    break
