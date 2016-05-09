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

            var bounds = new H.map.Overlay(new H.geo.Rect(30.785718, -100.558504, 28.990952, -96.976527), '/display/images/map_gc.png');
            map.addObject(bounds);

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = photos[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var photo = _step.value;


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
    function colorToHex(xs) {
        return xs.map(function (x) {
            switch (x.color) {
                case "orange":
                    x.color = "#ff6600";
                    break;
                case "red":
                    x.color = "#ef3123";
                    break;
                case "green":
                    x.color = "#009933";
                    break;
                default:
                    x.color = "#009933";
                    break;
            }

            return x;
        });
    }

    return {
        all: function all() {
            return $http.get(CONSTANTS.API_URL + "/photos").then(function (res) {
                return res.data;
            }).then(colorToHex).catch(function (err) {
                return console.error(err);
            });
        }
    };
}]);

angular.module('app').service("UserService", function () {});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyIsIm1haW4uanMiLCJyb3V0ZXMuanMiLCJjb21wb25lbnRzL2FwcC5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2FwcHJvdmFscy5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2hlYWRlci5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2hpc3RvcnktZGV0YWlsLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvaGlzdG9yeS5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2xlYWRlcmJvYXJkLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvbG9naW4uY29tcG9uZW50LmpzIiwib2JqZWN0cy9jb25zdGFudHMub2JqZWN0LmpzIiwic2VydmljZXMvTG9jYXRpb25TZXJ2aWNlLmpzIiwic2VydmljZXMvUGhvdG9zU2VydmljZS5qcyIsInNlcnZpY2VzL3VzZXIuc2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxRQUFBLE9BQUEsT0FBQSxDQUFBLGFBQUEsbUJBQ0EsT0FBQSxDQUFBLGlCQUFBLFVBQUEsZUFBQTtJQUNBLGNBQUEsU0FBQSxhQUFBO0lBQ0EsT0FBQSxjQUFBLFNBQUEsUUFBQSxPQUFBOzs7OztBQ0hBLFFBQUEsT0FBQSxPQUFBLGdEQUFBLFVBQUEsZ0JBQUEsb0JBQUE7SUFDQSxtQkFBQSxVQUFBO0lBQ0EsZUFDQSxNQUFBLFFBQUE7UUFDQSxVQUFBO1FBQ0EsS0FBQTtRQUNBLFVBQUE7T0FJQSxNQUFBLGdCQUFBO1FBQ0EsS0FBQTtRQUNBLFVBQUE7T0FJQSxNQUFBLGNBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTtPQUlBLE1BQUEsb0JBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTtPQUlBLE1BQUEsa0JBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTs7O0FDOUJBLFFBQUEsT0FBQSxPQUFBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBOzs7QUNEQSxRQUFBLE9BQUEsT0FBQSxVQUFBLHNCQUFBO0lBQ0EsVUFB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QkFDQSxFQUFBLFFBQUE7b0JBQ0E7OztZQUdBLE9BQUE7Ozs7SUFJQSxPQUFBO1FBQ0EsS0FEQSxTQUFBLE1BQ0E7WUFDQSxPQUFBLE1BQUEsSUFBQSxVQUFBLFVBQUEsV0FDQSxLQUFBLFVBQUEsS0FBQTtnQkFBQSxPQUFBLElBQUE7ZUFDQSxLQUFBLFlBQ0EsTUFBQSxVQUFBLEtBQUE7Z0JBQUEsT0FBQSxRQUFBLE1BQUE7Ozs7OztBQzNCQSxRQUFBLE9BQUEsT0FBQSxRQUFBLGVBQUEsWUFBQSxJQUFBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5hbmd1bGFyLm1vZHVsZShcImFwcFwiLCBbXCJ1aS5yb3V0ZXJcIiwgXCJ1aS5tYXRlcmlhbGl6ZVwiXSkuY29uZmlnKFsnJGh0dHBQcm92aWRlcicsIGZ1bmN0aW9uICgkaHR0cFByb3ZpZGVyKSB7XG4gICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy51c2VYRG9tYWluID0gdHJ1ZTtcbiAgICBkZWxldGUgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1SZXF1ZXN0ZWQtV2l0aCddO1xufV0pO1xuLy8gLmNvbmZpZygoUGFyc2VQcm92aWRlcikgPT4ge1xuLy8gICAgIFBhcnNlUHJvdmlkZXIuaW5pdGlhbGl6ZShcInk4NWd2Q3YzdVVLZHZaa0hmUzNpdXRlUkZoZGNWUWRoUlV2OXZNNmVcIiwgXCJwWW9RcGdzSUNUaHJaR1hoUGY4alNQUm44Y0g2WjFEb3NyZk9xbmpxXCIpXG4vLyB9KTtcbmFuZ3VsYXIubW9kdWxlKFwiYXBwXCIpLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoXCIvXCIpO1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKFwiaG9tZVwiLCB7XG4gICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICB1cmw6IFwiL1wiLFxuICAgICAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgICAgICAgICAgPGFwcC1jb21wb25lbnQ+PC9hcHAtY29tcG9uZW50PlxcbiAgICAgICAgICAgIFwiXG4gICAgfSkuc3RhdGUoXCJob21lLmhpc3RvcnlcIiwge1xuICAgICAgICB1cmw6IFwiXCIsXG4gICAgICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgICAgICAgICA8aGlzdG9yeS1jb21wb25lbnQ+PC9oaXN0b3J5LWNvbXBvbmVudD5cXG4gICAgICAgICAgICBcIlxuICAgIH0pLnN0YXRlKFwiaG9tZS5sb2dpblwiLCB7XG4gICAgICAgIHVybDogXCIvbG9naW5cIixcbiAgICAgICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICAgICAgICAgIDxsb2dpbi1jb21wb25lbnQ+PC9sb2dpbi1jb21wb25lbnQ+XFxuICAgICAgICAgICAgXCJcbiAgICB9KS5zdGF0ZShcImhvbWUubGVhZGVyYm9hcmRcIiwge1xuICAgICAgICB1cmw6IFwiL2xlYWRlcmJvYXJkXCIsXG4gICAgICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgICAgICAgICA8bGVhZGVyYm9hcmQtY29tcG9uZW50PjwvbGVhZGVyYm9hcmQtY29tcG9uZW50PlxcbiAgICAgICAgICAgIFwiXG4gICAgfSkuc3RhdGUoXCJob21lLmFwcHJvdmFsc1wiLCB7XG4gICAgICAgIHVybDogXCIvYXBwcm92YWxzXCIsXG4gICAgICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgICAgICAgICA8YXBwcm92YWxzLWNvbXBvbmVudD48L2FwcHJvdmFscy1jb21wb25lbnQ+XFxuICAgICAgICAgICAgXCJcbiAgICB9KTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnYXBwQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgPGhlYWRlci1jb21wb25lbnQ+PC9oZWFkZXItY29tcG9uZW50PlxcblxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29udGFpbmVyXFxcIj5cXG4gICAgICAgICAgICA8ZGl2IHVpLXZpZXc+PC9kaXY+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgICAgIFxcbiAgICBcIlxuXG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2FwcHJvdmFsc0NvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgIDxoMz5BcHByb3ZhbHMgTmVlZGVkPC9oMz5cXG4gICAgICAgIDxoNiBuZy1pZj1cXFwiISRjdHJsLml0ZW1zLmxlbmd0aFxcXCI+Tm8gYXBwcm92YWxzIG5lZWRlZDwvaDY+XFxuICAgICAgICA8aGlzdG9yeS1kZXRhaWwgaGlzdG9yeS1pdGVtcz1cXFwiJGN0cmwuaXRlbXNcXFwiPjwvaGlzdG9yeS1kZXRhaWw+XFxuICAgIFwiLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoUGhvdG9zU2VydmljZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIFBob3Rvc1NlcnZpY2UuYWxsKCkudGhlbihmdW5jdGlvbiAoeHMpIHtcbiAgICAgICAgICAgIHJldHVybiB4cy5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIXguYXBwcm92ZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocGhvdG9zKSB7XG4gICAgICAgICAgICBfdGhpcy5pdGVtcyA9IHBob3RvcztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhcHByb3ZlZCcsIHBob3Rvcyk7XG4gICAgICAgICAgICByZXR1cm4gcGhvdG9zO1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2hlYWRlckNvbXBvbmVudCcsIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCkge1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcbiAgICB9LFxuXG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgdXNlcjogXCI9XCJcbiAgICB9LFxuICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgPG5hdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJuYXYtd3JhcHBlclxcXCI+XFxuICAgICAgICAgICAgPGEgdWktc3JlZj1cXFwiaG9tZVxcXCIgY2xhc3M9XFxcImJyYW5kLWxvZ29cXFwiPlN0b3Jtd2F0ZXIgUmV0ZW50aW9uIEJhc2luczwvYT5cXG4gICAgICAgICAgICA8dWwgaWQ9XFxcIm5hdi1tb2JpbGVcXFwiIGNsYXNzPVxcXCJyaWdodCBoaWRlLW9uLW1lZC1hbmQtZG93blxcXCI+XFxuICAgICAgICAgICAgICAgIDxsaT48YSB1aS1zcmVmPVxcXCIubGVhZGVyYm9hcmRcXFwiPkxlYWRlcmJvYXJkczwvYT48L2xpPlxcbiAgICAgICAgICAgICAgICA8bGk+PGEgdWktc3JlZj1cXFwiLmxvZ2luXFxcIj5TaWduIEluPC9hPjwvbGk+XFxuICAgICAgICAgICAgPC91bD5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDwvbmF2PlxcbiAgICBcIlxufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdoaXN0b3J5RGV0YWlsJywge1xuICAgIHRlbXBsYXRlOiBcIlxcbiAgICBcXG4gICAgPGRpdiBjbGFzcz1cXFwicm93XFxcIiBuZy1yZXBlYXQ9XFxcIml0ZW0gaW4gJGN0cmwuaGlzdG9yeUl0ZW1zXFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbCBzMTIgbTEyXFxcIiBuZy1pZj1cXFwiaXRlbS5oaWRlICE9PSB0cnVlIHx8IGl0ZW0uYXBwcm92ZWRcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmRcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQtaW1hZ2VcXFwiPlxcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cXFwie3tpdGVtLmltYWdlVVJMfX1cXFwiPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiY2FyZC10aXRsZVxcXCI+TG9jYXRpb24gRGF0YTwvc3Bhbj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkLWNvbnRlbnRcXFwiPlxcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cXFwie3skY3RybC5nZXRBdmF0YXIoKX19XFxcIiBhbHQ9XFxcIlxcXCIgY2xhc3M9XFxcImNpcmNsZSBhdmF0YXJcXFwiPlxcbiAgICAgICAgICAgICAgICA8cD5DcmVhdGVkIGJ5OiB7eyRjdHJsLmdldE5hbWUoKX19IG9uIHt7aXRlbS5jcmVhdGVkLmRhdGV9fSBpbiB0aGUge3tpdGVtLnpvbmV9fTwvcD5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkLWFjdGlvblxcXCI+XFxuICAgICAgICAgICAgICAgIDxhIG5nLWlmPVxcXCJpdGVtLmFwcHJvdmVkXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuY2xvc2UoKVxcXCI+Q2xvc2U8L2E+XFxuICAgICAgICAgICAgICAgIDxhIG5nLWlmPVxcXCIhaXRlbS5hcHByb3ZlZFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmhpZGUoaXRlbSlcXFwiIGNsYXNzPVxcXCJncmVlbi10ZXh0IGRhcmtlbi00XFxcIj5BcHByb3ZlPC9hPlxcbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cXFwiIWl0ZW0uYXBwcm92ZWRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5oaWRlKGl0ZW0pXFxcIiBjbGFzcz1cXFwicmVkLXRleHQgZGFya2VuLTRcXFwiPkRpc2FwcHJvdmU8L2E+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgPC9kaXY+XFxuICAgIFwiLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoVXNlclNlcnZpY2UsICRyb290U2NvcGUpIHtcbiAgICAgICAgdGhpcy5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChcImNsb3NlOml0ZW1cIik7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXROYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG5hbWVzID0gW3tcbiAgICAgICAgICAgICAgICBuYW1lOiAnQm9iIE0uJyxcbiAgICAgICAgICAgICAgICBzY29yZTogNDUsXG4gICAgICAgICAgICAgICAgaW1nOiAxLFxuICAgICAgICAgICAgICAgIGJhZGdlczogNVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdHZW9yZ2UgSi4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA0MCxcbiAgICAgICAgICAgICAgICBpbWc6IDIsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ0hlYXRoZXIgUi4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA0MCxcbiAgICAgICAgICAgICAgICBpbWc6IDMsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiA0XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ0thcmVuIFMuJyxcbiAgICAgICAgICAgICAgICBzY29yZTogMjAsXG4gICAgICAgICAgICAgICAgaW1nOiA0LFxuICAgICAgICAgICAgICAgIGJhZGdlczogMlxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdTYW1teSBRLicsXG4gICAgICAgICAgICAgICAgc2NvcmU6IDUsXG4gICAgICAgICAgICAgICAgaW1nOiA1LFxuICAgICAgICAgICAgICAgIGJhZGdlczogMVxuICAgICAgICAgICAgfV07XG5cbiAgICAgICAgICAgIHJldHVybiBuYW1lc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuYW1lcy5sZW5ndGgpXS5uYW1lO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0QXZhdGFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG51bXMgPSBbMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOV07XG5cbiAgICAgICAgICAgIHZhciBpZCA9IG51bXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbnVtcy5sZW5ndGgpXTtcbiAgICAgICAgICAgIHJldHVybiBcIi9kaXNwbGF5L2ltYWdlcy9wcm9maWxlX1wiICsgaWQgKyBcIi5wbmdcIjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhpZGUgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5oaWRlID0gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaGlzdG9yeUl0ZW1zOiAnPSdcbiAgICB9XG5cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGlzdG9yeUNvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgIDxhIG5nLWNsaWNrPVxcXCIkY3RybC5zaG93KClcXFwiIHN0eWxlPVxcXCJkaXNwbGF5OiBub25lO1xcXCIgY2xhc3M9XFxcInNob3ctbWFwXFxcIj48L2E+XFxuICAgICAgICA8ZGl2IGlkPVxcXCJtYXBcXFwiPjwvZGl2PlxcbiAgICAgICAgPGhpc3RvcnktZGV0YWlsIG5nLWlmPVxcXCIkY3RybC5jaG9zZW5faXRlbXMubGVuZ3RoXFxcIiBoaXN0b3J5LWl0ZW1zPVxcXCIkY3RybC5jaG9zZW5faXRlbXNcXFwiPjwvaGlzdG9yeS1kZXRhaWw+XFxuICAgIFwiLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBMb2NhdGlvblNlcnZpY2UsIFBob3Rvc1NlcnZpY2UsIENPTlNUQU5UUykge1xuICAgICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgICB0aGlzLm1hcCA9IG51bGw7XG4gICAgICAgIHRoaXMuc2hvdyA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICB0aGlzLmNob3Nlbl9pdGVtcyA9IFtdO1xuXG4gICAgICAgIHZhciBpY29uID0gXCI8c3ZnIHdpZHRoPVxcXCIxMlxcXCIgaGVpZ2h0PVxcXCIxMlxcXCIgXFxuICAgICAgICAgICAgICAgICAgICAgICAgeG1sbnM9XFxcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBzdHJva2U9XFxcIndoaXRlXFxcIiBmaWxsPVxcXCJ7fVxcXCIgeD1cXFwiMVxcXCIgeT1cXFwiMVxcXCIgd2lkdGg9XFxcIjIyXFxcIiBcXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XFxcIjIyXFxcIiAvPjwvc3ZnPlwiO1xuXG4gICAgICAgICRzY29wZS4kb24oJ2Nsb3NlOml0ZW0nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpczIuY2hvc2VuX2l0ZW1zID0gW107XG4gICAgICAgIH0pO1xuXG4gICAgICAgIFBob3Rvc1NlcnZpY2UuYWxsKCkudGhlbihmdW5jdGlvbiAocGhvdG9zKSB7XG4gICAgICAgICAgICBwaG90b3MgPSBwaG90b3MuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHguYXBwcm92ZWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIF90aGlzMi5pdGVtcyA9IHBob3RvcztcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBob3Rvcyk7XG4gICAgICAgICAgICByZXR1cm4gcGhvdG9zO1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChwaG90b3MpIHtcbiAgICAgICAgICAgIF90aGlzMi5pbml0KHBob3Rvcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaW5pdCA9IGZ1bmN0aW9uIChwaG90b3MpIHtcbiAgICAgICAgICAgIHZhciBwbGF0Zm9ybSA9IG5ldyBILnNlcnZpY2UuUGxhdGZvcm0oe1xuICAgICAgICAgICAgICAgIGFwcF9pZDogQ09OU1RBTlRTLkhFUkUuSUQsXG4gICAgICAgICAgICAgICAgYXBwX2NvZGU6IENPTlNUQU5UUy5IRVJFLkFQUFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBkZWZhdWx0cyA9IHBsYXRmb3JtLmNyZWF0ZURlZmF1bHRMYXllcnMoKTtcbiAgICAgICAgICAgIHZhciBtYXAgPSBuZXcgSC5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLCBkZWZhdWx0cy5ub3JtYWwubWFwLCB7XG4gICAgICAgICAgICAgICAgY2VudGVyOiB7XG4gICAgICAgICAgICAgICAgICAgIGxhdDogMjkuNDI0MSxcbiAgICAgICAgICAgICAgICAgICAgbG5nOiAtOTguNDkzNlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgem9vbTogN1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciB1aSA9IEgudWkuVUkuY3JlYXRlRGVmYXVsdChtYXAsIGRlZmF1bHRzKTtcblxuICAgICAgICAgICAgdmFyIGJvdW5kcyA9IG5ldyBILm1hcC5PdmVybGF5KG5ldyBILmdlby5SZWN0KDMwLjc4NTcxOCwgLTEwMC41NTg1MDQsIDI4Ljk5MDk1MiwgLTk2Ljk3NjUyNyksICcvZGlzcGxheS9pbWFnZXMvbWFwX2djLnBuZycpO1xuICAgICAgICAgICAgbWFwLmFkZE9iamVjdChib3VuZHMpO1xuXG4gICAgICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgICAgICAgICB2YXIgX2RpZEl0ZXJhdG9yRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JFcnJvciA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBwaG90b3NbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwaG90byA9IF9zdGVwLnZhbHVlO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNfaWNvbiA9IGljb24ucmVwbGFjZShcInt9XCIsIHBob3RvLmNvbG9yKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcGxhY2UgPSBuZXcgSC5tYXAuSWNvbih0aGlzX2ljb24pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29vcmRzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGF0OiBwaG90by5sYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsbmc6IHBob3RvLmxvblxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IEgubWFwLk1hcmtlcihjb29yZHMsIHsgaWNvbjogcGxhY2UsIGlkOiBwaG90by5pZCB9KTtcbiAgICAgICAgICAgICAgICAgICAgbWFwLmFkZE9iamVjdChtYXJrZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIF9kaWRJdGVyYXRvckVycm9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvci5yZXR1cm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9pdGVyYXRvci5yZXR1cm4oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgX2l0ZXJhdG9yRXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBtYXBfZXZlbnRzID0gbmV3IEgubWFwZXZlbnRzLk1hcEV2ZW50cyhtYXApO1xuICAgICAgICAgICAgbWFwLmFkZEV2ZW50TGlzdGVuZXIoJ3RhcCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW1zID0gX3RoaXMyLml0ZW1zLmZpbHRlcihmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZS50YXJnZXQuYmIubGF0ID09IHgubGF0ICYmIGUudGFyZ2V0LmJiLmxuZyA9PSB4LmxvbjtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIF90aGlzMi5zaG93TWFya2VyKGl0ZW1zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2hvd01hcmtlciA9IGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLmNob3Nlbl9pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2hvb3NlIGl0ZW1zXCIsIF90aGlzMi5jaG9zZW5faXRlbXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKF90aGlzMi5pdGVtcykge1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICQoJy5zaG93LW1hcCcpLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEwMCk7XG4gICAgfVxufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdsZWFkZXJib2FyZENvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgIDx1bCBjbGFzcz1cXFwiY29sbGVjdGlvblxcXCI+XFxuICAgICAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2xsZWN0aW9uLWl0ZW0gYXZhdGFyXFxcIiBuZy1yZXBlYXQ9XFxcInVzZXIgaW4gJGN0cmwudXNlcnNcXFwiPlxcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cXFwiL2Rpc3BsYXkvaW1hZ2VzL3Byb2ZpbGVfe3t1c2VyLmltZ319LnBuZ1xcXCIgYWx0PVxcXCJcXFwiIGNsYXNzPVxcXCJjaXJjbGVcXFwiPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwidGl0bGVcXFwiPnt7dXNlci5uYW1lfX08L3NwYW4+XFxuICAgICAgICAgICAgICAgIDxwPkhlcm8gUG9pbnRzOiA8c3BhbiBjbGFzcz1cXFwicmVkLXRleHRcXFwiPnt7dXNlci5zY29yZX19PC9zcGFuPiA8YnIgLz5cXG4gICAgICAgICAgICAgICAgQmFkZ2VzOiB7e3VzZXIuYmFkZ2VzfX1cXG4gICAgICAgICAgICAgICAgXFxuICAgICAgICAgICAgICAgIDwvcD5cXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cXFwiIyFcXFwiIGNsYXNzPVxcXCJzZWNvbmRhcnktY29udGVudFxcXCI+PGkgY2xhc3M9XFxcIm1hdGVyaWFsLWljb25zXFxcIj5ncmFkZTwvaT48L2E+XFxuICAgICAgICAgICAgPC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgIFwiLFxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIHRoaXMudXNlcnMgPSBbe1xuICAgICAgICAgICAgbmFtZTogJ0JvYiBNLicsXG4gICAgICAgICAgICBzY29yZTogNDUsXG4gICAgICAgICAgICBpbWc6IDEsXG4gICAgICAgICAgICBiYWRnZXM6IDVcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbmFtZTogJ0dlb3JnZSBKLicsXG4gICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICBpbWc6IDIsXG4gICAgICAgICAgICBiYWRnZXM6IDVcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbmFtZTogJ0hlYXRoZXIgUi4nLFxuICAgICAgICAgICAgc2NvcmU6IDQwLFxuICAgICAgICAgICAgaW1nOiAzLFxuICAgICAgICAgICAgYmFkZ2VzOiA0XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG5hbWU6ICdLYXJlbiBTLicsXG4gICAgICAgICAgICBzY29yZTogMjAsXG4gICAgICAgICAgICBpbWc6IDQsXG4gICAgICAgICAgICBiYWRnZXM6IDJcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgbmFtZTogJ1NhbW15IFEuJyxcbiAgICAgICAgICAgIHNjb3JlOiA1LFxuICAgICAgICAgICAgaW1nOiA1LFxuICAgICAgICAgICAgYmFkZ2VzOiAxXG4gICAgICAgIH1dO1xuICAgIH1cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnbG9naW5Db21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbCBzMTIgbTYgb2Zmc2V0LW0zXFxcIj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZC1wYW5lbFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiY2FyZC10aXRsZVxcXCI+TG9naW48L3NwYW4+XFxuXFxuICAgICAgICAgICAgICAgICAgICA8cD5UbyBhY2Nlc3MgYWRtaW5pc3RyYXRpb24gZmVhdHVyZXMsIHlvdSdsbCBuZWVkIHRvIGxvZ2luLjwvcD5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaW5wdXQtZmllbGQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IG5nLW1vZGVsPVxcXCIkY3RybC5lbWFpbFxcXCIgdHlwZT1cXFwidGV4dFxcXCIgcGxhY2Vob2xkZXI9XFxcIllvdXIgRW1haWwgQWRkcmVzc1xcXCIgLz5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpbnB1dC1maWVsZD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgbmctbW9kZWw9XFxcIiRjdHJsLnBhc3N3b3JkXFxcIiB0eXBlPVxcXCJwYXNzd29yZFxcXCIgcGxhY2Vob2xkZXI9XFxcIllvdXIgUGFzc3dvcmRcXFwiIC8+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcInJpZ2h0XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cXFwid2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0biBncmVlbiBhY2NlbnQtNFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmdvKClcXFwiPlNpZ24gVXA8L2E+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XFxcIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gYmx1ZSBhY2NlbnQtNFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmdvKClcXFwiPkxvZ2luPC9hPlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgICAgICAgICA8YnIgY2xhc3M9XFxcImNsZWFyZml4XFxcIiAvPlxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICBcIixcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCRzdGF0ZSkge1xuICAgICAgICB0aGlzLmVtYWlsID0gbnVsbDtcblxuICAgICAgICB0aGlzLmdvID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lLmFwcHJvdmFscycpO1xuICAgICAgICB9O1xuICAgIH1cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnNlcnZpY2UoJ0NPTlNUQU5UUycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBBUElfVVJMOiBcImh0dHA6Ly8xMDQuMTk3LjIwNS4xMzMvXCIsXG4gICAgICAgIEhFUkU6IHtcbiAgICAgICAgICAgIElEOiBcIk1KWjdoZUl6T2JwQVdZZTB6ZTl1XCIsXG4gICAgICAgICAgICBBUFA6IFwiTGhaVWRZeGM1VDd2RHlQOHcwQmpNZ1wiXG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnTG9jYXRpb25TZXJ2aWNlJywgZnVuY3Rpb24gKCRxKSB7XG4gICAgaWYgKCFuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcbiAgICAgICAgYWxlcnQoXCJZb3VyIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBnZW9sb2NhdGlvbi4gUGxlYXNlIHRyeSBpbiBDaHJvbWUsIEZpcmVmb3gsIFNhZmFyaSBvciBFZGdlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0TG9jYXRpb246IGZ1bmN0aW9uIGdldExvY2F0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRxKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXQ6IHBvcy5jb29yZHMubGF0aXR1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZzogcG9zLmNvb3Jkcy5sb25naXR1ZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tOiA4XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnNlcnZpY2UoJ1Bob3Rvc1NlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIENPTlNUQU5UUykge1xuICAgIGZ1bmN0aW9uIGNvbG9yVG9IZXgoeHMpIHtcbiAgICAgICAgcmV0dXJuIHhzLm1hcChmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgc3dpdGNoICh4LmNvbG9yKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm9yYW5nZVwiOlxuICAgICAgICAgICAgICAgICAgICB4LmNvbG9yID0gXCIjZmY2NjAwXCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJyZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgeC5jb2xvciA9IFwiI2VmMzEyM1wiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiZ3JlZW5cIjpcbiAgICAgICAgICAgICAgICAgICAgeC5jb2xvciA9IFwiIzAwOTkzM1wiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB4LmNvbG9yID0gXCIjMDA5OTMzXCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWxsOiBmdW5jdGlvbiBhbGwoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KENPTlNUQU5UUy5BUElfVVJMICsgXCIvcGhvdG9zXCIpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pLnRoZW4oY29sb3JUb0hleCkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnNlcnZpY2UoXCJVc2VyU2VydmljZVwiLCBmdW5jdGlvbiAoKSB7fSk7IiwiYW5ndWxhci5tb2R1bGUoXCJhcHBcIiwgW1widWkucm91dGVyXCIsIFwidWkubWF0ZXJpYWxpemVcIl0pXG4gICAgLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCBmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMudXNlWERvbWFpbiA9IHRydWU7XG4gICAgICAgIGRlbGV0ZSAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLVJlcXVlc3RlZC1XaXRoJ107XG4gICAgfVxuXSlcbiAgICAvLyAuY29uZmlnKChQYXJzZVByb3ZpZGVyKSA9PiB7XG4gICAgLy8gICAgIFBhcnNlUHJvdmlkZXIuaW5pdGlhbGl6ZShcInk4NWd2Q3YzdVVLZHZaa0hmUzNpdXRlUkZoZGNWUWRoUlV2OXZNNmVcIiwgXCJwWW9RcGdzSUNUaHJaR1hoUGY4alNQUm44Y0g2WjFEb3NyZk9xbmpxXCIpXG4gICAgLy8gfSk7IiwiYW5ndWxhci5tb2R1bGUoXCJhcHBcIikuY29uZmlnKCgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSA9PiB7XG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9cIik7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKFwiaG9tZVwiLCB7XG4gICAgICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgICAgIHVybDogXCIvXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHAtY29tcG9uZW50PjwvYXBwLWNvbXBvbmVudD5cbiAgICAgICAgICAgIGBcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKFwiaG9tZS5oaXN0b3J5XCIsIHtcbiAgICAgICAgICAgIHVybDogXCJcIixcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGhpc3RvcnktY29tcG9uZW50PjwvaGlzdG9yeS1jb21wb25lbnQ+XG4gICAgICAgICAgICBgXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZShcImhvbWUubG9naW5cIiwge1xuICAgICAgICAgICAgdXJsOiBcIi9sb2dpblwiLFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8bG9naW4tY29tcG9uZW50PjwvbG9naW4tY29tcG9uZW50PlxuICAgICAgICAgICAgYFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoXCJob21lLmxlYWRlcmJvYXJkXCIsIHtcbiAgICAgICAgICAgIHVybDogXCIvbGVhZGVyYm9hcmRcIixcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGxlYWRlcmJvYXJkLWNvbXBvbmVudD48L2xlYWRlcmJvYXJkLWNvbXBvbmVudD5cbiAgICAgICAgICAgIGBcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKFwiaG9tZS5hcHByb3ZhbHNcIiwge1xuICAgICAgICAgICAgdXJsOiBcIi9hcHByb3ZhbHNcIixcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGFwcHJvdmFscy1jb21wb25lbnQ+PC9hcHByb3ZhbHMtY29tcG9uZW50PlxuICAgICAgICAgICAgYFxuICAgICAgICB9KVxuO1xufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnYXBwQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxoZWFkZXItY29tcG9uZW50PjwvaGVhZGVyLWNvbXBvbmVudD5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8ZGl2IHVpLXZpZXc+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICBgXG4gICAgXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdhcHByb3ZhbHNDb21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGgzPkFwcHJvdmFscyBOZWVkZWQ8L2gzPlxuICAgICAgICA8aDYgbmctaWY9XCIhJGN0cmwuaXRlbXMubGVuZ3RoXCI+Tm8gYXBwcm92YWxzIG5lZWRlZDwvaDY+XG4gICAgICAgIDxoaXN0b3J5LWRldGFpbCBoaXN0b3J5LWl0ZW1zPVwiJGN0cmwuaXRlbXNcIj48L2hpc3RvcnktZGV0YWlsPlxuICAgIGAsXG4gICAgY29udHJvbGxlcihQaG90b3NTZXJ2aWNlKSB7XG4gICAgICAgIFBob3Rvc1NlcnZpY2UuYWxsKClcbiAgICAgICAgICAgIC50aGVuKHhzID0+IHhzLmZpbHRlcih4ID0+ICF4LmFwcHJvdmVkKSlcbiAgICAgICAgICAgIC50aGVuKHBob3RvcyA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IHBob3RvcztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXBwcm92ZWQnLCBwaG90b3MpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwaG90b3M7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59KSIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2hlYWRlckNvbXBvbmVudCcsIHtcbiAgICBjb250cm9sbGVyKCkge1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcbiAgICB9LFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHVzZXI6IFwiPVwiXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8bmF2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5hdi13cmFwcGVyXCI+XG4gICAgICAgICAgICA8YSB1aS1zcmVmPVwiaG9tZVwiIGNsYXNzPVwiYnJhbmQtbG9nb1wiPlN0b3Jtd2F0ZXIgUmV0ZW50aW9uIEJhc2luczwvYT5cbiAgICAgICAgICAgIDx1bCBpZD1cIm5hdi1tb2JpbGVcIiBjbGFzcz1cInJpZ2h0IGhpZGUtb24tbWVkLWFuZC1kb3duXCI+XG4gICAgICAgICAgICAgICAgPGxpPjxhIHVpLXNyZWY9XCIubGVhZGVyYm9hcmRcIj5MZWFkZXJib2FyZHM8L2E+PC9saT5cbiAgICAgICAgICAgICAgICA8bGk+PGEgdWktc3JlZj1cIi5sb2dpblwiPlNpZ24gSW48L2E+PC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9uYXY+XG4gICAgYCxcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2hpc3RvcnlEZXRhaWwnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICBcbiAgICA8ZGl2IGNsYXNzPVwicm93XCIgbmctcmVwZWF0PVwiaXRlbSBpbiAkY3RybC5oaXN0b3J5SXRlbXNcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBzMTIgbTEyXCIgbmctaWY9XCJpdGVtLmhpZGUgIT09IHRydWUgfHwgaXRlbS5hcHByb3ZlZFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWltYWdlXCI+XG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCJ7e2l0ZW0uaW1hZ2VVUkx9fVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2FyZC10aXRsZVwiPkxvY2F0aW9uIERhdGE8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cInt7JGN0cmwuZ2V0QXZhdGFyKCl9fVwiIGFsdD1cIlwiIGNsYXNzPVwiY2lyY2xlIGF2YXRhclwiPlxuICAgICAgICAgICAgICAgIDxwPkNyZWF0ZWQgYnk6IHt7JGN0cmwuZ2V0TmFtZSgpfX0gb24ge3tpdGVtLmNyZWF0ZWQuZGF0ZX19IGluIHRoZSB7e2l0ZW0uem9uZX19PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1hY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cIml0ZW0uYXBwcm92ZWRcIiBuZy1jbGljaz1cIiRjdHJsLmNsb3NlKClcIj5DbG9zZTwvYT5cbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cIiFpdGVtLmFwcHJvdmVkXCIgbmctY2xpY2s9XCIkY3RybC5oaWRlKGl0ZW0pXCIgY2xhc3M9XCJncmVlbi10ZXh0IGRhcmtlbi00XCI+QXBwcm92ZTwvYT5cbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cIiFpdGVtLmFwcHJvdmVkXCIgbmctY2xpY2s9XCIkY3RybC5oaWRlKGl0ZW0pXCIgY2xhc3M9XCJyZWQtdGV4dCBkYXJrZW4tNFwiPkRpc2FwcHJvdmU8L2E+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoVXNlclNlcnZpY2UsICRyb290U2NvcGUpIHtcbiAgICAgICAgdGhpcy5jbG9zZSA9ICgpID0+IHtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChcImNsb3NlOml0ZW1cIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdldE5hbWUgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lcyA9IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdCb2IgTS4nLFxuICAgICAgICAgICAgICAgICAgICBzY29yZTogNDUsXG4gICAgICAgICAgICAgICAgICAgIGltZzogMSxcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdHZW9yZ2UgSi4nLFxuICAgICAgICAgICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICAgICAgICAgIGltZzogMixcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdIZWF0aGVyIFIuJyxcbiAgICAgICAgICAgICAgICAgICAgc2NvcmU6IDQwLFxuICAgICAgICAgICAgICAgICAgICBpbWc6IDMsXG4gICAgICAgICAgICAgICAgICAgIGJhZGdlczogNFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnS2FyZW4gUy4nLFxuICAgICAgICAgICAgICAgICAgICBzY29yZTogMjAsXG4gICAgICAgICAgICAgICAgICAgIGltZzogNCxcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2VzOiAyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdTYW1teSBRLicsXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlOiA1LFxuICAgICAgICAgICAgICAgICAgICBpbWc6IDUsXG4gICAgICAgICAgICAgICAgICAgIGJhZGdlczogMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHJldHVybiBuYW1lc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuYW1lcy5sZW5ndGgpXS5uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nZXRBdmF0YXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBudW1zID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldO1xuXG4gICAgICAgICAgICBjb25zdCBpZCA9IG51bXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbnVtcy5sZW5ndGgpXTtcbiAgICAgICAgICAgIHJldHVybiBgL2Rpc3BsYXkvaW1hZ2VzL3Byb2ZpbGVfJHtpZH0ucG5nYDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhpZGUgPSAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgaXRlbS5oaWRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaGlzdG9yeUl0ZW1zOiAnPSdcbiAgICB9XG5cbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGlzdG9yeUNvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8YSBuZy1jbGljaz1cIiRjdHJsLnNob3coKVwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBjbGFzcz1cInNob3ctbWFwXCI+PC9hPlxuICAgICAgICA8ZGl2IGlkPVwibWFwXCI+PC9kaXY+XG4gICAgICAgIDxoaXN0b3J5LWRldGFpbCBuZy1pZj1cIiRjdHJsLmNob3Nlbl9pdGVtcy5sZW5ndGhcIiBoaXN0b3J5LWl0ZW1zPVwiJGN0cmwuY2hvc2VuX2l0ZW1zXCI+PC9oaXN0b3J5LWRldGFpbD5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBMb2NhdGlvblNlcnZpY2UsIFBob3Rvc1NlcnZpY2UsIENPTlNUQU5UUykge1xuICAgICAgICB0aGlzLm1hcCA9IG51bGw7XG4gICAgICAgIHRoaXMuc2hvdyA9ICgpID0+IHsgfTtcbiAgICAgICAgdGhpcy5jaG9zZW5faXRlbXMgPSBbXTtcblxuICAgICAgICBjb25zdCBpY29uID0gYDxzdmcgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBzdHJva2U9XCJ3aGl0ZVwiIGZpbGw9XCJ7fVwiIHg9XCIxXCIgeT1cIjFcIiB3aWR0aD1cIjIyXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCIyMlwiIC8+PC9zdmc+YDtcblxuICAgICAgICAkc2NvcGUuJG9uKCdjbG9zZTppdGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jaG9zZW5faXRlbXMgPSBbXTtcbiAgICAgICAgfSlcblxuICAgICAgICBQaG90b3NTZXJ2aWNlLmFsbCgpXG4gICAgICAgICAgICAudGhlbihwaG90b3MgPT4ge1xuICAgICAgICAgICAgICAgIHBob3RvcyA9IHBob3Rvcy5maWx0ZXIoeCA9PiB4LmFwcHJvdmVkKTtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gcGhvdG9zO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBob3Rvcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBob3RvcztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigocGhvdG9zKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KHBob3Rvcyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmluaXQgPSAocGhvdG9zKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwbGF0Zm9ybSA9IG5ldyBILnNlcnZpY2UuUGxhdGZvcm0oe1xuICAgICAgICAgICAgICAgIGFwcF9pZDogQ09OU1RBTlRTLkhFUkUuSUQsXG4gICAgICAgICAgICAgICAgYXBwX2NvZGU6IENPTlNUQU5UUy5IRVJFLkFQUFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRzID0gcGxhdGZvcm0uY3JlYXRlRGVmYXVsdExheWVycygpO1xuICAgICAgICAgICAgY29uc3QgbWFwID0gbmV3IEguTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0cy5ub3JtYWwubWFwLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXQ6IDI5LjQyNDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBsbmc6IC05OC40OTM2XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCB1aSA9IEgudWkuVUkuY3JlYXRlRGVmYXVsdChtYXAsIGRlZmF1bHRzKTtcblxuICAgICAgICAgICAgY29uc3QgYm91bmRzID0gbmV3IEgubWFwLk92ZXJsYXkobmV3IEguZ2VvLlJlY3QoMzAuNzg1NzE4LCAtMTAwLjU1ODUwNCwgMjguOTkwOTUyLCAtOTYuOTc2NTI3KSwgJy9kaXNwbGF5L2ltYWdlcy9tYXBfZ2MucG5nJyk7XG4gICAgICAgICAgICBtYXAuYWRkT2JqZWN0KGJvdW5kcyk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHBob3RvIG9mIHBob3Rvcykge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbnN0IHRoaXNfaWNvbiA9IGljb24ucmVwbGFjZShcInt9XCIsIHBob3RvLmNvbG9yKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHBsYWNlID0gbmV3IEgubWFwLkljb24odGhpc19pY29uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGxhdDogcGhvdG8ubGF0LFxuICAgICAgICAgICAgICAgICAgICBsbmc6IHBob3RvLmxvblxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgbWFya2VyID0gbmV3IEgubWFwLk1hcmtlcihjb29yZHMsIHsgaWNvbjogcGxhY2UsIGlkOiBwaG90by5pZCB9KVxuICAgICAgICAgICAgICAgIG1hcC5hZGRPYmplY3QobWFya2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbWFwX2V2ZW50cyA9IG5ldyBILm1hcGV2ZW50cy5NYXBFdmVudHMobWFwKTtcbiAgICAgICAgICAgIG1hcC5hZGRFdmVudExpc3RlbmVyKCd0YXAnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5pdGVtcy5maWx0ZXIoeCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlLnRhcmdldC5iYi5sYXQgPT0geC5sYXQgJiYgZS50YXJnZXQuYmIubG5nID09IHgubG9uO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TWFya2VyKGl0ZW1zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2hvd01hcmtlciA9IChpdGVtcykgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaG9zZW5faXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNob29zZSBpdGVtc1wiLCB0aGlzLmNob3Nlbl9pdGVtcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgJCgnLnNob3ctbWFwJykuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKTtcblxuICAgIH1cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2xlYWRlcmJvYXJkQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDx1bCBjbGFzcz1cImNvbGxlY3Rpb25cIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz1cImNvbGxlY3Rpb24taXRlbSBhdmF0YXJcIiBuZy1yZXBlYXQ9XCJ1c2VyIGluICRjdHJsLnVzZXJzXCI+XG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCIvZGlzcGxheS9pbWFnZXMvcHJvZmlsZV97e3VzZXIuaW1nfX0ucG5nXCIgYWx0PVwiXCIgY2xhc3M9XCJjaXJjbGVcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpdGxlXCI+e3t1c2VyLm5hbWV9fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8cD5IZXJvIFBvaW50czogPHNwYW4gY2xhc3M9XCJyZWQtdGV4dFwiPnt7dXNlci5zY29yZX19PC9zcGFuPiA8YnIgLz5cbiAgICAgICAgICAgICAgICBCYWRnZXM6IHt7dXNlci5iYWRnZXN9fVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiIyFcIiBjbGFzcz1cInNlY29uZGFyeS1jb250ZW50XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPmdyYWRlPC9pPjwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgYCxcbiAgICBjb250cm9sbGVyKCkge1xuICAgICAgICB0aGlzLnVzZXJzID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdCb2IgTS4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA0NSxcbiAgICAgICAgICAgICAgICBpbWc6IDEsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdHZW9yZ2UgSi4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA0MCxcbiAgICAgICAgICAgICAgICBpbWc6IDIsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdIZWF0aGVyIFIuJyxcbiAgICAgICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICAgICAgaW1nOiAzLFxuICAgICAgICAgICAgICAgIGJhZGdlczogNFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnS2FyZW4gUy4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiAyMCxcbiAgICAgICAgICAgICAgICBpbWc6IDQsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiAyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdTYW1teSBRLicsXG4gICAgICAgICAgICAgICAgc2NvcmU6IDUsXG4gICAgICAgICAgICAgICAgaW1nOiA1LFxuICAgICAgICAgICAgICAgIGJhZGdlczogMVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnbG9naW5Db21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cInJvd1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBzMTIgbTYgb2Zmc2V0LW0zXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXJkLXRpdGxlXCI+TG9naW48L3NwYW4+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+VG8gYWNjZXNzIGFkbWluaXN0cmF0aW9uIGZlYXR1cmVzLCB5b3UnbGwgbmVlZCB0byBsb2dpbi48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaW5wdXQtZmllbGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgbmctbW9kZWw9XCIkY3RybC5lbWFpbFwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJZb3VyIEVtYWlsIEFkZHJlc3NcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpbnB1dC1maWVsZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuZy1tb2RlbD1cIiRjdHJsLnBhc3N3b3JkXCIgdHlwZT1cInBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCJZb3VyIFBhc3N3b3JkXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gYWNjZW50LTRcIiBuZy1jbGljaz1cIiRjdHJsLmdvKClcIj5TaWduIFVwPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGJsdWUgYWNjZW50LTRcIiBuZy1jbGljaz1cIiRjdHJsLmdvKClcIj5Mb2dpbjwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxiciBjbGFzcz1cImNsZWFyZml4XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoJHN0YXRlKSB7XG4gICAgICAgIHRoaXMuZW1haWwgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuZ28gPSAoKSA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUuYXBwcm92YWxzJyk7XG4gICAgICAgIH1cbiAgICB9XG59KSIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKCdDT05TVEFOVFMnLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgQVBJX1VSTDogXCJodHRwOi8vMTA0LjE5Ny4yMDUuMTMzL1wiLFxuICAgICAgICBIRVJFOiB7XG4gICAgICAgICAgICBJRDogXCJNSlo3aGVJek9icEFXWWUwemU5dVwiLFxuICAgICAgICAgICAgQVBQOiBcIkxoWlVkWXhjNVQ3dkR5UDh3MEJqTWdcIlxuICAgICAgICB9XG4gICAgfVxufSkiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnTG9jYXRpb25TZXJ2aWNlJywgKCRxKSA9PiB7XG4gICAgaWYgKCFuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcbiAgICAgICAgYWxlcnQoXCJZb3VyIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBnZW9sb2NhdGlvbi4gUGxlYXNlIHRyeSBpbiBDaHJvbWUsIEZpcmVmb3gsIFNhZmFyaSBvciBFZGdlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0TG9jYXRpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJHEoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oKHBvcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdDogcG9zLmNvb3Jkcy5sYXRpdHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25nOiBwb3MuY29vcmRzLmxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnUGhvdG9zU2VydmljZScsICgkaHR0cCwgQ09OU1RBTlRTKSA9PiB7XG4gICAgZnVuY3Rpb24gY29sb3JUb0hleCh4cykge1xuICAgICAgICByZXR1cm4geHMubWFwKHggPT4ge1xuICAgICAgICAgICAgc3dpdGNoICh4LmNvbG9yKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcIm9yYW5nZVwiOlxuICAgICAgICAgICAgICAgICAgICB4LmNvbG9yID0gXCIjZmY2NjAwXCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJyZWRcIjpcbiAgICAgICAgICAgICAgICAgICAgeC5jb2xvciA9IFwiI2VmMzEyM1wiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwiZ3JlZW5cIjpcbiAgICAgICAgICAgICAgICAgICAgeC5jb2xvciA9IFwiIzAwOTkzM1wiO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB4LmNvbG9yID0gXCIjMDA5OTMzXCI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBcblxuICAgICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGFsbCgpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoYCR7Q09OU1RBTlRTLkFQSV9VUkx9L3Bob3Rvc2ApXG4gICAgICAgICAgICAgICAgLnRoZW4ocmVzID0+IHJlcy5kYXRhKVxuICAgICAgICAgICAgICAgIC50aGVuKGNvbG9yVG9IZXgpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZShcIlVzZXJTZXJ2aWNlXCIsICgpID0+IHtcbiAgICBcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
