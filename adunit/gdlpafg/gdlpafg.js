function gdlpafg_attachHandlers(company_name) {
    function activate(ad) {
        var video = ad.querySelector(".video");
        var vcontainer = ad.querySelector(".vcontainer"),
            actual_video = ad.querySelector("video"),
            counter = ad.querySelector(".vcontainer span.counter"),
            messages_countdown = ad.querySelector(".vcontainer li.messages_countdown"),
            messages_done = ad.querySelector(".vcontainer li.messages_done"),
            finished_container = ad.querySelector(".vcontainer .finished"),
            chooser = ad.querySelector(".afg_charity_chooser"),
            countdown_iv,
            shown_once = false;
        return function(e) {
            if (e.target && (e.target == video || video.contains(e.target))) { return; }
            if (shown_once) { return; }
            video.style.display = "block";
            var vpos = video.getBoundingClientRect();
            var apos = ad.getBoundingClientRect();
            video.style.display = "none";

            // apply FLIP to move video
            var scaleX = apos.width / vpos.width;
            var scaleY = apos.height / vpos.height;
            var translateX = apos.left - vpos.left;
            var translateY = apos.top - vpos.top;
            var t = "translateX(" + translateX + "px) translateY(" + translateY + "px) " +
                "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
            video.style.transform = t;

            // hide the ad, but show the video child
            ad.style.visibility = "hidden";
            video.style.visibility = "visible";
            video.style.display = "block";

            // allow transitions again
            // and remove transform so that we FLIP back to base
            setTimeout(function() {
                video.style.transition = "all 100ms ease-out";
                video.style.transform = "";

                // scale GL logo so it fits in the top corner
                var black_bar_height = ((video.offsetHeight - actual_video.offsetHeight) / 2) - 15; 
                if (black_bar_height < 52) {
                    vcontainer.style.backgroundSize = Math.round(105*black_bar_height/42) + "px " + black_bar_height + "px";
                    vcontainer.style.backgroundPosition = "10px 0";
                }
            }, 0)

            /* connect the close button */
            function d4_collapse_video(ad, video, onCollapsed) {
                return function() {
                    var vpos = video.getBoundingClientRect();
                    var apos = ad.getBoundingClientRect();

                    // explicitly transition the video back to the ad
                    var scaleX = apos.width / vpos.width;
                    var scaleY = apos.height / vpos.height;
                    var translateX = apos.left - vpos.left;
                    var translateY = apos.top - vpos.top;
                    var t = "translateX(" + translateX + "px) translateY(" + translateY + "px) " +
                        "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
                    video.style.transform = t;
                    setTimeout(onCollapsed, 100); // the transition time from above
                }
            }
            function d4_close_manually(ad) {
                var video = ad.querySelector(".video");
                return d4_collapse_video(ad, video, function() {
                        // reset the video to be entirely off
                        ad.style.visibility = "visible";
                        video.style.display = "none";
                        video.style.transform = "";
                        video.style.transition = "";
                });
            }
            function d4_completed(ad) {
                var video = ad.querySelector(".video");
                var ty = ad.querySelector(".thankyou");
                return d4_collapse_video(ad, video, function() {
                        shown_once = true;
                        // reset the video to be entirely off
                        video.style.display = "none";
                        video.style.transform = "";
                        video.style.transition = "";
                        // turn on the thank you
                        ty.style.display = "block";
                        ty.style.visibility = "visible";
                });
            }

            var chosen_charity = false;
            var video_finished = false;
            function show_ending() {
                if (chosen_charity && video_finished) {
                    succeeded = true;
                    finished_container.style.width = actual_video.offsetWidth + "px";
                    finished_container.style.height = actual_video.offsetHeight + "px";
                    actual_video.style.display = "none";
                    messages_done.style.display = "none";
                    finished_container.style.display = "flex";
                    if (IE) finished_container.style.display = "-ms-flexbox";
                }
            }

            // and start the video
            actual_video.addEventListener("ended", function() {
                video_finished = true;
                show_ending();
            }, false);
            var closer = ad.querySelector("button.close");
            var succeeded = false;
            if (closer) {
                var manual_close_handler = d4_close_manually(ad);
                var manual_close_successfully_handler = d4_completed(ad);
                closer.onclick = function() {
                    actual_video.pause();
                    vcontainer.style.display = "none";
                    clearInterval(countdown_iv);
                    if (succeeded) {
                        manual_close_successfully_handler();
                    } else {
                        manual_close_handler();
                    }
                }
            }
            vcontainer.style.display = "flex";
            messages_countdown.style.display = "block";
            var remaining = 15;

            Array.prototype.slice.call(ad.querySelectorAll(".afg_video_charities li")).forEach(function(li) {
                li.onclick = function() {
                    chosen_charity = li.getElementsByTagName("span")[0].firstChild.nodeValue;
                    Array.prototype.slice.call(ad.querySelectorAll(".afg_charity_name")).forEach(function(cn) {
                        cn.innerHTML = cn.innerHTML.replace("$charity", chosen_charity);
                    });
                    messages_done.style.display = "block";
                    show_ending();
                    chooser.classList.remove("showing");
                    if (iOS) { actual_video.play(); }
                }
            });

            function displayChooser() {
                chooser.style.bottom = (video.offsetHeight - actual_video.offsetHeight - actual_video.offsetTop) + 28 + "px";
                chooser.classList.add("showing");
            }

            function countdown() {
                remaining -= 1;
                counter.innerHTML = remaining.toString();
                if (remaining <= 0) {
                    clearInterval(countdown_iv);
                    messages_countdown.style.display = "none";
                    displayChooser();
                }
            }

            // iOS plays the video on its own, full screen. So we have to show the chooser before that.
            var userAgent = navigator.userAgent || navigator.vendor || window.opera;
            var iOS =  (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream);
            if (iOS) {
                messages_countdown.style.display = "none";
                displayChooser();
            } else {
                actual_video.play();
                countdown_iv = setInterval(countdown, 1000);
                countdown();
            }
            // IE doesn't support display flex
            var msie = userAgent.indexOf('MSIE ');
            var trident = userAgent.indexOf('Trident/');
            var IE = (msie > 0 || trident > 0);
            if (IE) { vcontainer.style.display = "-ms-flexbox"; }
        }

    }

    Array.prototype.slice.call(document.querySelectorAll(".gdlpafg")).forEach(function(ad) {
        /* carousel */
        var lis = Array.prototype.slice.call(ad.querySelectorAll(".afg_charities li"));
        if (lis.length > 0) {
            lis[0].classList.add("showing");
            var idx = 0;
            setInterval(function() {
                lis[idx].classList.remove("showing");
                idx += 1;
                if (idx == lis.length) { idx = 0; }
                lis[idx].classList.add("showing");
            }, 4000);
        }

        Array.prototype.slice.call(ad.querySelectorAll(".afg_company_name")).forEach(function(cn) {
            cn.innerHTML = cn.innerHTML.replace("$company", company_name);
        });

        /* detect CSS animation support */
        var animation = false,
            animationstring = 'animation',
            keyframeprefix = '',
            domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
            pfx  = '',
            elm = document.createElement('div');
        if (elm.style.animationName !== undefined) { animation = true; }    
        if (animation === false) {
            for (var i = 0; i < domPrefixes.length; i++) {
                if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
                    pfx = domPrefixes[i];
                    animationstring = pfx + 'Animation';
                    keyframeprefix = '-' + pfx.toLowerCase() + '-';
                    animation = true;
                    break;
                }
            }
        }
        if (animation) {
            var hdrs = ad.getElementsByTagName("header");
            if (hdrs.length > 0) hdrs[0].classList.add("animatable");
        }

        /* clicks */
        ad.onclick = activate(ad);

    });
}
