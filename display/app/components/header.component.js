angular.module('app').component('headerComponent', {
    controller() {
        console.log(this);
    },
    bindings: {
        user: "="
    },
    template: `
        <nav>
            <div class="nav-wrapper">
            <a ui-sref="home" class="brand-logo">Stormwater Retention Basins</a>
            <ul id="nav-mobile" class="right hide-on-med-and-down">
                <li><a ui-sref=".leaderboard">Leaderboards</a></li>
                <li><a ui-sref=".login">Sign In</a></li>
            </ul>
            </div>
        </nav>
    `,
});