angular.module('app').component('loginComponent', {
    template: `
        <div class="row">
            <div class="col s12 m6 offset-m3">
                <div class="card-panel">
                    <span class="card-title">Login</span>

                    <p>To access administration features, you'll need to login.</p>
                    <div input-field>
                        <input ng-model="$ctrl.email" type="text" placeholder="Your Email Address" />
                    </div>
                    <div input-field>
                        <input ng-model="$ctrl.password" type="password" placeholder="Your Password" />
                    </div>

                    <div class="right">
                        <a class="waves-effect waves-light btn green accent-4" ng-click="$ctrl.go()">Sign Up</a>
                        <a class="waves-effect waves-light btn blue accent-4" ng-click="$ctrl.go()">Login</a>
                    </div>
                    <br class="clearfix" />
                </div>
            </div>
        </div>
    `,
    controller($state) {
        this.email = null;

        this.go = () => {
            $state.go('home.approvals');
        }
    }
})