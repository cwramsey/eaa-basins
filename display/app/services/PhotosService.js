angular.module('app').service('PhotosService', ($http, CONSTANTS) => {
    function colorToHex(xs) {
        return xs.map(x => {
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
        all() {
            return $http.get(`${CONSTANTS.API_URL}/photos`)
                .then(res => res.data)
                .then(colorToHex)
                .catch(err => console.error(err));
        }
    }
});
