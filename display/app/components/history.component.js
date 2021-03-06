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

        const icon = `<svg width="12" height="12" 
                        xmlns="http://www.w3.org/2000/svg">
                        <rect stroke="white" fill="{}" x="1" y="1" width="22" 
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

            const bounds = new H.map.Overlay(new H.geo.Rect(30.785718, -100.558504, 28.990952, -96.976527), '/display/images/map_gc.png');
            map.addObject(bounds);

            for (let photo of photos) {
                
                const this_icon = icon.replace("{}", photo.color);

                const place = new H.map.Icon(this_icon);
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