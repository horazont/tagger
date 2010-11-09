#!/bin/sh
rm -f tagger.xpi
echo -n "Packing extension... "
zip -rq tagger.xpi * -x "*.*~" -x "screenshot*.png"
echo "done."
