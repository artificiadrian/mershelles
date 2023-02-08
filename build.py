import argparse
from enum import Enum
from subprocess import call
from base64 import b64encode
import os


class Hosts(Enum):
    PHP = 'php'


parser = argparse.ArgumentParser()
parser.add_argument('--host', type=Hosts, required=True)
parser.add_argument('--password', type=str)

args = parser.parse_args()

if args.password is None:
    args.password = ""

displayPassword = args.password if args.password != "" else "<none>"


print("[*] Building frontend")
call("cd frontend && npm i && npm run build", shell=True)

with open("frontend/dist/index.html", "rb") as f:
    html = f.read()

if not os.path.exists("dist"):
    os.mkdir("dist")

if args.host == Hosts.PHP:
    print("[*] Building backend (PHP)")
    with open("backend/php/index.php", "rb") as f:
        php = f.read()
        php = php.replace(b"@@PASSWORD@@", bytes(args.password, "ascii"))
        php = php.replace(b"@@HTML@@", html)
    with open("dist/index.php", "wb") as f:
        f.write(php)
    print("[*] Created PHP backend at dist/index.php with password " + displayPassword)
