import {
    Component,
    ViewChildren
}  from '@angular/core';

import {
    UserRole,
    CompUser,
    CompUserRole,
    RoleDetails,
    ErrorMessage
} from '../../../_domains/common/index';

import {
    ListboxModule,
    SelectItem,
    LazyLoadEvent,
    ConfirmationService
} from 'primeng/primeng';

import {
    WebServiceComm,
    LocalStorageService,
    AlertMessageService,
    WaitSpinnerService,
    CommonValidation,
    ItmMasterUserRolesService,
    CommonUtils
} from '../../../_services/common/index';

@Component({
    templateUrl: './user-role.component.html'
})
export class UserRoleComponent {

    componentTitle: string = 'User Role';
    private roles: SelectItem[];
    private selectedRoles: string[];
    private isNewUserRolesDialogDisplay = false;
    private isNewUser = false;
    private componentIdUri = '/v1/user-maintainenance/comp/HSPartItemMasterAppService';
    private componentId;
    private emptyUserRoles = {
        "userName": '',
        "roles": '',
        "userId": ''
    };
    private emptyUserRolesDetails = {
        "authority": '',
        "roleId": ''
    };
    private jsonRoleDtlObj = {};
    private userRoleArray = [];
    private jsonObj = {};
    private userRoles = [];
    private userLdap;
    private userId;
    private role: RoleDetails;
    private msgs = [];
    private successMsgs = [];
    private subMessages = [];
    private isPaginator;
    private totalRecords;
    private rowindex;
    private loadCounter = 1;

    constructor(private _webServiceComm: WebServiceComm,
        private _waitSpinnerService: WaitSpinnerService,
        private _alertMessageService: AlertMessageService,
        private _confirmationService: ConfirmationService) {
        this.roles = [
            { label: 'Database Match', value: 'USER_ITEM_MASTER_EXTRACT' },
            { label: 'Extract Vendor Charge', value: 'USER_ITEM_MASTER_VENDOR_CHARGES' },
            { label: 'Cost History', value: 'USER_ITEM_MASTER_COST_HISTORY' },
            { label: 'Cost Sell', value: 'USER_ITEM_MASTER_COST_SELL' },
            { label: 'Item Maintenance - Read Only', value: 'USER_ITEM_MAINTAINANCE_RO' },
            { label: 'Item Maintenance - Add Only', value: 'USER_ITEM_MAINTAINANCE_ADD' },
            { label: 'Item Maintenance', value: 'USER_ITEM_MAINTAINANCE' },
            { label: 'Hazard', value: 'USER_ITEM_MASTER_HAZARD' },
            { label: 'Calendar', value: 'USER_ITEM_MASTER_CALENDAR' },
            { label: 'Div Pls', value: 'USER_ITEM_MASTER_DIV_PLS' },
            { label: 'Div Son', value: 'USER_ITEM_MASTER_DIV_SON' },
            { label: 'Buyer Auth', value: 'USER_ITEM_MASTER_BUYER_AUTH' },
            { label: 'Super User', value: 'USER_ITEM_GUI_SUPER' },
            { label: 'View Ship To Vendor', value: 'USER_ITEM_MASTER_SST_SHIP_TO_VENDOR' },
        ];
    }

