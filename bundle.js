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
angular.module('app').service('CONSTANTS', function () {
    return {
        API_URL: "http://104.197.205.133",
        HERE: {
            ID: "MJZ7heIzObpAWYe0ze9u",
            APP: "LhZUdYxc5T7vDyP8w0BjMg"
        }
    };
});
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
    template: "\n        <nav>\n            <div class=\"nav-wrapper\">\n            <a ui-sref=\"home\" class=\"brand-logo\">EAA Basins</a>\n            <ul id=\"nav-mobile\" class=\"right hide-on-med-and-down\">\n                <li><a ui-sref=\".leaderboard\">Leaderboards</a></li>\n                <li><a ui-sref=\".login\">Sign In</a></li>\n            </ul>\n            </div>\n        </nav>\n    "
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
            return "/images/profile_" + id + ".png";
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

        var icon = "<svg width=\"24\" height=\"24\" \n                        xmlns=\"http://www.w3.org/2000/svg\">\n                        <rect stroke=\"white\" fill=\"#1b468d\" x=\"1\" y=\"1\" width=\"22\" \n                        height=\"22\" /></svg>";

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


                    console.log(photo.approved);

                    var place = new H.map.Icon(icon);
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

            map.addObject(new H.map.Marker({
                lat: 29.4241,
                lng: -98.4936
            }, {
                icon: new H.map.Icon(icon)
            }));
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
    template: "\n        <ul class=\"collection\">\n            <li class=\"collection-item avatar\" ng-repeat=\"user in $ctrl.users\">\n                <img src=\"/images/profile_{{user.img}}.png\" alt=\"\" class=\"circle\">\n                <span class=\"title\">{{user.name}}</span>\n                <p>Hero Points: <span class=\"red-text\">{{user.score}}</span> <br />\n                Badges: {{user.badges}}\n                \n                </p>\n                <a href=\"#!\" class=\"secondary-content\"><i class=\"material-icons\">grade</i></a>\n            </li>\n        </ul>\n    ",
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1bmRsZS5qcyIsIm1haW4uanMiLCJyb3V0ZXMuanMiLCJvYmplY3RzL2NvbnN0YW50cy5vYmplY3QuanMiLCJjb21wb25lbnRzL2FwcC5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2FwcHJvdmFscy5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2hlYWRlci5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2hpc3RvcnktZGV0YWlsLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvaGlzdG9yeS5jb21wb25lbnQuanMiLCJjb21wb25lbnRzL2xlYWRlcmJvYXJkLmNvbXBvbmVudC5qcyIsImNvbXBvbmVudHMvbG9naW4uY29tcG9uZW50LmpzIiwic2VydmljZXMvTG9jYXRpb25TZXJ2aWNlLmpzIiwic2VydmljZXMvUGhvdG9zU2VydmljZS5qcyIsInNlcnZpY2VzL3VzZXIuc2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQSxRQUFBLE9BQUEsT0FBQSxDQUFBLGFBQUEsbUJBQ0EsT0FBQSxDQUFBLGlCQUFBLFVBQUEsZUFBQTtJQUNBLGNBQUEsU0FBQSxhQUFBO0lBQ0EsT0FBQSxjQUFBLFNBQUEsUUFBQSxPQUFBOzs7OztBQ0hBLFFBQUEsT0FBQSxPQUFBLGdEQUFBLFVBQUEsZ0JBQUEsb0JBQUE7SUFDQSxtQkFBQSxVQUFBO0lBQ0EsZUFDQSxNQUFBLFFBQUE7UUFDQSxVQUFBO1FBQ0EsS0FBQTtRQUNBLFVBQUE7T0FJQSxNQUFBLGdCQUFBO1FBQ0EsS0FBQTtRQUNBLFVBQUE7T0FJQSxNQUFBLGNBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTtPQUlBLE1BQUEsb0JBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTtPQUlBLE1BQUEsa0JBQUE7UUFDQSxLQUFBO1FBQ0EsVUFBQTs7O0FDOUJBLFFBQUEsT0FBQSxPQUFBLFFBQUEsYUFBQSxZQUFBO0lBQ0EsT0FBQTtRQUNBLFNBQUE7UUFDQSxNQUFBO1lBQ0EsSUFBQTtZQUNBLEtB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QSxLQUFBLFFBQUE7O1FBRUEsS0FBQSxLQUFBLFlBQUE7WUFDQSxPQUFBLEdBQUE7Ozs7QUM1QkEsUUFBQSxPQUFBLE9BQUEsUUFBQSwwQkFBQSxVQUFBLElBQUE7SUFDQSxJQUFBLENBQUEsVUFBQSxhQUFBO1FBQ0EsTUFBQTtRQUNBOzs7SUFHQSxPQUFBO1FBQ0EsYUFEQSxTQUFBLGNBQ0E7WUFDQSxPQUFBLEdBQUEsVUFBQSxTQUFBLFFBQUE7Z0JBQ0EsVUFBQSxZQUFBLG1CQUFBLFVBQUEsS0FBQTtvQkFDQSxRQUFBO3dCQUNBLFFBQUE7NEJBQ0EsS0FBQSxJQUFBLE9BQUE7NEJBQ0EsTUFBQSxJQUFBLE9BQUE7O3dCQUVBLE1BQUE7O21CQUVBLFVBQUEsS0FBQTtvQkFDQSxPQUFBOzs7Ozs7O0FDbEJBLFFBQUEsT0FBQSxPQUFBLFFBQUEsd0NBQUEsVUFBQSxPQUFBLFdBQUE7SUFDQSxPQUFBO1FBQ0EsS0FEQSxTQUFBLE1BQ0E7WUFDQSxPQUFBLE1BQUEsSUFBQSxVQUFBLFVBQUEsV0FDQSxLQUFBLFVBQUEsS0FBQTtnQkFBQSxPQUFBLElBQUE7ZUFDQSxNQUFBLFVBQUEsS0FBQTtnQkFBQSxPQUFBLFFBQUEsTUFBQTs7Ozs7O0FDTEEsUUFBQSxPQUFBLE9BQUEsUUFBQSxlQUFBLFlBQUEsSUFBQSIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuYW5ndWxhci5tb2R1bGUoXCJhcHBcIiwgW1widWkucm91dGVyXCIsIFwidWkubWF0ZXJpYWxpemVcIl0pLmNvbmZpZyhbJyRodHRwUHJvdmlkZXInLCBmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMudXNlWERvbWFpbiA9IHRydWU7XG4gICAgZGVsZXRlICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ1gtUmVxdWVzdGVkLVdpdGgnXTtcbn1dKTtcbi8vIC5jb25maWcoKFBhcnNlUHJvdmlkZXIpID0+IHtcbi8vICAgICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJ5ODVndkN2M3VVS2R2WmtIZlMzaXV0ZVJGaGRjVlFkaFJVdjl2TTZlXCIsIFwicFlvUXBnc0lDVGhyWkdYaFBmOGpTUFJuOGNINloxRG9zcmZPcW5qcVwiKVxuLy8gfSk7XG5hbmd1bGFyLm1vZHVsZShcImFwcFwiKS5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL1wiKTtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZShcImhvbWVcIiwge1xuICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgdXJsOiBcIi9cIixcbiAgICAgICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICAgICAgICAgIDxhcHAtY29tcG9uZW50PjwvYXBwLWNvbXBvbmVudD5cXG4gICAgICAgICAgICBcIlxuICAgIH0pLnN0YXRlKFwiaG9tZS5oaXN0b3J5XCIsIHtcbiAgICAgICAgdXJsOiBcIlwiLFxuICAgICAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgICAgICAgICAgPGhpc3RvcnktY29tcG9uZW50PjwvaGlzdG9yeS1jb21wb25lbnQ+XFxuICAgICAgICAgICAgXCJcbiAgICB9KS5zdGF0ZShcImhvbWUubG9naW5cIiwge1xuICAgICAgICB1cmw6IFwiL2xvZ2luXCIsXG4gICAgICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgICAgICAgICA8bG9naW4tY29tcG9uZW50PjwvbG9naW4tY29tcG9uZW50PlxcbiAgICAgICAgICAgIFwiXG4gICAgfSkuc3RhdGUoXCJob21lLmxlYWRlcmJvYXJkXCIsIHtcbiAgICAgICAgdXJsOiBcIi9sZWFkZXJib2FyZFwiLFxuICAgICAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgICAgICAgICAgPGxlYWRlcmJvYXJkLWNvbXBvbmVudD48L2xlYWRlcmJvYXJkLWNvbXBvbmVudD5cXG4gICAgICAgICAgICBcIlxuICAgIH0pLnN0YXRlKFwiaG9tZS5hcHByb3ZhbHNcIiwge1xuICAgICAgICB1cmw6IFwiL2FwcHJvdmFsc1wiLFxuICAgICAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgICAgICAgICAgPGFwcHJvdmFscy1jb21wb25lbnQ+PC9hcHByb3ZhbHMtY29tcG9uZW50PlxcbiAgICAgICAgICAgIFwiXG4gICAgfSk7XG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKCdDT05TVEFOVFMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgQVBJX1VSTDogXCJodHRwOi8vMTA0LjE5Ny4yMDUuMTMzXCIsXG4gICAgICAgIEhFUkU6IHtcbiAgICAgICAgICAgIElEOiBcIk1KWjdoZUl6T2JwQVdZZTB6ZTl1XCIsXG4gICAgICAgICAgICBBUFA6IFwiTGhaVWRZeGM1VDd2RHlQOHcwQmpNZ1wiXG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdhcHBDb21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8aGVhZGVyLWNvbXBvbmVudD48L2hlYWRlci1jb21wb25lbnQ+XFxuXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb250YWluZXJcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgdWktdmlldz48L2Rpdj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgXFxuICAgIFwiXG5cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnYXBwcm92YWxzQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgPGgzPkFwcHJvdmFscyBOZWVkZWQ8L2gzPlxcbiAgICAgICAgPGg2IG5nLWlmPVxcXCIhJGN0cmwuaXRlbXMubGVuZ3RoXFxcIj5ObyBhcHByb3ZhbHMgbmVlZGVkPC9oNj5cXG4gICAgICAgIDxoaXN0b3J5LWRldGFpbCBoaXN0b3J5LWl0ZW1zPVxcXCIkY3RybC5pdGVtc1xcXCI+PC9oaXN0b3J5LWRldGFpbD5cXG4gICAgXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcihQaG90b3NTZXJ2aWNlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgUGhvdG9zU2VydmljZS5hbGwoKS50aGVuKGZ1bmN0aW9uICh4cykge1xuICAgICAgICAgICAgcmV0dXJuIHhzLmZpbHRlcihmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAheC5hcHByb3ZlZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChwaG90b3MpIHtcbiAgICAgICAgICAgIF90aGlzLml0ZW1zID0gcGhvdG9zO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FwcHJvdmVkJywgcGhvdG9zKTtcbiAgICAgICAgICAgIHJldHVybiBwaG90b3M7XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGVhZGVyQ29tcG9uZW50Jywge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGNvbnRyb2xsZXIoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgIH0sXG5cbiAgICBiaW5kaW5nczoge1xuICAgICAgICB1c2VyOiBcIj1cIlxuICAgIH0sXG4gICAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8bmF2PlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIm5hdi13cmFwcGVyXFxcIj5cXG4gICAgICAgICAgICA8YSB1aS1zcmVmPVxcXCJob21lXFxcIiBjbGFzcz1cXFwiYnJhbmQtbG9nb1xcXCI+RUFBIEJhc2luczwvYT5cXG4gICAgICAgICAgICA8dWwgaWQ9XFxcIm5hdi1tb2JpbGVcXFwiIGNsYXNzPVxcXCJyaWdodCBoaWRlLW9uLW1lZC1hbmQtZG93blxcXCI+XFxuICAgICAgICAgICAgICAgIDxsaT48YSB1aS1zcmVmPVxcXCIubGVhZGVyYm9hcmRcXFwiPkxlYWRlcmJvYXJkczwvYT48L2xpPlxcbiAgICAgICAgICAgICAgICA8bGk+PGEgdWktc3JlZj1cXFwiLmxvZ2luXFxcIj5TaWduIEluPC9hPjwvbGk+XFxuICAgICAgICAgICAgPC91bD5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDwvbmF2PlxcbiAgICBcIlxufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdoaXN0b3J5RGV0YWlsJywge1xuICAgIHRlbXBsYXRlOiBcIlxcbiAgICBcXG4gICAgPGRpdiBjbGFzcz1cXFwicm93XFxcIiBuZy1yZXBlYXQ9XFxcIml0ZW0gaW4gJGN0cmwuaGlzdG9yeUl0ZW1zXFxcIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XFxcImNvbCBzMTIgbTEyXFxcIiBuZy1pZj1cXFwiaXRlbS5oaWRlICE9PSB0cnVlIHx8IGl0ZW0uYXBwcm92ZWRcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmRcXFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQtaW1hZ2VcXFwiPlxcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cXFwie3tpdGVtLmltYWdlVVJMfX1cXFwiPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cXFwiY2FyZC10aXRsZVxcXCI+TG9jYXRpb24gRGF0YTwvc3Bhbj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjYXJkLWNvbnRlbnRcXFwiPlxcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cXFwie3skY3RybC5nZXRBdmF0YXIoKX19XFxcIiBhbHQ9XFxcIlxcXCIgY2xhc3M9XFxcImNpcmNsZSBhdmF0YXJcXFwiPlxcbiAgICAgICAgICAgICAgICA8cD5DcmVhdGVkIGJ5OiBCb2IgUi4gb24ge3tpdGVtLmNyZWF0ZWQuZGF0ZX19IGluIHRoZSB7e2l0ZW0uem9uZX19PC9wPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQtYWN0aW9uXFxcIj5cXG4gICAgICAgICAgICAgICAgPGEgbmctaWY9XFxcIml0ZW0uYXBwcm92ZWRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5jbG9zZSgpXFxcIj5DbG9zZTwvYT5cXG4gICAgICAgICAgICAgICAgPGEgbmctaWY9XFxcIiFpdGVtLmFwcHJvdmVkXFxcIiBuZy1jbGljaz1cXFwiJGN0cmwuaGlkZShpdGVtKVxcXCIgY2xhc3M9XFxcImdyZWVuLXRleHQgZGFya2VuLTRcXFwiPkFwcHJvdmU8L2E+XFxuICAgICAgICAgICAgICAgIDxhIG5nLWlmPVxcXCIhaXRlbS5hcHByb3ZlZFxcXCIgbmctY2xpY2s9XFxcIiRjdHJsLmhpZGUoaXRlbSlcXFwiIGNsYXNzPVxcXCJyZWQtdGV4dCBkYXJrZW4tNFxcXCI+RGlzYXBwcm92ZTwvYT5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gICBcXG4gICAgXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcihVc2VyU2VydmljZSwgJHJvb3RTY29wZSkge1xuICAgICAgICB0aGlzLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KFwiY2xvc2U6aXRlbVwiKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldEF2YXRhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBudW1zID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDldO1xuXG4gICAgICAgICAgICB2YXIgaWQgPSBudW1zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG51bXMubGVuZ3RoKV07XG4gICAgICAgICAgICByZXR1cm4gXCIvaW1hZ2VzL3Byb2ZpbGVfXCIgKyBpZCArIFwiLnBuZ1wiO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaGlkZSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLmhpZGUgPSB0cnVlO1xuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBiaW5kaW5nczoge1xuICAgICAgICBoaXN0b3J5SXRlbXM6ICc9J1xuICAgIH1cblxufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdoaXN0b3J5Q29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgPGEgbmctY2xpY2s9XFxcIiRjdHJsLnNob3coKVxcXCIgc3R5bGU9XFxcImRpc3BsYXk6IG5vbmU7XFxcIiBjbGFzcz1cXFwic2hvdy1tYXBcXFwiPjwvYT5cXG4gICAgICAgIDxkaXYgaWQ9XFxcIm1hcFxcXCI+PC9kaXY+XFxuICAgICAgICA8aGlzdG9yeS1kZXRhaWwgbmctaWY9XFxcIiRjdHJsLmNob3Nlbl9pdGVtcy5sZW5ndGhcXFwiIGhpc3RvcnktaXRlbXM9XFxcIiRjdHJsLmNob3Nlbl9pdGVtc1xcXCI+PC9oaXN0b3J5LWRldGFpbD5cXG4gICAgXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc2NvcGUsICRyb290U2NvcGUsIExvY2F0aW9uU2VydmljZSwgUGhvdG9zU2VydmljZSwgQ09OU1RBTlRTKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMubWFwID0gbnVsbDtcbiAgICAgICAgdGhpcy5zaG93ID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgIHRoaXMuY2hvc2VuX2l0ZW1zID0gW107XG5cbiAgICAgICAgdmFyIGljb24gPSBcIjxzdmcgd2lkdGg9XFxcIjI0XFxcIiBoZWlnaHQ9XFxcIjI0XFxcIiBcXG4gICAgICAgICAgICAgICAgICAgICAgICB4bWxucz1cXFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IHN0cm9rZT1cXFwid2hpdGVcXFwiIGZpbGw9XFxcIiMxYjQ2OGRcXFwiIHg9XFxcIjFcXFwiIHk9XFxcIjFcXFwiIHdpZHRoPVxcXCIyMlxcXCIgXFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PVxcXCIyMlxcXCIgLz48L3N2Zz5cIjtcblxuICAgICAgICAkc2NvcGUuJG9uKCdjbG9zZTppdGVtJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMyLmNob3Nlbl9pdGVtcyA9IFtdO1xuICAgICAgICB9KTtcblxuICAgICAgICBQaG90b3NTZXJ2aWNlLmFsbCgpLnRoZW4oZnVuY3Rpb24gKHBob3Rvcykge1xuICAgICAgICAgICAgcGhvdG9zID0gcGhvdG9zLmZpbHRlcihmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LmFwcHJvdmVkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBfdGhpczIuaXRlbXMgPSBwaG90b3M7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwaG90b3MpO1xuICAgICAgICAgICAgcmV0dXJuIHBob3RvcztcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocGhvdG9zKSB7XG4gICAgICAgICAgICBfdGhpczIuaW5pdChwaG90b3MpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmluaXQgPSBmdW5jdGlvbiAocGhvdG9zKSB7XG4gICAgICAgICAgICB2YXIgcGxhdGZvcm0gPSBuZXcgSC5zZXJ2aWNlLlBsYXRmb3JtKHtcbiAgICAgICAgICAgICAgICBhcHBfaWQ6IENPTlNUQU5UUy5IRVJFLklELFxuICAgICAgICAgICAgICAgIGFwcF9jb2RlOiBDT05TVEFOVFMuSEVSRS5BUFBcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgZGVmYXVsdHMgPSBwbGF0Zm9ybS5jcmVhdGVEZWZhdWx0TGF5ZXJzKCk7XG4gICAgICAgICAgICB2YXIgbWFwID0gbmV3IEguTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAnKSwgZGVmYXVsdHMubm9ybWFsLm1hcCwge1xuICAgICAgICAgICAgICAgIGNlbnRlcjoge1xuICAgICAgICAgICAgICAgICAgICBsYXQ6IDI5LjQyNDEsXG4gICAgICAgICAgICAgICAgICAgIGxuZzogLTk4LjQ5MzZcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHpvb206IDdcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgdWkgPSBILnVpLlVJLmNyZWF0ZURlZmF1bHQobWFwLCBkZWZhdWx0cyk7XG5cbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHBob3Rvc1tTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBob3RvID0gX3N0ZXAudmFsdWU7XG5cblxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwaG90by5hcHByb3ZlZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYWNlID0gbmV3IEgubWFwLkljb24oaWNvbik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXQ6IHBob3RvLmxhdCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxuZzogcGhvdG8ubG9uXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgSC5tYXAuTWFya2VyKGNvb3JkcywgeyBpY29uOiBwbGFjZSwgaWQ6IHBob3RvLmlkIH0pO1xuICAgICAgICAgICAgICAgICAgICBtYXAuYWRkT2JqZWN0KG1hcmtlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yLnJldHVybikge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2l0ZXJhdG9yLnJldHVybigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG1hcF9ldmVudHMgPSBuZXcgSC5tYXBldmVudHMuTWFwRXZlbnRzKG1hcCk7XG4gICAgICAgICAgICBtYXAuYWRkRXZlbnRMaXN0ZW5lcigndGFwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbXMgPSBfdGhpczIuaXRlbXMuZmlsdGVyKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlLnRhcmdldC5iYi5sYXQgPT0geC5sYXQgJiYgZS50YXJnZXQuYmIubG5nID09IHgubG9uO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgX3RoaXMyLnNob3dNYXJrZXIoaXRlbXMpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG1hcC5hZGRPYmplY3QobmV3IEgubWFwLk1hcmtlcih7XG4gICAgICAgICAgICAgICAgbGF0OiAyOS40MjQxLFxuICAgICAgICAgICAgICAgIGxuZzogLTk4LjQ5MzZcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBpY29uOiBuZXcgSC5tYXAuSWNvbihpY29uKVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2hvd01hcmtlciA9IGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMyLmNob3Nlbl9pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2hvb3NlIGl0ZW1zXCIsIF90aGlzMi5jaG9zZW5faXRlbXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKF90aGlzMi5pdGVtcykge1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICQoJy5zaG93LW1hcCcpLmNsaWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEwMCk7XG4gICAgfVxufSk7XG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdsZWFkZXJib2FyZENvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogXCJcXG4gICAgICAgIDx1bCBjbGFzcz1cXFwiY29sbGVjdGlvblxcXCI+XFxuICAgICAgICAgICAgPGxpIGNsYXNzPVxcXCJjb2xsZWN0aW9uLWl0ZW0gYXZhdGFyXFxcIiBuZy1yZXBlYXQ9XFxcInVzZXIgaW4gJGN0cmwudXNlcnNcXFwiPlxcbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cXFwiL2ltYWdlcy9wcm9maWxlX3t7dXNlci5pbWd9fS5wbmdcXFwiIGFsdD1cXFwiXFxcIiBjbGFzcz1cXFwiY2lyY2xlXFxcIj5cXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcInRpdGxlXFxcIj57e3VzZXIubmFtZX19PC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8cD5IZXJvIFBvaW50czogPHNwYW4gY2xhc3M9XFxcInJlZC10ZXh0XFxcIj57e3VzZXIuc2NvcmV9fTwvc3Bhbj4gPGJyIC8+XFxuICAgICAgICAgICAgICAgIEJhZGdlczoge3t1c2VyLmJhZGdlc319XFxuICAgICAgICAgICAgICAgIFxcbiAgICAgICAgICAgICAgICA8L3A+XFxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XFxcIiMhXFxcIiBjbGFzcz1cXFwic2Vjb25kYXJ5LWNvbnRlbnRcXFwiPjxpIGNsYXNzPVxcXCJtYXRlcmlhbC1pY29uc1xcXCI+Z3JhZGU8L2k+PC9hPlxcbiAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICA8L3VsPlxcbiAgICBcIixcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBjb250cm9sbGVyKCkge1xuICAgICAgICB0aGlzLnVzZXJzID0gW3tcbiAgICAgICAgICAgIG5hbWU6ICdCb2IgTS4nLFxuICAgICAgICAgICAgc2NvcmU6IDQ1LFxuICAgICAgICAgICAgaW1nOiAxLFxuICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG5hbWU6ICdHZW9yZ2UgSi4nLFxuICAgICAgICAgICAgc2NvcmU6IDQwLFxuICAgICAgICAgICAgaW1nOiAyLFxuICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG5hbWU6ICdIZWF0aGVyIFIuJyxcbiAgICAgICAgICAgIHNjb3JlOiA0MCxcbiAgICAgICAgICAgIGltZzogMyxcbiAgICAgICAgICAgIGJhZGdlczogNFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBuYW1lOiAnS2FyZW4gUy4nLFxuICAgICAgICAgICAgc2NvcmU6IDIwLFxuICAgICAgICAgICAgaW1nOiA0LFxuICAgICAgICAgICAgYmFkZ2VzOiAyXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIG5hbWU6ICdTYW1teSBRLicsXG4gICAgICAgICAgICBzY29yZTogNSxcbiAgICAgICAgICAgIGltZzogNSxcbiAgICAgICAgICAgIGJhZGdlczogMVxuICAgICAgICB9XTtcbiAgICB9XG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2xvZ2luQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwicm93XFxcIj5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJjb2wgczEyIG02IG9mZnNldC1tM1xcXCI+XFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcImNhcmQtcGFuZWxcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XFxcImNhcmQtdGl0bGVcXFwiPkxvZ2luPC9zcGFuPlxcblxcbiAgICAgICAgICAgICAgICAgICAgPHA+VG8gYWNjZXNzIGFkbWluaXN0cmF0aW9uIGZlYXR1cmVzLCB5b3UnbGwgbmVlZCB0byBsb2dpbi48L3A+XFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGlucHV0LWZpZWxkPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuZy1tb2RlbD1cXFwiJGN0cmwuZW1haWxcXFwiIHR5cGU9XFxcInRleHRcXFwiIHBsYWNlaG9sZGVyPVxcXCJZb3VyIEVtYWlsIEFkZHJlc3NcXFwiIC8+XFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaW5wdXQtZmllbGQ+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IG5nLW1vZGVsPVxcXCIkY3RybC5wYXNzd29yZFxcXCIgdHlwZT1cXFwicGFzc3dvcmRcXFwiIHBsYWNlaG9sZGVyPVxcXCJZb3VyIFBhc3N3b3JkXFxcIiAvPlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJyaWdodFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XFxcIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gYWNjZW50LTRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5nbygpXFxcIj5TaWduIFVwPC9hPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVxcXCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGJsdWUgYWNjZW50LTRcXFwiIG5nLWNsaWNrPVxcXCIkY3RybC5nbygpXFxcIj5Mb2dpbjwvYT5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgPGJyIGNsYXNzPVxcXCJjbGVhcmZpeFxcXCIgLz5cXG4gICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgXCIsXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY29udHJvbGxlcigkc3RhdGUpIHtcbiAgICAgICAgdGhpcy5lbWFpbCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5nbyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZS5hcHByb3ZhbHMnKTtcbiAgICAgICAgfTtcbiAgICB9XG59KTtcbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKCdMb2NhdGlvblNlcnZpY2UnLCBmdW5jdGlvbiAoJHEpIHtcbiAgICBpZiAoIW5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xuICAgICAgICBhbGVydChcIllvdXIgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGdlb2xvY2F0aW9uLiBQbGVhc2UgdHJ5IGluIENocm9tZSwgRmlyZWZveCwgU2FmYXJpIG9yIEVkZ2VcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRMb2NhdGlvbjogZnVuY3Rpb24gZ2V0TG9jYXRpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJHEoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24gKHBvcykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNlbnRlcjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdDogcG9zLmNvb3Jkcy5sYXRpdHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25nOiBwb3MuY29vcmRzLmxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwJykuc2VydmljZSgnUGhvdG9zU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCwgQ09OU1RBTlRTKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYWxsOiBmdW5jdGlvbiBhbGwoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KENPTlNUQU5UUy5BUElfVVJMICsgXCIvcGhvdG9zXCIpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKFwiVXNlclNlcnZpY2VcIiwgZnVuY3Rpb24gKCkge30pOyIsImFuZ3VsYXIubW9kdWxlKFwiYXBwXCIsIFtcInVpLnJvdXRlclwiLCBcInVpLm1hdGVyaWFsaXplXCJdKVxuICAgIC5jb25maWcoWyckaHR0cFByb3ZpZGVyJywgZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLnVzZVhEb21haW4gPSB0cnVlO1xuICAgICAgICBkZWxldGUgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsnWC1SZXF1ZXN0ZWQtV2l0aCddO1xuICAgIH1cbl0pXG4gICAgLy8gLmNvbmZpZygoUGFyc2VQcm92aWRlcikgPT4ge1xuICAgIC8vICAgICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJ5ODVndkN2M3VVS2R2WmtIZlMzaXV0ZVJGaGRjVlFkaFJVdjl2TTZlXCIsIFwicFlvUXBnc0lDVGhyWkdYaFBmOGpTUFJuOGNINloxRG9zcmZPcW5qcVwiKVxuICAgIC8vIH0pOyIsImFuZ3VsYXIubW9kdWxlKFwiYXBwXCIpLmNvbmZpZygoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikgPT4ge1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoXCIvXCIpO1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZShcImhvbWVcIiwge1xuICAgICAgICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICAgICAgICB1cmw6IFwiL1wiLFxuICAgICAgICAgICAgdGVtcGxhdGU6IGBcbiAgICAgICAgICAgICAgICA8YXBwLWNvbXBvbmVudD48L2FwcC1jb21wb25lbnQ+XG4gICAgICAgICAgICBgXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZShcImhvbWUuaGlzdG9yeVwiLCB7XG4gICAgICAgICAgICB1cmw6IFwiXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxoaXN0b3J5LWNvbXBvbmVudD48L2hpc3RvcnktY29tcG9uZW50PlxuICAgICAgICAgICAgYFxuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoXCJob21lLmxvZ2luXCIsIHtcbiAgICAgICAgICAgIHVybDogXCIvbG9naW5cIixcbiAgICAgICAgICAgIHRlbXBsYXRlOiBgXG4gICAgICAgICAgICAgICAgPGxvZ2luLWNvbXBvbmVudD48L2xvZ2luLWNvbXBvbmVudD5cbiAgICAgICAgICAgIGBcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKFwiaG9tZS5sZWFkZXJib2FyZFwiLCB7XG4gICAgICAgICAgICB1cmw6IFwiL2xlYWRlcmJvYXJkXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxsZWFkZXJib2FyZC1jb21wb25lbnQ+PC9sZWFkZXJib2FyZC1jb21wb25lbnQ+XG4gICAgICAgICAgICBgXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZShcImhvbWUuYXBwcm92YWxzXCIsIHtcbiAgICAgICAgICAgIHVybDogXCIvYXBwcm92YWxzXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogYFxuICAgICAgICAgICAgICAgIDxhcHByb3ZhbHMtY29tcG9uZW50PjwvYXBwcm92YWxzLWNvbXBvbmVudD5cbiAgICAgICAgICAgIGBcbiAgICAgICAgfSlcbjtcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKCdDT05TVEFOVFMnLCAoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgQVBJX1VSTDogXCJodHRwOi8vMTA0LjE5Ny4yMDUuMTMzXCIsXG4gICAgICAgIEhFUkU6IHtcbiAgICAgICAgICAgIElEOiBcIk1KWjdoZUl6T2JwQVdZZTB6ZTl1XCIsXG4gICAgICAgICAgICBBUFA6IFwiTGhaVWRZeGM1VDd2RHlQOHcwQmpNZ1wiXG4gICAgICAgIH1cbiAgICB9XG59KSIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5jb21wb25lbnQoJ2FwcENvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8aGVhZGVyLWNvbXBvbmVudD48L2hlYWRlci1jb21wb25lbnQ+XG5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGRpdiB1aS12aWV3PjwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgXG4gICAgYFxuICAgIFxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnYXBwcm92YWxzQ29tcG9uZW50Jywge1xuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxoMz5BcHByb3ZhbHMgTmVlZGVkPC9oMz5cbiAgICAgICAgPGg2IG5nLWlmPVwiISRjdHJsLml0ZW1zLmxlbmd0aFwiPk5vIGFwcHJvdmFscyBuZWVkZWQ8L2g2PlxuICAgICAgICA8aGlzdG9yeS1kZXRhaWwgaGlzdG9yeS1pdGVtcz1cIiRjdHJsLml0ZW1zXCI+PC9oaXN0b3J5LWRldGFpbD5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoUGhvdG9zU2VydmljZSkge1xuICAgICAgICBQaG90b3NTZXJ2aWNlLmFsbCgpXG4gICAgICAgICAgICAudGhlbih4cyA9PiB4cy5maWx0ZXIoeCA9PiAheC5hcHByb3ZlZCkpXG4gICAgICAgICAgICAudGhlbihwaG90b3MgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBwaG90b3M7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FwcHJvdmVkJywgcGhvdG9zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGhvdG9zO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufSkiLCJhbmd1bGFyLm1vZHVsZSgnYXBwJykuY29tcG9uZW50KCdoZWFkZXJDb21wb25lbnQnLCB7XG4gICAgY29udHJvbGxlcigpIHtcbiAgICAgICAgY29uc29sZS5sb2codGhpcyk7XG4gICAgfSxcbiAgICBiaW5kaW5nczoge1xuICAgICAgICB1c2VyOiBcIj1cIlxuICAgIH0sXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPG5hdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuYXYtd3JhcHBlclwiPlxuICAgICAgICAgICAgPGEgdWktc3JlZj1cImhvbWVcIiBjbGFzcz1cImJyYW5kLWxvZ29cIj5FQUEgQmFzaW5zPC9hPlxuICAgICAgICAgICAgPHVsIGlkPVwibmF2LW1vYmlsZVwiIGNsYXNzPVwicmlnaHQgaGlkZS1vbi1tZWQtYW5kLWRvd25cIj5cbiAgICAgICAgICAgICAgICA8bGk+PGEgdWktc3JlZj1cIi5sZWFkZXJib2FyZFwiPkxlYWRlcmJvYXJkczwvYT48L2xpPlxuICAgICAgICAgICAgICAgIDxsaT48YSB1aS1zcmVmPVwiLmxvZ2luXCI+U2lnbiBJbjwvYT48L2xpPlxuICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L25hdj5cbiAgICBgLFxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGlzdG9yeURldGFpbCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgIFxuICAgIDxkaXYgY2xhc3M9XCJyb3dcIiBuZy1yZXBlYXQ9XCJpdGVtIGluICRjdHJsLmhpc3RvcnlJdGVtc1wiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29sIHMxMiBtMTJcIiBuZy1pZj1cIml0ZW0uaGlkZSAhPT0gdHJ1ZSB8fCBpdGVtLmFwcHJvdmVkXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtaW1hZ2VcIj5cbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cInt7aXRlbS5pbWFnZVVSTH19XCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXJkLXRpdGxlXCI+TG9jYXRpb24gRGF0YTwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtY29udGVudFwiPlxuICAgICAgICAgICAgICAgIDxpbWcgc3JjPVwie3skY3RybC5nZXRBdmF0YXIoKX19XCIgYWx0PVwiXCIgY2xhc3M9XCJjaXJjbGUgYXZhdGFyXCI+XG4gICAgICAgICAgICAgICAgPHA+Q3JlYXRlZCBieTogQm9iIFIuIG9uIHt7aXRlbS5jcmVhdGVkLmRhdGV9fSBpbiB0aGUge3tpdGVtLnpvbmV9fTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtYWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgPGEgbmctaWY9XCJpdGVtLmFwcHJvdmVkXCIgbmctY2xpY2s9XCIkY3RybC5jbG9zZSgpXCI+Q2xvc2U8L2E+XG4gICAgICAgICAgICAgICAgPGEgbmctaWY9XCIhaXRlbS5hcHByb3ZlZFwiIG5nLWNsaWNrPVwiJGN0cmwuaGlkZShpdGVtKVwiIGNsYXNzPVwiZ3JlZW4tdGV4dCBkYXJrZW4tNFwiPkFwcHJvdmU8L2E+XG4gICAgICAgICAgICAgICAgPGEgbmctaWY9XCIhaXRlbS5hcHByb3ZlZFwiIG5nLWNsaWNrPVwiJGN0cmwuaGlkZShpdGVtKVwiIGNsYXNzPVwicmVkLXRleHQgZGFya2VuLTRcIj5EaXNhcHByb3ZlPC9hPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICBcbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoVXNlclNlcnZpY2UsICRyb290U2NvcGUpIHtcbiAgICAgICAgdGhpcy5jbG9zZSA9ICgpID0+IHtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChcImNsb3NlOml0ZW1cIik7XG4gICAgICAgIH0gICAgICAgIFxuXG4gICAgICAgIHRoaXMuZ2V0QXZhdGFyID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbnVtcyA9IFsxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5XTtcblxuICAgICAgICAgICAgY29uc3QgaWQgPSBudW1zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG51bXMubGVuZ3RoKV07XG4gICAgICAgICAgICByZXR1cm4gYC9pbWFnZXMvcHJvZmlsZV8ke2lkfS5wbmdgO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuaGlkZSA9IChpdGVtKSA9PiB7XG4gICAgICAgICAgICBpdGVtLmhpZGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBiaW5kaW5nczoge1xuICAgICAgICBoaXN0b3J5SXRlbXM6ICc9J1xuICAgIH1cbiAgICBcbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnaGlzdG9yeUNvbXBvbmVudCcsIHtcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8YSBuZy1jbGljaz1cIiRjdHJsLnNob3coKVwiIHN0eWxlPVwiZGlzcGxheTogbm9uZTtcIiBjbGFzcz1cInNob3ctbWFwXCI+PC9hPlxuICAgICAgICA8ZGl2IGlkPVwibWFwXCI+PC9kaXY+XG4gICAgICAgIDxoaXN0b3J5LWRldGFpbCBuZy1pZj1cIiRjdHJsLmNob3Nlbl9pdGVtcy5sZW5ndGhcIiBoaXN0b3J5LWl0ZW1zPVwiJGN0cmwuY2hvc2VuX2l0ZW1zXCI+PC9oaXN0b3J5LWRldGFpbD5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCBMb2NhdGlvblNlcnZpY2UsIFBob3Rvc1NlcnZpY2UsIENPTlNUQU5UUykge1xuICAgICAgICB0aGlzLm1hcCA9IG51bGw7XG4gICAgICAgIHRoaXMuc2hvdyA9ICgpID0+IHsgfTtcbiAgICAgICAgdGhpcy5jaG9zZW5faXRlbXMgPSBbXTtcblxuICAgICAgICBjb25zdCBpY29uID0gYDxzdmcgd2lkdGg9XCIyNFwiIGhlaWdodD1cIjI0XCIgXG4gICAgICAgICAgICAgICAgICAgICAgICB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCBzdHJva2U9XCJ3aGl0ZVwiIGZpbGw9XCIjMWI0NjhkXCIgeD1cIjFcIiB5PVwiMVwiIHdpZHRoPVwiMjJcIiBcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjIyXCIgLz48L3N2Zz5gO1xuXG4gICAgICAgICRzY29wZS4kb24oJ2Nsb3NlOml0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNob3Nlbl9pdGVtcyA9IFtdO1xuICAgICAgICB9KVxuXG4gICAgICAgIFBob3Rvc1NlcnZpY2UuYWxsKClcbiAgICAgICAgICAgIC50aGVuKHBob3RvcyA9PiB7XG4gICAgICAgICAgICAgICAgcGhvdG9zID0gcGhvdG9zLmZpbHRlcih4ID0+IHguYXBwcm92ZWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBwaG90b3M7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocGhvdG9zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGhvdG9zO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChwaG90b3MpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQocGhvdG9zKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaW5pdCA9IChwaG90b3MpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBsYXRmb3JtID0gbmV3IEguc2VydmljZS5QbGF0Zm9ybSh7XG4gICAgICAgICAgICAgICAgYXBwX2lkOiBDT05TVEFOVFMuSEVSRS5JRCxcbiAgICAgICAgICAgICAgICBhcHBfY29kZTogQ09OU1RBTlRTLkhFUkUuQVBQXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdHMgPSBwbGF0Zm9ybS5jcmVhdGVEZWZhdWx0TGF5ZXJzKCk7XG4gICAgICAgICAgICBjb25zdCBtYXAgPSBuZXcgSC5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpLFxuICAgICAgICAgICAgICAgIGRlZmF1bHRzLm5vcm1hbC5tYXAsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhdDogMjkuNDI0MSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxuZzogLTk4LjQ5MzZcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgem9vbTogN1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGNvbnN0IHVpID0gSC51aS5VSS5jcmVhdGVEZWZhdWx0KG1hcCwgZGVmYXVsdHMpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBwaG90byBvZiBwaG90b3MpIHtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBob3RvLmFwcHJvdmVkKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBwbGFjZSA9IG5ldyBILm1hcC5JY29uKGljb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvb3JkcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGF0OiBwaG90by5sYXQsXG4gICAgICAgICAgICAgICAgICAgIGxuZzogcGhvdG8ubG9uXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXJrZXIgPSBuZXcgSC5tYXAuTWFya2VyKGNvb3JkcywgeyBpY29uOiBwbGFjZSwgaWQ6IHBob3RvLmlkIH0pXG4gICAgICAgICAgICAgICAgbWFwLmFkZE9iamVjdChtYXJrZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBtYXBfZXZlbnRzID0gbmV3IEgubWFwZXZlbnRzLk1hcEV2ZW50cyhtYXApO1xuICAgICAgICAgICAgbWFwLmFkZEV2ZW50TGlzdGVuZXIoJ3RhcCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaXRlbXMgPSB0aGlzLml0ZW1zLmZpbHRlcih4ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGUudGFyZ2V0LmJiLmxhdCA9PSB4LmxhdCAmJiBlLnRhcmdldC5iYi5sbmcgPT0geC5sb247XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dNYXJrZXIoaXRlbXMpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG1hcC5hZGRPYmplY3QobmV3IEgubWFwLk1hcmtlcih7XG4gICAgICAgICAgICAgICAgbGF0OiAyOS40MjQxLFxuICAgICAgICAgICAgICAgIGxuZzogLTk4LjQ5MzZcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogbmV3IEgubWFwLkljb24oaWNvbilcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zaG93TWFya2VyID0gKGl0ZW1zKSA9PiB7XG4gICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNob3Nlbl9pdGVtcyA9IGl0ZW1zO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2hvb3NlIGl0ZW1zXCIsIHRoaXMuY2hvc2VuX2l0ZW1zKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXRlbXMpIHtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICAkKCcuc2hvdy1tYXAnKS5jbGljaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAxMDApO1xuXG4gICAgfVxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnbGVhZGVyYm9hcmRDb21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPHVsIGNsYXNzPVwiY29sbGVjdGlvblwiPlxuICAgICAgICAgICAgPGxpIGNsYXNzPVwiY29sbGVjdGlvbi1pdGVtIGF2YXRhclwiIG5nLXJlcGVhdD1cInVzZXIgaW4gJGN0cmwudXNlcnNcIj5cbiAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIi9pbWFnZXMvcHJvZmlsZV97e3VzZXIuaW1nfX0ucG5nXCIgYWx0PVwiXCIgY2xhc3M9XCJjaXJjbGVcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRpdGxlXCI+e3t1c2VyLm5hbWV9fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8cD5IZXJvIFBvaW50czogPHNwYW4gY2xhc3M9XCJyZWQtdGV4dFwiPnt7dXNlci5zY29yZX19PC9zcGFuPiA8YnIgLz5cbiAgICAgICAgICAgICAgICBCYWRnZXM6IHt7dXNlci5iYWRnZXN9fVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiIyFcIiBjbGFzcz1cInNlY29uZGFyeS1jb250ZW50XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPmdyYWRlPC9pPjwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgIDwvdWw+XG4gICAgYCxcbiAgICBjb250cm9sbGVyKCkge1xuICAgICAgICB0aGlzLnVzZXJzID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdCb2IgTS4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA0NSxcbiAgICAgICAgICAgICAgICBpbWc6IDEsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdHZW9yZ2UgSi4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiA0MCxcbiAgICAgICAgICAgICAgICBpbWc6IDIsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiA1XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdIZWF0aGVyIFIuJyxcbiAgICAgICAgICAgICAgICBzY29yZTogNDAsXG4gICAgICAgICAgICAgICAgaW1nOiAzLFxuICAgICAgICAgICAgICAgIGJhZGdlczogNFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnS2FyZW4gUy4nLFxuICAgICAgICAgICAgICAgIHNjb3JlOiAyMCxcbiAgICAgICAgICAgICAgICBpbWc6IDQsXG4gICAgICAgICAgICAgICAgYmFkZ2VzOiAyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdTYW1teSBRLicsXG4gICAgICAgICAgICAgICAgc2NvcmU6IDUsXG4gICAgICAgICAgICAgICAgaW1nOiA1LFxuICAgICAgICAgICAgICAgIGJhZGdlczogMVxuICAgICAgICAgICAgfVxuICAgICAgICBdO1xuICAgIH1cbn0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcCcpLmNvbXBvbmVudCgnbG9naW5Db21wb25lbnQnLCB7XG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cInJvd1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBzMTIgbTYgb2Zmc2V0LW0zXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtcGFuZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXJkLXRpdGxlXCI+TG9naW48L3NwYW4+XG5cbiAgICAgICAgICAgICAgICAgICAgPHA+VG8gYWNjZXNzIGFkbWluaXN0cmF0aW9uIGZlYXR1cmVzLCB5b3UnbGwgbmVlZCB0byBsb2dpbi48L3A+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgaW5wdXQtZmllbGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgbmctbW9kZWw9XCIkY3RybC5lbWFpbFwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJZb3VyIEVtYWlsIEFkZHJlc3NcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBpbnB1dC1maWVsZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuZy1tb2RlbD1cIiRjdHJsLnBhc3N3b3JkXCIgdHlwZT1cInBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCJZb3VyIFBhc3N3b3JkXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJpZ2h0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cIndhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4gZ3JlZW4gYWNjZW50LTRcIiBuZy1jbGljaz1cIiRjdHJsLmdvKClcIj5TaWduIFVwPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJ3YXZlcy1lZmZlY3Qgd2F2ZXMtbGlnaHQgYnRuIGJsdWUgYWNjZW50LTRcIiBuZy1jbGljaz1cIiRjdHJsLmdvKClcIj5Mb2dpbjwvYT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxiciBjbGFzcz1cImNsZWFyZml4XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICBgLFxuICAgIGNvbnRyb2xsZXIoJHN0YXRlKSB7XG4gICAgICAgIHRoaXMuZW1haWwgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuZ28gPSAoKSA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUuYXBwcm92YWxzJyk7XG4gICAgICAgIH1cbiAgICB9XG59KSIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKCdMb2NhdGlvblNlcnZpY2UnLCAoJHEpID0+IHtcbiAgICBpZiAoIW5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xuICAgICAgICBhbGVydChcIllvdXIgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGdlb2xvY2F0aW9uLiBQbGVhc2UgdHJ5IGluIENocm9tZSwgRmlyZWZveCwgU2FmYXJpIG9yIEVkZ2VcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRMb2NhdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkcSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbigocG9zKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF0OiBwb3MuY29vcmRzLmxhdGl0dWRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvbmc6IHBvcy5jb29yZHMubG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogOFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKCdQaG90b3NTZXJ2aWNlJywgKCRodHRwLCBDT05TVEFOVFMpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBhbGwoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGAke0NPTlNUQU5UUy5BUElfVVJMfS9waG90b3NgKVxuICAgICAgICAgICAgICAgIC50aGVuKHJlcyA9PiByZXMuZGF0YSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcbiIsImFuZ3VsYXIubW9kdWxlKCdhcHAnKS5zZXJ2aWNlKFwiVXNlclNlcnZpY2VcIiwgKCkgPT4ge1xuICAgIFxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
