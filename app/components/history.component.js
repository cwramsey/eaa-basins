angular.module('app').component('historyComponent', {
    template: `
        <a ng-click="$ctrl.show()" style="display: none;" class="show-map"></a>
        <div id="map"></div>
        <history-detail ng-if="$ctrl.chosen_items.length" history-items="$ctrl.chosen_items"></history-detail>
    `,
    controller($scope, $rootScope, LocationService, PhotosService, CONSTANTS) {
        this.map = null;
        this.show = () => { };
        this.chosen_items = [];

        const icon = `<svg width="24" height="24" 
                        xmlns="http://www.w3.org/2000/svg">
                        <rect stroke="white" fill="#1b468d" x="1" y="1" width="22" 
                        height="22" /></svg>`;

        $scope.$on('close:item', () => {
            this.chosen_items = [];
        })

        PhotosService.all()
            .then(photos => {
                photos = photos.filter(x => x.approved);
                this.items = photos;
                console.log(photos);
                return photos;
            })
            .then((photos) => {
                this.init(photos);
            });

        this.init = (photos) => {
            const platform = new H.service.Platform({
                app_id: CONSTANTS.HERE.ID,
                app_code: CONSTANTS.HERE.APP
            });

            const defaults = platform.createDefaultLayers();
            const map = new H.Map(document.getElementById('map'),
                defaults.normal.map,
                {
                    center: {
                        lat: 29.4241,
                        lng: -98.4936
                    },
                    zoom: 7
                }
            );

            const ui = H.ui.UI.createDefault(map, defaults);

            for (let photo of photos) {

                console.log(photo.approved);
                
                const place = new H.map.Icon(icon);
                const coords = {
                    lat: photo.lat,
                    lng: photo.lon
                };
                const marker = new H.map.Marker(coords, { icon: place, id: photo.id })
                map.addObject(marker);
            }

            const map_events = new H.mapevents.MapEvents(map);
            map.addEventListener('tap', (e) => {
                const items = this.items.filter(x => {
                    return e.target.bb.lat == x.lat && e.target.bb.lng == x.lon;
                });

                this.showMarker(items);
            });

            map.addObject(new H.map.Marker({
                lat: 29.4241,
                lng: -98.4936
            }, {
                    icon: new H.map.Icon(icon)
                }));
        };

        this.showMarker = (items) => {
            $scope.$apply(() => {
                this.chosen_items = items;
                console.log("Choose items", this.chosen_items);
            });
        };

        const interval = setInterval(() => {
            if (this.items) {
                clearInterval(interval);
                $('.show-map').click();
            }
        }, 100);

    }
});