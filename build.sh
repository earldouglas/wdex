#!/usr/bin/env bash

set -e

pandoc -s -f markdown -o index.html README.md
