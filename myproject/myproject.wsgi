#!/usr/bin/python3
import sys
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"/home/masoris/myproject")

from myproject import app as application
application.secret_key = 'your_secret_key'
