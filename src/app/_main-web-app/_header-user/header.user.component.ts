import {
    Component
} from '@angular/core';

import {
    MenuItem
} from 'primeng/primeng';

import {
    AlertMessageService,
    LocalStorageService
} from '../../_services/common/index';

import {
    AuthService
} from '../../_services/auth/auth.service';

@Component({
    selector: 'header-user',
    templateUrl: './header.user.component.html'
})

export class HeaderUserComponent {
    private isDialogVisible = false;
    private isVisible;
    private items: MenuItem[];
    private loggedInUserId;
    private loggedInUserGivenName;
    private loggedInUserName;
    private loggedInUserTitle;
    private loggedInUserEmail;

    constructor(private _authService: AuthService,
        private _localStorageService: LocalStorageService,
        private _alertMessageService: AlertMessageService) { }

    ngOnInit() {
        this._authService.loggedInUser.subscribe(isLoggedIn => {
            this.isVisible = isLoggedIn;
            this.loggedInUserName = '';
            this.loggedInUserId = '';
            this.loggedInUserGivenName = '';
            if (this.isVisible) {
                let loggeduser = JSON.parse(localStorage.getItem('loggeduser'));
                this.loggedInUserId = localStorage.getItem('loggedinid');
                this.loggedInUserGivenName = loggeduser.displayName;
                this.loggedInUserName = loggeduser.displayName;
                this.loggedInUserTitle = loggeduser.title;
                this.loggedInUserEmail = loggeduser.mail;
                this._getMenuItem();
            }
        });
    }

    private _getMenuItem() {
        this.items = [{
            label: 'Logout',
            icon: 'fa fa-close',
            command: (event) => {
                this.onLogOutClicked();
            }
        }];
    }

    onNameClick() {
        this.isDialogVisible = true;
    }
    private onLogOutClicked() {
        this._checkForMenuItemClicked(LocalStorageService.LOGOUT_MENU_KEY);
    }
    private _checkForMenuItemClicked(menuItem: string) {
        setTimeout(() => {
            if (menuItem && menuItem == LocalStorageService.LOGOUT_MENU_KEY) {
                this._authService.logout();
            }
        }, 10);
    }
}