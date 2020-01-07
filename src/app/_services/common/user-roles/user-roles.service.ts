import {
    Injectable
} from '@angular/core';

import {
    LocalStorageService
} from '../../../_services/common/index';


@Injectable()
export class ItmMasterUserRolesService {

    constructor() { }

    public isAuthorizeUser(roles): boolean {
        return (this.isSuperUser(roles) || this.isDBMatchMenuVisible(roles)
            || this.isVendChrgMenuVisible(roles) || this.isCostHistoryMenuVisible(roles) || this.isItemMasterMaintainanceMenuVisible(roles)
            || this.isHazardMenuVisible(roles) || this.isCalendarMenuVisible(roles)  || this.isCostSellMenuVisible(roles)
            || this.isDivPlsMenuVisible(roles) || this.isDivSonMenuVisible(roles) || this.isBuyerAuthMenuVisible(roles)
            ||this.isSSTViewShipToVendorMenuVisible(roles));
    }

    public isSuperUser(roles): boolean {
        let rolesArray = JSON.parse(roles);
        return (rolesArray.indexOf('USER_ITEM_GUI_SUPER') > -1);
    }

    public isReportMenuVisible(userRoles): boolean {
        let isReportVisible = false;
        if (this.isDBMatchMenuVisible(userRoles)) {
            isReportVisible = true;
        }
        if (this.isVendChrgMenuVisible(userRoles)) {
            isReportVisible = true;
        }
        if (this.isCostHistoryMenuVisible(userRoles)) {
            isReportVisible = true;
        }
        if (this.isCostSellMenuVisible(userRoles)) {
            isReportVisible = true;
        }
        return isReportVisible;
    }

    public isDBMatchMenuVisible(roles): boolean {
        let rolesArray = JSON.parse(roles);
        return (rolesArray.indexOf('USER_ITEM_MASTER_EXTRACT') > -1);
    }

    public isVendChrgMenuVisible(roles): boolean {
        let rolesArray = JSON.parse(roles);
        return (rolesArray.indexOf('USER_ITEM_MASTER_VENDOR_CHARGES') > -1);
    }

    public isMaintainanceMenuVisible(userRoles): boolean {
        let isMaintainanceVisible = false;
        if (this.isItemMasterMaintainanceMenuVisible(userRoles) 
        || this.isHazardMenuVisible(userRoles) || this.isCalendarMenuVisible(userRoles)  
        || this.isDivPlsMenuVisible(userRoles) || this.isDivSonMenuVisible(userRoles) || this.isBuyerAuthMenuVisible(userRoles)) {
            isMaintainanceVisible = true;
        }
        return isMaintainanceVisible;
    }

    public isItemMasterMaintainanceMenuVisible(roles): boolean {
        let isMaintainanceVisible = false;
        let itemMasterMaintainanceHeighestRole = this.getItemMasterMaintainanceRole(roles);
        if (itemMasterMaintainanceHeighestRole === undefined) {
            isMaintainanceVisible = false;
        } else {
            isMaintainanceVisible = true;
        }
        return isMaintainanceVisible;
    }

    public getItemMasterMaintainanceRole(roles): string {
        let itemMasterMaintainanceHeighestRole;
        if (this.getItemMaintainanceRoleRO(roles) !== undefined) {
            itemMasterMaintainanceHeighestRole = this.getItemMaintainanceRoleRO(roles);
        }
        if (this.getItemMaintainanceRoleAdd(roles) !== undefined) {
            itemMasterMaintainanceHeighestRole = this.getItemMaintainanceRoleAdd(roles);
        }
        if (this.getItemMaintainanceRoleHazard(roles) !== undefined) {
            itemMasterMaintainanceHeighestRole = this.getItemMaintainanceRoleHazard(roles);
        }
        if (this.getItemMaintainanceRoleEdit(roles) !== undefined) {
            itemMasterMaintainanceHeighestRole = this.getItemMaintainanceRoleEdit(roles);
        }
        if (this.getItemMaintainanceRoleSuper(roles) !== undefined) {
            itemMasterMaintainanceHeighestRole = this.getItemMaintainanceRoleSuper(roles);
        }
        return itemMasterMaintainanceHeighestRole;
    }


