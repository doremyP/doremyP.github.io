(function () {
    function t() {
        var o = gsap.timeline();
        gsap.matchMedia().add({
            isDesktop: "(min-width: ".concat(750, "px)"),
            isMobile: "(max-width: ".concat(749, "px)")
        }, function (t) {
            var t = t.conditions
                , e = t.isDesktop
                , t = t.isMobile;
            o.to(".opening-top__item", {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: .5,
                ease: "power3.out",
                stagger: .1
            }, "+=0.3").to(".opening-top__item img", {
                opacity: 1,
                duration: 1,
                ease: "power3.out",
                stagger: .1
            }, "<+=0.4").to(".opening-top__item:nth-child(odd) img", {
                yPercent: e ? 10 : 0,
                xPercent: t ? 10 : 0,
                duration: 1.5,
                ease: "power3.out",
                stagger: .15
            }, "<").to(".opening-top__item:nth-child(even) img", {
                yPercent: e ? -10 : 0,
                xPercent: t ? -10 : 0,
                duration: 1.5,
                ease: "power3.out",
                stagger: .15
            }, "<").to(".opening-top__item:nth-child(odd)", {
                clipPath: e ? "inset(100% 0% 0% 0%)" : "inset(0% 100% 0% 0%)",
                duration: .5,
                ease: "power3.out"
            }).to(".opening-top__item:nth-child(even)", {
                clipPath: e ? "inset(0% 0% 100% 0%)" : "inset(0% 0% 0% 100%)",
                duration: .5,
                ease: "power3.out"
            }, "<").add(function () {
                document.querySelector("#js-opening-top").classList.add("is-to-finish")
            }, "<").add(function () {
                document.querySelector("#js-opening-top").classList.add("is-finish")
            }, "+=0.3")
        })
    }
    location.hash && location.hash.includes("#news_") ? (document.querySelector("#js-opening-top").classList.add("is-to-finish"),
        document.querySelector("#js-opening-top").classList.add("is-finish")) : document.querySelector(".opening-top__item") && t()
}());