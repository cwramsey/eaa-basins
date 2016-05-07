"use strict";

angular.module("app", ["ui.router", "ui.materialize"]).config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);
// .config((ParseProvider) => {
//     ParseProvider.initialize("y85gvCv3uUKdvZkHfS3iuteRFhdcVQdhRUv9vM6e", "pYoQpgsICThrZGXhPf8jSPRn8cH6Z1DosrfOqnjq")
// });
angular.module("app").config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider.state("home", {
        abstract: true,
        url: "/",
        template: "\n                <app-component></app-component>\n            "
    }).state("home.history", {
        url: "",
        template: "\n                <history-component></history-component>\n            "
    }).state("home.login", {
        url: "/login",
        template: "\n                <login-component></login-component>\n            "
    }).state("home.leaderboard", {
        url: "/leaderboard",
        template: "\n                <leaderboard-component></leaderboard-component>\n            "
    }).state("home.approvals", {
        url: "/approvals",
        template: "\n                <approvals-component></approvals-component>\n            "
    });
}]);
angular.module('app').component('appComponent', {
    template: "\n        <header-component></header-component>\n\n        <div class=\"container\">\n            <div ui-view></div>\n        </div>\n        \n    "

});
angular.module('app').component('approvalsComponent', {
    template: "\n        <h3>Approvals Needed</h3>\n        <h6 ng-if=\"!$ctrl.items.length\">No approvals needed</h6>\n        <history-detail history-items=\"$ctrl.items\"></history-detail>\n    ",
    controller: ["PhotosService", function controller(PhotosService) {
        var _this = this;

        PhotosService.all().then(function (xs) {
            return xs.filter(function (x) {
                return !x.approved;
            });
        }).then(function (photos) {
            _this.items = photos;
            console.log('approved', photos);
            return photos;
        });
    }]
});
angular.module('app').component('headerComponent', {
    controller: function controller() {
        console.log(this);
    },

    bindings: {
        user: "="
    },
    template: "\n        <nav>\n            <div class=\"nav-wrapper\">\n            <a ui-sref=\"home\" class=\"brand-logo\">Stormwater Retention Basins</a>\n            <ul id=\"nav-mobile\" class=\"right hide-on-med-and-down\">\n                <li><a ui-sref=\".leaderboard\">Leaderboards</a></li>\n                <li><a ui-sref=\".login\">Sign In</a></li>\n            </ul>\n            </div>\n        </nav>\n    "
});
angular.module('app').component('historyDetail', {
    template: "\n    \n    <div class=\"row\" ng-repeat=\"item in $ctrl.historyItems\">\n        <div class=\"col s12 m12\" ng-if=\"item.hide !== true || item.approved\">\n            <div class=\"card\">\n            <div class=\"card-image\">\n                <img src=\"{{item.imageURL}}\">\n                <span class=\"card-title\">Location Data</span>\n            </div>\n            <div class=\"card-content\">\n                <img src=\"{{$ctrl.getAvatar()}}\" alt=\"\" class=\"circle avatar\">\n                <p>Created by: Bob R. on {{item.created.date}} in the {{item.zone}}</p>\n            </div>\n            <div class=\"card-action\">\n                <a ng-if=\"item.approved\" ng-click=\"$ctrl.close()\">Close</a>\n                <a ng-if=\"!item.approved\" ng-click=\"$ctrl.hide(item)\" class=\"green-text darken-4\">Approve</a>\n                <a ng-if=\"!item.approved\" ng-click=\"$ctrl.hide(item)\" class=\"red-text darken-4\">Disapprove</a>\n            </div>\n            </div>\n        </div>\n    </div>\n   \n    ",
    controller: ["UserService", "$rootScope", function controller(UserService, $rootScope) {
        this.close = function () {
            $rootScope.$broadcast("close:item");
        };

        this.getAvatar = function () {
            var nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

            var id = nums[Math.floor(Math.random() * nums.length)];
            return "/display/images/profile_" + id + ".png";
        };

        this.hide = function (item) {
            item.hide = true;
        };
    }],

    bindings: {
        historyItems: '='
    }

});
angular.module('app').component('historyComponent', {
    template: "\n        <a ng-click=\"$ctrl.show()\" style=\"display: none;\" class=\"show-map\"></a>\n        <div id=\"map\"></div>\n        <history-detail ng-if=\"$ctrl.chosen_items.length\" history-items=\"$ctrl.chosen_items\"></history-detail>\n    ",
    controller: ["$scope", "$rootScope", "LocationService", "PhotosService", "CONSTANTS", function controller($scope, $rootScope, LocationService, PhotosService, CONSTANTS) {
        var _this2 = this;

        this.map = null;
        this.show = function () {};
        this.chosen_items = [];

        var icon = "<svg width=\"12\" height=\"12\" \n                        xmlns=\"http://www.w3.org/2000/svg\">\n                        <rect stroke=\"white\" fill=\"{}\" x=\"1\" y=\"1\" width=\"22\" \n                        height=\"22\" /></svg>";

        $scope.$on('close:item', function () {
            _this2.chosen_items = [];
        });

        PhotosService.all().then(function (photos) {
            photos = photos.filter(function (x) {
                return x.approved;
            });
            _this2.items = photos;
            console.log(photos);
            return photos;
        }).then(function (photos) {
            _this2.init(photos);
        });

        this.init = function (photos) {
            var platform = new H.service.Platform({
                app_id: CONSTANTS.HERE.ID,
                app_code: CONSTANTS.HERE.APP
            });

            var defaults = platform.createDefaultLayers();
            var map = new H.Map(document.getElementById('map'), defaults.normal.map, {
                center: {
                    lat: 29.4241,
                    lng: -98.4936
                },
                zoom: 7
            });

            var ui = H.ui.UI.createDefault(map, defaults);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = photos[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var photo = _step.value;

                    console.log(photo);

                    if (!photo.color) {
                        continue;
                    }

                    switch (photo.color) {
                        case "orange":
                            photo.color = "#ff6600";
                            break;
                        case "red":
                            photo.color = "#ef3123";
                            break;
                        case "green":
                            photo.color = "#009933";
                            break;
                        default:
                            continue;
                    }

                    var this_icon = icon.replace("{}", photo.color);

                    var place = new H.map.Icon(this_icon);
                    var coords = {
                        lat: photo.lat,
                        lng: photo.lon
                    };
                    var marker = new H.map.Marker(coords, { icon: place, id: photo.id });
                    map.addObject(marker);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var map_events = new H.mapevents.MapEvents(map);
            map.addEventListener('tap', function (e) {
                var items = _this2.items.filter(function (x) {
                    return e.target.bb.lat == x.lat && e.target.bb.lng == x.lon;
                });

                _this2.showMarker(items);
            });
        };

        this.showMarker = function (items) {
            $scope.$apply(function () {
                _this2.chosen_items = items;
                console.log("Choose items", _this2.chosen_items);
            });
        };

        var interval = setInterval(function () {
            if (_this2.items) {
                clearInterval(interval);
                $('.show-map').click();
            }
        }, 100);
    }]
});
angular.module('app').component('leaderboardComponent', {
    template: "\n        <ul class=\"collection\">\n            <li class=\"collection-item avatar\" ng-repeat=\"user in $ctrl.users\">\n                <img src=\"/display/images/profile_{{user.img}}.png\" alt=\"\" class=\"circle\">\n                <span class=\"title\">{{user.name}}</span>\n                <p>Hero Points: <span class=\"red-text\">{{user.score}}</span> <br />\n                Badges: {{user.badges}}\n                \n                </p>\n                <a href=\"#!\" class=\"secondary-content\"><i class=\"material-icons\">grade</i></a>\n            </li>\n        </ul>\n    ",
    controller: function controller() {
        this.users = [{
            name: 'Bob M.',
            score: 45,
            img: 1,
            badges: 5
        }, {
            name: 'George J.',
            score: 40,
            img: 2,
            badges: 5
        }, {
            name: 'Heather R.',
            score: 40,
            img: 3,
            badges: 4
        }, {
            name: 'Karen S.',
            score: 20,
            img: 4,
            badges: 2
        }, {
            name: 'Sammy Q.',
            score: 5,
            img: 5,
            badges: 1
        }];
    }
});
angular.module('app').component('loginComponent', {
    template: "\n        <div class=\"row\">\n            <div class=\"col s12 m6 offset-m3\">\n                <div class=\"card-panel\">\n                    <span class=\"card-title\">Login</span>\n\n                    <p>To access administration features, you'll need to login.</p>\n                    <div input-field>\n                        <input ng-model=\"$ctrl.email\" type=\"text\" placeholder=\"Your Email Address\" />\n                    </div>\n                    <div input-field>\n                        <input ng-model=\"$ctrl.password\" type=\"password\" placeholder=\"Your Password\" />\n                    </div>\n\n                    <div class=\"right\">\n                        <a class=\"waves-effect waves-light btn green accent-4\" ng-click=\"$ctrl.go()\">Sign Up</a>\n                        <a class=\"waves-effect waves-light btn blue accent-4\" ng-click=\"$ctrl.go()\">Login</a>\n                    </div>\n                    <br class=\"clearfix\" />\n                </div>\n            </div>\n        </div>\n    ",
    controller: ["$state", function controller($state) {
        this.email = null;

        this.go = function () {
            $state.go('home.approvals');
        };
    }]
});
angular.module('app').service('CONSTANTS', function () {
    return {
        API_URL: "http://104.197.205.133/",
        HERE: {
            ID: "MJZ7heIzObpAWYe0ze9u",
            APP: "LhZUdYxc5T7vDyP8w0BjMg"
        }
    };
});
angular.module('app').service('LocationService', ["$q", function ($q) {
    if (!navigator.geolocation) {
        alert("Your browser does not support geolocation. Please try in Chrome, Firefox, Safari or Edge");
        return;
    }

    return {
        getLocation: function getLocation() {
            return $q(function (resolve, reject) {
                navigator.geolocation.getCurrentPosition(function (pos) {
                    resolve({
                        center: {
                            lat: pos.coords.latitude,
                            long: pos.coords.longitude
                        },
                        zoom: 8
                    });
                }, function (err) {
                    reject(err);
                });
            });
        }
    };
}]);

angular.module('app').service('PhotosService', ["$http", "CONSTANTS", function ($http, CONSTANTS) {
    return {
        all: function all() {
            return $http.get(CONSTANTS.API_URL + "/photos").then(function (res) {
                return res.data;
            }).catch(function (err) {
                return console.error(err);
            });
        }
    };
}]);

angular.module('app').service("UserService", function () {});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyIsIm1haW4uanMiLCJyb3V0ZXMuanMiLCJjb21wb25lbnRzL2FwcC5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2FwcHJvdmFscy5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2hlYWRlci5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2hpc3RvcnktZGV0YWlsLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvaGlzdG9yeS5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2xlYWRlcmJvYXJkLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvbG9naW4uY29tcG9uZW50LmpzIiwib2JqZWN0cy9jb25zdGFudHMub2JqZWN0LmpzIiwic2VydmljZXMvTG9jYXRpb25TZXJ2aWNlLmpzIiwic2VydmljZXMvUGhvdG9zU2VydmljZS5qcyIsInNlcnZpY2VzL3VzZXIuc2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxRQUFBLE9BQUEsT0FBQSxDQUFBLGFBQUEsbUJBQ0EsT0FBQSxDQUFBLGlCQUFBLFVBQUEsZUFBQTtJQUNBLGNBQUEsU0FBQSxhQUFBO0lBQ0EsT0FBQSxjQUFBLFNBQUEsUUFBQSxPQUFBOzs7OztBQ0hBLFFBQUEsT0FBQSxPQUFBLGdEQUFBLFVBQUEsZ0JBQUEsb0JBQUE7SUFDQSxtQkFBQSxVQUFBO0lBQ0EsZUFDQSxNQUFBLFFBQUE7UUFDQSxVQUFBO1FBQ0EsS0FBQTtRQUNBLFVBQUE7T0FJQSxNQUFBLGdCQUFBO1FBQ0EsS0FBQTtRQUNBLFVBQUE7T0FJQSxNQUFBLGNBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTtPQUlBLE1BQUEsb0JBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTtPQUlBLE1BQUEsa0JBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTs7O0FDOUJBLFFBQUEsT0FBQSxPQUFBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBOzs7QUNEQSxRQUFBLE9BQUEsT0FBQSxVQUFBLHNCQUFBO0lBQ0EsVUFBQTtJQUtBLDhCQU5BLFNBQUEsV0FNQSxlQUFBO1FBQUEsSUFBQSxRQUFBOztRQUNBLGNBQUEsTUFDQSxLQUFBLFVBQUEsSUFBQTtZQUFBLE9BQUEsR0FBQSxPQUFBLFVBQUEsR0FBQTtnQkFBQSxPQUFBLENBQUEsRUFBQTs7V0FDQSxLQUFBLFVBQUEsUUFBQTtZQUNBLE1BQUEsUUFBQTtZQUNBLFFBQUEsSUFBQSxZQUFBO1lBQ0EsT0FBQTs7OztBQ1pBLFFBQUEsT0FBQSxPQUFBLFVBQUEsbUJBQUE7SUFDQSxZQURBLFNBQUEsYUFDQTtRQUNBLFFBQUEsSUFBQTs7O0lBRUEsVUFBQTtRQUNBLE1BQUE7O0lBRUEsVUFBQTs7QUNQQSxRQUFBLE9BQUEsT0FBQSxVQUFBLGlCQUFBO0lBQ0EsVUFBQTtJQXVCQSwwQ0F4QkEsU0FBQSxXQXdCQSxhQUFBLFlBQUE7UUFDQSxLQUFBLFFBQUEsWUFBQTtZQUNBLFdBQUEsV0FBQTs7O1FBR0EsS0FBQSxZQUFBLFlBQUE7WUFDQSxJQUFBLE9BQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxHQUFBLEdBQUEsR0FBQSxHQUFBLEdBQUE7O1lBRUEsSUFBQSxLQUFBLEtBQUEsS0FBQSxNQUFBLEtBQUEsV0FBQSxLQUFBO1lBQ0EsT0FBQSw2QkFBQSxLQUFBOzs7UUFHQSxLQUFBLE9BQUEsVUFBQSxNQUFBO1lBQ0EsS0FBQSxPQUFBOzs7O0lBR0EsVUFBQTtRQUNBLGNBQUE7Ozs7QUN6Q0EsUUFBQSxPQUFBLE9BQUEsVUFBQSxvQkFBQTtJQUNBLFVBQUE7SUFLQSxzRkFOQSxTQUFBLFdBTUEsUUFBQSxZQUFBLGlCQUFBLGVBQUEsV0FBQTtRQUFBLElBQUEsU0FBQTs7UUFDQSxLQUFBLE1BQUE7UUFDQSxLQUFBLE9BQUEsWUFBQTtRQUNBLEtBQUEsZUFBQTs7UUFFQSxJQUFBLE9BQUE7O1FBS0EsT0FBQSxJQUFBLGNBQUEsWUFBQTtZQUNBLE9BQUEsZUFBQTs7O1FBR0EsY0FBQSxNQUNBLEtBQUEsVUFBQSxRQUFBO1lBQ0EsU0FBQSxPQUFBLE9BQUEsVUFBQSxHQUFBO2dCQUFBLE9BQUEsRUFBQTs7WUFDQSxPQUFBLFFBQUE7WUFDQSxRQUFBLElBQUE7WUFDQSxPQUFBO1dBRUEsS0FBQSxVQUFBLFFBQUE7WUFDQSxPQUFBLEtBQUE7OztRQUdBLEtBQUEsT0FBQSxVQUFBLFFBQUE7WUFDQSxJQUFBLFdBQUEsSUFBQSxFQUFBLFFBQUEsU0FBQTtnQkFDQSxRQUFBLFVBQUEsS0FBQTtnQkFDQSxVQUFBLFVBQUEsS0FBQTs7O1lBR0EsSUFBQSxXQUFBLFNBQUE7WUFDQSxJQUFBLE1BQUEsSUFBQSxFQUFBLElBQUEsU0FBQSxlQUFBLFFBQ0EsU0FBQSxPQUFBLEtBQ0E7Z0JBQ0EsUUFBQTtvQkFDQSxLQUFBO29CQUNBLEtBQUEsQ0FBQTs7Z0JBRUEsTUFBQTs7O1lBSUEsSUFBQSxLQUFBLEVBQUEsR0FBQSxHQUFBLGNBQUEsS0FBQTs7WUFsQkEsSUFBQSw0QkFBQTtZQUFBLElBQUEsb0JBQUE7WUFBQSxJQUFBLGlCQUFBOztZQUFBLElBQUE7Z0JBb0JBLEtBQUEsSUFBQSxZQUFBLE9BQUEsT0FBQSxhQUFBLE9BQUEsRUFBQSw0QkFBQSxDQUFBLFFBQUEsVUFBQSxRQUFBLE9BQUEsNEJBQUEsTUFBQTtvQkFBQSxJQUFBLFFBQUEsTUFBQTs7b0JBQ0EsUUFBQSxJQUFBOztvQkFFQSxJQUFBLENBQUEsTUFBQSxPQUFBO3dCQUNBOzs7b0JBR0EsUUFBQSxNQUFBO3dCQUNBLEtBQUE7NEJBQ0EsTUFBQSxRQUFBOzRCQUNBO3dCQUNBLEtBQUE7NEJBQ0EsTUFBQSxRQUFBOzRCQUNBO3dCQUNBLEtBQUE7NEJBQ0EsTUFBQSxRQUFBOzRCQUNBO3dCQUNBOzRCQUNBOzs7b0JBR0EsSUFBQSxZQUFBLEtBQUEsUUFBQSxNQUFBLE1BQUE7O29CQUVBLElBQUEsUUFBQSxJQUFBLEVBQUEsSUFBQSxLQUFBO29CQUNBLElBQUEsU0FBQTt3QkFDQSxLQUFBLE1BQUE7d0JBQ0EsS0FBQSxNQUFBOztvQkFFQSxJQUFBLFNBQUEsSUFBQSxFQUFBLElBQUEsT0FBQSxRQUFBLEVBQUEsTUFBQSxPQUFBLElBQUEsTUFBQTtvQkFDQSxJQUFBLFVBQUE7O2NBakRBLE9BQUEsS0FBQTtnQkFBQSxvQkFBQTtnQkFBQSxpQkFBQTtzQkFBQTtnQkFBQSxJQUFBO29CQUFBLElBQUEsQ0FBQSw2QkFBQSxVQUFBLFFBQUE7d0JBQUEsVUFBQTs7MEJBQUE7b0JBQUEsSUFBQSxtQkFBQTt3QkFBQSxNQUFBOzs7OztZQW9EQSxJQUFBLGFBQUEsSUFBQSxFQUFBLFVBQUEsVUFBQTtZQUNBLElBQUEsaUJBQUEsT0FBQSxVQUFBLEdBQUE7Z0JBQ0EsSUFBQSxRQUFBLE9BQUEsTUFBQSxPQUFBLFVBQUEsR0FBQTtvQkFDQSxPQUFBLEVBQUEsT0FBQSxHQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxHQUFBLE9BQUEsRUFBQTs7O2dCQUdBLE9BQUEsV0FBQTs7OztRQUlBLEtBQUEsYUFBQSxVQUFBLE9BQUE7WUFDQSxPQUFBLE9BQUEsWUFBQTtnQkFDQSxPQUFBLGVBQUE7Z0JBQ0EsUUFBQSxJQUFBLGdCQUFBLE9BQUE7Ozs7UUFJQSxJQUFBLFdBQUEsWUFBQSxZQUFBO1lBQ0EsSUFBQSxPQUFBLE9BQUE7Z0JBQ0EsY0FBQTtnQkFDQSxFQUFBLGFBQUE7O1dBRUE7OztBQ3pHQSxRQUFBLE9BQUEsT0FBQSxVQUFBLHdCQUFBO0lBQ0EsVUFBQTtJQWFBLFlBZEEsU0FBQSxhQWNBO1FBQ0EsS0FBQSxRQUFBLENBQ0E7WUFDQSxNQUFBO1lBQ0EsT0FBQTtZQUNBLEtBQUE7WUFDQSxRQUFBO1dBRUE7WUFDQSxNQUFBO1lBQ0EsT0FBQTtZQUNBLEtBQUE7WUFDQSxRQUFBO1dBRUE7WUFDQSxNQUFBO1lBQ0EsT0FBQTtZQUNBLEtBQUE7WUFDQSxRQUFBO1dBRUE7WUFDQSxNQUFBO1lBQ0EsT0FBQTtZQUNBLEtBQUE7WUFDQSxRQUFBO1dBRUE7WUFDQSxNQUFBO1lBQ0EsT0FBQTtZQUNBLEtBQUE7WUFDQSxRQUFBOzs7O0FDNUNBLFFBQUEsT0FBQSxPQUFBLFVBQUEsa0JBQUE7SUFDQSxVQUFBO0lBdUJBLHVCQXhCQSxTQUFBLFdBd0JBLFFBQUE7UUFDQSxLQUFBLFFBQUE7O1FBRUEsS0FBQSxLQUFBLFlBQUE7WUFDQSxPQUFBLEdBQUE7Ozs7QUM1QkEsUUFBQSxPQUFBLE9BQUEsUUFBQSxhQUFBLFlBQUE7SUFDQSxPQUFBO1FBQ0EsU0FBQTtRQUNBLE1BQUE7WUFDQSxJQUFBO1lBQ0EsS0FBQTs7OztBQ0xBLFFBQUEsT0FBQSxPQUFBLFFBQUEsMEJBQUEsVUFBQSxJQUFBO0lBQ0EsSUFBQSxDQUFBLFVBQUEsYUFBQTtRQUNBLE1BQUE7UUFDQTs7O0lBR0EsT0FBQTtRQUNBLGFBREEsU0FBQSxjQUNBO1lBQ0EsT0FBQSxHQUFBLFVBQUEsU0FBQSxRQUFBO2dCQUNBLFVBQUEsWUFBQSxtQkFBQSxVQUFBLEtBQUE7b0JBQ0EsUUFBQTt3QkFDQSxRQUFBOzRCQUNBLEtBQUEsSUFBQSxPQUFBOzRCQUNBLE1BQUEsSUFBQSxPQUFBOzt3QkFFQSxNQUFBOzttQkFFQSxVQUFBLEtBQUE7b0JBQ0EsT0FBQTs7Ozs7OztBQ2xCQSxRQUFBLE9BQUEsT0FBQSxRQUFBLHdDQUFBLFVBQUEsT0FBQSxXQUFBO0lBQ0EsT0FBQTtRQUNBLEtBREEsU0FBQSxNQUNBO1lBQ0EsT0FBQSxNQUFBLElBQUEsVUFBQSxVQUFBLFdBQ0EsS0FBQSxVQUFBLEtBQUE7Z0JBQUEsT0FBQSxJQUFBO2VBQ0EsTUFBQSxVQUFBLEtBQUE7Z0JBQUEsT0FBQSxRQUFBLE1BQUE7Ozs7OztBQ0xBLFFBQUEsT0FBQSxPQUFBLFFBQUEsZUFBQSxZQUFBLElBQUEiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmFuZ3VsYXIubW9kdWxlKFwiYXBwXCIsIFtcInVpLnJvdXRlclwiLCBcInVpLm1hdGVyaWFsaXplXCJdKS5jb25maWcoWyckaHR0cFByb3ZpZGVyJywgZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIpIHtcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLnVzZVhEb21haW4gPSB0cnVlO1xuICAgIGRlbGV0ZSAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLVJlcXVlc3RlZC1XaXRoJ107XG59XSk7XG4vLyAuY29uZmlnKChQYXJzZVByb3ZpZGVyKSA9PiB7XG4vLyAgICAgUGFyc2VQcm92aWRlci5pbml0aWFsaXplKFwieTg1Z3ZDdjN1VUtkdlprSGZTM2l1dGVSRmhkY1ZRZGhSVXY5dk02ZVwiLCBcInBZb1FwZ3NJQ1RoclpHWGhQZjhqU1BSbjhjSDZaMURvc3JmT3FuanFcIilcbi8vIH0pO1xuYW5ndWxhci5tb2R1bGUoXCJhcHBcIikuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9cIik7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lXCIsIHtcbiAgICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICAgIHVybDogXCIvXCIsXG4gICAgICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgICAgICAgICA8YXBwLWNvbXBvbmVudD48L2FwcC1jb21wb25lbnQ+XFxuICAgICAgICAgICAgXCJcbiAgICB9KS5zdGF0ZShcImhvbWUuaGlzdG9yeVwiLCB7XG4gICAgICAgIHVybDogXCJcIixcbiAgICAgICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICAgICAgICAgIDxoaXN0b3J5LWNvbXBvbmVudD48L2hpc3RvcnktY29tcG9uZW50PlxcbiAgICAgICAgICAgIFwiXG4gICAgfSkuc3RhdGUoXCJob21lLmxvZ2luXCIsIHtcbiAgICAgICAgdXJsOiBcIi9sb2dpblwiLFxuICAgICAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgICAgICAgICAgPGxvZ2luLWNvbXBvbmVudD48L2xvZ2luLWNvbXBvbmVudD5cXG4gICAgICAgICAgICBcIlxuICAgIH0pLnN0YXRlKFwiaG9tZS5sZWFkZXJib2FyZFwiLCB7XG4gICAgICAgIHVybDogXCIvbGVhZGVyYm9hcmRcIixcbiAgICAgICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICAgICAgICAgIDxsZWFkZXJib2FyZC1jb21wb25lbnQ+PC9sZWFkZXJib2FyZC1jb21wb25lbnQ+XFxuICAgICAgICAgICAgXCJcbiAgICB9KS5zdGF0ZShcImhvbWUuYXBwcm92YWxzXCIsIHtcbiAgICAgICAgdXJsOiBcIi9hcHByb3ZhbHNcIixcbiAgICAgICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICAgICAgICAgIDxhcHByb3ZhbHMtY29tcG9uZW50PjwvYXBwcm92YWxzLWNvbXBvbmVudD5cXG4gICAgICAgICAgICBcIlxuICAgIH0pO1xufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdhcHBDb21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8aGVhZGVyLWNvbXBvbmVudD48L2hlYWRlci1jb21wb25lbnQ+XFxuXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb250YWluZXJcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgdWktdmlldz48L2Rpdj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgXFxuICAgIFwiXG5cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnYXBwcm92YWxzQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgPGgzPkFwcHJvdmFscyBOZWVkZWQ8L2gzPlxcbiAgICAgICAgPGg2IG5nLWlmPVxcXCIhJGN0cmwuaXRlbXMubGVuZ3RoXFxcIj5ObyBhcHByb3ZhbHMgbmVlZGVkPC9oNj5cXG4gICAgICAgIDxoaXN0b3J5LWRldGFpbCBoaXN0b3J5LWl0ZW1zPVxcXCIkY3RybC5pdGVtc1xcXCI+PC9oaXN0b3J5LWRldGFpbD5cXG4gICAgXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcihQaG90b3NTZXJ2aWNlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgUGhvdG9zU2VydmljZS5hbGwoKS50aGVuKGZ1bmN0aW9uICh4cykge1xuICAgICAgICAgICAgcmV0dXJuIHhzLmZpbHRlcihmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAheC5hcHByb3ZlZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChwaG90b3MpIHtcbiAgICAgICAgICAgIF90aGlzLml0ZW1zID0gcGhvdG9zO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FwcHJvdmVkJywgcGhvdG9zKTtcbiAgICAgICAgICAgIHJldHVybiBwaG90b3M7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGVhZGVyQ29tcG9uZW50Jywge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgIH0sXG5cbiAgICBiaW5kaW5nczoge1xuICAgICAgICB1c2VyOiBcIj1cIlxuICAgIH0sXG4gICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8bmF2PlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIm5hdi13cmFwcGVyXFxcIj5cXG4gICAgICAgICAgICA8YSB1aS1zcmVmPVxcXCJob21lXFxcIiBjbGFzcz1cXFwiYnJhbmQtbG9nb1xcXCI+U3Rvcm13YXRlciBSZXRlbnRpb24gQmFzaW5zPC9hPlxcbiAgICAgICAgICAgIDx1bCBpZD1cXFwibmF2LW1vYmlsZVxcXCIgY2xhc3M9XFxcInJpZ2h0IGhpZGUtb24tbWVkLWFuZC1kb3duXFxcIj5cXG4gICAgICAgICAgICAgICAgPGxpPjxhIHVpLXNyZWY9XFxcIi5sZWFkZXJib2FyZFxcXCI+TGVhZGVyYm9hcmRzPC9hPjwvbGk+XFxuICAgICAgICAgICAgICAgIDxsaT48YSB1aS1zcmVmPVxcXCIubG9naW5cXFwiPlNpZ24gSW48L2E+PC9saT5cXG4gICAgICAgICAgICA8L3VsPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9uYXY+XFxuICAgIFwiXG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2hpc3RvcnlEZXRhaWwnLCB7XG4gICAgdGVtcGxhdGU6IFwiXFxuICAgIFxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiIG5nLXJlcGVhdD1cXFwiaXRlbSBpbiAkY3RybC5oaXN0b3J5SXRlbXNcXFwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29sIHMxMiBtMTJcXFwiIG5nLWlmPVxcXCJpdGVtLmhpZGUgIT09IHRydWUgfHwgaXRlbS5hcHByb3ZlZFxcXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZFxcXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZC1pbWFnZVxcXCI+XFxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVxcXCJ7e2l0ZW0uaW1hZ2VVUkx9fVxcXCI+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjYXJkLXRpdGxlXFxcIj5Mb2NhdGlvbiBEYXRhPC9zcGFuPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQtY29udGVudFxcXCI+XFxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVxcXCJ7eyRjdHJsLmdldEF2YXRhcigpfX1cXFwiIGFsdD1cXFwiXFxcIiBjbGFzcz1cXFwiY2lyY2xlIGF2YXRhclxcXCI+XFxuICAgICAgICAgICAgICAgIDxwPkNyZWF0ZWQgYnk6IEJvYiBSLiBvbiB7e2l0ZW0uY3JlYXRlZC5kYXRlfX0gaW4gdGhlIHt7aXRlbS56b25lfX08L3A+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZC1hY3Rpb25cXFwiPlxcbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cXFwiaXRlbS5hcHByb3ZlZFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmNsb3NlKClcXFwiPkNsb3NlPC9hPlxcbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cXFwiIWl0ZW0uYXBwcm92ZWRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5oaWRlKGl0ZW0pXFxcIiBjbGFzcz1cXFwiZ3JlZW4tdGV4dCBkYXJrZW4tNFxcXCI+QXBwcm92ZTwvYT5cXG4gICAgICAgICAgICAgICAgPGEgbmctaWY9XFxcIiFpdGVtLmFwcHJvdmVkXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuaGlkZShpdGVtKVxcXCIgY2xhc3M9XFxcInJlZC10ZXh0IGRhcmtlbi00XFxcIj5EaXNhcHByb3ZlPC9hPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgIFxcbiAgICBcIixcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKFVzZXJTZXJ2aWNlLCAkcm9vdFNjb3BlKSB7XG4gICAgICAgIHRoaXMuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoXCJjbG9zZTppdGVtXCIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0QXZhdGFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG51bXMgPSBbMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV07XG5cbiAgICAgICAgICAgIHZhciBpZCA9IG51bXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbnVtcy5sZW5ndGgpXTtcbiAgICAgICAgICAgIHJldHVybiBcIi9kaXNwbGF5L2ltYWdlcy9wcm9maWxlX1wiICsgaWQgKyBcIi5wbmdcIjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhpZGUgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5oaWRlID0gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaGlzdG9yeUl0ZW1zOiAnPSdcbiAgICB9XG5cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGlzdG9yeUNvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgIDxhIG5nLWNsaWNrPVxcXCIkY3RybC5zaG93KClcXFwiIHN0eWxlPVxcXCJkaXNwbGF5OiBub25lO1xcXCIgY2xhc3M9XFxcInNob3ctbWFwXFxcIj48L2E+XFxuICAgICAgICA8ZGl2IGlkPVxcXCJtYXBcXFwiPjwvZGl2PlxcbiAgICAgICAgPGhpc3RvcnktZGV0YWlsIG5nLWlmPVxcXCIkY3RybC5jaG9zZW5faXRlbXMubGVuZ3RoXFxcIiBoaXN0b3J5LWl0ZW1zPVxcXCIkY3RybC5jaG9zZW5faXRlbXNcXFwiPjwvaGlzdG9yeS1kZXRhaWw+XFxuICAgIFwiLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBMb2NhdGlvblNlcnZpY2UsIFBob3Rvc1NlcnZpY2UsIENPTlNUQU5UUykge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB0aGlzLm1hcCA9IG51bGw7XG4gICAgICAgIHRoaXMuc2hvdyA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICB0aGlzLmNob3Nlbl9pdGVtcyA9IFtdO1xuXG4gICAgICAgIHZhciBpY29uID0gXCI8c3ZnIHdpZHRoPVxcXCIxMlxcXCIgaGVpZ2h0PVxcXCIxMlxcXCIgXFxuICAgICAgICAgICAgICAgICAgICAgICAgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBzdHJva2U9XFxcIndoaXRlXFxcIiBmaWxsPVxcXCJ7fVxcXCIgeD1cXFwiMVxcXCIgeT1cXFwiMVxcXCIgd2lkdGg9XFxcIjIyXFxcIiBcXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XFxcIjIyXFxcIiAvPjwvc3ZnPlwiO1xuXG4gICAgICAgICRzY29wZS4kb24oJ2Nsb3NlOml0ZW0nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczIuY2hvc2VuX2l0ZW1zID0gW107XG4gICAgICAgIH0pO1xuXG4gICAgICAgIFBob3Rvc1NlcnZpY2UuYWxsKCkudGhlbihmdW5jdGlvbiAocGhvdG9zKSB7XG4gICAgICAgICAgICBwaG90b3MgPSBwaG90b3MuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHguYXBwcm92ZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF90aGlzMi5pdGVtcyA9IHBob3RvcztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBob3Rvcyk7XG4gICAgICAgICAgICByZXR1cm4gcGhvdG9zO1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChwaG90b3MpIHtcbiAgICAgICAgICAgIF90aGlzMi5pbml0KHBob3Rvcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaW5pdCA9IGZ1bmN0aW9uIChwaG90b3MpIHtcbiAgICAgICAgICAgIHZhciBwbGF0Zm9ybSA9IG5ldyBILnNlcnZpY2UuUGxhdGZvcm0oe1xuICAgICAgICAgICAgICAgIGFwcF9pZDogQ09OU1RBTlRTLkhFUkUuSUQsXG4gICAgICAgICAgICAgICAgYXBwX2NvZGU6IENPTlNUQU5UUy5IRVJFLkFQUFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBkZWZhdWx0cyA9IHBsYXRmb3JtLmNyZWF0ZURlZmF1bHRMYXllcnMoKTtcbiAgICAgICAgICAgIHZhciBtYXAgPSBuZXcgSC5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCBkZWZhdWx0cy5ub3JtYWwubWFwLCB7XG4gICAgICAgICAgICAgICAgY2VudGVyOiB7XG4gICAgICAgICAgICAgICAgICAgIGxhdDogMjkuNDI0MSxcbiAgICAgICAgICAgICAgICAgICAgbG5nOiAtOTguNDkzNlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgem9vbTogN1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciB1aSA9IEgudWkuVUkuY3JlYXRlRGVmYXVsdChtYXAsIGRlZmF1bHRzKTtcblxuICAgICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgdmFyIF9kaWRJdGVyYXRvckVycm9yID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gcGhvdG9zW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IChfc3RlcCA9IF9pdGVyYXRvci5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGhvdG8gPSBfc3RlcC52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwaG90byk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwaG90by5jb2xvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHBob3RvLmNvbG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwib3JhbmdlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhvdG8uY29sb3IgPSBcIiNmZjY2MDBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJyZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaG90by5jb2xvciA9IFwiI2VmMzEyM1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcImdyZWVuXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhvdG8uY29sb3IgPSBcIiMwMDk5MzNcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGhpc19pY29uID0gaWNvbi5yZXBsYWNlKFwie31cIiwgcGhvdG8uY29sb3IpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGFjZSA9IG5ldyBILm1hcC5JY29uKHRoaXNfaWNvbik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXQ6IHBob3RvLmxhdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxuZzogcGhvdG8ubG9uXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgSC5tYXAuTWFya2VyKGNvb3JkcywgeyBpY29uOiBwbGFjZSwgaWQ6IHBob3RvLmlkIH0pO1xuICAgICAgICAgICAgICAgICAgICBtYXAuYWRkT2JqZWN0KG1hcmtlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG1hcF9ldmVudHMgPSBuZXcgSC5tYXBldmVudHMuTWFwRXZlbnRzKG1hcCk7XG4gICAgICAgICAgICBtYXAuYWRkRXZlbnRMaXN0ZW5lcigndGFwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBfdGhpczIuaXRlbXMuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlLnRhcmdldC5iYi5sYXQgPT0geC5sYXQgJiYgZS50YXJnZXQuYmIubG5nID09IHgubG9uO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgX3RoaXMyLnNob3dNYXJrZXIoaXRlbXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zaG93TWFya2VyID0gZnVuY3Rpb24gKGl0ZW1zKSB7XG4gICAgICAgICAgICAkc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfdGhpczIuY2hvc2VuX2l0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDaG9vc2UgaXRlbXNcIiwgX3RoaXMyLmNob3Nlbl9pdGVtcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMyLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgJCgnLnNob3ctbWFwJykuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2xlYWRlcmJvYXJkQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgPHVsIGNsYXNzPVxcXCJjb2xsZWN0aW9uXFxcIj5cXG4gICAgICAgICAgICA8bGkgY2xhc3M9XFxcImNvbGxlY3Rpb24taXRlbSBhdmF0YXJcXFwiIG5nLXJlcGVhdD1cXFwidXNlciBpbiAkY3RybC51c2Vyc1xcXCI+XFxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVxcXCIvZGlzcGxheS9pbWFnZXMvcHJvZmlsZV97e3VzZXIuaW1nfX0ucG5nXFxcIiBhbHQ9XFxcIlxcXCIgY2xhc3M9XFxcImNpcmNsZVxcXCI+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJ0aXRsZVxcXCI+e3t1c2VyLm5hbWV9fTwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgPHA+SGVybyBQb2ludHM6IDxzcGFuIGNsYXNzPVxcXCJyZWQtdGV4dFxcXCI+e3t1c2VyLnNjb3JlfX08L3NwYW4+IDxiciAvPlxcbiAgICAgICAgICAgICAgICBCYWRnZXM6IHt7dXNlci5iYWRnZXN9fVxcbiAgICAgICAgICAgICAgICBcXG4gICAgICAgICAgICAgICAgPC9wPlxcbiAgICAgICAgICAgICAgICA8YSBocmVmPVxcXCIjIVxcXCIgY2xhc3M9XFxcInNlY29uZGFyeS1jb250ZW50XFxcIj48aSBjbGFzcz1cXFwibWF0ZXJpYWwtaWNvbnNcXFwiPmdyYWRlPC9pPjwvYT5cXG4gICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigpIHtcbiAgICAgICAgdGhpcy51c2VycyA9IFt7XG4gICAgICAgICAgICBuYW1lOiAnQm9iIE0uJyxcbiAgICAgICAgICAgIHNjb3JlOiA0NSxcbiAgICAgICAgICAgIGltZzogMSxcbiAgICAgICAgICAgIGJhZGdlczogNVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBuYW1lOiAnR2VvcmdlIEouJyxcbiAgICAgICAgICAgIHNjb3JlOiA0MCxcbiAgICAgICAgICAgIGltZzogMixcbiAgICAgICAgICAgIGJhZGdlczogNVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBuYW1lOiAnSGVhdGhlciBSLicsXG4gICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICBpbWc6IDMsXG4gICAgICAgICAgICBiYWRnZXM6IDRcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbmFtZTogJ0thcmVuIFMuJyxcbiAgICAgICAgICAgIHNjb3JlOiAyMCxcbiAgICAgICAgICAgIGltZzogNCxcbiAgICAgICAgICAgIGJhZGdlczogMlxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBuYW1lOiAnU2FtbXkgUS4nLFxuICAgICAgICAgICAgc2NvcmU6IDUsXG4gICAgICAgICAgICBpbWc6IDUsXG4gICAgICAgICAgICBiYWRnZXM6IDFcbiAgICAgICAgfV07XG4gICAgfVxufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdsb2dpbkNvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcInJvd1xcXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29sIHMxMiBtNiBvZmZzZXQtbTNcXFwiPlxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkLXBhbmVsXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjYXJkLXRpdGxlXFxcIj5Mb2dpbjwvc3Bhbj5cXG5cXG4gICAgICAgICAgICAgICAgICAgIDxwPlRvIGFjY2VzcyBhZG1pbmlzdHJhdGlvbiBmZWF0dXJlcywgeW91J2xsIG5lZWQgdG8gbG9naW4uPC9wPlxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpbnB1dC1maWVsZD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgbmctbW9kZWw9XFxcIiRjdHJsLmVtYWlsXFxcIiB0eXBlPVxcXCJ0ZXh0XFxcIiBwbGFjZWhvbGRlcj1cXFwiWW91ciBFbWFpbCBBZGRyZXNzXFxcIiAvPlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGlucHV0LWZpZWxkPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuZy1tb2RlbD1cXFwiJGN0cmwucGFzc3dvcmRcXFwiIHR5cGU9XFxcInBhc3N3b3JkXFxcIiBwbGFjZWhvbGRlcj1cXFwiWW91ciBQYXNzd29yZFxcXCIgLz5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwicmlnaHRcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVxcXCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGdyZWVuIGFjY2VudC00XFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuZ28oKVxcXCI+U2lnbiBVcDwvYT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cXFwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBibHVlIGFjY2VudC00XFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuZ28oKVxcXCI+TG9naW48L2E+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDxiciBjbGFzcz1cXFwiY2xlYXJmaXhcXFwiIC8+XFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuICAgIFwiLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHN0YXRlKSB7XG4gICAgICAgIHRoaXMuZW1haWwgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuZ28gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUuYXBwcm92YWxzJyk7XG4gICAgICAgIH07XG4gICAgfVxufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnQ09OU1RBTlRTJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIEFQSV9VUkw6IFwiaHR0cDovLzEwNC4xOTcuMjA1LjEzMy9cIixcbiAgICAgICAgSEVSRToge1xuICAgICAgICAgICAgSUQ6IFwiTUpaN2hlSXpPYnBBV1llMHplOXVcIixcbiAgICAgICAgICAgIEFQUDogXCJMaFpVZFl4YzVUN3ZEeVA4dzBCak1nXCJcbiAgICAgICAgfVxuICAgIH07XG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKCdMb2NhdGlvblNlcnZpY2UnLCBmdW5jdGlvbiAoJHEpIHtcbiAgICBpZiAoIW5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xuICAgICAgICBhbGVydChcIllvdXIgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGdlb2xvY2F0aW9uLiBQbGVhc2UgdHJ5IGluIENocm9tZSwgRmlyZWZveCwgU2FmYXJpIG9yIEVkZ2VcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRMb2NhdGlvbjogZnVuY3Rpb24gZ2V0TG9jYXRpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24gKHBvcykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdDogcG9zLmNvb3Jkcy5sYXRpdHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25nOiBwb3MuY29vcmRzLmxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnUGhvdG9zU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgQ09OU1RBTlRTKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWxsOiBmdW5jdGlvbiBhbGwoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KENPTlNUQU5UUy5BUElfVVJMICsgXCIvcGhvdG9zXCIpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKFwiVXNlclNlcnZpY2VcIiwgZnVuY3Rpb24gKCkge30pOyIsImFuZ3VsYXIubW9kdWxlKFwiYXBwXCIsIFtcInVpLnJvdXRlclwiLCBcInVpLm1hdGVyaWFsaXplXCJdKVxuICAgIC5jb25maWcoWyckaHR0cFByb3ZpZGVyJywgZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLnVzZVhEb21haW4gPSB0cnVlO1xuICAgICAgICBkZWxldGUgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1SZXF1ZXN0ZWQtV2l0aCddO1xuICAgIH1cbl0pXG4gICAgLy8gLmNvbmZpZygoUGFyc2VQcm92aWRlcikgPT4ge1xuICAgIC8vICAgICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJ5ODVndkN2M3VVS2R2WmtIZlMzaXV0ZVJGaGRjVlFkaFJVdjl2TTZlXCIsIFwicFlvUXBnc0lDVGhyWkdYaFBmOGpTUFJuOGNINloxRG9zcmZPcW5qcVwiKVxuICAgIC8vIH0pOyIsImFuZ3VsYXIubW9kdWxlKFwiYXBwXCIpLmNvbmZpZygoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikgPT4ge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoXCIvXCIpO1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZShcImhvbWVcIiwge1xuICAgICAgICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICAgICAgICB1cmw6IFwiL1wiLFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwLWNvbXBvbmVudD48L2FwcC1jb21wb25lbnQ+XG4gICAgICAgICAgICBgXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZShcImhvbWUuaGlzdG9yeVwiLCB7XG4gICAgICAgICAgICB1cmw6IFwiXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxoaXN0b3J5LWNvbXBvbmVudD48L2hpc3RvcnktY29tcG9uZW50PlxuICAgICAgICAgICAgYFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoXCJob21lLmxvZ2luXCIsIHtcbiAgICAgICAgICAgIHVybDogXCIvbG9naW5cIixcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGxvZ2luLWNvbXBvbmVudD48L2xvZ2luLWNvbXBvbmVudD5cbiAgICAgICAgICAgIGBcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKFwiaG9tZS5sZWFkZXJib2FyZFwiLCB7XG4gICAgICAgICAgICB1cmw6IFwiL2xlYWRlcmJvYXJkXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxsZWFkZXJib2FyZC1jb21wb25lbnQ+PC9sZWFkZXJib2FyZC1jb21wb25lbnQ+XG4gICAgICAgICAgICBgXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZShcImhvbWUuYXBwcm92YWxzXCIsIHtcbiAgICAgICAgICAgIHVybDogXCIvYXBwcm92YWxzXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHByb3ZhbHMtY29tcG9uZW50PjwvYXBwcm92YWxzLWNvbXBvbmVudD5cbiAgICAgICAgICAgIGBcbiAgICAgICAgfSlcbjtcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2FwcENvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8aGVhZGVyLWNvbXBvbmVudD48L2hlYWRlci1jb21wb25lbnQ+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGRpdiB1aS12aWV3PjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgYFxuICAgIFxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnYXBwcm92YWxzQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxoMz5BcHByb3ZhbHMgTmVlZGVkPC9oMz5cbiAgICAgICAgPGg2IG5nLWlmPVwiISRjdHJsLml0ZW1zLmxlbmd0aFwiPk5vIGFwcHJvdmFscyBuZWVkZWQ8L2g2PlxuICAgICAgICA8aGlzdG9yeS1kZXRhaWwgaGlzdG9yeS1pdGVtcz1cIiRjdHJsLml0ZW1zXCI+PC9oaXN0b3J5LWRldGFpbD5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoUGhvdG9zU2VydmljZSkge1xuICAgICAgICBQaG90b3NTZXJ2aWNlLmFsbCgpXG4gICAgICAgICAgICAudGhlbih4cyA9PiB4cy5maWx0ZXIoeCA9PiAheC5hcHByb3ZlZCkpXG4gICAgICAgICAgICAudGhlbihwaG90b3MgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBwaG90b3M7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FwcHJvdmVkJywgcGhvdG9zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGhvdG9zO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufSkiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdoZWFkZXJDb21wb25lbnQnLCB7XG4gICAgY29udHJvbGxlcigpIHtcbiAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG4gICAgfSxcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB1c2VyOiBcIj1cIlxuICAgIH0sXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPG5hdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuYXYtd3JhcHBlclwiPlxuICAgICAgICAgICAgPGEgdWktc3JlZj1cImhvbWVcIiBjbGFzcz1cImJyYW5kLWxvZ29cIj5TdG9ybXdhdGVyIFJldGVudGlvbiBCYXNpbnM8L2E+XG4gICAgICAgICAgICA8dWwgaWQ9XCJuYXYtbW9iaWxlXCIgY2xhc3M9XCJyaWdodCBoaWRlLW9uLW1lZC1hbmQtZG93blwiPlxuICAgICAgICAgICAgICAgIDxsaT48YSB1aS1zcmVmPVwiLmxlYWRlcmJvYXJkXCI+TGVhZGVyYm9hcmRzPC9hPjwvbGk+XG4gICAgICAgICAgICAgICAgPGxpPjxhIHVpLXNyZWY9XCIubG9naW5cIj5TaWduIEluPC9hPjwvbGk+XG4gICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbmF2PlxuICAgIGAsXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdoaXN0b3J5RGV0YWlsJywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgXG4gICAgPGRpdiBjbGFzcz1cInJvd1wiIG5nLXJlcGVhdD1cIml0ZW0gaW4gJGN0cmwuaGlzdG9yeUl0ZW1zXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb2wgczEyIG0xMlwiIG5nLWlmPVwiaXRlbS5oaWRlICE9PSB0cnVlIHx8IGl0ZW0uYXBwcm92ZWRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1pbWFnZVwiPlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwie3tpdGVtLmltYWdlVVJMfX1cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNhcmQtdGl0bGVcIj5Mb2NhdGlvbiBEYXRhPC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCJ7eyRjdHJsLmdldEF2YXRhcigpfX1cIiBhbHQ9XCJcIiBjbGFzcz1cImNpcmNsZSBhdmF0YXJcIj5cbiAgICAgICAgICAgICAgICA8cD5DcmVhdGVkIGJ5OiBCb2IgUi4gb24ge3tpdGVtLmNyZWF0ZWQuZGF0ZX19IGluIHRoZSB7e2l0ZW0uem9uZX19PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1hY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cIml0ZW0uYXBwcm92ZWRcIiBuZy1jbGljaz1cIiRjdHJsLmNsb3NlKClcIj5DbG9zZTwvYT5cbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cIiFpdGVtLmFwcHJvdmVkXCIgbmctY2xpY2s9XCIkY3RybC5oaWRlKGl0ZW0pXCIgY2xhc3M9XCJncmVlbi10ZXh0IGRhcmtlbi00XCI+QXBwcm92ZTwvYT5cbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cIiFpdGVtLmFwcHJvdmVkXCIgbmctY2xpY2s9XCIkY3RybC5oaWRlKGl0ZW0pXCIgY2xhc3M9XCJyZWQtdGV4dCBkYXJrZW4tNFwiPkRpc2FwcHJvdmU8L2E+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgIFxuICAgIGAsXG4gICAgY29udHJvbGxlcihVc2VyU2VydmljZSwgJHJvb3RTY29wZSkge1xuICAgICAgICB0aGlzLmNsb3NlID0gKCkgPT4ge1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFwiY2xvc2U6aXRlbVwiKTtcbiAgICAgICAgfSAgICAgICAgXG5cbiAgICAgICAgdGhpcy5nZXRBdmF0YXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBudW1zID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldO1xuXG4gICAgICAgICAgICBjb25zdCBpZCA9IG51bXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbnVtcy5sZW5ndGgpXTtcbiAgICAgICAgICAgIHJldHVybiBgL2Rpc3BsYXkvaW1hZ2VzL3Byb2ZpbGVfJHtpZH0ucG5nYDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhpZGUgPSAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgaXRlbS5oaWRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaGlzdG9yeUl0ZW1zOiAnPSdcbiAgICB9XG4gICAgXG59KSIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2hpc3RvcnlDb21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGEgbmctY2xpY2s9XCIkY3RybC5zaG93KClcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCIgY2xhc3M9XCJzaG93LW1hcFwiPjwvYT5cbiAgICAgICAgPGRpdiBpZD1cIm1hcFwiPjwvZGl2PlxuICAgICAgICA8aGlzdG9yeS1kZXRhaWwgbmctaWY9XCIkY3RybC5jaG9zZW5faXRlbXMubGVuZ3RoXCIgaGlzdG9yeS1pdGVtcz1cIiRjdHJsLmNob3Nlbl9pdGVtc1wiPjwvaGlzdG9yeS1kZXRhaWw+XG4gICAgYCxcbiAgICBjb250cm9sbGVyKCRzY29wZSwgJHJvb3RTY29wZSwgTG9jYXRpb25TZXJ2aWNlLCBQaG90b3NTZXJ2aWNlLCBDT05TVEFOVFMpIHtcbiAgICAgICAgdGhpcy5tYXAgPSBudWxsO1xuICAgICAgICB0aGlzLnNob3cgPSAoKSA9PiB7IH07XG4gICAgICAgIHRoaXMuY2hvc2VuX2l0ZW1zID0gW107XG5cbiAgICAgICAgY29uc3QgaWNvbiA9IGA8c3ZnIHdpZHRoPVwiMTJcIiBoZWlnaHQ9XCIxMlwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3Qgc3Ryb2tlPVwid2hpdGVcIiBmaWxsPVwie31cIiB4PVwiMVwiIHk9XCIxXCIgd2lkdGg9XCIyMlwiIFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PVwiMjJcIiAvPjwvc3ZnPmA7XG5cbiAgICAgICAgJHNjb3BlLiRvbignY2xvc2U6aXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hvc2VuX2l0ZW1zID0gW107XG4gICAgICAgIH0pXG5cbiAgICAgICAgUGhvdG9zU2VydmljZS5hbGwoKVxuICAgICAgICAgICAgLnRoZW4ocGhvdG9zID0+IHtcbiAgICAgICAgICAgICAgICBwaG90b3MgPSBwaG90b3MuZmlsdGVyKHggPT4geC5hcHByb3ZlZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IHBob3RvcztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwaG90b3MpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwaG90b3M7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKHBob3RvcykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdChwaG90b3MpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pbml0ID0gKHBob3RvcykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGxhdGZvcm0gPSBuZXcgSC5zZXJ2aWNlLlBsYXRmb3JtKHtcbiAgICAgICAgICAgICAgICBhcHBfaWQ6IENPTlNUQU5UUy5IRVJFLklELFxuICAgICAgICAgICAgICAgIGFwcF9jb2RlOiBDT05TVEFOVFMuSEVSRS5BUFBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0cyA9IHBsYXRmb3JtLmNyZWF0ZURlZmF1bHRMYXllcnMoKTtcbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IG5ldyBILk1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwJyksXG4gICAgICAgICAgICAgICAgZGVmYXVsdHMubm9ybWFsLm1hcCxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGF0OiAyOS40MjQxLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG5nOiAtOTguNDkzNlxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB6b29tOiA3XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgdWkgPSBILnVpLlVJLmNyZWF0ZURlZmF1bHQobWFwLCBkZWZhdWx0cyk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHBob3RvIG9mIHBob3Rvcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBob3RvKTtcblxuICAgICAgICAgICAgICAgIGlmICghcGhvdG8uY29sb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChwaG90by5jb2xvcikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwib3JhbmdlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBwaG90by5jb2xvciA9IFwiI2ZmNjYwMFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJyZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob3RvLmNvbG9yID0gXCIjZWYzMTIzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcImdyZWVuXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBwaG90by5jb2xvciA9IFwiIzAwOTkzM1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9ICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgY29uc3QgdGhpc19pY29uID0gaWNvbi5yZXBsYWNlKFwie31cIiwgcGhvdG8uY29sb3IpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IHBsYWNlID0gbmV3IEgubWFwLkljb24odGhpc19pY29uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGxhdDogcGhvdG8ubGF0LFxuICAgICAgICAgICAgICAgICAgICBsbmc6IHBob3RvLmxvblxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgbWFya2VyID0gbmV3IEgubWFwLk1hcmtlcihjb29yZHMsIHsgaWNvbjogcGxhY2UsIGlkOiBwaG90by5pZCB9KVxuICAgICAgICAgICAgICAgIG1hcC5hZGRPYmplY3QobWFya2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbWFwX2V2ZW50cyA9IG5ldyBILm1hcGV2ZW50cy5NYXBFdmVudHMobWFwKTtcbiAgICAgICAgICAgIG1hcC5hZGRFdmVudExpc3RlbmVyKCd0YXAnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5pdGVtcy5maWx0ZXIoeCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlLnRhcmdldC5iYi5sYXQgPT0geC5sYXQgJiYgZS50YXJnZXQuYmIubG5nID09IHgubG9uO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TWFya2VyKGl0ZW1zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2hvd01hcmtlciA9IChpdGVtcykgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaG9zZW5faXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNob29zZSBpdGVtc1wiLCB0aGlzLmNob3Nlbl9pdGVtcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgJCgnLnNob3ctbWFwJykuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKTtcblxuICAgIH1cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2xlYWRlcmJvYXJkQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDx1bCBjbGFzcz1cImNvbGxlY3Rpb25cIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz1cImNvbGxlY3Rpb24taXRlbSBhdmF0YXJcIiBuZy1yZXBlYXQ9XCJ1c2VyIGluICRjdHJsLnVzZXJzXCI+XG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCIvZGlzcGxheS9pbWFnZXMvcHJvZmlsZV97e3VzZXIuaW1nfX0ucG5nXCIgYWx0PVwiXCIgY2xhc3M9XCJjaXJjbGVcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpdGxlXCI+e3t1c2VyLm5hbWV9fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8cD5IZXJvIFBvaW50czogPHNwYW4gY2xhc3M9XCJyZWQtdGV4dFwiPnt7dXNlci5zY29yZX19PC9zcGFuPiA8YnIgLz5cbiAgICAgICAgICAgICAgICBCYWRnZXM6IHt7dXNlci5iYWRnZXN9fVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiIyFcIiBjbGFzcz1cInNlY29uZGFyeS1jb250ZW50XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPmdyYWRlPC9pPjwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgYCxcbiAgICBjb250cm9sbGVyKCkge1xuICAgICAgICB0aGlzLnVzZXJzID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdCb2IgTS4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA0NSxcbiAgICAgICAgICAgICAgICBpbWc6IDEsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdHZW9yZ2UgSi4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA0MCxcbiAgICAgICAgICAgICAgICBpbWc6IDIsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdIZWF0aGVyIFIuJyxcbiAgICAgICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICAgICAgaW1nOiAzLFxuICAgICAgICAgICAgICAgIGJhZGdlczogNFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnS2FyZW4gUy4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiAyMCxcbiAgICAgICAgICAgICAgICBpbWc6IDQsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiAyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdTYW1teSBRLicsXG4gICAgICAgICAgICAgICAgc2NvcmU6IDUsXG4gICAgICAgICAgICAgICAgaW1nOiA1LFxuICAgICAgICAgICAgICAgIGJhZGdlczogMVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnbG9naW5Db21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cInJvd1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBzMTIgbTYgb2Zmc2V0LW0zXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXJkLXRpdGxlXCI+TG9naW48L3NwYW4+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+VG8gYWNjZXNzIGFkbWluaXN0cmF0aW9uIGZlYXR1cmVzLCB5b3UnbGwgbmVlZCB0byBsb2dpbi48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaW5wdXQtZmllbGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgbmctbW9kZWw9XCIkY3RybC5lbWFpbFwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJZb3VyIEVtYWlsIEFkZHJlc3NcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpbnB1dC1maWVsZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuZy1tb2RlbD1cIiRjdHJsLnBhc3N3b3JkXCIgdHlwZT1cInBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCJZb3VyIFBhc3N3b3JkXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gYWNjZW50LTRcIiBuZy1jbGljaz1cIiRjdHJsLmdvKClcIj5TaWduIFVwPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGJsdWUgYWNjZW50LTRcIiBuZy1jbGljaz1cIiRjdHJsLmdvKClcIj5Mb2dpbjwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxiciBjbGFzcz1cImNsZWFyZml4XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoJHN0YXRlKSB7XG4gICAgICAgIHRoaXMuZW1haWwgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuZ28gPSAoKSA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUuYXBwcm92YWxzJyk7XG4gICAgICAgIH1cbiAgICB9XG59KSIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKCdDT05TVEFOVFMnLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgQVBJX1VSTDogXCJodHRwOi8vMTA0LjE5Ny4yMDUuMTMzL1wiLFxuICAgICAgICBIRVJFOiB7XG4gICAgICAgICAgICBJRDogXCJNSlo3aGVJek9icEFXWWUwemU5dVwiLFxuICAgICAgICAgICAgQVBQOiBcIkxoWlVkWXhjNVQ3dkR5UDh3MEJqTWdcIlxuICAgICAgICB9XG4gICAgfVxufSkiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnTG9jYXRpb25TZXJ2aWNlJywgKCRxKSA9PiB7XG4gICAgaWYgKCFuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcbiAgICAgICAgYWxlcnQoXCJZb3VyIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBnZW9sb2NhdGlvbi4gUGxlYXNlIHRyeSBpbiBDaHJvbWUsIEZpcmVmb3gsIFNhZmFyaSBvciBFZGdlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0TG9jYXRpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJHEoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oKHBvcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdDogcG9zLmNvb3Jkcy5sYXRpdHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25nOiBwb3MuY29vcmRzLmxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnUGhvdG9zU2VydmljZScsICgkaHR0cCwgQ09OU1RBTlRTKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWxsKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChgJHtDT05TVEFOVFMuQVBJX1VSTH0vcGhvdG9zYClcbiAgICAgICAgICAgICAgICAudGhlbihyZXMgPT4gcmVzLmRhdGEpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZShcIlVzZXJTZXJ2aWNlXCIsICgpID0+IHtcbiAgICBcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
