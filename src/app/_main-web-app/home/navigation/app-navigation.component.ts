import {
  Component,
  AfterViewInit
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  ConfirmationService,
  MenubarModule,
  MenuItem
} from 'primeng/primeng';

import {
  AuthService
} from '../../../_services/auth/auth.service';

import {
  WaitSpinnerService,
  AlertMessageService,
  ItmMasterUserRolesService,
  LocalStorageService
} from '../../../_services/common/index';



@Component({
  selector: 'app-navigation',
  templateUrl: './app-navigation.component.html'
})

export class AppNavigationComponent implements AfterViewInit {
  private isNoSaleDialogVisible = false;
  private isTransactionLookupDialogVisible = false;
  private isUnitDialogVisible = false;
  private items: MenuItem[] = [];
  private msgs = [];
  private _userHasAccess = true;
  private globalSearch = false;
  private isVisible;
  private userAccessPermission = false;
  //private itemMasterMaintainanceRole;
  private _userRolesService;
  private userRoles;

  constructor(private _router: Router,
    private _authService: AuthService,
    private _alertMessageService: AlertMessageService,
    private _localStorageService: LocalStorageService,
    private _waitSpinnerService: WaitSpinnerService,
    private _confirmationService: ConfirmationService) {
    this._userRolesService = new ItmMasterUserRolesService();
  }

  ngOnInit() {
    this._authService.loggedInUser.subscribe(isLoggedIn => {
      this.isVisible = isLoggedIn;
      if (this.isVisible) {
        this.makeMenu();
      } else {
        this._userHasAccess = false;
      }
    });
    this._alertMessageService.confirmMessageSubject.subscribe(key => {
      //this._confirmUnCompleteTransaction(key);
    });

    this.userRoles = localStorage.getItem('userRoles');
  }

  ngAfterViewInit() {
    this.makeMenu();
  }

  private makeMenu() {
    if (this._userRolesService.isSuperUser(this.userRoles)
      || this._userRolesService.isReportMenuVisible(this.userRoles)) {
      this.items.push(this._itemMasterMenu());
    }
    if (this._userRolesService.isSuperUser(this.userRoles)
      || this._userRolesService.isMaintainanceMenuVisible(this.userRoles)) {
      this.items.push(this._itemMaintenanceMenu());
    }
 
     if (this._userRolesService.isSuperUser(this.userRoles)
      || this._userRolesService.isSSTMenuVisible(this.userRoles)) {
      this.items.push(this._SSTMaintenanceMenu());
    }

  }


  private _itemMasterMenu(): MenuItem {

    let itemMasterMenuItem: MenuItem = {
      label: 'Reports',
      icon: 'fa fa-cogs',
      items: []
    }

    if (this._userRolesService.isDBMatchMenuVisible(this.userRoles)
      || this._userRolesService.isSuperUser(this.userRoles)) {
      itemMasterMenuItem.items.push({
        label: 'Database match',
        icon: 'fa fa-cog',
        command: (event) => {
          this.onDBMatchMenuClicked();
        }
      });
    }

    if (this._userRolesService.isVendChrgMenuVisible(this.userRoles)
      || this._userRolesService.isSuperUser(this.userRoles)) {
      itemMasterMenuItem.items.push({
        label: 'Vendor Charge',
        icon: 'fa fa-table',
        command: (event) => {
          this.onVendorChargeMenuClicked();
        }
      });
    }

    if (this._userRolesService.isCostHistoryMenuVisible(this.userRoles)
      || this._userRolesService.isSuperUser(this.userRoles)) {
      itemMasterMenuItem.items.push({
        label: 'Cost History',
        icon: 'fa fa-money',
        command: (event) => {
          this.onCostHistoryMenuClicked();
        }
      });
    }

    if (this._userRolesService.isCostSellMenuVisible(this.userRoles)
      || this._userRolesService.isSuperUser(this.userRoles)) {
      itemMasterMenuItem.items.push({
        label: 'Cost Sell',
        icon: 'fa fa-file-excel-o',
        command: (event) => {
          this.onCostSellMenuClicked();
        }
      });
    }

    

    return itemMasterMenuItem;
  }