    ngOnInit() {
        try {
            this.msgs = [];
            this._waitSpinnerService.showWait();
            this._webServiceComm.httpGet(this.componentIdUri).subscribe(resp => {
                if(resp && resp.comps){
                    for (let xx = 0; xx < resp.comps.length; xx++) {
                        if (resp.comps[xx].name.indexOf('HSPartItemMasterAppService') > -1) {
                            this.componentId = resp.comps[xx].compId;
                        }
                    }
                    if(typeof this.componentId !== 'undefined'){
                        this.getUsersRoles(0,10);
                    }
              }else{
                    this._waitSpinnerService.hideWait();
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
              }
            }, err => {
                this.loadCounter = -1;
                this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                 if(this.loadCounter === -1){
                     this._waitSpinnerService.hideWait();
                }
                //this.loadCounter = -1;
            }, () => {
                for (let xx = 0; xx < this.roles.length; xx++) {
                    this.getRoleId(this.roles[xx].value);
                }
                this._waitSpinnerService.hideWait();
            });
        } catch (error) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
            this._waitSpinnerService.hideWait();
        }
    }


    getRoleId(authority) {
        this._waitSpinnerService.showWait();
        let userRoleUri = '/v1/user-maintainenance/roles/' + authority;
        this._webServiceComm.httpGet(userRoleUri).subscribe(resp => {
            var jsonstr = JSON.stringify(this.emptyUserRolesDetails);
            this.jsonRoleDtlObj = JSON.parse(jsonstr);
            this.jsonRoleDtlObj["authority"] = resp.roles[0].authority;
            this.jsonRoleDtlObj["roleId"] = resp.roles[0].roleId;
            this.userRoleArray.push(this.jsonRoleDtlObj);
        }, err => {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
        }, () => {
            this._waitSpinnerService.hideWait();
        });
    }

    onNewUserRoles() {
        this.subMessages = [];
        this.userLdap = '';
        this.selectedRoles = [];
        this.isNewUser = true;
        this.isNewUserRolesDialogDisplay = true;
    }

    onUserRoleSubmit() {
        this.subMessages = [];
        this.msgs = [];
        this._waitSpinnerService.showWait();
        if (this.isNewUser) {
            this.userId = 0;
            if(this.userLdap === ''){
                this._alertMessageService.addErrorMessage(ErrorMessage.ES043, this.subMessages);
                this._waitSpinnerService.hideWait();
                return;
            }
        }
        let uri = '/v1/user-maintainenance/comp/' + this.componentId + '/user/' + this.userId;
        let compUser = this.buildModifyUserRolesRequest();
        this._webServiceComm.httpPut(uri, compUser).subscribe(resp => {
            if (this.isNewUser) {
                this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'User created successfully' });
                this.isNewUser = false;
            } else {
                this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'User updated successfully' });
            }
            this.isNewUserRolesDialogDisplay = false;
            this.getUsersRoles(this.rowindex,10);
        }, err => {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.subMessages);
            this._waitSpinnerService.hideWait();
        }, () => {
            this._waitSpinnerService.hideWait();
        });
    }

    buildModifyUserRolesRequest() : CompUser {
        let len = 0;
        if (this.selectedRoles !== undefined) {
            len = this.selectedRoles.length;
        }
        var jsonData = JSON.parse(JSON.stringify(this.userRoleArray));
        let compUser = new CompUser();
        let compUserRole = new CompUserRole();
        for (var i = 0; i < jsonData.length; i++) {
            for (let xx = 0; xx < len; xx++) {
                if (jsonData[i].authority === this.selectedRoles[xx]) {
                    let userAssignedRoles = new UserRole();
                    this.role = new RoleDetails();
                    userAssignedRoles.authority = jsonData[i].authority;
                    userAssignedRoles.roleId = jsonData[i].roleId;
                    this.role.role = userAssignedRoles;
                    compUserRole.compUserRole[xx] = this.role;
                    compUser.compUser[0] = compUserRole;
                    compUser.userName = this.userLdap;
                }
            }
        }
        return compUser;
    }


    getUsersRoles(rowIndex:number, offset:number){
        this._waitSpinnerService.showWait();
        this.userRoles = [];
        let pageNo = (rowIndex + offset)/offset;
        if(typeof this.componentId !== 'undefined'){
            let uri = '/v1/user-maintainenance/comp/' + this.componentId + '/user-roles?pageNo='+pageNo+'&pageSize='+offset;
            this._webServiceComm.httpGet(uri).subscribe(resp => {
                this.msgs = [];
                if(resp && resp.users && resp.users.length >0){
                    this.totalRecords = resp.pagination.totalRecordCount;
                    if(this.totalRecords > 10){
                        this.isPaginator = true;
                    }else{
                        this.isPaginator = false;
                    
                    }
                }
                let roles;
                let newLine = ', ';
                for (let ii = 0; ii < resp.users.length; ii++) {
                    roles = [];
                    if (resp.users[ii].roles !== undefined) {
                        for (let xx = 0; xx < resp.users[ii].roles.length; xx++) {
                            roles += this.getLongUserRolesMaping(resp.users[ii].roles[xx].authority);
                            if (xx != resp.users[ii].roles.length - 1) {
                                roles += newLine;
                            }
                        }
                    }
                    var jsonstr = JSON.stringify(this.emptyUserRoles);
                    this.jsonObj = JSON.parse(jsonstr);
                    this.jsonObj["userName"] = resp.users[ii].userName;
                    this.jsonObj["roles"] = roles;
                    this.jsonObj["userId"] = resp.users[ii].userId;
                    this.userRoles.push(this.jsonObj);
                }
            }, err => {
                if(err.status === 500 ){
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                }
                if(this.loadCounter === -1){
                this._waitSpinnerService.hideWait();
                }
            this.loadCounter = -1;
            }, () => {
            if(this.loadCounter === -1 ){
                this._waitSpinnerService.hideWait();
            }
            this.loadCounter = -1;
            });
        }



      }

    getLongUserRolesMaping(roles) {
        if (roles === 'USER_ITEM_GUI_SUPER') {
            return 'Super User'
        } else if (roles === 'USER_ITEM_MASTER_EXTRACT') {
            return 'Database Match'
        } else if (roles === 'USER_ITEM_MASTER_VENDOR_CHARGES') {
            return 'Extract Vendor Charge'
        } else if (roles === 'USER_ITEM_MASTER_COST_HISTORY') {
            return 'Cost History'
        } else if (roles === 'USER_ITEM_MASTER_COST_SELL') {
            return 'Cost Sell'
        } else if (roles === 'USER_ITEM_MAINTAINANCE_RO') {
            return 'Item Maintenance - Read Only'
        } else if (roles === 'USER_ITEM_MAINTAINANCE_ADD') {
            return 'Item Maintenance - Add Only'
        } else if (roles === 'USER_ITEM_MAINTAINANCE') {
            return 'Item Maintenance'
        } else if (roles === 'USER_ITEM_MASTER_HAZARD') {
            return 'Hazard'
        } else if (roles === 'USER_ITEM_MASTER_CALENDAR') {
            return 'Calendar'
        } else if (roles === 'USER_ITEM_MASTER_DIV_PLS') {
            return 'Div Pls'
        }else if (roles === 'USER_ITEM_MASTER_DIV_SON') {
            return 'Div Son'
        }else if (roles === 'USER_ITEM_MASTER_BUYER_AUTH') {
            return 'Buyer Auth'
        }else if (roles === 'USER_ITEM_MASTER_SST_SHIP_TO_VENDOR') {
            return 'Ship To Vendor'
        } else {
            return ' ';
        }
    }

    onRowSelect(event) {
        this.isNewUser = false;
        this.subMessages = [];
        this.msgs = [];
        this._waitSpinnerService.showWait();
        this.userId = event.data.userId;
        let uri = '/v1/user-maintainenance/comp/' + this.componentId + '/user/' + event.data.userId;
        this.userLdap = event.data.userName;
        let roles;
        this._webServiceComm.httpGet(uri).subscribe(resp => {
            if (!resp || !resp.users || resp.users.length == 0) {
               this._alertMessageService.addErrorMessage(ErrorMessage.ES042, this.msgs);
               this.isNewUserRolesDialogDisplay = false;
               return;
            }
            roles = resp.users[0].roles;
            let rolesArray;
            rolesArray = [];
            if (roles != undefined) {
                for (let ii = 0; ii < roles.length; ii++) {
                    for (let xx = 0; xx < this.userRoleArray.length; xx++) {
                        if (this.userRoleArray[xx].authority === roles[ii].authority) {
                            rolesArray[ii] = roles[ii].authority;
                        }
                    }
                }
            }
            this.selectedRoles = rolesArray;
            this.isNewUserRolesDialogDisplay = true;
        }, err => {
            if(err.status === 500 ){
               this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
             }
            this._waitSpinnerService.hideWait();
        }, () => {
            this._waitSpinnerService.hideWait();
        });
    }

    onUserDeleteSubmit() {
        this.msgs = [];
        this.subMessages = [];
        this._confirmationService.confirm({
            message: 'Are you sure that you want to delete this user?',
            header: 'Confirmation',
            accept: () => {
                this._waitSpinnerService.showWait();
                let uri = '/v1/user-maintainenance/comp/' + this.componentId + '/user/' + this.userId;
                this._webServiceComm.httpDelete(uri).subscribe(resp => {
                    this.isNewUserRolesDialogDisplay = false;
                    this.getUsersRoles(this.rowindex,10);
                }, err => {
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.subMessages);
                    this._waitSpinnerService.hideWait();
                }, () => {
                    this._waitSpinnerService.hideWait();
                    this.successMsgs.push({ severity: 'success', summary: 'Success Message', detail: 'The user deleted successfully' });
                });
            },
            reject: () => {              
            }
        });
    }

     loadUserRolesLazy(event: LazyLoadEvent) {
        this.rowindex = event.first;
        this.getUsersRoles(event.first, event.rows);   
     }
}