    public getItemMaintainanceRoleRO(roles): string {
        let rolesArray = JSON.parse(roles);
        let role;
        if (rolesArray.indexOf('USER_ITEM_MAINTAINANCE_RO') > -1) {
            role = 'USER_ITEM_MAINTAINANCE_RO';
        }
        return role;
    }

    public getItemMaintainanceRoleAdd(roles): string {
        let rolesArray = JSON.parse(roles);
        let role;
        if (rolesArray.indexOf('USER_ITEM_MAINTAINANCE_ADD') > -1) {
            role = 'USER_ITEM_MAINTAINANCE_ADD';
        }
        return role;
    }

    public getItemMaintainanceRoleHazard(roles): string {
        let rolesArray = JSON.parse(roles);
        let role;
        if (rolesArray.indexOf('USER_HAZARD_MAINTENANCE') > -1) {
            role = 'USER_HAZARD_MAINTENANCE';
        }
        return role;
    }

    public getItemMaintainanceRoleEdit(roles): string {
        let rolesArray = JSON.parse(roles);
        let role;
        if (rolesArray.indexOf('USER_ITEM_MAINTAINANCE') > -1) {
            role = 'USER_ITEM_MAINTAINANCE';
        }
        return role;
    }

    public getItemMaintainanceRoleSuper(roles): string {
        let rolesArray = JSON.parse(roles);
        let role;
        if (rolesArray.indexOf('USER_ITEM_GUI_SUPER') > -1) {
            role = 'USER_ITEM_GUI_SUPER';
        }
        return role;
    }


    public isHazardMenuVisible(roles): boolean {
        let rolesArray = JSON.parse(roles);
        return (rolesArray.indexOf('USER_ITEM_MASTER_HAZARD') > -1);
    }

    public isCalendarMenuVisible(roles): boolean {
        let rolesArray = JSON.parse(roles);
        return (rolesArray.indexOf('USER_ITEM_MASTER_CALENDAR') > -1);
    }

    public isCostHistoryMenuVisible(roles): boolean {
        let rolesArray = JSON.parse(roles);
        return (rolesArray.indexOf('USER_ITEM_MASTER_COST_HISTORY') > -1);
    }

    public isCostSellMenuVisible(roles): boolean {
        let rolesArray = JSON.parse(roles);
        return (rolesArray.indexOf('USER_ITEM_MASTER_COST_SELL') > -1);
    }

    public isDivPlsMenuVisible(roles): boolean {
        let rolesArray = JSON.parse(roles);
        return (rolesArray.indexOf('USER_ITEM_MASTER_DIV_PLS') > -1);
    }

    public isDivSonMenuVisible(roles): boolean {
        let rolesArray = JSON.parse(roles);
        return (rolesArray.indexOf('USER_ITEM_MASTER_DIV_SON') > -1);
    }

    public isBuyerAuthMenuVisible(roles): boolean {
        let rolesArray = JSON.parse(roles);
        return (rolesArray.indexOf('USER_ITEM_MASTER_BUYER_AUTH') > -1);
    }

    public isSSTMenuVisible(userRoles): boolean {
          let isSSTMenuVisible = false;
          if (this.isSSTViewShipToVendorMenuVisible(userRoles) 
          ) {
            isSSTMenuVisible = true;
          }
          
          return isSSTMenuVisible;
     }


    public isSSTViewShipToVendorMenuVisible(roles): boolean {
        let rolesArray = JSON.parse(roles);
        return (rolesArray.indexOf('USER_ITEM_MASTER_SST_SHIP_TO_VENDOR') > -1);
    }

}