  private _itemMaintenanceMenu(): MenuItem {
    let itemMaintenanceMenuItem: MenuItem = {
      label: 'Maintenance',
      icon: 'fa fa-cogs',
      items: []

    }

 
    if (this._userRolesService.isItemMasterMaintainanceMenuVisible(this.userRoles)) {
      itemMaintenanceMenuItem.items.push({
        label: 'Item',
        icon: 'fa fa-table',
        command: (event) => {
          this.onEnquiryMenuClicked();
        }
      });
    }

 

    
    if (this._userRolesService.isSuperUser(this.userRoles)) {
      itemMaintenanceMenuItem.items.push({
        label: 'Users',
        icon: 'fa fa-users',
        command: (event) => {
          this.onUserRoleMenuClicked();
        }
      });
    }

  
    if (this._userRolesService.isHazardMenuVisible(this.userRoles)
      || this._userRolesService.isSuperUser(this.userRoles)) {
      itemMaintenanceMenuItem.items.push({
        label: 'Hazmat',
        icon: 'fas fa-exclamation-triangle',
        command: (event) => {
          this.onHazardMenuClicked();
        }
      });
    }

   if (this._userRolesService.isCalendarMenuVisible(this.userRoles)
      || this._userRolesService.isSuperUser(this.userRoles)) {
        itemMaintenanceMenuItem.items.push({
          label: 'Calendar',
          icon: 'far fa-calendar',
          command: (event) => {
            this.onCalendarMenuClicked();
          }
        });
      }
     
      if (this._userRolesService.isSuperUser(this.userRoles)
        || this._userRolesService.isDivSonMenuVisible(this.userRoles)) {
        itemMaintenanceMenuItem.items.push({
          label: 'Div Son',
          icon: 'fa fa-share-alt',
          command: (event) => {
            this.onDivSonClicked();
          }
        });
      }

     
      if (this._userRolesService.isDivPlsMenuVisible(this.userRoles)
        || this._userRolesService.isSuperUser(this.userRoles)) {
        itemMaintenanceMenuItem.items.push({
          label: 'Div-Pls',
          icon: 'fa fa-globe',
          command: (event) => {
            this.onDivPlsMenuClicked();
          }
        });
      }
      if (this._userRolesService.isBuyerAuthMenuVisible(this.userRoles)
        || this._userRolesService.isSuperUser(this.userRoles)) {
        itemMaintenanceMenuItem.items.push({
          label: 'Buyer Information',
          icon: 'fa fa-shopping-cart',
          command: (event) => {
            this.onBuyerMenuClicked();
          }
        });
      }

   
    return itemMaintenanceMenuItem;
  }

  private _SSTMaintenanceMenu(): MenuItem {
      let SSTMaintenanceMenuItem: MenuItem = {
      label: 'SST',
      icon: 'fa fa-cogs',
      items: []
    }

     if (this._userRolesService.isSSTViewShipToVendorMenuVisible(this.userRoles)
        || this._userRolesService.isSuperUser(this.userRoles)) {
        SSTMaintenanceMenuItem.items.push({
          label: 'View Ship To Vendor',
          icon: 'fa fa-shopping-cart',
          command: (event) => {
            this.onViewShipToVendorMenuClicked();
          }
        });
      }

    return SSTMaintenanceMenuItem;
  }

