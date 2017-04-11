mkdir build

# combine
# TODO remove dummy-init!
cat dummy-init.js zepto.min.js js.cookie.js datalog.js unit.js unit.html unit.act.js > build/all.js
cat unit.css lightbox.css leaderboard.css sticky-bottom.css verticalbanner.css medium-rectangle.css > build/all.css

# TODO shrink images

# TODO shrink js and css

# Copy for local test
cp build/all.css all.css
# Copy for SafeFrame test
cp build/all.css ~/winterwell/safeframe/src/html/all.css
cp build/all.js ~/winterwell/safeframe/tests/sample_ads/all.js