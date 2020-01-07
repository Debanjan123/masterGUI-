import { ErrorMessage } from './ErrorMessage';

export class FieldMetadata {
    private static fieldStatus = {
        "mainDiv": {
            "cssClass": "",
            "disable": true
        },
        "mainPls": {
            "cssClass": "",
            "disable": true
        },
        "mainPartNo": {
            "valid": true,
            "disable": true
        },
        "nextSubstitute": {
            "dialogBox-visible": false,
            "mandatory": false,
            "saveEnabled": false
        },
        "alphaCode": {
            "valid": true,
            "dialogBox-visible": false
        },
        "itemDescription": {
            "valid": true
        },
        "comments": {
            "valid": true
        },
        "subItem": {
            "errorCodes": [ErrorMessage.ES012, ErrorMessage.ES013, ErrorMessage.ES014,
                ErrorMessage.ES015, ErrorMessage.ES016, ErrorMessage.ES010, ErrorMessage.ES025]
        },
        "subBuyerId": {
            "loading": false,
            "valid": true,
            "errorCodes": [ErrorMessage.ES009]
        },
        "hazardCd": {
            "loading": false,
            "valid": true,
            "dialogBox-visible": false,
            "errorCodes": [ErrorMessage.ES002, ErrorMessage.ES003, ErrorMessage.ES004]
        },
        "son": {
            "cssClass": "",
            "valid": true,
            "errorCodes": [ErrorMessage.ES027]
        },
        "buyerAuth": {
            "cssClass": "",
            "errorCodes": [ErrorMessage.ES026]
        },
        "cost": {
            "valid": true,
            "errorCodes": [ErrorMessage.ES020]
        },
        "sellPrice": {
            "valid": true,
            "errorCodes": [ErrorMessage.ES019]
        },
        "listPrice": {
            "valid": true,
            "errorCodes": [ErrorMessage.ES021]
        },
        "exchangePrice": {
            "valid": true,
            "errorCodes": [ErrorMessage.ES022]
        },
        "discountPercent": {
            "valid": true,
            "errorCodes": [ErrorMessage.ES028]
        },
        "relatedModelNo": {
            "valid": true,
            "errorCodes": [ErrorMessage.ES023, ErrorMessage.ES024]
        },
        "reinstate": {
            "disable": true
        },
        "markedForDeletion": {
            "disable": true
        },
        "onEditMode": {
            "disable": true
        },
        "onInquiryAction": {
            "disable": true,
            "visible": true
        },
        "onAddAction": {
            "disable": true,
            "visible": true
        },
        "onForwardAndBackwardAction": {
            "disable": true,
            "visible": true
        },
        "onEditAction": {
            "disable": true,
            "visible": true
        },
        "onCloneAction": {
            "disable": true,
            "visible": true
        },
        "hazardCode": {
            "mandatory": false,
            "errorCodes": [ErrorMessage.ES030]
        },
        "toDiv": {
            "cssClass": "",
            "disable": true
        },
        "toPls": {
            "cssClass": "",
            "disable": true
        },
        "toPartNo": {
            "valid": true,
            "disable": true
        },
        "fromDiv": {
            "cssClass": "",
            "disable": true
        },
        "fromPls": {
            "cssClass": "",
            "disable": true
        },
        "fromPartNo": {
            "valid": true,
            "disable": true
        },
        "hazardScr": {
            "mandatory": true,
            "saveEnabled": false
        },
        "hazardScrCd": {
            "loading": false,
            "valid": true,
            "errorCodes": [ErrorMessage.ES044, ErrorMessage.ES045]
        },
        "hazardScrDesc": {
            "valid": true,
            "errorCodes": [ErrorMessage.ES046]
        },
        "hsCalendar": {
            "mandatory": true,
            "saveEnabled": true
        },
        "hsCalendarCalDate": {
            "loading": false,
            "valid": true,
            "errorCodes": [ErrorMessage.ES047]
        },
        "divSon": {
            "mandatory": true,
            "saveEnabled": false,
            "dialogBox-visible-priceFormula": false,
            "dialogBox-visible-buyerAuth": false,
            "errorCodes": [ErrorMessage.ES056],
            "valid": true,
            "priceVariableValid": true,
            "markUpValid": true,
            "distCountValid": true,
        },
        "divSon.PriceVariable": {
            "errorCodes": [ErrorMessage.ES057],
        },
        "DivPlsScr": {
            "mandatory": true,
            "saveEnabled": false
        },
        "addDivPls": {
            "loading": false,
            "valid": true,
            "errorCodes": [ErrorMessage.ES052]
        },
        "addBuyerAuth": {
            "loading": false,
            "valid": true,
            "errorCodes": [ErrorMessage.ES052]
        },
        "BuyerAuthScr": {
            "mandatory": true,
            "saveEnabled": false
        },
         "ShipToVendor": {
           "mandatory": true,
           "saveEnabled": false,
           "dialogBox-visible-State" :true,
           "valid" : true
        }
    };

    public static getFieldStatus() {
        return JSON.parse(JSON.stringify(this.fieldStatus));
    }
}