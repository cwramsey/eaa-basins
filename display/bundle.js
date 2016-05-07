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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyIsIm1haW4uanMiLCJyb3V0ZXMuanMiLCJjb21wb25lbnRzL2FwcC5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2FwcHJvdmFscy5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2hlYWRlci5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2hpc3RvcnktZGV0YWlsLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvaGlzdG9yeS5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2xlYWRlcmJvYXJkLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvbG9naW4uY29tcG9uZW50LmpzIiwib2JqZWN0cy9jb25zdGFudHMub2JqZWN0LmpzIiwic2VydmljZXMvTG9jYXRpb25TZXJ2aWNlLmpzIiwic2VydmljZXMvUGhvdG9zU2VydmljZS5qcyIsInNlcnZpY2VzL3VzZXIuc2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxRQUFBLE9BQUEsT0FBQSxDQUFBLGFBQUEsbUJBQ0EsT0FBQSxDQUFBLGlCQUFBLFVBQUEsZUFBQTtJQUNBLGNBQUEsU0FBQSxhQUFBO0lBQ0EsT0FBQSxjQUFBLFNBQUEsUUFBQSxPQUFBOzs7OztBQ0hBLFFBQUEsT0FBQSxPQUFBLGdEQUFBLFVBQUEsZ0JBQUEsb0JBQUE7SUFDQSxtQkFBQSxVQUFBO0lBQ0EsZUFDQSxNQUFBLFFBQUE7UUFDQSxVQUFBO1FBQ0EsS0FBQTtRQUNBLFVBQUE7T0FJQSxNQUFBLGdCQUFBO1FBQ0EsS0FBQTtRQUNBLFVBQUE7T0FJQSxNQUFBLGNBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTtPQUlBLE1BQUEsb0JBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTtPQUlBLE1BQUEsa0JBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTs7O0FDOUJBLFFBQUEsT0FBQSxPQUFBLFVBQUEsZ0JBQUE7SUFDQSxVQUFBOzs7QUNEQSxRQUFBLE9BQUEsT0FBQSxVQUFBLHNCQUFBO0lBQ0EsVUFB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QTtRQUNBLEtBREEsU0FBQSxNQUNBO1lBQ0EsT0FBQSxNQUFBLElBQUEsVUFBQSxVQUFBLFdBQ0EsS0FBQSxVQUFBLEtBQUE7Z0JBQUEsT0FBQSxJQUFBO2VBQ0EsTUFBQSxVQUFBLEtBQUE7Z0JBQUEsT0FBQSxRQUFBLE1BQUE7Ozs7OztBQ0xBLFFBQUEsT0FBQSxPQUFBLFFBQUEsZUFBQSxZQUFBLElBQUEiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmFuZ3VsYXIubW9kdWxlKFwiYXBwXCIsIFtcInVpLnJvdXRlclwiLCBcInVpLm1hdGVyaWFsaXplXCJdKS5jb25maWcoWyckaHR0cFByb3ZpZGVyJywgZnVuY3Rpb24gKCRodHRwUHJvdmlkZXIpIHtcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLnVzZVhEb21haW4gPSB0cnVlO1xuICAgIGRlbGV0ZSAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLVJlcXVlc3RlZC1XaXRoJ107XG59XSk7XG4vLyAuY29uZmlnKChQYXJzZVByb3ZpZGVyKSA9PiB7XG4vLyAgICAgUGFyc2VQcm92aWRlci5pbml0aWFsaXplKFwieTg1Z3ZDdjN1VUtkdlprSGZTM2l1dGVSRmhkY1ZRZGhSVXY5dk02ZVwiLCBcInBZb1FwZ3NJQ1RoclpHWGhQZjhqU1BSbjhjSDZaMURvc3JmT3FuanFcIilcbi8vIH0pO1xuYW5ndWxhci5tb2R1bGUoXCJhcHBcIikuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9cIik7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lXCIsIHtcbiAgICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICAgIHVybDogXCIvXCIsXG4gICAgICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgICAgICAgICA8YXBwLWNvbXBvbmVudD48L2FwcC1jb21wb25lbnQ+XFxuICAgICAgICAgICAgXCJcbiAgICB9KS5zdGF0ZShcImhvbWUuaGlzdG9yeVwiLCB7XG4gICAgICAgIHVybDogXCJcIixcbiAgICAgICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICAgICAgICAgIDxoaXN0b3J5LWNvbXBvbmVudD48L2hpc3RvcnktY29tcG9uZW50PlxcbiAgICAgICAgICAgIFwiXG4gICAgfSkuc3RhdGUoXCJob21lLmxvZ2luXCIsIHtcbiAgICAgICAgdXJsOiBcIi9sb2dpblwiLFxuICAgICAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgICAgICAgICAgPGxvZ2luLWNvbXBvbmVudD48L2xvZ2luLWNvbXBvbmVudD5cXG4gICAgICAgICAgICBcIlxuICAgIH0pLnN0YXRlKFwiaG9tZS5sZWFkZXJib2FyZFwiLCB7XG4gICAgICAgIHVybDogXCIvbGVhZGVyYm9hcmRcIixcbiAgICAgICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICAgICAgICAgIDxsZWFkZXJib2FyZC1jb21wb25lbnQ+PC9sZWFkZXJib2FyZC1jb21wb25lbnQ+XFxuICAgICAgICAgICAgXCJcbiAgICB9KS5zdGF0ZShcImhvbWUuYXBwcm92YWxzXCIsIHtcbiAgICAgICAgdXJsOiBcIi9hcHByb3ZhbHNcIixcbiAgICAgICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICAgICAgICAgIDxhcHByb3ZhbHMtY29tcG9uZW50PjwvYXBwcm92YWxzLWNvbXBvbmVudD5cXG4gICAgICAgICAgICBcIlxuICAgIH0pO1xufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdhcHBDb21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8aGVhZGVyLWNvbXBvbmVudD48L2hlYWRlci1jb21wb25lbnQ+XFxuXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb250YWluZXJcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgdWktdmlldz48L2Rpdj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgXFxuICAgIFwiXG5cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnYXBwcm92YWxzQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgPGgzPkFwcHJvdmFscyBOZWVkZWQ8L2gzPlxcbiAgICAgICAgPGg2IG5nLWlmPVxcXCIhJGN0cmwuaXRlbXMubGVuZ3RoXFxcIj5ObyBhcHByb3ZhbHMgbmVlZGVkPC9oNj5cXG4gICAgICAgIDxoaXN0b3J5LWRldGFpbCBoaXN0b3J5LWl0ZW1zPVxcXCIkY3RybC5pdGVtc1xcXCI+PC9oaXN0b3J5LWRldGFpbD5cXG4gICAgXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcihQaG90b3NTZXJ2aWNlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgUGhvdG9zU2VydmljZS5hbGwoKS50aGVuKGZ1bmN0aW9uICh4cykge1xuICAgICAgICAgICAgcmV0dXJuIHhzLmZpbHRlcihmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAheC5hcHByb3ZlZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChwaG90b3MpIHtcbiAgICAgICAgICAgIF90aGlzLml0ZW1zID0gcGhvdG9zO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FwcHJvdmVkJywgcGhvdG9zKTtcbiAgICAgICAgICAgIHJldHVybiBwaG90b3M7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGVhZGVyQ29tcG9uZW50Jywge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgIH0sXG5cbiAgICBiaW5kaW5nczoge1xuICAgICAgICB1c2VyOiBcIj1cIlxuICAgIH0sXG4gICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8bmF2PlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIm5hdi13cmFwcGVyXFxcIj5cXG4gICAgICAgICAgICA8YSB1aS1zcmVmPVxcXCJob21lXFxcIiBjbGFzcz1cXFwiYnJhbmQtbG9nb1xcXCI+U3Rvcm13YXRlciBSZXRlbnRpb24gQmFzaW5zPC9hPlxcbiAgICAgICAgICAgIDx1bCBpZD1cXFwibmF2LW1vYmlsZVxcXCIgY2xhc3M9XFxcInJpZ2h0IGhpZGUtb24tbWVkLWFuZC1kb3duXFxcIj5cXG4gICAgICAgICAgICAgICAgPGxpPjxhIHVpLXNyZWY9XFxcIi5sZWFkZXJib2FyZFxcXCI+TGVhZGVyYm9hcmRzPC9hPjwvbGk+XFxuICAgICAgICAgICAgICAgIDxsaT48YSB1aS1zcmVmPVxcXCIubG9naW5cXFwiPlNpZ24gSW48L2E+PC9saT5cXG4gICAgICAgICAgICA8L3VsPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgPC9uYXY+XFxuICAgIFwiXG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2hpc3RvcnlEZXRhaWwnLCB7XG4gICAgdGVtcGxhdGU6IFwiXFxuICAgIFxcbiAgICA8ZGl2IGNsYXNzPVxcXCJyb3dcXFwiIG5nLXJlcGVhdD1cXFwiaXRlbSBpbiAkY3RybC5oaXN0b3J5SXRlbXNcXFwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwiY29sIHMxMiBtMTJcXFwiIG5nLWlmPVxcXCJpdGVtLmhpZGUgIT09IHRydWUgfHwgaXRlbS5hcHByb3ZlZFxcXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZFxcXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiY2FyZC1pbWFnZVxcXCI+XFxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVxcXCJ7e2l0ZW0uaW1hZ2VVUkx9fVxcXCI+XFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVxcXCJjYXJkLXRpdGxlXFxcIj5Mb2NhdGlvbiBEYXRhPC9zcGFuPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQtY29udGVudFxcXCI+XFxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVxcXCJ7eyRjdHJsLmdldEF2YXRhcigpfX1cXFwiIGFsdD1cXFwiXFxcIiBjbGFzcz1cXFwiY2lyY2xlIGF2YXRhclxcXCI+XFxuICAgICAgICAgICAgICAgIDxwPkNyZWF0ZWQgYnk6IHt7JGN0cmwuZ2V0TmFtZSgpfX0gb24ge3tpdGVtLmNyZWF0ZWQuZGF0ZX19IGluIHRoZSB7e2l0ZW0uem9uZX19PC9wPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQtYWN0aW9uXFxcIj5cXG4gICAgICAgICAgICAgICAgPGEgbmctaWY9XFxcIml0ZW0uYXBwcm92ZWRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5jbG9zZSgpXFxcIj5DbG9zZTwvYT5cXG4gICAgICAgICAgICAgICAgPGEgbmctaWY9XFxcIiFpdGVtLmFwcHJvdmVkXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuaGlkZShpdGVtKVxcXCIgY2xhc3M9XFxcImdyZWVuLXRleHQgZGFya2VuLTRcXFwiPkFwcHJvdmU8L2E+XFxuICAgICAgICAgICAgICAgIDxhIG5nLWlmPVxcXCIhaXRlbS5hcHByb3ZlZFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmhpZGUoaXRlbSlcXFwiIGNsYXNzPVxcXCJyZWQtdGV4dCBkYXJrZW4tNFxcXCI+RGlzYXBwcm92ZTwvYT5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICAgXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcihVc2VyU2VydmljZSwgJHJvb3RTY29wZSkge1xuICAgICAgICB0aGlzLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFwiY2xvc2U6aXRlbVwiKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldE5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbmFtZXMgPSBbe1xuICAgICAgICAgICAgICAgIG5hbWU6ICdCb2IgTS4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA0NSxcbiAgICAgICAgICAgICAgICBpbWc6IDEsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ0dlb3JnZSBKLicsXG4gICAgICAgICAgICAgICAgc2NvcmU6IDQwLFxuICAgICAgICAgICAgICAgIGltZzogMixcbiAgICAgICAgICAgICAgICBiYWRnZXM6IDVcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnSGVhdGhlciBSLicsXG4gICAgICAgICAgICAgICAgc2NvcmU6IDQwLFxuICAgICAgICAgICAgICAgIGltZzogMyxcbiAgICAgICAgICAgICAgICBiYWRnZXM6IDRcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnS2FyZW4gUy4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiAyMCxcbiAgICAgICAgICAgICAgICBpbWc6IDQsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiAyXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ1NhbW15IFEuJyxcbiAgICAgICAgICAgICAgICBzY29yZTogNSxcbiAgICAgICAgICAgICAgICBpbWc6IDUsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiAxXG4gICAgICAgICAgICB9XTtcblxuICAgICAgICAgICAgcmV0dXJuIG5hbWVzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG5hbWVzLmxlbmd0aCldLm5hbWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRBdmF0YXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbnVtcyA9IFsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XTtcblxuICAgICAgICAgICAgdmFyIGlkID0gbnVtc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBudW1zLmxlbmd0aCldO1xuICAgICAgICAgICAgcmV0dXJuIFwiL2Rpc3BsYXkvaW1hZ2VzL3Byb2ZpbGVfXCIgKyBpZCArIFwiLnBuZ1wiO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaGlkZSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLmhpZGUgPSB0cnVlO1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBiaW5kaW5nczoge1xuICAgICAgICBoaXN0b3J5SXRlbXM6ICc9J1xuICAgIH1cblxufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdoaXN0b3J5Q29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgPGEgbmctY2xpY2s9XFxcIiRjdHJsLnNob3coKVxcXCIgc3R5bGU9XFxcImRpc3BsYXk6IG5vbmU7XFxcIiBjbGFzcz1cXFwic2hvdy1tYXBcXFwiPjwvYT5cXG4gICAgICAgIDxkaXYgaWQ9XFxcIm1hcFxcXCI+PC9kaXY+XFxuICAgICAgICA8aGlzdG9yeS1kZXRhaWwgbmctaWY9XFxcIiRjdHJsLmNob3Nlbl9pdGVtcy5sZW5ndGhcXFwiIGhpc3RvcnktaXRlbXM9XFxcIiRjdHJsLmNob3Nlbl9pdGVtc1xcXCI+PC9oaXN0b3J5LWRldGFpbD5cXG4gICAgXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc2NvcGUsICRyb290U2NvcGUsIExvY2F0aW9uU2VydmljZSwgUGhvdG9zU2VydmljZSwgQ09OU1RBTlRTKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMubWFwID0gbnVsbDtcbiAgICAgICAgdGhpcy5zaG93ID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgIHRoaXMuY2hvc2VuX2l0ZW1zID0gW107XG5cbiAgICAgICAgdmFyIGljb24gPSBcIjxzdmcgd2lkdGg9XFxcIjEyXFxcIiBoZWlnaHQ9XFxcIjEyXFxcIiBcXG4gICAgICAgICAgICAgICAgICAgICAgICB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IHN0cm9rZT1cXFwid2hpdGVcXFwiIGZpbGw9XFxcInt9XFxcIiB4PVxcXCIxXFxcIiB5PVxcXCIxXFxcIiB3aWR0aD1cXFwiMjJcXFwiIFxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD1cXFwiMjJcXFwiIC8+PC9zdmc+XCI7XG5cbiAgICAgICAgJHNjb3BlLiRvbignY2xvc2U6aXRlbScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzMi5jaG9zZW5faXRlbXMgPSBbXTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgUGhvdG9zU2VydmljZS5hbGwoKS50aGVuKGZ1bmN0aW9uIChwaG90b3MpIHtcbiAgICAgICAgICAgIHBob3RvcyA9IHBob3Rvcy5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC5hcHByb3ZlZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgX3RoaXMyLml0ZW1zID0gcGhvdG9zO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocGhvdG9zKTtcbiAgICAgICAgICAgIHJldHVybiBwaG90b3M7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHBob3Rvcykge1xuICAgICAgICAgICAgX3RoaXMyLmluaXQocGhvdG9zKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pbml0ID0gZnVuY3Rpb24gKHBob3Rvcykge1xuICAgICAgICAgICAgdmFyIHBsYXRmb3JtID0gbmV3IEguc2VydmljZS5QbGF0Zm9ybSh7XG4gICAgICAgICAgICAgICAgYXBwX2lkOiBDT05TVEFOVFMuSEVSRS5JRCxcbiAgICAgICAgICAgICAgICBhcHBfY29kZTogQ09OU1RBTlRTLkhFUkUuQVBQXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIGRlZmF1bHRzID0gcGxhdGZvcm0uY3JlYXRlRGVmYXVsdExheWVycygpO1xuICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBILk1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwJyksIGRlZmF1bHRzLm5vcm1hbC5tYXAsIHtcbiAgICAgICAgICAgICAgICBjZW50ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgbGF0OiAyOS40MjQxLFxuICAgICAgICAgICAgICAgICAgICBsbmc6IC05OC40OTM2XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB6b29tOiA3XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIHVpID0gSC51aS5VSS5jcmVhdGVEZWZhdWx0KG1hcCwgZGVmYXVsdHMpO1xuXG4gICAgICAgICAgICB2YXIgYm91bmRzID0gbmV3IEgubWFwLk92ZXJsYXkobmV3IEguZ2VvLlJlY3QoMzAuNzg1NzE4LCAtMTAwLjU1ODUwNCwgMjguOTkwOTUyLCAtOTYuOTc2NTI3KSwgJy9kaXNwbGF5L2ltYWdlcy9tYXBfZ2MucG5nJyk7XG4gICAgICAgICAgICBtYXAuYWRkT2JqZWN0KGJvdW5kcyk7XG5cbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHBob3Rvc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBob3RvID0gX3N0ZXAudmFsdWU7XG5cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXBob3RvLmNvbG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCAocGhvdG8uY29sb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJvcmFuZ2VcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaG90by5jb2xvciA9IFwiI2ZmNjYwMFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBcInJlZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBob3RvLmNvbG9yID0gXCIjZWYzMTIzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZ3JlZW5cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaG90by5jb2xvciA9IFwiIzAwOTkzM1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aGlzX2ljb24gPSBpY29uLnJlcGxhY2UoXCJ7fVwiLCBwaG90by5jb2xvcik7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYWNlID0gbmV3IEgubWFwLkljb24odGhpc19pY29uKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvb3JkcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhdDogcGhvdG8ubGF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbG5nOiBwaG90by5sb25cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBILm1hcC5NYXJrZXIoY29vcmRzLCB7IGljb246IHBsYWNlLCBpZDogcGhvdG8uaWQgfSk7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5hZGRPYmplY3QobWFya2VyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgICAgICAgICAgX2l0ZXJhdG9yRXJyb3IgPSBlcnI7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiAmJiBfaXRlcmF0b3IucmV0dXJuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfaXRlcmF0b3IucmV0dXJuKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbWFwX2V2ZW50cyA9IG5ldyBILm1hcGV2ZW50cy5NYXBFdmVudHMobWFwKTtcbiAgICAgICAgICAgIG1hcC5hZGRFdmVudExpc3RlbmVyKCd0YXAnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IF90aGlzMi5pdGVtcy5maWx0ZXIoZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUudGFyZ2V0LmJiLmxhdCA9PSB4LmxhdCAmJiBlLnRhcmdldC5iYi5sbmcgPT0geC5sb247XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBfdGhpczIuc2hvd01hcmtlcihpdGVtcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNob3dNYXJrZXIgPSBmdW5jdGlvbiAoaXRlbXMpIHtcbiAgICAgICAgICAgICRzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIF90aGlzMi5jaG9zZW5faXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNob29zZSBpdGVtc1wiLCBfdGhpczIuY2hvc2VuX2l0ZW1zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBpbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChfdGhpczIuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICAkKCcuc2hvdy1tYXAnKS5jbGljaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAxMDApO1xuICAgIH1cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnbGVhZGVyYm9hcmRDb21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8dWwgY2xhc3M9XFxcImNvbGxlY3Rpb25cXFwiPlxcbiAgICAgICAgICAgIDxsaSBjbGFzcz1cXFwiY29sbGVjdGlvbi1pdGVtIGF2YXRhclxcXCIgbmctcmVwZWF0PVxcXCJ1c2VyIGluICRjdHJsLnVzZXJzXFxcIj5cXG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XFxcIi9kaXNwbGF5L2ltYWdlcy9wcm9maWxlX3t7dXNlci5pbWd9fS5wbmdcXFwiIGFsdD1cXFwiXFxcIiBjbGFzcz1cXFwiY2lyY2xlXFxcIj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInRpdGxlXFxcIj57e3VzZXIubmFtZX19PC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8cD5IZXJvIFBvaW50czogPHNwYW4gY2xhc3M9XFxcInJlZC10ZXh0XFxcIj57e3VzZXIuc2NvcmV9fTwvc3Bhbj4gPGJyIC8+XFxuICAgICAgICAgICAgICAgIEJhZGdlczoge3t1c2VyLmJhZGdlc319XFxuICAgICAgICAgICAgICAgIFxcbiAgICAgICAgICAgICAgICA8L3A+XFxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XFxcIiMhXFxcIiBjbGFzcz1cXFwic2Vjb25kYXJ5LWNvbnRlbnRcXFwiPjxpIGNsYXNzPVxcXCJtYXRlcmlhbC1pY29uc1xcXCI+Z3JhZGU8L2k+PC9hPlxcbiAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICBcIixcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCkge1xuICAgICAgICB0aGlzLnVzZXJzID0gW3tcbiAgICAgICAgICAgIG5hbWU6ICdCb2IgTS4nLFxuICAgICAgICAgICAgc2NvcmU6IDQ1LFxuICAgICAgICAgICAgaW1nOiAxLFxuICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG5hbWU6ICdHZW9yZ2UgSi4nLFxuICAgICAgICAgICAgc2NvcmU6IDQwLFxuICAgICAgICAgICAgaW1nOiAyLFxuICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG5hbWU6ICdIZWF0aGVyIFIuJyxcbiAgICAgICAgICAgIHNjb3JlOiA0MCxcbiAgICAgICAgICAgIGltZzogMyxcbiAgICAgICAgICAgIGJhZGdlczogNFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBuYW1lOiAnS2FyZW4gUy4nLFxuICAgICAgICAgICAgc2NvcmU6IDIwLFxuICAgICAgICAgICAgaW1nOiA0LFxuICAgICAgICAgICAgYmFkZ2VzOiAyXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG5hbWU6ICdTYW1teSBRLicsXG4gICAgICAgICAgICBzY29yZTogNSxcbiAgICAgICAgICAgIGltZzogNSxcbiAgICAgICAgICAgIGJhZGdlczogMVxuICAgICAgICB9XTtcbiAgICB9XG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2xvZ2luQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicm93XFxcIj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb2wgczEyIG02IG9mZnNldC1tM1xcXCI+XFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQtcGFuZWxcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNhcmQtdGl0bGVcXFwiPkxvZ2luPC9zcGFuPlxcblxcbiAgICAgICAgICAgICAgICAgICAgPHA+VG8gYWNjZXNzIGFkbWluaXN0cmF0aW9uIGZlYXR1cmVzLCB5b3UnbGwgbmVlZCB0byBsb2dpbi48L3A+XFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGlucHV0LWZpZWxkPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuZy1tb2RlbD1cXFwiJGN0cmwuZW1haWxcXFwiIHR5cGU9XFxcInRleHRcXFwiIHBsYWNlaG9sZGVyPVxcXCJZb3VyIEVtYWlsIEFkZHJlc3NcXFwiIC8+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaW5wdXQtZmllbGQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IG5nLW1vZGVsPVxcXCIkY3RybC5wYXNzd29yZFxcXCIgdHlwZT1cXFwicGFzc3dvcmRcXFwiIHBsYWNlaG9sZGVyPVxcXCJZb3VyIFBhc3N3b3JkXFxcIiAvPlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XFxcIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gYWNjZW50LTRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5nbygpXFxcIj5TaWduIFVwPC9hPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVxcXCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGJsdWUgYWNjZW50LTRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5nbygpXFxcIj5Mb2dpbjwvYT5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPGJyIGNsYXNzPVxcXCJjbGVhcmZpeFxcXCIgLz5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc3RhdGUpIHtcbiAgICAgICAgdGhpcy5lbWFpbCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5nbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZS5hcHByb3ZhbHMnKTtcbiAgICAgICAgfTtcbiAgICB9XG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKCdDT05TVEFOVFMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgQVBJX1VSTDogXCJodHRwOi8vMTA0LjE5Ny4yMDUuMTMzL1wiLFxuICAgICAgICBIRVJFOiB7XG4gICAgICAgICAgICBJRDogXCJNSlo3aGVJek9icEFXWWUwemU5dVwiLFxuICAgICAgICAgICAgQVBQOiBcIkxoWlVkWXhjNVQ3dkR5UDh3MEJqTWdcIlxuICAgICAgICB9XG4gICAgfTtcbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnNlcnZpY2UoJ0xvY2F0aW9uU2VydmljZScsIGZ1bmN0aW9uICgkcSkge1xuICAgIGlmICghbmF2aWdhdG9yLmdlb2xvY2F0aW9uKSB7XG4gICAgICAgIGFsZXJ0KFwiWW91ciBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgZ2VvbG9jYXRpb24uIFBsZWFzZSB0cnkgaW4gQ2hyb21lLCBGaXJlZm94LCBTYWZhcmkgb3IgRWRnZVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldExvY2F0aW9uOiBmdW5jdGlvbiBnZXRMb2NhdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkcShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbiAocG9zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF0OiBwb3MuY29vcmRzLmxhdGl0dWRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvbmc6IHBvcy5jb29yZHMubG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogOFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKCdQaG90b3NTZXJ2aWNlJywgZnVuY3Rpb24gKCRodHRwLCBDT05TVEFOVFMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBhbGw6IGZ1bmN0aW9uIGFsbCgpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoQ09OU1RBTlRTLkFQSV9VUkwgKyBcIi9waG90b3NcIikudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTtcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLnNlcnZpY2UoXCJVc2VyU2VydmljZVwiLCBmdW5jdGlvbiAoKSB7fSk7IiwiYW5ndWxhci5tb2R1bGUoXCJhcHBcIiwgW1widWkucm91dGVyXCIsIFwidWkubWF0ZXJpYWxpemVcIl0pXG4gICAgLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCBmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMudXNlWERvbWFpbiA9IHRydWU7XG4gICAgICAgIGRlbGV0ZSAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWydYLVJlcXVlc3RlZC1XaXRoJ107XG4gICAgfVxuXSlcbiAgICAvLyAuY29uZmlnKChQYXJzZVByb3ZpZGVyKSA9PiB7XG4gICAgLy8gICAgIFBhcnNlUHJvdmlkZXIuaW5pdGlhbGl6ZShcInk4NWd2Q3YzdVVLZHZaa0hmUzNpdXRlUkZoZGNWUWRoUlV2OXZNNmVcIiwgXCJwWW9RcGdzSUNUaHJaR1hoUGY4alNQUm44Y0g2WjFEb3NyZk9xbmpxXCIpXG4gICAgLy8gfSk7IiwiYW5ndWxhci5tb2R1bGUoXCJhcHBcIikuY29uZmlnKCgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSA9PiB7XG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShcIi9cIik7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKFwiaG9tZVwiLCB7XG4gICAgICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgICAgIHVybDogXCIvXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHAtY29tcG9uZW50PjwvYXBwLWNvbXBvbmVudD5cbiAgICAgICAgICAgIGBcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKFwiaG9tZS5oaXN0b3J5XCIsIHtcbiAgICAgICAgICAgIHVybDogXCJcIixcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGhpc3RvcnktY29tcG9uZW50PjwvaGlzdG9yeS1jb21wb25lbnQ+XG4gICAgICAgICAgICBgXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZShcImhvbWUubG9naW5cIiwge1xuICAgICAgICAgICAgdXJsOiBcIi9sb2dpblwiLFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8bG9naW4tY29tcG9uZW50PjwvbG9naW4tY29tcG9uZW50PlxuICAgICAgICAgICAgYFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoXCJob21lLmxlYWRlcmJvYXJkXCIsIHtcbiAgICAgICAgICAgIHVybDogXCIvbGVhZGVyYm9hcmRcIixcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGxlYWRlcmJvYXJkLWNvbXBvbmVudD48L2xlYWRlcmJvYXJkLWNvbXBvbmVudD5cbiAgICAgICAgICAgIGBcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKFwiaG9tZS5hcHByb3ZhbHNcIiwge1xuICAgICAgICAgICAgdXJsOiBcIi9hcHByb3ZhbHNcIixcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGFwcHJvdmFscy1jb21wb25lbnQ+PC9hcHByb3ZhbHMtY29tcG9uZW50PlxuICAgICAgICAgICAgYFxuICAgICAgICB9KVxuO1xufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnYXBwQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxoZWFkZXItY29tcG9uZW50PjwvaGVhZGVyLWNvbXBvbmVudD5cblxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8ZGl2IHVpLXZpZXc+PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICBcbiAgICBgXG4gICAgXG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdhcHByb3ZhbHNDb21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGgzPkFwcHJvdmFscyBOZWVkZWQ8L2gzPlxuICAgICAgICA8aDYgbmctaWY9XCIhJGN0cmwuaXRlbXMubGVuZ3RoXCI+Tm8gYXBwcm92YWxzIG5lZWRlZDwvaDY+XG4gICAgICAgIDxoaXN0b3J5LWRldGFpbCBoaXN0b3J5LWl0ZW1zPVwiJGN0cmwuaXRlbXNcIj48L2hpc3RvcnktZGV0YWlsPlxuICAgIGAsXG4gICAgY29udHJvbGxlcihQaG90b3NTZXJ2aWNlKSB7XG4gICAgICAgIFBob3Rvc1NlcnZpY2UuYWxsKClcbiAgICAgICAgICAgIC50aGVuKHhzID0+IHhzLmZpbHRlcih4ID0+ICF4LmFwcHJvdmVkKSlcbiAgICAgICAgICAgIC50aGVuKHBob3RvcyA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IHBob3RvcztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYXBwcm92ZWQnLCBwaG90b3MpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwaG90b3M7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59KSIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2hlYWRlckNvbXBvbmVudCcsIHtcbiAgICBjb250cm9sbGVyKCkge1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcbiAgICB9LFxuICAgIGJpbmRpbmdzOiB7XG4gICAgICAgIHVzZXI6IFwiPVwiXG4gICAgfSxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8bmF2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm5hdi13cmFwcGVyXCI+XG4gICAgICAgICAgICA8YSB1aS1zcmVmPVwiaG9tZVwiIGNsYXNzPVwiYnJhbmQtbG9nb1wiPlN0b3Jtd2F0ZXIgUmV0ZW50aW9uIEJhc2luczwvYT5cbiAgICAgICAgICAgIDx1bCBpZD1cIm5hdi1tb2JpbGVcIiBjbGFzcz1cInJpZ2h0IGhpZGUtb24tbWVkLWFuZC1kb3duXCI+XG4gICAgICAgICAgICAgICAgPGxpPjxhIHVpLXNyZWY9XCIubGVhZGVyYm9hcmRcIj5MZWFkZXJib2FyZHM8L2E+PC9saT5cbiAgICAgICAgICAgICAgICA8bGk+PGEgdWktc3JlZj1cIi5sb2dpblwiPlNpZ24gSW48L2E+PC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9uYXY+XG4gICAgYCxcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2hpc3RvcnlEZXRhaWwnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICBcbiAgICA8ZGl2IGNsYXNzPVwicm93XCIgbmctcmVwZWF0PVwiaXRlbSBpbiAkY3RybC5oaXN0b3J5SXRlbXNcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBzMTIgbTEyXCIgbmctaWY9XCJpdGVtLmhpZGUgIT09IHRydWUgfHwgaXRlbS5hcHByb3ZlZFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWltYWdlXCI+XG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCJ7e2l0ZW0uaW1hZ2VVUkx9fVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2FyZC10aXRsZVwiPkxvY2F0aW9uIERhdGE8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cInt7JGN0cmwuZ2V0QXZhdGFyKCl9fVwiIGFsdD1cIlwiIGNsYXNzPVwiY2lyY2xlIGF2YXRhclwiPlxuICAgICAgICAgICAgICAgIDxwPkNyZWF0ZWQgYnk6IHt7JGN0cmwuZ2V0TmFtZSgpfX0gb24ge3tpdGVtLmNyZWF0ZWQuZGF0ZX19IGluIHRoZSB7e2l0ZW0uem9uZX19PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1hY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cIml0ZW0uYXBwcm92ZWRcIiBuZy1jbGljaz1cIiRjdHJsLmNsb3NlKClcIj5DbG9zZTwvYT5cbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cIiFpdGVtLmFwcHJvdmVkXCIgbmctY2xpY2s9XCIkY3RybC5oaWRlKGl0ZW0pXCIgY2xhc3M9XCJncmVlbi10ZXh0IGRhcmtlbi00XCI+QXBwcm92ZTwvYT5cbiAgICAgICAgICAgICAgICA8YSBuZy1pZj1cIiFpdGVtLmFwcHJvdmVkXCIgbmctY2xpY2s9XCIkY3RybC5oaWRlKGl0ZW0pXCIgY2xhc3M9XCJyZWQtdGV4dCBkYXJrZW4tNFwiPkRpc2FwcHJvdmU8L2E+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoVXNlclNlcnZpY2UsICRyb290U2NvcGUpIHtcbiAgICAgICAgdGhpcy5jbG9zZSA9ICgpID0+IHtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChcImNsb3NlOml0ZW1cIik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdldE5hbWUgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lcyA9IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdCb2IgTS4nLFxuICAgICAgICAgICAgICAgICAgICBzY29yZTogNDUsXG4gICAgICAgICAgICAgICAgICAgIGltZzogMSxcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdHZW9yZ2UgSi4nLFxuICAgICAgICAgICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICAgICAgICAgIGltZzogMixcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdIZWF0aGVyIFIuJyxcbiAgICAgICAgICAgICAgICAgICAgc2NvcmU6IDQwLFxuICAgICAgICAgICAgICAgICAgICBpbWc6IDMsXG4gICAgICAgICAgICAgICAgICAgIGJhZGdlczogNFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnS2FyZW4gUy4nLFxuICAgICAgICAgICAgICAgICAgICBzY29yZTogMjAsXG4gICAgICAgICAgICAgICAgICAgIGltZzogNCxcbiAgICAgICAgICAgICAgICAgICAgYmFkZ2VzOiAyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdTYW1teSBRLicsXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlOiA1LFxuICAgICAgICAgICAgICAgICAgICBpbWc6IDUsXG4gICAgICAgICAgICAgICAgICAgIGJhZGdlczogMVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHJldHVybiBuYW1lc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBuYW1lcy5sZW5ndGgpXS5uYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nZXRBdmF0YXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBudW1zID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldO1xuXG4gICAgICAgICAgICBjb25zdCBpZCA9IG51bXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbnVtcy5sZW5ndGgpXTtcbiAgICAgICAgICAgIHJldHVybiBgL2Rpc3BsYXkvaW1hZ2VzL3Byb2ZpbGVfJHtpZH0ucG5nYDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhpZGUgPSAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgaXRlbS5oaWRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgYmluZGluZ3M6IHtcbiAgICAgICAgaGlzdG9yeUl0ZW1zOiAnPSdcbiAgICB9XG5cbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGlzdG9yeUNvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8YSBuZy1jbGljaz1cIiRjdHJsLnNob3coKVwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBjbGFzcz1cInNob3ctbWFwXCI+PC9hPlxuICAgICAgICA8ZGl2IGlkPVwibWFwXCI+PC9kaXY+XG4gICAgICAgIDxoaXN0b3J5LWRldGFpbCBuZy1pZj1cIiRjdHJsLmNob3Nlbl9pdGVtcy5sZW5ndGhcIiBoaXN0b3J5LWl0ZW1zPVwiJGN0cmwuY2hvc2VuX2l0ZW1zXCI+PC9oaXN0b3J5LWRldGFpbD5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBMb2NhdGlvblNlcnZpY2UsIFBob3Rvc1NlcnZpY2UsIENPTlNUQU5UUykge1xuICAgICAgICB0aGlzLm1hcCA9IG51bGw7XG4gICAgICAgIHRoaXMuc2hvdyA9ICgpID0+IHsgfTtcbiAgICAgICAgdGhpcy5jaG9zZW5faXRlbXMgPSBbXTtcblxuICAgICAgICBjb25zdCBpY29uID0gYDxzdmcgd2lkdGg9XCIxMlwiIGhlaWdodD1cIjEyXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBzdHJva2U9XCJ3aGl0ZVwiIGZpbGw9XCJ7fVwiIHg9XCIxXCIgeT1cIjFcIiB3aWR0aD1cIjIyXCIgXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCIyMlwiIC8+PC9zdmc+YDtcblxuICAgICAgICAkc2NvcGUuJG9uKCdjbG9zZTppdGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jaG9zZW5faXRlbXMgPSBbXTtcbiAgICAgICAgfSlcblxuICAgICAgICBQaG90b3NTZXJ2aWNlLmFsbCgpXG4gICAgICAgICAgICAudGhlbihwaG90b3MgPT4ge1xuICAgICAgICAgICAgICAgIHBob3RvcyA9IHBob3Rvcy5maWx0ZXIoeCA9PiB4LmFwcHJvdmVkKTtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1zID0gcGhvdG9zO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBob3Rvcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBob3RvcztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigocGhvdG9zKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KHBob3Rvcyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmluaXQgPSAocGhvdG9zKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwbGF0Zm9ybSA9IG5ldyBILnNlcnZpY2UuUGxhdGZvcm0oe1xuICAgICAgICAgICAgICAgIGFwcF9pZDogQ09OU1RBTlRTLkhFUkUuSUQsXG4gICAgICAgICAgICAgICAgYXBwX2NvZGU6IENPTlNUQU5UUy5IRVJFLkFQUFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRzID0gcGxhdGZvcm0uY3JlYXRlRGVmYXVsdExheWVycygpO1xuICAgICAgICAgICAgY29uc3QgbWFwID0gbmV3IEguTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSxcbiAgICAgICAgICAgICAgICBkZWZhdWx0cy5ub3JtYWwubWFwLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXQ6IDI5LjQyNDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBsbmc6IC05OC40OTM2XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHpvb206IDdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCB1aSA9IEgudWkuVUkuY3JlYXRlRGVmYXVsdChtYXAsIGRlZmF1bHRzKTtcblxuICAgICAgICAgICAgY29uc3QgYm91bmRzID0gbmV3IEgubWFwLk92ZXJsYXkobmV3IEguZ2VvLlJlY3QoMzAuNzg1NzE4LCAtMTAwLjU1ODUwNCwgMjguOTkwOTUyLCAtOTYuOTc2NTI3KSwgJy9kaXNwbGF5L2ltYWdlcy9tYXBfZ2MucG5nJyk7XG4gICAgICAgICAgICBtYXAuYWRkT2JqZWN0KGJvdW5kcyk7XG5cbiAgICAgICAgICAgIGZvciAobGV0IHBob3RvIG9mIHBob3Rvcykge1xuXG4gICAgICAgICAgICAgICAgaWYgKCFwaG90by5jb2xvcikge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHBob3RvLmNvbG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJvcmFuZ2VcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob3RvLmNvbG9yID0gXCIjZmY2NjAwXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcInJlZFwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgcGhvdG8uY29sb3IgPSBcIiNlZjMxMjNcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZ3JlZW5cIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob3RvLmNvbG9yID0gXCIjMDA5OTMzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHRoaXNfaWNvbiA9IGljb24ucmVwbGFjZShcInt9XCIsIHBob3RvLmNvbG9yKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHBsYWNlID0gbmV3IEgubWFwLkljb24odGhpc19pY29uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIGxhdDogcGhvdG8ubGF0LFxuICAgICAgICAgICAgICAgICAgICBsbmc6IHBob3RvLmxvblxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3QgbWFya2VyID0gbmV3IEgubWFwLk1hcmtlcihjb29yZHMsIHsgaWNvbjogcGxhY2UsIGlkOiBwaG90by5pZCB9KVxuICAgICAgICAgICAgICAgIG1hcC5hZGRPYmplY3QobWFya2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbWFwX2V2ZW50cyA9IG5ldyBILm1hcGV2ZW50cy5NYXBFdmVudHMobWFwKTtcbiAgICAgICAgICAgIG1hcC5hZGRFdmVudExpc3RlbmVyKCd0YXAnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5pdGVtcy5maWx0ZXIoeCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlLnRhcmdldC5iYi5sYXQgPT0geC5sYXQgJiYgZS50YXJnZXQuYmIubG5nID09IHgubG9uO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TWFya2VyKGl0ZW1zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2hvd01hcmtlciA9IChpdGVtcykgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaG9zZW5faXRlbXMgPSBpdGVtcztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNob29zZSBpdGVtc1wiLCB0aGlzLmNob3Nlbl9pdGVtcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgJCgnLnNob3ctbWFwJykuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKTtcblxuICAgIH1cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2xlYWRlcmJvYXJkQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDx1bCBjbGFzcz1cImNvbGxlY3Rpb25cIj5cbiAgICAgICAgICAgIDxsaSBjbGFzcz1cImNvbGxlY3Rpb24taXRlbSBhdmF0YXJcIiBuZy1yZXBlYXQ9XCJ1c2VyIGluICRjdHJsLnVzZXJzXCI+XG4gICAgICAgICAgICAgICAgPGltZyBzcmM9XCIvZGlzcGxheS9pbWFnZXMvcHJvZmlsZV97e3VzZXIuaW1nfX0ucG5nXCIgYWx0PVwiXCIgY2xhc3M9XCJjaXJjbGVcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpdGxlXCI+e3t1c2VyLm5hbWV9fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8cD5IZXJvIFBvaW50czogPHNwYW4gY2xhc3M9XCJyZWQtdGV4dFwiPnt7dXNlci5zY29yZX19PC9zcGFuPiA8YnIgLz5cbiAgICAgICAgICAgICAgICBCYWRnZXM6IHt7dXNlci5iYWRnZXN9fVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiIyFcIiBjbGFzcz1cInNlY29uZGFyeS1jb250ZW50XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPmdyYWRlPC9pPjwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgYCxcbiAgICBjb250cm9sbGVyKCkge1xuICAgICAgICB0aGlzLnVzZXJzID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdCb2IgTS4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA0NSxcbiAgICAgICAgICAgICAgICBpbWc6IDEsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdHZW9yZ2UgSi4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA0MCxcbiAgICAgICAgICAgICAgICBpbWc6IDIsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdIZWF0aGVyIFIuJyxcbiAgICAgICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICAgICAgaW1nOiAzLFxuICAgICAgICAgICAgICAgIGJhZGdlczogNFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnS2FyZW4gUy4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiAyMCxcbiAgICAgICAgICAgICAgICBpbWc6IDQsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiAyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdTYW1teSBRLicsXG4gICAgICAgICAgICAgICAgc2NvcmU6IDUsXG4gICAgICAgICAgICAgICAgaW1nOiA1LFxuICAgICAgICAgICAgICAgIGJhZGdlczogMVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnbG9naW5Db21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cInJvd1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBzMTIgbTYgb2Zmc2V0LW0zXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXJkLXRpdGxlXCI+TG9naW48L3NwYW4+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+VG8gYWNjZXNzIGFkbWluaXN0cmF0aW9uIGZlYXR1cmVzLCB5b3UnbGwgbmVlZCB0byBsb2dpbi48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaW5wdXQtZmllbGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgbmctbW9kZWw9XCIkY3RybC5lbWFpbFwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJZb3VyIEVtYWlsIEFkZHJlc3NcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpbnB1dC1maWVsZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuZy1tb2RlbD1cIiRjdHJsLnBhc3N3b3JkXCIgdHlwZT1cInBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCJZb3VyIFBhc3N3b3JkXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gYWNjZW50LTRcIiBuZy1jbGljaz1cIiRjdHJsLmdvKClcIj5TaWduIFVwPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGJsdWUgYWNjZW50LTRcIiBuZy1jbGljaz1cIiRjdHJsLmdvKClcIj5Mb2dpbjwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxiciBjbGFzcz1cImNsZWFyZml4XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoJHN0YXRlKSB7XG4gICAgICAgIHRoaXMuZW1haWwgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuZ28gPSAoKSA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUuYXBwcm92YWxzJyk7XG4gICAgICAgIH1cbiAgICB9XG59KSIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKCdDT05TVEFOVFMnLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgQVBJX1VSTDogXCJodHRwOi8vMTA0LjE5Ny4yMDUuMTMzL1wiLFxuICAgICAgICBIRVJFOiB7XG4gICAgICAgICAgICBJRDogXCJNSlo3aGVJek9icEFXWWUwemU5dVwiLFxuICAgICAgICAgICAgQVBQOiBcIkxoWlVkWXhjNVQ3dkR5UDh3MEJqTWdcIlxuICAgICAgICB9XG4gICAgfVxufSkiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnTG9jYXRpb25TZXJ2aWNlJywgKCRxKSA9PiB7XG4gICAgaWYgKCFuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcbiAgICAgICAgYWxlcnQoXCJZb3VyIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBnZW9sb2NhdGlvbi4gUGxlYXNlIHRyeSBpbiBDaHJvbWUsIEZpcmVmb3gsIFNhZmFyaSBvciBFZGdlXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0TG9jYXRpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJHEoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oKHBvcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdDogcG9zLmNvb3Jkcy5sYXRpdHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25nOiBwb3MuY29vcmRzLmxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnUGhvdG9zU2VydmljZScsICgkaHR0cCwgQ09OU1RBTlRTKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWxsKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChgJHtDT05TVEFOVFMuQVBJX1VSTH0vcGhvdG9zYClcbiAgICAgICAgICAgICAgICAudGhlbihyZXMgPT4gcmVzLmRhdGEpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZShcIlVzZXJTZXJ2aWNlXCIsICgpID0+IHtcbiAgICBcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
