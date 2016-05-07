angular.module("app").config(($stateProvider, $urlRouterProvider) => {
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state("home", {
            abstract: true,
            url: "/",
            template: `
                <app-component></app-component>
            `
        })
        .state("home.history", {
            url: "",
            template: `
                <history-component></history-component>
            `
        })
        .state("home.login", {
            url: "/login",
            template: `
                <login-component></login-component>
            `
        })
        .state("home.leaderboard", {
            url: "/leaderboard",
            template: `
                <leaderboard-component></leaderboard-component>
            `
        })
        .state("home.approvals", {
            url: "/approvals",
            template: `
                <approvals-component></approvals-component>
            `
        })
;
});