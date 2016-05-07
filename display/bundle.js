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
    template: "\n    \n    <div class=\"row\" ng-repeat=\"item in $ctrl.historyItems\">\n        <div class=\"col s12 m12\" ng-if=\"item.hide !== true || item.approved\">\n            <div class=\"card\">\n            <div class=\"card-image\">\n                <img src=\"{{item.imageURL}}\">\n                <span class=\"card-title\">Location Data</span>\n            </div>\n            <div class=\"card-content\">\n                <img src=\"{{$ctrl.getAvatar()}}\" alt=\"\" class=\"circle avatar\">\n                <p>Created by: {{$ctrl.getName()}} on {{item.created.date}} in the {{item.zone}}</p>\n            </div>\n            <div class=\"card-action\">\n                <a ng-if=\"item.approved\" ng-click=\"$ctrl.close()\">Close</a>\n                <a ng-if=\"!item.approved\" ng-click=\"$ctrl.hide(item)\" class=\"green-text darken-4\">Approve</a>\n                <a ng-if=\"!item.approved\" ng-click=\"$ctrl.hide(item)\" class=\"red-text darken-4\">Disapprove</a>\n            </div>\n            </div>\n        </div>\n    </div>\n    ",
    controller: ["UserService", "$rootScope", function controller(UserService, $rootScope) {
        this.close = function () {
            $rootScope.$broadcast("close:item");
        };

        this.getName = function () {
            var names = [{
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

            return names[Math.floor(Math.random() * names.length)].name;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyIsIm1haW4uanMiLCJyb3V0ZXMuanMiLCJjb21wb25lbnRzL2FwcC5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2FwcHJvdmFscy5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2hlYWRlci5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2hpc3RvcnktZGV0YWlsLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvaGlzdG9yeS5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2xlYWRlcmJvYXJkLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvbG9naW4uY29tcG9uZW50LmpzIiwib2JqZWN0cy9jb25zdGFudHMub2JqZWN0LmpzIiwic2VydmljZXMvTG9jYXRpb25TZXJ2aWNlLmpzIiwic2VydmljZXMvUGhvdG9zU2VydmljZS5qcyIsInNlcnZpY2VzL3VzZXIuc2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxRQUFBLE9BQUEsT0FBQSxDQUFBLGFBQUEsbUJBQ0EsT0FBQSxDQUFBLGlCQUFBLFVBQUEsZUFBQTtJQUNBLGNBQUEsU0FBQSxhQUFBO0lBQ0EsT0FBQSxjQUFBLFNBQUEsUUFBQSxPQUFBOzs7OztBQ0hBLFFBQUEsT0FBQSxPQUFBLGdEQUFBLFVBQUEsZ0JBQUEsb0JBQUE7SUFDQSxtQkFBQSxVQUFBO0lBQ0EsZUFDQSxNQUFBLFFBQUE7UUFDQSxVQUFBO1FBQ0EsS0FBQTtRQUNBLFVBQUE7T0FJQSxNQUFBLGdCQUFBO1FBQ0EsS0FBQTtRQUNBLFVBQUE7T0FJQSxNQUFBLGNBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTtPQUlBLE1BQUEsb0JBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTtPQUlBLE1BQUEsa0JBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTs7O0FDOUJBLFFBQUEsT0FBQSxPQUFBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBOzs7QUNEQSxRQUFBLE9BQUEsT0FBQSxVQUFBLHNCQUFBO0lBQ0EsVUFB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QUE7ZUFDQSxNQUFBLFVBQUEsS0FBQTtnQkFBQSxPQUFBLFFBQUEsTUFBQTs7Ozs7O0FDTEEsUUFBQSxPQUFBLE9BQUEsUUFBQSxlQUFBLFlBQUEsSUFBQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuYW5ndWxhci5tb2R1bGUoXCJhcHBcIiwgW1widWkucm91dGVyXCIsIFwidWkubWF0ZXJpYWxpemVcIl0pLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCBmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMudXNlWERvbWFpbiA9IHRydWU7XG4gICAgZGVsZXRlICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtUmVxdWVzdGVkLVdpdGgnXTtcbn1dKTtcbi8vIC5jb25maWcoKFBhcnNlUHJvdmlkZXIpID0+IHtcbi8vICAgICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJ5ODVndkN2M3VVS2R2WmtIZlMzaXV0ZVJGaGRjVlFkaFJVdjl2TTZlXCIsIFwicFlvUXBnc0lDVGhyWkdYaFBmOGpTUFJuOGNINloxRG9zcmZPcW5qcVwiKVxuLy8gfSk7XG5hbmd1bGFyLm1vZHVsZShcImFwcFwiKS5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL1wiKTtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZShcImhvbWVcIiwge1xuICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgdXJsOiBcIi9cIixcbiAgICAgICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICAgICAgICAgIDxhcHAtY29tcG9uZW50PjwvYXBwLWNvbXBvbmVudD5cXG4gICAgICAgICAgICBcIlxuICAgIH0pLnN0YXRlKFwiaG9tZS5oaXN0b3J5XCIsIHtcbiAgICAgICAgdXJsOiBcIlwiLFxuICAgICAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgICAgICAgICAgPGhpc3RvcnktY29tcG9uZW50PjwvaGlzdG9yeS1jb21wb25lbnQ+XFxuICAgICAgICAgICAgXCJcbiAgICB9KS5zdGF0ZShcImhvbWUubG9naW5cIiwge1xuICAgICAgICB1cmw6IFwiL2xvZ2luXCIsXG4gICAgICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgICAgICAgICA8bG9naW4tY29tcG9uZW50PjwvbG9naW4tY29tcG9uZW50PlxcbiAgICAgICAgICAgIFwiXG4gICAgfSkuc3RhdGUoXCJob21lLmxlYWRlcmJvYXJkXCIsIHtcbiAgICAgICAgdXJsOiBcIi9sZWFkZXJib2FyZFwiLFxuICAgICAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgICAgICAgICAgPGxlYWRlcmJvYXJkLWNvbXBvbmVudD48L2xlYWRlcmJvYXJkLWNvbXBvbmVudD5cXG4gICAgICAgICAgICBcIlxuICAgIH0pLnN0YXRlKFwiaG9tZS5hcHByb3ZhbHNcIiwge1xuICAgICAgICB1cmw6IFwiL2FwcHJvdmFsc1wiLFxuICAgICAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgICAgICAgICAgPGFwcHJvdmFscy1jb21wb25lbnQ+PC9hcHByb3ZhbHMtY29tcG9uZW50PlxcbiAgICAgICAgICAgIFwiXG4gICAgfSk7XG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2FwcENvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgIDxoZWFkZXItY29tcG9uZW50PjwvaGVhZGVyLWNvbXBvbmVudD5cXG5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbnRhaW5lclxcXCI+XFxuICAgICAgICAgICAgPGRpdiB1aS12aWV3PjwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgICBcXG4gICAgXCJcblxufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdhcHByb3ZhbHNDb21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8aDM+QXBwcm92YWxzIE5lZWRlZDwvaDM+XFxuICAgICAgICA8aDYgbmctaWY9XFxcIiEkY3RybC5pdGVtcy5sZW5ndGhcXFwiPk5vIGFwcHJvdmFscyBuZWVkZWQ8L2g2PlxcbiAgICAgICAgPGhpc3RvcnktZGV0YWlsIGhpc3RvcnktaXRlbXM9XFxcIiRjdHJsLml0ZW1zXFxcIj48L2hpc3RvcnktZGV0YWlsPlxcbiAgICBcIixcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKFBob3Rvc1NlcnZpY2UpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBQaG90b3NTZXJ2aWNlLmFsbCgpLnRoZW4oZnVuY3Rpb24gKHhzKSB7XG4gICAgICAgICAgICByZXR1cm4geHMuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICF4LmFwcHJvdmVkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHBob3Rvcykge1xuICAgICAgICAgICAgX3RoaXMuaXRlbXMgPSBwaG90b3M7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnYXBwcm92ZWQnLCBwaG90b3MpO1xuICAgICAgICAgICAgcmV0dXJuIHBob3RvcztcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdoZWFkZXJDb21wb25lbnQnLCB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigpIHtcbiAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG4gICAgfSxcblxuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHVzZXI6IFwiPVwiXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgIDxuYXY+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwibmF2LXdyYXBwZXJcXFwiPlxcbiAgICAgICAgICAgIDxhIHVpLXNyZWY9XFxcImhvbWVcXFwiIGNsYXNzPVxcXCJicmFuZC1sb2dvXFxcIj5TdG9ybXdhdGVyIFJldGVudGlvbiBCYXNpbnM8L2E+XFxuICAgICAgICAgICAgPHVsIGlkPVxcXCJuYXYtbW9iaWxlXFxcIiBjbGFzcz1cXFwicmlnaHQgaGlkZS1vbi1tZWQtYW5kLWRvd25cXFwiPlxcbiAgICAgICAgICAgICAgICA8bGk+PGEgdWktc3JlZj1cXFwiLmxlYWRlcmJvYXJkXFxcIj5MZWFkZXJib2FyZHM8L2E+PC9saT5cXG4gICAgICAgICAgICAgICAgPGxpPjxhIHVpLXNyZWY9XFxcIi5sb2dpblxcXCI+U2lnbiBJbjwvYT48L2xpPlxcbiAgICAgICAgICAgIDwvdWw+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L25hdj5cXG4gICAgXCJcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGlzdG9yeURldGFpbCcsIHtcbiAgICB0ZW1wbGF0ZTogXCJcXG4gICAgXFxuICAgIDxkaXYgY2xhc3M9XFxcInJvd1xcXCIgbmctcmVwZWF0PVxcXCJpdGVtIGluICRjdHJsLmhpc3RvcnlJdGVtc1xcXCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb2wgczEyIG0xMlxcXCIgbmctaWY9XFxcIml0ZW0uaGlkZSAhPT0gdHJ1ZSB8fCBpdGVtLmFwcHJvdmVkXFxcIj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkXFxcIj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkLWltYWdlXFxcIj5cXG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XFxcInt7aXRlbS5pbWFnZVVSTH19XFxcIj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNhcmQtdGl0bGVcXFwiPkxvY2F0aW9uIERhdGE8L3NwYW4+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZC1jb250ZW50XFxcIj5cXG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XFxcInt7JGN0cmwuZ2V0QXZhdGFyKCl9fVxcXCIgYWx0PVxcXCJcXFwiIGNsYXNzPVxcXCJjaXJjbGUgYXZhdGFyXFxcIj5cXG4gICAgICAgICAgICAgICAgPHA+Q3JlYXRlZCBieToge3skY3RybC5nZXROYW1lKCl9fSBvbiB7e2l0ZW0uY3JlYXRlZC5kYXRlfX0gaW4gdGhlIHt7aXRlbS56b25lfX08L3A+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZC1hY3Rpb25cXFwiPlxcbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cXFwiaXRlbS5hcHByb3ZlZFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmNsb3NlKClcXFwiPkNsb3NlPC9hPlxcbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cXFwiIWl0ZW0uYXBwcm92ZWRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5oaWRlKGl0ZW0pXFxcIiBjbGFzcz1cXFwiZ3JlZW4tdGV4dCBkYXJrZW4tNFxcXCI+QXBwcm92ZTwvYT5cXG4gICAgICAgICAgICAgICAgPGEgbmctaWY9XFxcIiFpdGVtLmFwcHJvdmVkXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuaGlkZShpdGVtKVxcXCIgY2xhc3M9XFxcInJlZC10ZXh0IGRhcmtlbi00XFxcIj5EaXNhcHByb3ZlPC9hPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgICBcIixcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKFVzZXJTZXJ2aWNlLCAkcm9vdFNjb3BlKSB7XG4gICAgICAgIHRoaXMuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoXCJjbG9zZTppdGVtXCIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TmFtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBuYW1lcyA9IFt7XG4gICAgICAgICAgICAgICAgbmFtZTogJ0JvYiBNLicsXG4gICAgICAgICAgICAgICAgc2NvcmU6IDQ1LFxuICAgICAgICAgICAgICAgIGltZzogMSxcbiAgICAgICAgICAgICAgICBiYWRnZXM6IDVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnR2VvcmdlIEouJyxcbiAgICAgICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICAgICAgaW1nOiAyLFxuICAgICAgICAgICAgICAgIGJhZGdlczogNVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdIZWF0aGVyIFIuJyxcbiAgICAgICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICAgICAgaW1nOiAzLFxuICAgICAgICAgICAgICAgIGJhZGdlczogNFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdLYXJlbiBTLicsXG4gICAgICAgICAgICAgICAgc2NvcmU6IDIwLFxuICAgICAgICAgICAgICAgIGltZzogNCxcbiAgICAgICAgICAgICAgICBiYWRnZXM6IDJcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnU2FtbXkgUS4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA1LFxuICAgICAgICAgICAgICAgIGltZzogNSxcbiAgICAgICAgICAgICAgICBiYWRnZXM6IDFcbiAgICAgICAgICAgIH1dO1xuXG4gICAgICAgICAgICByZXR1cm4gbmFtZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbmFtZXMubGVuZ3RoKV0ubmFtZTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldEF2YXRhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBudW1zID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldO1xuXG4gICAgICAgICAgICB2YXIgaWQgPSBudW1zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG51bXMubGVuZ3RoKV07XG4gICAgICAgICAgICByZXR1cm4gXCIvZGlzcGxheS9pbWFnZXMvcHJvZmlsZV9cIiArIGlkICsgXCIucG5nXCI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5oaWRlID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGl0ZW0uaGlkZSA9IHRydWU7XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIGhpc3RvcnlJdGVtczogJz0nXG4gICAgfVxuXG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2hpc3RvcnlDb21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8YSBuZy1jbGljaz1cXFwiJGN0cmwuc2hvdygpXFxcIiBzdHlsZT1cXFwiZGlzcGxheTogbm9uZTtcXFwiIGNsYXNzPVxcXCJzaG93LW1hcFxcXCI+PC9hPlxcbiAgICAgICAgPGRpdiBpZD1cXFwibWFwXFxcIj48L2Rpdj5cXG4gICAgICAgIDxoaXN0b3J5LWRldGFpbCBuZy1pZj1cXFwiJGN0cmwuY2hvc2VuX2l0ZW1zLmxlbmd0aFxcXCIgaGlzdG9yeS1pdGVtcz1cXFwiJGN0cmwuY2hvc2VuX2l0ZW1zXFxcIj48L2hpc3RvcnktZGV0YWlsPlxcbiAgICBcIixcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCRzY29wZSwgJHJvb3RTY29wZSwgTG9jYXRpb25TZXJ2aWNlLCBQaG90b3NTZXJ2aWNlLCBDT05TVEFOVFMpIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5tYXAgPSBudWxsO1xuICAgICAgICB0aGlzLnNob3cgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgdGhpcy5jaG9zZW5faXRlbXMgPSBbXTtcblxuICAgICAgICB2YXIgaWNvbiA9IFwiPHN2ZyB3aWR0aD1cXFwiMTJcXFwiIGhlaWdodD1cXFwiMTJcXFwiIFxcbiAgICAgICAgICAgICAgICAgICAgICAgIHhtbG5zPVxcXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3Qgc3Ryb2tlPVxcXCJ3aGl0ZVxcXCIgZmlsbD1cXFwie31cXFwiIHg9XFxcIjFcXFwiIHk9XFxcIjFcXFwiIHdpZHRoPVxcXCIyMlxcXCIgXFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PVxcXCIyMlxcXCIgLz48L3N2Zz5cIjtcblxuICAgICAgICAkc2NvcGUuJG9uKCdjbG9zZTppdGVtJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMyLmNob3Nlbl9pdGVtcyA9IFtdO1xuICAgICAgICB9KTtcblxuICAgICAgICBQaG90b3NTZXJ2aWNlLmFsbCgpLnRoZW4oZnVuY3Rpb24gKHBob3Rvcykge1xuICAgICAgICAgICAgcGhvdG9zID0gcGhvdG9zLmZpbHRlcihmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LmFwcHJvdmVkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfdGhpczIuaXRlbXMgPSBwaG90b3M7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwaG90b3MpO1xuICAgICAgICAgICAgcmV0dXJuIHBob3RvcztcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocGhvdG9zKSB7XG4gICAgICAgICAgICBfdGhpczIuaW5pdChwaG90b3MpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmluaXQgPSBmdW5jdGlvbiAocGhvdG9zKSB7XG4gICAgICAgICAgICB2YXIgcGxhdGZvcm0gPSBuZXcgSC5zZXJ2aWNlLlBsYXRmb3JtKHtcbiAgICAgICAgICAgICAgICBhcHBfaWQ6IENPTlNUQU5UUy5IRVJFLklELFxuICAgICAgICAgICAgICAgIGFwcF9jb2RlOiBDT05TVEFOVFMuSEVSRS5BUFBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgZGVmYXVsdHMgPSBwbGF0Zm9ybS5jcmVhdGVEZWZhdWx0TGF5ZXJzKCk7XG4gICAgICAgICAgICB2YXIgbWFwID0gbmV3IEguTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSwgZGVmYXVsdHMubm9ybWFsLm1hcCwge1xuICAgICAgICAgICAgICAgIGNlbnRlcjoge1xuICAgICAgICAgICAgICAgICAgICBsYXQ6IDI5LjQyNDEsXG4gICAgICAgICAgICAgICAgICAgIGxuZzogLTk4LjQ5MzZcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHpvb206IDdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgdWkgPSBILnVpLlVJLmNyZWF0ZURlZmF1bHQobWFwLCBkZWZhdWx0cyk7XG5cbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHBob3Rvc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBob3RvID0gX3N0ZXAudmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocGhvdG8pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghcGhvdG8uY29sb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChwaG90by5jb2xvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm9yYW5nZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBob3RvLmNvbG9yID0gXCIjZmY2NjAwXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwicmVkXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhvdG8uY29sb3IgPSBcIiNlZjMxMjNcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJncmVlblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBob3RvLmNvbG9yID0gXCIjMDA5OTMzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNfaWNvbiA9IGljb24ucmVwbGFjZShcInt9XCIsIHBob3RvLmNvbG9yKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcGxhY2UgPSBuZXcgSC5tYXAuSWNvbih0aGlzX2ljb24pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGF0OiBwaG90by5sYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsbmc6IHBob3RvLmxvblxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IEgubWFwLk1hcmtlcihjb29yZHMsIHsgaWNvbjogcGxhY2UsIGlkOiBwaG90by5pZCB9KTtcbiAgICAgICAgICAgICAgICAgICAgbWFwLmFkZE9iamVjdChtYXJrZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBtYXBfZXZlbnRzID0gbmV3IEgubWFwZXZlbnRzLk1hcEV2ZW50cyhtYXApO1xuICAgICAgICAgICAgbWFwLmFkZEV2ZW50TGlzdGVuZXIoJ3RhcCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gX3RoaXMyLml0ZW1zLmZpbHRlcihmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS50YXJnZXQuYmIubGF0ID09IHgubGF0ICYmIGUudGFyZ2V0LmJiLmxuZyA9PSB4LmxvbjtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIF90aGlzMi5zaG93TWFya2VyKGl0ZW1zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2hvd01hcmtlciA9IGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLmNob3Nlbl9pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2hvb3NlIGl0ZW1zXCIsIF90aGlzMi5jaG9zZW5faXRlbXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKF90aGlzMi5pdGVtcykge1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICQoJy5zaG93LW1hcCcpLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEwMCk7XG4gICAgfVxufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdsZWFkZXJib2FyZENvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgIDx1bCBjbGFzcz1cXFwiY29sbGVjdGlvblxcXCI+XFxuICAgICAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2xsZWN0aW9uLWl0ZW0gYXZhdGFyXFxcIiBuZy1yZXBlYXQ9XFxcInVzZXIgaW4gJGN0cmwudXNlcnNcXFwiPlxcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cXFwiL2Rpc3BsYXkvaW1hZ2VzL3Byb2ZpbGVfe3t1c2VyLmltZ319LnBuZ1xcXCIgYWx0PVxcXCJcXFwiIGNsYXNzPVxcXCJjaXJjbGVcXFwiPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwidGl0bGVcXFwiPnt7dXNlci5uYW1lfX08L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxwPkhlcm8gUG9pbnRzOiA8c3BhbiBjbGFzcz1cXFwicmVkLXRleHRcXFwiPnt7dXNlci5zY29yZX19PC9zcGFuPiA8YnIgLz5cXG4gICAgICAgICAgICAgICAgQmFkZ2VzOiB7e3VzZXIuYmFkZ2VzfX1cXG4gICAgICAgICAgICAgICAgXFxuICAgICAgICAgICAgICAgIDwvcD5cXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwiIyFcXFwiIGNsYXNzPVxcXCJzZWNvbmRhcnktY29udGVudFxcXCI+PGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj5ncmFkZTwvaT48L2E+XFxuICAgICAgICAgICAgPC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgIFwiLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIHRoaXMudXNlcnMgPSBbe1xuICAgICAgICAgICAgbmFtZTogJ0JvYiBNLicsXG4gICAgICAgICAgICBzY29yZTogNDUsXG4gICAgICAgICAgICBpbWc6IDEsXG4gICAgICAgICAgICBiYWRnZXM6IDVcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbmFtZTogJ0dlb3JnZSBKLicsXG4gICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICBpbWc6IDIsXG4gICAgICAgICAgICBiYWRnZXM6IDVcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbmFtZTogJ0hlYXRoZXIgUi4nLFxuICAgICAgICAgICAgc2NvcmU6IDQwLFxuICAgICAgICAgICAgaW1nOiAzLFxuICAgICAgICAgICAgYmFkZ2VzOiA0XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG5hbWU6ICdLYXJlbiBTLicsXG4gICAgICAgICAgICBzY29yZTogMjAsXG4gICAgICAgICAgICBpbWc6IDQsXG4gICAgICAgICAgICBiYWRnZXM6IDJcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbmFtZTogJ1NhbW15IFEuJyxcbiAgICAgICAgICAgIHNjb3JlOiA1LFxuICAgICAgICAgICAgaW1nOiA1LFxuICAgICAgICAgICAgYmFkZ2VzOiAxXG4gICAgICAgIH1dO1xuICAgIH1cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnbG9naW5Db21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbCBzMTIgbTYgb2Zmc2V0LW0zXFxcIj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZC1wYW5lbFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiY2FyZC10aXRsZVxcXCI+TG9naW48L3NwYW4+XFxuXFxuICAgICAgICAgICAgICAgICAgICA8cD5UbyBhY2Nlc3MgYWRtaW5pc3RyYXRpb24gZmVhdHVyZXMsIHlvdSdsbCBuZWVkIHRvIGxvZ2luLjwvcD5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaW5wdXQtZmllbGQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IG5nLW1vZGVsPVxcXCIkY3RybC5lbWFpbFxcXCIgdHlwZT1cXFwidGV4dFxcXCIgcGxhY2Vob2xkZXI9XFxcIllvdXIgRW1haWwgQWRkcmVzc1xcXCIgLz5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpbnB1dC1maWVsZD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgbmctbW9kZWw9XFxcIiRjdHJsLnBhc3N3b3JkXFxcIiB0eXBlPVxcXCJwYXNzd29yZFxcXCIgcGxhY2Vob2xkZXI9XFxcIllvdXIgUGFzc3dvcmRcXFwiIC8+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJpZ2h0XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cXFwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBncmVlbiBhY2NlbnQtNFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmdvKClcXFwiPlNpZ24gVXA8L2E+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XFxcIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gYmx1ZSBhY2NlbnQtNFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmdvKClcXFwiPkxvZ2luPC9hPlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICA8YnIgY2xhc3M9XFxcImNsZWFyZml4XFxcIiAvPlxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICBcIixcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCRzdGF0ZSkge1xuICAgICAgICB0aGlzLmVtYWlsID0gbnVsbDtcblxuICAgICAgICB0aGlzLmdvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lLmFwcHJvdmFscycpO1xuICAgICAgICB9O1xuICAgIH1cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnNlcnZpY2UoJ0NPTlNUQU5UUycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBBUElfVVJMOiBcImh0dHA6Ly8xMDQuMTk3LjIwNS4xMzMvXCIsXG4gICAgICAgIEhFUkU6IHtcbiAgICAgICAgICAgIElEOiBcIk1KWjdoZUl6T2JwQVdZZTB6ZTl1XCIsXG4gICAgICAgICAgICBBUFA6IFwiTGhaVWRZeGM1VDd2RHlQOHcwQmpNZ1wiXG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnTG9jYXRpb25TZXJ2aWNlJywgZnVuY3Rpb24gKCRxKSB7XG4gICAgaWYgKCFuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcbiAgICAgICAgYWxlcnQoXCJZb3VyIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBnZW9sb2NhdGlvbi4gUGxlYXNlIHRyeSBpbiBDaHJvbWUsIEZpcmVmb3gsIFNhZmFyaSBvciBFZGdlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0TG9jYXRpb246IGZ1bmN0aW9uIGdldExvY2F0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXQ6IHBvcy5jb29yZHMubGF0aXR1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZzogcG9zLmNvb3Jkcy5sb25naXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiA4XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnNlcnZpY2UoJ1Bob3Rvc1NlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIENPTlNUQU5UUykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGFsbDogZnVuY3Rpb24gYWxsKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChDT05TVEFOVFMuQVBJX1VSTCArIFwiL3Bob3Rvc1wiKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZShcIlVzZXJTZXJ2aWNlXCIsIGZ1bmN0aW9uICgpIHt9KTsiLCJhbmd1bGFyLm1vZHVsZShcImFwcFwiLCBbXCJ1aS5yb3V0ZXJcIiwgXCJ1aS5tYXRlcmlhbGl6ZVwiXSlcbiAgICAuY29uZmlnKFsnJGh0dHBQcm92aWRlcicsIGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAgICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy51c2VYRG9tYWluID0gdHJ1ZTtcbiAgICAgICAgZGVsZXRlICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtUmVxdWVzdGVkLVdpdGgnXTtcbiAgICB9XG5dKVxuICAgIC8vIC5jb25maWcoKFBhcnNlUHJvdmlkZXIpID0+IHtcbiAgICAvLyAgICAgUGFyc2VQcm92aWRlci5pbml0aWFsaXplKFwieTg1Z3ZDdjN1VUtkdlprSGZTM2l1dGVSRmhkY1ZRZGhSVXY5dk02ZVwiLCBcInBZb1FwZ3NJQ1RoclpHWGhQZjhqU1BSbjhjSDZaMURvc3JmT3FuanFcIilcbiAgICAvLyB9KTsiLCJhbmd1bGFyLm1vZHVsZShcImFwcFwiKS5jb25maWcoKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpID0+IHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL1wiKTtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoXCJob21lXCIsIHtcbiAgICAgICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICAgICAgdXJsOiBcIi9cIixcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGFwcC1jb21wb25lbnQ+PC9hcHAtY29tcG9uZW50PlxuICAgICAgICAgICAgYFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoXCJob21lLmhpc3RvcnlcIiwge1xuICAgICAgICAgICAgdXJsOiBcIlwiLFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8aGlzdG9yeS1jb21wb25lbnQ+PC9oaXN0b3J5LWNvbXBvbmVudD5cbiAgICAgICAgICAgIGBcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKFwiaG9tZS5sb2dpblwiLCB7XG4gICAgICAgICAgICB1cmw6IFwiL2xvZ2luXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxsb2dpbi1jb21wb25lbnQ+PC9sb2dpbi1jb21wb25lbnQ+XG4gICAgICAgICAgICBgXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZShcImhvbWUubGVhZGVyYm9hcmRcIiwge1xuICAgICAgICAgICAgdXJsOiBcIi9sZWFkZXJib2FyZFwiLFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8bGVhZGVyYm9hcmQtY29tcG9uZW50PjwvbGVhZGVyYm9hcmQtY29tcG9uZW50PlxuICAgICAgICAgICAgYFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoXCJob21lLmFwcHJvdmFsc1wiLCB7XG4gICAgICAgICAgICB1cmw6IFwiL2FwcHJvdmFsc1wiLFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwcm92YWxzLWNvbXBvbmVudD48L2FwcHJvdmFscy1jb21wb25lbnQ+XG4gICAgICAgICAgICBgXG4gICAgICAgIH0pXG47XG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdhcHBDb21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGhlYWRlci1jb21wb25lbnQ+PC9oZWFkZXItY29tcG9uZW50PlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cbiAgICAgICAgICAgIDxkaXYgdWktdmlldz48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIFxuICAgIGBcbiAgICBcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2FwcHJvdmFsc0NvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8aDM+QXBwcm92YWxzIE5lZWRlZDwvaDM+XG4gICAgICAgIDxoNiBuZy1pZj1cIiEkY3RybC5pdGVtcy5sZW5ndGhcIj5ObyBhcHByb3ZhbHMgbmVlZGVkPC9oNj5cbiAgICAgICAgPGhpc3RvcnktZGV0YWlsIGhpc3RvcnktaXRlbXM9XCIkY3RybC5pdGVtc1wiPjwvaGlzdG9yeS1kZXRhaWw+XG4gICAgYCxcbiAgICBjb250cm9sbGVyKFBob3Rvc1NlcnZpY2UpIHtcbiAgICAgICAgUGhvdG9zU2VydmljZS5hbGwoKVxuICAgICAgICAgICAgLnRoZW4oeHMgPT4geHMuZmlsdGVyKHggPT4gIXguYXBwcm92ZWQpKVxuICAgICAgICAgICAgLnRoZW4ocGhvdG9zID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gcGhvdG9zO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhcHByb3ZlZCcsIHBob3Rvcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBob3RvcztcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGVhZGVyQ29tcG9uZW50Jywge1xuICAgIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgIH0sXG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgdXNlcjogXCI9XCJcbiAgICB9LFxuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxuYXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwibmF2LXdyYXBwZXJcIj5cbiAgICAgICAgICAgIDxhIHVpLXNyZWY9XCJob21lXCIgY2xhc3M9XCJicmFuZC1sb2dvXCI+U3Rvcm13YXRlciBSZXRlbnRpb24gQmFzaW5zPC9hPlxuICAgICAgICAgICAgPHVsIGlkPVwibmF2LW1vYmlsZVwiIGNsYXNzPVwicmlnaHQgaGlkZS1vbi1tZWQtYW5kLWRvd25cIj5cbiAgICAgICAgICAgICAgICA8bGk+PGEgdWktc3JlZj1cIi5sZWFkZXJib2FyZFwiPkxlYWRlcmJvYXJkczwvYT48L2xpPlxuICAgICAgICAgICAgICAgIDxsaT48YSB1aS1zcmVmPVwiLmxvZ2luXCI+U2lnbiBJbjwvYT48L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L25hdj5cbiAgICBgLFxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGlzdG9yeURldGFpbCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgIFxuICAgIDxkaXYgY2xhc3M9XCJyb3dcIiBuZy1yZXBlYXQ9XCJpdGVtIGluICRjdHJsLmhpc3RvcnlJdGVtc1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sIHMxMiBtMTJcIiBuZy1pZj1cIml0ZW0uaGlkZSAhPT0gdHJ1ZSB8fCBpdGVtLmFwcHJvdmVkXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtaW1hZ2VcIj5cbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cInt7aXRlbS5pbWFnZVVSTH19XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXJkLXRpdGxlXCI+TG9jYXRpb24gRGF0YTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtY29udGVudFwiPlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwie3skY3RybC5nZXRBdmF0YXIoKX19XCIgYWx0PVwiXCIgY2xhc3M9XCJjaXJjbGUgYXZhdGFyXCI+XG4gICAgICAgICAgICAgICAgPHA+Q3JlYXRlZCBieToge3skY3RybC5nZXROYW1lKCl9fSBvbiB7e2l0ZW0uY3JlYXRlZC5kYXRlfX0gaW4gdGhlIHt7aXRlbS56b25lfX08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWFjdGlvblwiPlxuICAgICAgICAgICAgICAgIDxhIG5nLWlmPVwiaXRlbS5hcHByb3ZlZFwiIG5nLWNsaWNrPVwiJGN0cmwuY2xvc2UoKVwiPkNsb3NlPC9hPlxuICAgICAgICAgICAgICAgIDxhIG5nLWlmPVwiIWl0ZW0uYXBwcm92ZWRcIiBuZy1jbGljaz1cIiRjdHJsLmhpZGUoaXRlbSlcIiBjbGFzcz1cImdyZWVuLXRleHQgZGFya2VuLTRcIj5BcHByb3ZlPC9hPlxuICAgICAgICAgICAgICAgIDxhIG5nLWlmPVwiIWl0ZW0uYXBwcm92ZWRcIiBuZy1jbGljaz1cIiRjdHJsLmhpZGUoaXRlbSlcIiBjbGFzcz1cInJlZC10ZXh0IGRhcmtlbi00XCI+RGlzYXBwcm92ZTwvYT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICAgIGAsXG4gICAgY29udHJvbGxlcihVc2VyU2VydmljZSwgJHJvb3RTY29wZSkge1xuICAgICAgICB0aGlzLmNsb3NlID0gKCkgPT4ge1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFwiY2xvc2U6aXRlbVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ2V0TmFtZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVzID0gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0JvYiBNLicsXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlOiA0NSxcbiAgICAgICAgICAgICAgICAgICAgaW1nOiAxLFxuICAgICAgICAgICAgICAgICAgICBiYWRnZXM6IDVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0dlb3JnZSBKLicsXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlOiA0MCxcbiAgICAgICAgICAgICAgICAgICAgaW1nOiAyLFxuICAgICAgICAgICAgICAgICAgICBiYWRnZXM6IDVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0hlYXRoZXIgUi4nLFxuICAgICAgICAgICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICAgICAgICAgIGltZzogMyxcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2VzOiA0XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdLYXJlbiBTLicsXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlOiAyMCxcbiAgICAgICAgICAgICAgICAgICAgaW1nOiA0LFxuICAgICAgICAgICAgICAgICAgICBiYWRnZXM6IDJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1NhbW15IFEuJyxcbiAgICAgICAgICAgICAgICAgICAgc2NvcmU6IDUsXG4gICAgICAgICAgICAgICAgICAgIGltZzogNSxcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2VzOiAxXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgcmV0dXJuIG5hbWVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG5hbWVzLmxlbmd0aCldLm5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdldEF2YXRhciA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG51bXMgPSBbMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV07XG5cbiAgICAgICAgICAgIGNvbnN0IGlkID0gbnVtc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBudW1zLmxlbmd0aCldO1xuICAgICAgICAgICAgcmV0dXJuIGAvZGlzcGxheS9pbWFnZXMvcHJvZmlsZV8ke2lkfS5wbmdgO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaGlkZSA9IChpdGVtKSA9PiB7XG4gICAgICAgICAgICBpdGVtLmhpZGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBoaXN0b3J5SXRlbXM6ICc9J1xuICAgIH1cblxufSkiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdoaXN0b3J5Q29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxhIG5nLWNsaWNrPVwiJGN0cmwuc2hvdygpXCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiIGNsYXNzPVwic2hvdy1tYXBcIj48L2E+XG4gICAgICAgIDxkaXYgaWQ9XCJtYXBcIj48L2Rpdj5cbiAgICAgICAgPGhpc3RvcnktZGV0YWlsIG5nLWlmPVwiJGN0cmwuY2hvc2VuX2l0ZW1zLmxlbmd0aFwiIGhpc3RvcnktaXRlbXM9XCIkY3RybC5jaG9zZW5faXRlbXNcIj48L2hpc3RvcnktZGV0YWlsPlxuICAgIGAsXG4gICAgY29udHJvbGxlcigkc2NvcGUsICRyb290U2NvcGUsIExvY2F0aW9uU2VydmljZSwgUGhvdG9zU2VydmljZSwgQ09OU1RBTlRTKSB7XG4gICAgICAgIHRoaXMubWFwID0gbnVsbDtcbiAgICAgICAgdGhpcy5zaG93ID0gKCkgPT4geyB9O1xuICAgICAgICB0aGlzLmNob3Nlbl9pdGVtcyA9IFtdO1xuXG4gICAgICAgIGNvbnN0IGljb24gPSBgPHN2ZyB3aWR0aD1cIjEyXCIgaGVpZ2h0PVwiMTJcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IHN0cm9rZT1cIndoaXRlXCIgZmlsbD1cInt9XCIgeD1cIjFcIiB5PVwiMVwiIHdpZHRoPVwiMjJcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjIyXCIgLz48L3N2Zz5gO1xuXG4gICAgICAgICRzY29wZS4kb24oJ2Nsb3NlOml0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNob3Nlbl9pdGVtcyA9IFtdO1xuICAgICAgICB9KVxuXG4gICAgICAgIFBob3Rvc1NlcnZpY2UuYWxsKClcbiAgICAgICAgICAgIC50aGVuKHBob3RvcyA9PiB7XG4gICAgICAgICAgICAgICAgcGhvdG9zID0gcGhvdG9zLmZpbHRlcih4ID0+IHguYXBwcm92ZWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBwaG90b3M7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocGhvdG9zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGhvdG9zO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChwaG90b3MpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQocGhvdG9zKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaW5pdCA9IChwaG90b3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBsYXRmb3JtID0gbmV3IEguc2VydmljZS5QbGF0Zm9ybSh7XG4gICAgICAgICAgICAgICAgYXBwX2lkOiBDT05TVEFOVFMuSEVSRS5JRCxcbiAgICAgICAgICAgICAgICBhcHBfY29kZTogQ09OU1RBTlRTLkhFUkUuQVBQXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdHMgPSBwbGF0Zm9ybS5jcmVhdGVEZWZhdWx0TGF5ZXJzKCk7XG4gICAgICAgICAgICBjb25zdCBtYXAgPSBuZXcgSC5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRzLm5vcm1hbC5tYXAsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhdDogMjkuNDI0MSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxuZzogLTk4LjQ5MzZcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgem9vbTogN1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IHVpID0gSC51aS5VSS5jcmVhdGVEZWZhdWx0KG1hcCwgZGVmYXVsdHMpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBwaG90byBvZiBwaG90b3MpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwaG90byk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIXBob3RvLmNvbG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN3aXRjaCAocGhvdG8uY29sb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIm9yYW5nZVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgcGhvdG8uY29sb3IgPSBcIiNmZjY2MDBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwicmVkXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBwaG90by5jb2xvciA9IFwiI2VmMzEyM1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJncmVlblwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgcGhvdG8uY29sb3IgPSBcIiMwMDk5MzNcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfSAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgIGNvbnN0IHRoaXNfaWNvbiA9IGljb24ucmVwbGFjZShcInt9XCIsIHBob3RvLmNvbG9yKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBwbGFjZSA9IG5ldyBILm1hcC5JY29uKHRoaXNfaWNvbik7XG4gICAgICAgICAgICAgICAgY29uc3QgY29vcmRzID0ge1xuICAgICAgICAgICAgICAgICAgICBsYXQ6IHBob3RvLmxhdCxcbiAgICAgICAgICAgICAgICAgICAgbG5nOiBwaG90by5sb25cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IG1hcmtlciA9IG5ldyBILm1hcC5NYXJrZXIoY29vcmRzLCB7IGljb246IHBsYWNlLCBpZDogcGhvdG8uaWQgfSlcbiAgICAgICAgICAgICAgICBtYXAuYWRkT2JqZWN0KG1hcmtlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG1hcF9ldmVudHMgPSBuZXcgSC5tYXBldmVudHMuTWFwRXZlbnRzKG1hcCk7XG4gICAgICAgICAgICBtYXAuYWRkRXZlbnRMaXN0ZW5lcigndGFwJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpdGVtcyA9IHRoaXMuaXRlbXMuZmlsdGVyKHggPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS50YXJnZXQuYmIubGF0ID09IHgubGF0ICYmIGUudGFyZ2V0LmJiLmxuZyA9PSB4LmxvbjtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd01hcmtlcihpdGVtcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNob3dNYXJrZXIgPSAoaXRlbXMpID0+IHtcbiAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hvc2VuX2l0ZW1zID0gaXRlbXM7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDaG9vc2UgaXRlbXNcIiwgdGhpcy5jaG9zZW5faXRlbXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5pdGVtcykge1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICQoJy5zaG93LW1hcCcpLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEwMCk7XG5cbiAgICB9XG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdsZWFkZXJib2FyZENvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8dWwgY2xhc3M9XCJjb2xsZWN0aW9uXCI+XG4gICAgICAgICAgICA8bGkgY2xhc3M9XCJjb2xsZWN0aW9uLWl0ZW0gYXZhdGFyXCIgbmctcmVwZWF0PVwidXNlciBpbiAkY3RybC51c2Vyc1wiPlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwiL2Rpc3BsYXkvaW1hZ2VzL3Byb2ZpbGVfe3t1c2VyLmltZ319LnBuZ1wiIGFsdD1cIlwiIGNsYXNzPVwiY2lyY2xlXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJ0aXRsZVwiPnt7dXNlci5uYW1lfX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHA+SGVybyBQb2ludHM6IDxzcGFuIGNsYXNzPVwicmVkLXRleHRcIj57e3VzZXIuc2NvcmV9fTwvc3Bhbj4gPGJyIC8+XG4gICAgICAgICAgICAgICAgQmFkZ2VzOiB7e3VzZXIuYmFkZ2VzfX1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIiMhXCIgY2xhc3M9XCJzZWNvbmRhcnktY29udGVudFwiPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5ncmFkZTwvaT48L2E+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICA8L3VsPlxuICAgIGAsXG4gICAgY29udHJvbGxlcigpIHtcbiAgICAgICAgdGhpcy51c2VycyA9IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnQm9iIE0uJyxcbiAgICAgICAgICAgICAgICBzY29yZTogNDUsXG4gICAgICAgICAgICAgICAgaW1nOiAxLFxuICAgICAgICAgICAgICAgIGJhZGdlczogNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnR2VvcmdlIEouJyxcbiAgICAgICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICAgICAgaW1nOiAyLFxuICAgICAgICAgICAgICAgIGJhZGdlczogNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnSGVhdGhlciBSLicsXG4gICAgICAgICAgICAgICAgc2NvcmU6IDQwLFxuICAgICAgICAgICAgICAgIGltZzogMyxcbiAgICAgICAgICAgICAgICBiYWRnZXM6IDRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ0thcmVuIFMuJyxcbiAgICAgICAgICAgICAgICBzY29yZTogMjAsXG4gICAgICAgICAgICAgICAgaW1nOiA0LFxuICAgICAgICAgICAgICAgIGJhZGdlczogMlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnU2FtbXkgUS4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA1LFxuICAgICAgICAgICAgICAgIGltZzogNSxcbiAgICAgICAgICAgICAgICBiYWRnZXM6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgXTtcbiAgICB9XG59KSIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2xvZ2luQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wgczEyIG02IG9mZnNldC1tM1wiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLXBhbmVsXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2FyZC10aXRsZVwiPkxvZ2luPC9zcGFuPlxuXG4gICAgICAgICAgICAgICAgICAgIDxwPlRvIGFjY2VzcyBhZG1pbmlzdHJhdGlvbiBmZWF0dXJlcywgeW91J2xsIG5lZWQgdG8gbG9naW4uPC9wPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGlucHV0LWZpZWxkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IG5nLW1vZGVsPVwiJGN0cmwuZW1haWxcIiB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiWW91ciBFbWFpbCBBZGRyZXNzXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaW5wdXQtZmllbGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgbmctbW9kZWw9XCIkY3RybC5wYXNzd29yZFwiIHR5cGU9XCJwYXNzd29yZFwiIHBsYWNlaG9sZGVyPVwiWW91ciBQYXNzd29yZFwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJyaWdodFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGdyZWVuIGFjY2VudC00XCIgbmctY2xpY2s9XCIkY3RybC5nbygpXCI+U2lnbiBVcDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBibHVlIGFjY2VudC00XCIgbmctY2xpY2s9XCIkY3RybC5nbygpXCI+TG9naW48L2E+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8YnIgY2xhc3M9XCJjbGVhcmZpeFwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgYCxcbiAgICBjb250cm9sbGVyKCRzdGF0ZSkge1xuICAgICAgICB0aGlzLmVtYWlsID0gbnVsbDtcblxuICAgICAgICB0aGlzLmdvID0gKCkgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lLmFwcHJvdmFscycpO1xuICAgICAgICB9XG4gICAgfVxufSkiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnQ09OU1RBTlRTJywgKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIEFQSV9VUkw6IFwiaHR0cDovLzEwNC4xOTcuMjA1LjEzMy9cIixcbiAgICAgICAgSEVSRToge1xuICAgICAgICAgICAgSUQ6IFwiTUpaN2hlSXpPYnBBV1llMHplOXVcIixcbiAgICAgICAgICAgIEFQUDogXCJMaFpVZFl4YzVUN3ZEeVA4dzBCak1nXCJcbiAgICAgICAgfVxuICAgIH1cbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnNlcnZpY2UoJ0xvY2F0aW9uU2VydmljZScsICgkcSkgPT4ge1xuICAgIGlmICghbmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XG4gICAgICAgIGFsZXJ0KFwiWW91ciBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgZ2VvbG9jYXRpb24uIFBsZWFzZSB0cnkgaW4gQ2hyb21lLCBGaXJlZm94LCBTYWZhcmkgb3IgRWRnZVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldExvY2F0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRxKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKChwb3MpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXQ6IHBvcy5jb29yZHMubGF0aXR1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZzogcG9zLmNvb3Jkcy5sb25naXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiA4XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnNlcnZpY2UoJ1Bob3Rvc1NlcnZpY2UnLCAoJGh0dHAsIENPTlNUQU5UUykgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGFsbCgpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoYCR7Q09OU1RBTlRTLkFQSV9VUkx9L3Bob3Rvc2ApXG4gICAgICAgICAgICAgICAgLnRoZW4ocmVzID0+IHJlcy5kYXRhKVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnNlcnZpY2UoXCJVc2VyU2VydmljZVwiLCAoKSA9PiB7XG4gICAgXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
