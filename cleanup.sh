#!/bin/sh
find -iname "*~" -or -iname "*.orig" -or -iname "*.rej" | xargs -- rm
