echo "Build the Good-Loop adunit - outputs all.js, all.css, dummy.all.js + copies"

cd ~/winterwell/adserver/adunit
mkdir build

# combine
# TODO remove dummy-init!
cat zepto.min.js js.cookie.js datalog.js unit.html unit.act.js unit.js > build/all.js
cat dummy-init.js build/all.js > build/dummy.all.js
cat unit.css lightbox.css leaderboard.css sticky-bottom.css verticalbanner.css medium-rectangle.css > build/all.css

# TODO shrink images

# TODO use babel to convert ES6 to ES5

# TODO shrink js and css

# Copy for adserver
cp build/all.css ../web-as/all.css
# Copy for local test
cp build/all.css all.css
# Copy for SafeFrame test
cp build/all.css ~/winterwell/safeframe/src/html/all.css
cp build/dummy.all.js ~/winterwell/safeframe/tests/sample_ads/all.js
