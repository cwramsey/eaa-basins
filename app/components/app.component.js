angular.module('app').component('appComponent', {
    template: `
        <header-component></header-component>

        <div class="container">
            <div ui-view></div>
        </div>
        
    `
    
});