import {
    Component,
    ViewChildren
}  from '@angular/core';

import {
    DatePipe
}from '@angular/common';

import {
    WebServiceComm,
    LocalStorageService,
    AlertMessageService,
    WaitSpinnerService,
    CommonUtils,
    CommonValidation
} from '../../../_services/common/index';

// import {
//     Content
// } from '../../../shared/dbMatch/content';

import {
    ShipToVendor,
    Report,
    FieldMetadata,
    ErrorMessage,
} from '../../../_domains/common/index';

import {
    Headers,
    Http,
    Response,
    RequestOptions
} from '@angular/http';

import {
    Observable
} from 'rxjs/Observable';

import {
    ISubscription
} from 'rxjs/Subscription';

import {
    SelectItem,
    ConfirmationService,
    GrowlModule
} from 'primeng/primeng';

import {
    ReportResponse
} from '../../../shared/dbMatch/reportResponse';

import {
    Router
} from '@angular/router';

@Component({
    templateUrl: './sstViewShipToVendor.component.html'
})



export class SSTViewShipToVendorComponent {


  private isNewVendor = false;
  private vendorData = [];
  private msgs = [];
  private jsonObj = {};
  private warnMsgs = [];
  private shipToVendor = new ShipToVendor();
  private addmsgs = [];
  private successMsgs = [];
  private isEditVendor = false;
  private fieldStatus = FieldMetadata.getFieldStatus();
  private stateCd : SelectItem[];
  private emptyShipToVendorData = {
            'vendorId':'',
            'vendorName':'',
            'vendorAddress':'',
            'vendorCityName':'',
            'vendorStateCd':'',
            'vendorZipCd':'',
            'vendorActiveDt':'',
            'createTime':'',
            '_links':{ 
               'self':{ 
                  'href':''
               },
               'shipToVendor':{ 
                  'href':''
               }
            }
  }



   constructor(private _webServiceComm: WebServiceComm,
        private _waitSpinnerService: WaitSpinnerService,
        private _commonValidation: CommonValidation,
        private _alertMessageService: AlertMessageService,
        private confirmationService: ConfirmationService) {
        // this.validateSub.subscribe(resp => {
        //     if (resp === false) {
        //         //this.toggleSubmitButton();
        //     }
        //     if (resp === true) {
        //         //this.toggleSubmitButton();
        //     }
        // }
        // )
        
    }

  ngOnInit() {
        try {
           this.stateCd = [];
           this.stateCd.push({label : 'Select a State',value : null},
                {label : 'AL' ,value :'AL'},
                { label: 'AK', value: 'AK'},
                { label: 'AS', value: 'AS'},
                { label: 'AZ', value: 'AZ'},
                { label: 'AR', value: 'AR'},
                { label: 'CA', value: 'CA'},
                { label: 'CO', value: 'CO'},
                { label: 'CT', value: 'CT'},
                { label: 'DE', value: 'DE'},
                { label: 'DC', value: 'DC'},
                { label: 'FM', value: 'FM'},
                { label: 'FL', value: 'FL'},
                { label: 'GA', value: 'GA'},
                { label: 'GU', value: 'GU'},
                { label: 'HI', value: 'HI'},
                { label: 'ID', value: 'ID'},
                { label: 'IL', value: 'IL'},
                { label: 'IN', value: 'IN'},
                { label: 'IA', value: 'IA'},
                { label: 'KS', value: 'KS'},
                { label: 'KY', value: 'KY'},
                { label: 'LA', value: 'LA'},
                { label: 'ME', value: 'ME'},
                { label: 'MH', value: 'MH'},
                { label: 'MD', value: 'MD'},
                { label: 'MA', value: 'MA'},
                { label: 'MI', value: 'MI'},
                { label: 'MN', value: 'MN'},
                { label: 'MS', value: 'MS'},
                { label: 'MO', value: 'MO'},
                { label: 'MT', value: 'MT'},
                { label: 'NE', value: 'NE'},
                { label: 'NV', value: 'NV'},
                { label: 'NH', value: 'NH'},
                { label: 'NJ', value: 'NJ'},
                { label: 'NM', value: 'NM'},
                { label: 'NY', value: 'NY'},
                { label: 'NC', value: 'NC'},
                { label: 'ND', value: 'ND'},
                { label: 'MP', value: 'MP'},
                { label: 'OH', value: 'OH'},
                { label: 'OK', value: 'OK'},
                { label: 'OR', value: 'OR'},
                { label: 'PW', value: 'PW'},
                { label: 'PA', value: 'PA'},
                { label: 'PR', value: 'PR'},
                { label: 'RI', value: 'RI'},
                { label: 'SC', value: 'SC'},
                { label: 'SD', value: 'SD'},
                { label: 'TN', value: 'TN'},
                { label: 'TX', value: 'TX'},
                { label: 'UT', value: 'UT'},
                { label: 'VT', value: 'VT'},
                { label: 'VI', value: 'VI'},
                { label: 'VA', value: 'VA'},
                { label: 'WA', value: 'WA'},
                { label: 'WV', value: 'WV'},
                { label: 'WI', value: 'WI'},
                { label: 'WY', value: 'WY' });
       
           this.getVendorData();
        } catch (error) {
            this.msgs.push({ severity: 'error', summary: error });
        }
   }


