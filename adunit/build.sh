mkdir build

# combine
# TODO remove dummy-init!
cat dummy-init.js zepto.min.js js.cookie.js datalog.js unit.js unit.html unit.act.js > build/all.js
cat unit.css lightbox.css leaderboard.css sticky-bottom.css medium-rectangle.css > build/all.css

# TODO shrink images

# TODO shrink js and css
