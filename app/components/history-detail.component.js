angular.module('app').component('historyDetail', {
    template: `
    
    <div class="row" ng-repeat="item in $ctrl.historyItems">
        <div class="col s12 m12" ng-if="item.hide !== true || item.approved">
            <div class="card">
            <div class="card-image">
                <img src="{{item.imageURL}}">
                <span class="card-title">Location Data</span>
            </div>
            <div class="card-content">
                <img src="{{$ctrl.getAvatar()}}" alt="" class="circle avatar">
                <p>Created by: Bob R. on {{item.created.date}} in the {{item.zone}}</p>
            </div>
            <div class="card-action">
                <a ng-if="item.approved" ng-click="$ctrl.close()">Close</a>
                <a ng-if="!item.approved" ng-click="$ctrl.hide(item)" class="green-text darken-4">Approve</a>
                <a ng-if="!item.approved" ng-click="$ctrl.hide(item)" class="red-text darken-4">Disapprove</a>
            </div>
            </div>
        </div>
    </div>
   
    `,
    controller(UserService, $rootScope) {
        this.close = () => {
            $rootScope.$broadcast("close:item");
        }        

        this.getAvatar = () => {
            const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];

            const id = nums[Math.floor(Math.random() * nums.length)];
            return `/images/profile_${id}.png`;
        };

        this.hide = (item) => {
            item.hide = true;
        }
    },
    bindings: {
        historyItems: '='
    }
    
})