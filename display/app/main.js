angular.module("app", ["ui.router", "ui.materialize"])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])
    // .config((ParseProvider) => {
    //     ParseProvider.initialize("y85gvCv3uUKdvZkHfS3iuteRFhdcVQdhRUv9vM6e", "pYoQpgsICThrZGXhPf8jSPRn8cH6Z1DosrfOqnjq")
    // });