  private onEnquiryMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.ENQUIRY_MENU_KEY);
  }

  private onAddMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.ADD_MENU_KEY);
  }
  private onVendorChargeMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.VND_CHRG_MENU_KEY);
  }

  private onCostHistoryMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.COST_HISTORY_MENU_KEY);
  }

  private onCostSellMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.COST_SELL_MENU_KEY);
  }

  private onDBMatchMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.DB_MATCH_MENU_KEY);
  }

  private onUserRoleMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.USER_ROLE_MENU_KEY);
  }
  private onHazardMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.HAZARD_MENU_KEY);
  }

  private onCalendarMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.CALENDAR_MENU_KEY);
  }
  private onDivSonClicked() {
    this._checkForMenuItemClicked(LocalStorageService.DIV_SON_MENU_KEY);
  }
  private onDivPlsMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.DIV_PLS_MENU_KEY);
  }
  private onBuyerMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.BUYER_MENU_KEY);
  }
  private onLogOutClicked() {
    this._checkForMenuItemClicked(LocalStorageService.LOGOUT_MENU_KEY);
  }

  private onViewShipToVendorMenuClicked() {
    this._checkForMenuItemClicked(LocalStorageService.SST_VIEW_SHIP_TO_VENDOR_MENU_KEY);
  }


  private _checkForMenuItemClicked(menuItem: string) {
    setTimeout(() => {
      if (menuItem && menuItem == LocalStorageService.DB_MATCH_MENU_KEY) {
        this._router.navigate(['web-app', 'db-match']);
      } else if (menuItem && menuItem == LocalStorageService.VND_CHRG_MENU_KEY) {
        this._router.navigate(['web-app', 'vnd-chrg']);
      } else if (menuItem && menuItem == LocalStorageService.COST_HISTORY_MENU_KEY) {
        this._router.navigate(['web-app', 'cost-history']);
      } else if (menuItem && menuItem == LocalStorageService.COST_SELL_MENU_KEY) {
        this._router.navigate(['web-app', 'cost-sell']);
      } else if (menuItem && menuItem == LocalStorageService.USER_ROLE_MENU_KEY) {
        this._router.navigate(['web-app', 'user-role']);
      } else if (menuItem && menuItem == LocalStorageService.ENQUIRY_MENU_KEY) {
        this._router.navigate(['web-app', 'enquiry']);
      } else if (menuItem && menuItem == LocalStorageService.ADD_MENU_KEY) {
        this._router.navigate(['web-app', 'addItem']);
      } else if (menuItem && menuItem == LocalStorageService.HAZARD_MENU_KEY) {
        this._router.navigate(['web-app', 'hazard']);
      } else if (menuItem && menuItem == LocalStorageService.CALENDAR_MENU_KEY) {
        this._router.navigate(['web-app', 'calendar']);
      } else if (menuItem && menuItem == LocalStorageService.DIV_SON_MENU_KEY) {
        this._router.navigate(['web-app', 'divson']);
      } else if (menuItem && menuItem == LocalStorageService.DIV_PLS_MENU_KEY) {
        this._router.navigate(['web-app', 'divpls']);
      } else if (menuItem && menuItem == LocalStorageService.BUYER_MENU_KEY) {
        this._router.navigate(['web-app', 'buyer']);
      } else if (menuItem && menuItem == LocalStorageService.SST_VIEW_SHIP_TO_VENDOR_MENU_KEY) {
         this._router.navigate(['web-app', 'sstViewShipToVendor']);
      } else if (menuItem && menuItem == LocalStorageService.LOGOUT_MENU_KEY) {
        this._authService.logout();
      } else if (menuItem && menuItem == LocalStorageService.EXIT_MENU_KEY) {
        this._authService.logout(true);
      }
    }, 10);
  }



  private _checkDBMatchAccess() {

    if (this._router.url == '/web-app/db-match') return false;

    let userAccessPermission = false;
    try {
      let loggedUserStr = localStorage.getItem('dbmatchRole');

      if (loggedUserStr == 'USER_ITEM_MASTER_EXTRACT') {
        userAccessPermission = true;
      }
    } catch (e) { }

    if (userAccessPermission) {
      // this._waitSpinnerService.showWait();
      this._router.navigate(['web-app', 'db-match']);
    } else {
      this._router.navigate(['web-app', 'not-auth']);
    }

  }


  private _checkVndCrhAccess() {
    if (this._router.url == '/web-app/vnd-chrg') return false;


    let userAccessPermission = false;
    try {
      let loggedUserStr = localStorage.getItem('vndchrgRole');

      if (loggedUserStr == 'USER_ITEM_MASTER_VENDOR_CHARGES') {
        userAccessPermission = true;
      }
    } catch (e) { }

    if (userAccessPermission) {
      // this._waitSpinnerService.showWait();
      this._router.navigate(['web-app', 'vnd-chrg']);
    } else {
      this._router.navigate(['web-app', 'not-auth']);
    }

  }





}