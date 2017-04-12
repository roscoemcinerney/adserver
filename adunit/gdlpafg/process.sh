#!/bin/bash

echo Clearing and recreating old final folder
rm -rf final
mkdir final
mkdir final/gdlpafg/
cp final*.html final

echo "Compressing images (pngs)"
for f in gdlpafg/*.png; do pngquant - < $f > final/$f; done
echo "Compressing images (jpegs)"
jpegoptim -s -S10 -q -dfinal/gdlpafg/ gdlpafg/*.jpg

echo "Compressing JS"
uglifyjs --compress --mangle --screw-ie8 -o final/gdlpafg/gdlpafg.js gdlpafg/gdlpafg.js
echo "Compressing CSS" # NB: the order here is important
cleancss -o final/gdlpafg/gdlpafg.css gdlpafg/gdlpafg-reset.css gdlpafg/ad_sizes.css \
    gdlpafg/gdlpafg-general.css gdlpafg/gdlpafg-medium-rectangle.css \
    gdlpafg/gdlpafg-leaderboard.css gdlpafg/gdlpafg-popup.css

echo "Making a zip file"
rm goodloop-final.zip
zip goodloop-final.zip --password goodloop -r final*.html README.md gdlpafg/ final/ process.sh
