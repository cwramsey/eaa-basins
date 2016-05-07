angular.module('app').component('approvalsComponent', {
    template: `
        <h3>Approvals Needed</h3>
        <h6 ng-if="!$ctrl.items.length">No approvals needed</h6>
        <history-detail history-items="$ctrl.items"></history-detail>
    `,
    controller(PhotosService) {
        PhotosService.all()
            .then(xs => xs.filter(x => !x.approved))
            .then(photos => {
                this.items = photos;
                console.log('approved', photos);
                return photos;
            });
    }
})