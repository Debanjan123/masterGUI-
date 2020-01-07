import {
    Injectable
} from '@angular/core';
import {
    Headers,
    Http,
    Response,
    RequestOptions,
    ResponseOptions
} from '@angular/http';

import {
    Subject
} from 'rxjs/Rx';

import {
    AuthHttp,
    JwtHelper,
    tokenNotExpired} from 'angular2-jwt';

import {
    Router
} from '@angular/router';

import {
    LocalStorageService,
    WaitSpinnerService,
    AlertMessageService,
    WebServiceComm,
    CommonUtils,
} from '../index';

import {
    Observable
} from 'rxjs/Rx';

import {
    ErrorMessage,
    FieldMetadata
} from '../../../_domains/common/index';

@Injectable()
export class CommonValidation {

    public subcriberObj = new Subject();
    public subObj = new Subject();
    private fieldMetadata;
    constructor(private _localStorageService: LocalStorageService,
        private _alertMessageService: AlertMessageService,
        private _webServiceComm: WebServiceComm,
        private _waitSpinnerService: WaitSpinnerService) {
        this.fieldMetadata = FieldMetadata.getFieldStatus();
    }

    validateItemDescription(itemDescription : string, msgs) {
        let result = this.buildValidationResponse(true);
        if (CommonUtils.hasNoText(itemDescription)) {
            result.valid = false;
            this._alertMessageService.addErrorMessage(ErrorMessage.ES001, msgs);
        } else {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES001, msgs);
        }
        return result;
    }

    validateHazardCode(hazardCode, msgs) {
        let hazardCd = (hazardCode).replace(/\s+/g, '');
        if (!!hazardCd) {
            let HrzdCdUri = "/v1/data/item-master-data/hazard/" + hazardCd;
            this._webServiceComm.httpGet(HrzdCdUri).subscribe(res => {
                let response = this.buildValidationResponse(true, 'validateHazardCode');
                if (res.activeStatus === "A") {
                    this._alertMessageService.removeErrorMessages(this.fieldMetadata['hazardCd'].errorCodes, msgs);
                } else {
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES003, msgs);
                    response.valid = false;
                }
                this.subcriberObj.next(response);
            }, err => {
                if (err.status === 404) {
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES002, msgs);
                    this.subcriberObj.next(this.buildValidationResponse(false, 'validateHazardCode'));
                } else {
                    this._alertMessageService.removeErrorMessages(this.fieldMetadata['hazardCd'].errorCodes, msgs);
                    this.subcriberObj.next(this.buildValidationResponse(true, 'validateHazardCode'));
                }
            }, () => {
            });
        } else {
            this._alertMessageService.removeErrorMessages(this.fieldMetadata['hazardCd'].errorCodes, msgs);
            this.subcriberObj.next(this.buildValidationResponse(true, 'validateHazardCode'));
        }
    }

    formatPrice(price : string, elementName : string, errorMessage : ErrorMessage, msgs) {
        let result = this.buildValidationResponse(true);
        price = '' + price;
        price = price.replace(/\s+/g, '');
        result.price = '';
        if (!!price) {
            price = Number(price).toFixed(2);
            result.price = price;
            if (Number(price) >= 100000) {
                result.valid = false;
                this._alertMessageService.addErrorMessage(errorMessage, msgs);
            }
        }
        if (result.valid) {
            this._alertMessageService.removeErrorMessages(this.fieldMetadata[elementName].errorCodes, msgs);
        }
        return result;
    }

    checkDiscFormat(discountPercent, msgs) {
        let result = this.buildValidationResponse(true);
        discountPercent = discountPercent.replace(/\s+/g, '');
        if (discountPercent === '') {
            result.discountPercent = discountPercent;
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES028, msgs);
        } else {
            result.discountPercent = Number(discountPercent).toFixed(1);
            if (Number(discountPercent) < 100.0) {
                this._alertMessageService.removeErrorMessage(ErrorMessage.ES028, msgs);
            } else {
                result.valid = false;
                this._alertMessageService.addErrorMessage(ErrorMessage.ES028, msgs);
            }
        }
        return result;
    }

    formatNumeric(value : string) {
        value = value.replace(/\s+/g, '');
        while (isNaN(+value) && value !== '') {
            value = value.slice(0, -1);
        }
        return value;        
    }

    validateBuyerNo(byerAuth, msgs) {
        let result: { [k: string]: any } = {};
        let uri = "/v1/data/item-master-data/buyerAuth/" + byerAuth;
        result.origin = "validateBuyerNo";
        this._webServiceComm.httpGet(uri).subscribe(res => {
        }, err => {
            if (err.status === 404) {
                result.err = "red-border";
                this._alertMessageService.addErrorMessage(ErrorMessage.ES026, msgs);
            } else {
                result.err = "";
            }
            this.subcriberObj.next(result);
        }, () => {
            result.err = "";
            this.subcriberObj.next(result);
        });
    }

    validateDivSon(fromDiv, son, msgs) {
        let result: { [k: string]: any } = {};
        let divSonUri = "/v1/data/item-master-data/divSon/" + fromDiv + "_" + son;
        this._webServiceComm.httpGet(divSonUri).subscribe(res => {
        }, err => {
            if (err.status === 404) {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES027, msgs);
                this.subcriberObj.next(this.buildValidationResponse(false, "validateDivSon"));
            } else {
                this.fieldMetadata['son'].cssClass = "";
                this.subcriberObj.next(this.buildValidationResponse(true, "validateDivSon"));                
            }
        }, () => {
            this.fieldMetadata['son'].cssClass = "";
            this.subcriberObj.next(this.buildValidationResponse(true, "validateDivSon"));
        });
    }

    validateSubBuyerNo(byerAuth, subMessages) {
        let uri = "/v1/data/item-master-data/buyerAuth/" + byerAuth;
        this._alertMessageService.removeErrorMessages(this.fieldMetadata['subBuyerId'].errorCodes, subMessages);
        this._webServiceComm.httpGet(uri).subscribe(res => {
            this.fieldMetadata['subBuyerId'].loading = false;
        }, err => {
            if (err.status === 404) {
                this.fieldMetadata['subBuyerId'].valid = false;
                this.fieldMetadata['subBuyerId'].loading = false;
                this._alertMessageService.addErrorMessage(ErrorMessage.ES009, subMessages);
                this.subcriberObj.next(this.buildValidationResponse(false, "validateSubBuyerNo"));
            } else {
                // Other error occurred, so let backend handle this
                this.fieldMetadata['subBuyerId'].valid = true;
                this.subcriberObj.next(this.buildValidationResponse(true, "validateSubBuyerNo"));
            }
            this.fieldMetadata['subBuyerId'].loading = false;
        }, () => {
            this.fieldMetadata['subBuyerId'].loading = false;
            this.fieldMetadata['subBuyerId'].valid = true;
            this.subcriberObj.next(this.buildValidationResponse(true, "validateSubBuyerNo"));
        });
    }

    validateComments(comments: string, alphaCode : string, msgs) {
        let result;
        comments = CommonUtils.safeTrim(comments, '');
        if (alphaCode === "NPI" && comments === '') {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES017, msgs);
            result = this.buildValidationResponse(false);
        } else {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES017, msgs);
            result = this.buildValidationResponse(true);
        }
        result.comments = comments;
        return result;
    }

    validateAlphaCode(alphaCode : string, msgs) {
        let result;
        alphaCode = alphaCode.replace(/\s+/g, '');
        if (alphaCode === '') {
            alphaCode = ' ';
        }
        if (!CommonUtils.getShortAvailCd(alphaCode)) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES018, msgs);            
            result = this.buildValidationResponse(false);
        } else {
            this._alertMessageService.removeErrorMessage(ErrorMessage.ES018, msgs);            
            result = this.buildValidationResponse(true);
        }
        result.alphaCode =  alphaCode;
        return result; 
    }

    checkValidSubItem(subItem, subMessages) {
        let uri = '/v1/data/item-master-data/api/item-details?itemNo=' + subItem;
        let obj: { [k: string]: any } = {};
        obj.origin = 'checkValidSubItem';
        this._alertMessageService.removeErrorMessages(this.fieldMetadata['subItem'].errorCodes, subMessages);
        this._webServiceComm.httpGet(uri).subscribe(res => {
            let alphaCd = '';
            obj.response = res;
            if (res.itemSummary.activeStatusFlag === "I") {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES012, subMessages);
                obj.isSubNextDialogVisible = true;
                return;
            }
            if (res.itemSummary.partDeleteFlag === "Y") {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES013, subMessages);
                obj.isSubNextDialogVisible = true;
                return;
            }
            if (res.substitution) {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES014, subMessages);
                obj.isSubNextDialogVisible = true;
                return;
            }

            if (this.isNlaPart(res.price)) {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES015, subMessages);
                obj.isSubNextDialogVisible = true;
                return;
            }
            this.subObj.next(obj);
        }, err => {
            // Only handle status 400
            if (err.status == 400) {
                this._alertMessageService.addErrorMessage(ErrorMessage.ES016, subMessages);
            } else {
                subMessages = [];
            }
            obj.isSubNextDialogVisible = true;
            obj.err = err;
            this._waitSpinnerService.hideWait();
            this.subObj.next(obj);

        }, () => {
            this._waitSpinnerService.hideWait();
        });
    }

    private isNlaPart(price: any) {
        if (price) {
            let availCd = '';
            if (price.nextPrice) {
                availCd = price.nextPrice.availCd;
            } else if (price.currentPrice) {
                availCd = price.currentPrice.availCd;
            }
            if (availCd === 'U') {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }
  
   validateRelatedModelNo(relatedModelNo, msgs) {
        let result = this.buildValidationResponse(true);
        this._alertMessageService.removeErrorMessage(ErrorMessage.ES024, msgs);

        relatedModelNo = relatedModelNo.replace(/\s+/g, '');
        while (!CommonUtils.matchesPattern(relatedModelNo, '[A-Za-z0-9./-]+') && relatedModelNo !== '') {
            relatedModelNo = relatedModelNo.slice(0, -1);
        }
        
        if (CommonUtils.matchesPattern(relatedModelNo, '[0]+')) {
            this._alertMessageService.addErrorMessage(ErrorMessage.ES024, msgs);
        }
        result.relatedModelNo = relatedModelNo;      
        return result;
    }

    subPartValidation(event, subedItemPart, subMessages) {
        let subPartInvalid = false;
        if (subedItemPart.length > 0) {
            for (let i = 0, len = subedItemPart.length; i < len; i++) {
                let code = subedItemPart.charCodeAt(i);
                if (!(code > 44 && code < 58) && // numeric (0-9)./-
                    !(code > 64 && code < 91) && // upper alpha (A-Z)
                    !(code > 96 && code < 123)) {
                    subPartInvalid = true;
                    this._alertMessageService.addErrorMessage(ErrorMessage.ES025, subMessages);
                    return;
                }
            }
            if (!subPartInvalid) {
                this._alertMessageService.removeErrorMessages(this.fieldMetadata['subItem'].errorCodes, subMessages);
            }
        }
    }

    private buildValidationResponse(valid: boolean, origin?: string) {
        let response: { [key: string]: any } = {};
        response.origin = origin;
        response.valid = valid;
        return response;
    }


    formatPriceFields(price : string, elementName : string, errorMessage : ErrorMessage, msgs) {
        let result = this.buildValidationResponse(true);
        price = '' + price;
        price = price.replace(/\s+/g, '');
        result.price = '';
        if (!!price) {
            price = Number(price).toFixed(2);
            result.price = price;
            if (Number(price) >= 100000) {
                result.valid = false;
                this._alertMessageService.addErrorMessage(errorMessage, msgs);
            }
        }
        if (result.valid) {
            this._alertMessageService.removeErrorMessages(this.fieldMetadata[elementName].errorCodes, msgs);
        }
        return result;
    }

    validateFileSize(fileSize : Number) {
        if (fileSize > 18874368) {
            return false;
        }
        return true;
    }
}