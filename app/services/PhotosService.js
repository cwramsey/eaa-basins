angular.module('app').service('PhotosService', ($http, CONSTANTS) => {
    return {
        all() {
            return $http.get(`${CONSTANTS.API_URL}/photos`)
                .then(res => res.data)
                .catch(err => console.error(err));
        }
    }
});
