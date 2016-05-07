angular.module('app').component('leaderboardComponent', {
    template: `
        <ul class="collection">
            <li class="collection-item avatar" ng-repeat="user in $ctrl.users">
                <img src="/display/images/profile_{{user.img}}.png" alt="" class="circle">
                <span class="title">{{user.name}}</span>
                <p>Hero Points: <span class="red-text">{{user.score}}</span> <br />
                Badges: {{user.badges}}
                
                </p>
                <a href="#!" class="secondary-content"><i class="material-icons">grade</i></a>
            </li>
        </ul>
    `,
    controller() {
        this.users = [
            {
                name: 'Bob M.',
                score: 45,
                img: 1,
                badges: 5
            },
            {
                name: 'George J.',
                score: 40,
                img: 2,
                badges: 5
            },
            {
                name: 'Heather R.',
                score: 40,
                img: 3,
                badges: 4
            },
            {
                name: 'Karen S.',
                score: 20,
                img: 4,
                badges: 2
            },
            {
                name: 'Sammy Q.',
                score: 5,
                img: 5,
                badges: 1
            }
        ];
    }
})