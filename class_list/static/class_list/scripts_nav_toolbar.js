// toggles nav; also closes open menus
function toggleNav() {
    var prevScrollpos = window.pageYOffset; // gets initial Y-axis scroll position
    window.onscroll = function() {
        var currentScrollPos = window.pageYOffset;
        var navContainer = document.getElementById("nav-container");
        var hasClass = navContainer.classList.contains('show-nav') || navContainer.classList.contains('hide-nav');
        // this provides an initial scroll state; without this conditional, the nav menu jumps on page load
        if (currentScrollPos <= 300 && !hasClass) {
            // prevents actions if no classes are applied
        } else if (prevScrollpos > currentScrollPos  || currentScrollPos <= 300) {
            // shows navbar
            navContainer.classList.add('show-nav');
            navContainer.classList.remove('hide-nav');
        } else {
            // hides navbar
            navContainer.classList.add('hide-nav');
            navContainer.classList.remove('show-nav');
        }

        // // CLOSES DAY OF WEEK SELECTION MENU WHEN ON SMALL DEVICES
        // let primaryContainer = document.getElementById('buttons-container-sub-menu');
        // if (primaryContainer.classList.contains('show-sub-menu')) {
        //     primaryContainer.classList.remove('show-sub-menu');
        // }

        prevScrollpos = currentScrollPos;
    }
}