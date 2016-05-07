angular.module('app').service('LocationService', ($q) => {
    if (!navigator.geolocation) {
        alert("Your browser does not support geolocation. Please try in Chrome, Firefox, Safari or Edge");
        return;
    }

    return {
        getLocation() {
            return $q((resolve, reject) => {
                navigator.geolocation.getCurrentPosition((pos) => {
                    resolve({
                        center: {
                            lat: pos.coords.latitude,
                            long: pos.coords.longitude
                        },
                        zoom: 8
                    });
                }, (err) => {
                    reject(err);
                });
            });
        }
    }
});