   getVendorData() {
        this._waitSpinnerService.showWait();
        this.vendorData = [];
        let uri = '/v1/data/item-master-data/shipToVendor?size=100';
        try {
            this._webServiceComm.httpGet(uri).subscribe(resp => {
           
                this._waitSpinnerService.hideWait();
                 for (let ii = 0; ii < resp._embedded.shipToVendor.length; ii++) {
                     var jsonstr = JSON.stringify(this.emptyShipToVendorData);
                     this.jsonObj = JSON.parse(jsonstr);
                     this.jsonObj['vendorId'] = resp._embedded.shipToVendor[ii].vendorId;
                     this.jsonObj['vendorName'] = resp._embedded.shipToVendor[ii].vendorName;
                     this.jsonObj['vendorAddress'] = resp._embedded.shipToVendor[ii].vendorAddress;
                     this.jsonObj['vendorCityName'] = resp._embedded.shipToVendor[ii].vendorCityName;
                     this.jsonObj['vendorStateCd'] = resp._embedded.shipToVendor[ii].vendorStateCd;
                     this.jsonObj['vendorZipCd'] = resp._embedded.shipToVendor[ii].vendorZipCd;
                     this.jsonObj['vendorZip4Cd'] = resp._embedded.shipToVendor[ii].vendorZip4Cd;
                     this.jsonObj['vendorActiveDt'] = resp._embedded.shipToVendor[ii].vendorActiveDt;
                     this.jsonObj["updateTime"] = resp._embedded.shipToVendor[ii].updateTime;
                     this.jsonObj["createId"] = resp._embedded.shipToVendor[ii].createId;
                     this.jsonObj["updateId"] = resp._embedded.shipToVendor[ii].updateId;
                     this.vendorData.push(this.jsonObj);
                 }
               
            }, err => {
                if (CommonUtils.hasText('' + err.status)) {
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                } else {
                    var errorJson = JSON.parse(err._body);
                    for (let i = 0, len = errorJson.messages.length; i < len; i++) {
                        let errorMessage = ErrorMessage.buildErrorMessage(errorJson.messages[i]);
                        if (errorMessage.getType() === "ERROR") {
                            this.msgs.push({ severity: 'error', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                        } else {
                            this.warnMsgs.push({ severity: 'warn', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                        }
                    }
                }
                this._waitSpinnerService.hideWait();
            }, () => {
            });
        } catch (error) {
            this.msgs.push({ severity: 'error', summary: error });
        }

    }


  onNewVendor(){
       this.addmsgs = [];
       this.shipToVendor = new ShipToVendor();  
       this.isNewVendor = true;
       
  } 


  vendorAddressSave(){ 
    console.log(JSON.stringify(this.shipToVendor.vendorStateCd));
     if(this.shipToVendor.vendorStateCd === ""){
          this._alertMessageService.addErrorMessage(ErrorMessage.ES069, this.addmsgs);
          return;
     }
     this.shipToVendor.vendorActiveDt = "2017-10-04";
     this.shipToVendor.dacDt = "";
     this.shipToVendor.createId = localStorage.getItem('loggedinid');
     this.shipToVendor.updateId = localStorage.getItem('loggedinid');
     this.shipToVendor.createTime = Date.now();
     this.shipToVendor.updateTime = Date.now();
     console.log(JSON.stringify(this.shipToVendor));
     this._waitSpinnerService.showWait();
     let uri = '/v1/data/item-master-data/shipToVendor'
       try {
                this._webServiceComm.httpPost(uri, this.shipToVendor).subscribe(resp => {
                    this._waitSpinnerService.hideWait();
                    if (this.isEditVendor) {
                        this.isEditVendor = false;
                        this.successMsgs.push({ severity: 'success', summary: 'Vendor successfully updated' });
                    }
                    if (this.isNewVendor) {
                        this.isNewVendor = false;
                        this.successMsgs.push({ severity: 'success', summary: 'Vendor successfully added' });
                    }
              
                    this.getVendorData();
                }, err => {
                    if (CommonUtils.hasText('' + err.status)) {
                        this.isNewVendor = false;
                        this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                    } else {
                        var errorJson = JSON.parse(err._body);
                        for (let i = 0, len = errorJson.messages.length; i < len; i++) {
                            let errorMessage = ErrorMessage.buildErrorMessage(errorJson.messages[i]);
                            if (errorMessage.getType() === "ERROR") {
                                this.msgs.push({ severity: 'error', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                            } else {
                                this.warnMsgs.push({ severity: 'warn', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                            }
                        }
                    }
                    this._waitSpinnerService.hideWait();
                }, () => { });
                } catch (error) {
                    this._waitSpinnerService.hideWait();
                    this.msgs.push({ severity: 'error', summary: error });
                }
     
  }

  
     onRowSelect(event) {
        this.fieldStatus['ShipToVendor']['saveEnabled'] = false;
        this.shipToVendor.vendorId = event.data.vendorId;
        this.shipToVendor.vendorName = event.data.vendorName;
        this.shipToVendor.vendorAddress = event.data.vendorAddress;
        this.shipToVendor.vendorCityName = event.data.vendorCityName;
        this.shipToVendor.vendorStateCd =  event.data.vendorStateCd;
        this.shipToVendor.vendorZipCd =  event.data.vendorZipCd;
        this.shipToVendor.vendorZip4Cd =  event.data.vendorZip4Cd;
        this.shipToVendor.vendorActiveDt = "2017-10-04";
        this.shipToVendor.dacDt = "2017-10-04";
        this.shipToVendor.createTime = Date.now();
        this.shipToVendor.updateTime = Date.now();
        this.isEditVendor = true;
        this.addmsgs = [];
     }


    hideDialog(){
         this.isNewVendor = false;
         this.isEditVendor = false;
     }

    onZipKeyUp() {
        this.fieldStatus['ShipToVendor']['saveEnabled'] = false;
        let zip = (this.shipToVendor.vendorZipCd).replace(/\s+/g, '');
        this.shipToVendor.vendorZipCd = this._commonValidation.formatNumeric(zip);
        if (this.shipToVendor.vendorZipCd.length === 5) {
            this.fieldStatus['ShipToVendor']['saveEnabled'] = true;
        } 
    }

    onZip4KeyUp(){
        this.fieldStatus['ShipToVendor']['saveEnabled'] = false;
        let zip = (this.shipToVendor.vendorZip4Cd).replace(/\s+/g, '');
        this.shipToVendor.vendorZip4Cd = this._commonValidation.formatNumeric(zip);
        if (this.shipToVendor.vendorZip4Cd.length === 4) {
            this.fieldStatus['ShipToVendor']['saveEnabled'] = true;
        }
    }

    onKeyUp(){
         this.fieldStatus['ShipToVendor']['saveEnabled'] = false;
         if (this.shipToVendor.vendorName.length != 0 && this.shipToVendor.vendorAddress.length != 0
         && this.shipToVendor.vendorCityName.length != 0 && this.shipToVendor.vendorStateCd.length !=0 && this.shipToVendor.vendorZipCd.length === 5  ) {
            this.fieldStatus['ShipToVendor']['saveEnabled'] = true;
        }
    }

     stateOnChange(){
         this.fieldStatus['ShipToVendor']['saveEnabled'] = false;
         if (this.shipToVendor.vendorName.length != 0 && this.shipToVendor.vendorAddress.length != 0
         && this.shipToVendor.vendorCityName.length != 0 && this.shipToVendor.vendorStateCd.length !=0 && this.shipToVendor.vendorZipCd.length === 5  ) {
            this.fieldStatus['ShipToVendor']['saveEnabled'] = true;
        }
    }
   

    
    

     selectVendorToDelete(vondor: ShipToVendor) {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete Vendor -  ' + vondor.vendorName + ' record?',
            accept: () => {
                this.deleteVendorRecord(vondor);
            }
        });
    }


     deleteVendorRecord(vondor) {
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES999, this.msgs);
        let foreignkeyValidationUri = ''
        let ForeignKeyValidationForVendorIDUri = '/v1/data/item-master-data/api/search/shipToVendor/' + vondor.vendorId
        console.log(JSON.stringify(ForeignKeyValidationForVendorIDUri));
        let deleteUri = '/v1/data/item-master-data/shipToVendor/' + vondor.vendorId
        try {
                  this._webServiceComm.httpGet(ForeignKeyValidationForVendorIDUri).subscribe(resp => {
                  this._waitSpinnerService.hideWait();
                  console.log(JSON.stringify(resp));
                  if(resp > 0){
                        this.msgs.push({ severity: 'warn', warnsummary: 'Error Message', detail: 'There are records present in the child table related to the Vendor -' + vondor.vendorName + '. Please delete the child records first.' });
                         return;
                  }
                  else{
                       this._webServiceComm.httpDelete(deleteUri).subscribe(resp => {
                       this.successMsgs.push({ severity: 'success', summary: 'Vendor successfully Deleted' });
                       this.getVendorData(); 
                        }, err => {
                        if (CommonUtils.hasText('' + err.status)) {
                            this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                        } else {
                            var errorJson = JSON.parse(err._body);
                            for (let i = 0, len = errorJson.messages.length; i < len; i++) {
                                let errorMessage = ErrorMessage.buildErrorMessage(errorJson.messages[i]);
                                if (errorMessage.getType() === "ERROR") {
                                    this.msgs.push({ severity: 'error', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                                } else {
                                    this.warnMsgs.push({ severity: 'warn', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                                }
                            }
                        }
                        this._waitSpinnerService.hideWait();
                    }, () => { });
                  }
       
            }, err => {
                if (CommonUtils.hasText('' + err.status)) {
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES999, this.msgs);
                } else {
                    var errorJson = JSON.parse(err._body);
                    for (let i = 0, len = errorJson.messages.length; i < len; i++) {
                        let errorMessage = ErrorMessage.buildErrorMessage(errorJson.messages[i]);
                        if (errorMessage.getType() === "ERROR") {
                            this.msgs.push({ severity: 'error', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                        } else {
                            this.warnMsgs.push({ severity: 'warn', summary: errorMessage.getCode(), detail: errorMessage.getMessage() });
                        }
                    }
                }
               this._waitSpinnerService.hideWait();
            }, () => { });
        } catch (error) {
            this._waitSpinnerService.hideWait();
            this.msgs.push({ severity: 'error', summary: error });
         }
    }

}