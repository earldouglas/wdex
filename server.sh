#!/usr/bin/env bash

set -e

PORT=8080

if [ $# -eq 1 ]
then
  PORT=$1
fi

python -m SimpleHTTPServer $PORT
