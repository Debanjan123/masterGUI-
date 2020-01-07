import { Injectable } from '@angular/core';



@Injectable()
export class LocalStorageService {

    private keys = new Array();
    private data = new Object();

    addItem(key, value) {
        if (this.data[key] == null) {
            this.keys.push(key);
        }
        this.data[key] = value;
    }

    getItem(key) {
        return this.data[key];
    }

    remove(key) {
        try {
            this.keys.splice(this.keys.indexOf(key), 1);
            this.data[key] = null;
        } catch (e) { }
    }

    clear() {
        this.keys = new Array();
        this.data = new Object();
    }

    public static LOGOUT_MENU_KEY = 'logoutmenu';
    public static EXIT_MENU_KEY = 'exitmenu';
    public static DB_MATCH_MENU_KEY = 'dbmatchmenu';
    public static VND_CHRG_MENU_KEY = 'vndchrgmenu';
    public static COST_HISTORY_MENU_KEY = 'costhistgmenu';
    public static COST_SELL_MENU_KEY = 'costsellgmenu';
    public static USER_ROLE_MENU_KEY = 'userrolemenu';
    public static ENQUIRY_MENU_KEY = 'enquirymenu';
    public static ADD_MENU_KEY = 'addmenu';
    public static ITEMMASTER_MENU_KEY = 'itemmastermenu';
    public static MAINTAIN_MENU_KEY = 'maintainmenu';
    public static HAZARD_MENU_KEY = 'hazardmenu';
    public static CALENDAR_MENU_KEY = 'calendarmenu';
    public static DIV_SON_MENU_KEY = 'divsonmenu';
    public static DIV_PLS_MENU_KEY = 'divplsmenu';
    public static BUYER_MENU_KEY = 'buyermenu';
    public static ClientCode = 'ItemMasterGUI';
    public static ClientSecret = 'Kkq21!#1Asd1';
    public static ITEM_MASTER_GUI = "HSPartItemMasterAppService";
    public static SST_VIEW_SHIP_TO_VENDOR_MENU_KEY = 'sstshiptovendowmenu';


    public static ERROR_STATUS_CD_NOT_FOUND = "ES404";
    public static ERROR_STATUS_CD_INACTIVE = "ES400";
    public static ERROR_STATUS_CD_SYS_ERROR_FETCH = "ES405";
    public static ERROR_STATUS_CD_SYS_ERROR = "ES500";
    public static ERROR_STATUS_CD_DIV_NOT_VALID = "ES402";
    public static ERROR_STATUS_CD_NOT_BLANK = "ES401"
    public static ERROR_STATUS_CD_PLS_NOT_VALID = "ES403";
    public static ERROR_STATUS_CD_PART_NOT_VALID = "ES406";
    public static ERROR_STATUS_CD_ITEM_NOT_BLANK = "ES407";
    public static ERROR_STATUS_CD_SUB_ITEM_NOT_ACTIVE = "ES408";
    public static ERROR_STATUS_CD_SUB_ITEM_NOT_MARK_DLT = "ES409";
    public static ERROR_STATUS_CD_SUB_ITEM_NOT_FOUND = "ES410";
    public static ERROR_STATUS_CD_ITM_NOT_SUBED_ITSELF = "ES411";
    public static ERROR_STATUS_CD_HAZARD_CD_INACTIVE = "ES412";
    public static ERROR_STATUS_CD_HAZARD_CD_NOT_FOUND = "ES413";
    public static ERROR_STATUS_CD_SIC_CD_INACTIVE = "ES414";
    public static ERROR_STATUS_CD_SIC_CD_NOT_FOUND = "ES415";
    public static ERROR_STATUS_CD_DESC_NOT_BLANK = "ES416";
    public static ERROR_STATUS_CD_SUB_FIELDS_REQUIRED = "ES417";
    public static ERROR_STATUS_CD_COST_INVALID = "ES418";
    public static ERROR_STATUS_CD_SELL_PRICE_INVALID = "ES419";
    public static ERROR_STATUS_CD_LIST_PRICE_INVALID = "ES421";
    public static ERROR_STATUS_CD_EX_PRICE_INVALID = "ES422";
    public static ERROR_STATUS_CD_DISCOUNT_PRICE_INVALID = "ES423";
    public static ERROR_STATUS_CD_COMENT_NOT_BLANK_FOR_NPI_ALPHA_CD = "ES424";
    public static ERROR_STATUS_CD_SUB_PART_INVALID = "ES425";
    public static ERROR_STATUS_CD_RELATED_PART_INVALID = "ES426";
    public static ERROR_STATUS_CD_DIV_SON_INVALID = "ES427";
    public static ERROR_STATUS_CD_SUB_BYER_AUTH_INVALID = "ES428";
    public static ERROR_STATUS_CD_ITEM_EXISTS = "ES429";
    public static ERROR_STATUS_CD_PREV_ITM_NT_FND = "ES008A";
    public static ERROR_STATUS_CD_NXT_ITM_NT_FND = "ES008B";
    public static ERROR_STATUS_CD_RELATED_PART_NOT_ALL_ZERO = "ES430";
    public static ERROR_STATUS_CD_NEXT_SUB_ITEM_ALREADY_SUBBED = "ES431";
    public static ERROR_STATUS_CD_NEXT_SUB_ITEM_IS_NLA = "ES432";
    public static ERROR_STATUS_CD_HAZARD_CD_LOAD_ERROR = "ES434";
    public static ERROR_STATUS_CD_BYER_AUTH_INVALID = "ES433";


    public static ERROR_MSG_BODY_INACTIVE = " is Inactive";
    public static ERROR_MSG_BODY_NOT_FOUND = " not found";
    public static ERROR_MSG_BODY_SYS_ERROR_FETCH = "System error encountered while fetching ";
    public static ERROR_MSG_BODY_SYS_ERROR = "Something went wrong, please try again later";
    public static ERROR_MSG_BODY_DIV_NOT_VALID = "DIV should be 2 digits.";
    public static ERROR_MSG_BODY_NOT_BLANK = " should not be blank.";
    public static ERROR_MSG_BODY_PLS_NOT_VALID = "PLS should be 3 digits.";
    public static ERROR_MSG_BODY_PART_NOT_VALID = "Part should contains only 0-9 a-z A-Z . \\ -";
    public static ERROR_MSG_BODY_ITEM_NOT_BLANK = "Item should not be blank.";
    public static ERROR_MSG_BODY_SUB_ITEM_NOT_ACTIVE = "Next substitute item is inactive.";
    public static ERROR_MSG_BODY_SUB_ITEM_NOT_MARK_DLT = "Next substitute item is marked for deletion.";
    public static ERROR_MSG_BODY_SUB_ITEM_NOT_FOUND = "Next substitute item is not found.";
    public static ERROR_MSG_BODY_ITM_NOT_SUBED_ITSELF = "Item can not be subbed with itself.";
    public static ERROR_MSG_BODY_SUB_FIELDS_REQUIRED = "Substitution fields are required.";
    public static ERROR_MSG_BODY_COST_INVALID = "Cost can't be greater than $10000.";
    public static ERROR_MSG_BODY_SELL_PRICE_INVALID = "Sell Price can't be greater than $10000.";
    public static ERROR_MSG_BODY_LIST_PRICE_INVALID = "List Price can't be greater than $10000.";
    public static ERROR_MSG_BODY_EX_PRICE_INVALID = "Exchange Price can't be greater than $10000.";
    public static ERROR_MSG_BODY_DISCOUNT_PRICE_INVALID = "Discount Percentage can't be greater than $99.9.";
    public static ERROR_MSG_BODY_COMENT_NOT_BLANK_FOR_NPI_ALPHA_CD = "Comments should not be blank while Alpha Code is NPI.";
    public static ERROR_MSG_BODY_DIV_SON_INVALID = "SON is not valid.";
    public static ERROR_MSG_BODY_BYER_AUTH_INVALID = "Byer No. is not valid.";
    public static ERROR_MSG_BODY_ITEM_EXISTS = "Item already exists.";
    public static ERROR_MSG_BODY_PREV_ITM_NT_FND = "Previous Item not found.";
    public static ERROR_MSG_BODY_NXT_ITM_NT_FND = "Next Item not found.";
    public static ERROR_MSG_BODY_RELATED_PART_NOT_ALL_ZERO = "Related Model Number Invalid.";
    public static ERROR_MSG_BODY_NEXT_SUB_IS_ALREADY_SUBBED = "Next Substitute Item is already subbed to another item.";
    public static ERROR_MSG_BODY_NEXT_SUB_IS_NLA = "Next Substitute Item is no longer available.";
    public static ERROR_MSG_BODY_HAZARD_CD_LOAD_ERROR = "Hazard Code failed to load.";

    public static ALPHACODE: any[] = [
        { Code: 'B/L', Description: 'Buy Locally' },
        { Code: 'F/L', Description: 'Fabricate Locally' },
        { Code: 'N/C', Description: 'No Charge' },
        { Code: 'NLA', Description: 'No Longer Available' },
        { Code: 'NPI', Description: 'No Pricing Information' },
        { Code: 'NSP', Description: 'Non Servicable Part' },
        { Code: 'R/L', Description: 'Repair Locally' },
    ];

    public static PRICE_FORMULA: any[] = [
        { Code: 'L', Description: 'List price formula' },
        { Code: 'M', Description: 'Markup formula' },
        { Code: '3', Description: 'Cubed root formula' },
        { Code: '5', Description: 'Fifth root formula' }
    ];

   

// public static State: any[]  = [
//     { name: 'ALABAMA', abbreviation: 'AL'},
//     { name: 'ALASKA', abbreviation: 'AK'},
//     { name: 'AMERICAN SAMOA', abbreviation: 'AS'},
//     { name: 'ARIZONA', abbreviation: 'AZ'},
//     { name: 'ARKANSAS', abbreviation: 'AR'},
//     { name: 'CALIFORNIA', abbreviation: 'CA'},
//     { name: 'COLORADO', abbreviation: 'CO'},
//     { name: 'CONNECTICUT', abbreviation: 'CT'},
//     { name: 'DELAWARE', abbreviation: 'DE'},
//     { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC'},
//     { name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM'},
//     { name: 'FLORIDA', abbreviation: 'FL'},
//     { name: 'GEORGIA', abbreviation: 'GA'},
//     { name: 'GUAM', abbreviation: 'GU'},
//     { name: 'HAWAII', abbreviation: 'HI'},
//     { name: 'IDAHO', abbreviation: 'ID'},
//     { name: 'ILLINOIS', abbreviation: 'IL'},
//     { name: 'INDIANA', abbreviation: 'IN'},
//     { name: 'IOWA', abbreviation: 'IA'},
//     { name: 'KANSAS', abbreviation: 'KS'},
//     { name: 'KENTUCKY', abbreviation: 'KY'},
//     { name: 'LOUISIANA', abbreviation: 'LA'},
//     { name: 'MAINE', abbreviation: 'ME'},
//     { name: 'MARSHALL ISLANDS', abbreviation: 'MH'},
//     { name: 'MARYLAND', abbreviation: 'MD'},
//     { name: 'MASSACHUSETTS', abbreviation: 'MA'},
//     { name: 'MICHIGAN', abbreviation: 'MI'},
//     { name: 'MINNESOTA', abbreviation: 'MN'},
//     { name: 'MISSISSIPPI', abbreviation: 'MS'},
//     { name: 'MISSOURI', abbreviation: 'MO'},
//     { name: 'MONTANA', abbreviation: 'MT'},
//     { name: 'NEBRASKA', abbreviation: 'NE'},
//     { name: 'NEVADA', abbreviation: 'NV'},
//     { name: 'NEW HAMPSHIRE', abbreviation: 'NH'},
//     { name: 'NEW JERSEY', abbreviation: 'NJ'},
//     { name: 'NEW MEXICO', abbreviation: 'NM'},
//     { name: 'NEW YORK', abbreviation: 'NY'},
//     { name: 'NORTH CAROLINA', abbreviation: 'NC'},
//     { name: 'NORTH DAKOTA', abbreviation: 'ND'},
//     { name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP'},
//     { name: 'OHIO', abbreviation: 'OH'},
//     { name: 'OKLAHOMA', abbreviation: 'OK'},
//     { name: 'OREGON', abbreviation: 'OR'},
//     { name: 'PALAU', abbreviation: 'PW'},
//     { name: 'PENNSYLVANIA', abbreviation: 'PA'},
//     { name: 'PUERTO RICO', abbreviation: 'PR'},
//     { name: 'RHODE ISLAND', abbreviation: 'RI'},
//     { name: 'SOUTH CAROLINA', abbreviation: 'SC'},
//     { name: 'SOUTH DAKOTA', abbreviation: 'SD'},
//     { name: 'TENNESSEE', abbreviation: 'TN'},
//     { name: 'TEXAS', abbreviation: 'TX'},
//     { name: 'UTAH', abbreviation: 'UT'},
//     { name: 'VERMONT', abbreviation: 'VT'},
//     { name: 'VIRGIN ISLANDS', abbreviation: 'VI'},
//     { name: 'VIRGINIA', abbreviation: 'VA'},
//     { name: 'WASHINGTON', abbreviation: 'WA'},
//     { name: 'WEST VIRGINIA', abbreviation: 'WV'},
//     { name: 'WISCONSIN', abbreviation: 'WI'},
//     { name: 'WYOMING', abbreviation: 'WY' }
// // ];


    public static SEASONALCODE: any[] = [
        { Code: 'S', Description: 'Spring' },
        { Code: 'U', Description: 'Summer' },
        { Code: 'F', Description: 'Fall' },
        { Code: 'W', Description: 'Winter' },
    ];

    public static UOM: any[] = [
        { Code: 'BL', Description: 'Bottle' },
        { Code: 'CN', Description: 'Can' },
        { Code: 'CS', Description: 'Case' },
        { Code: 'EA', Description: 'Each' },
        { Code: 'FT', Description: 'Feet' },
        { Code: 'GL', Description: 'Gallons' },
        { Code: 'KT', Description: 'KiT' },
        { Code: 'LB', Description: 'Pounds' },
        { Code: 'PG', Description: 'Package' },
        { Code: 'PR', Description: 'Pair' },
        { Code: 'PT', Description: 'Prints' },
        { Code: 'QT', Description: 'Quarts' },
        { Code: 'ST', Description: 'Set' },
    ];





    // static methods
    public static getLabel(id: string, options: any[], fillString?: string): string {
        let description = (fillString) ? fillString : '-';
        options.forEach(option => {
            if (option.value == id) {
                description = option.label;
                return;
            }
        });
        return description;
    }


    public static leftPad(n, p, c?): any {
        var pad_char = typeof c !== 'undefined' ? c : '0';
        var pad = new Array(1 + p).join(pad_char);
        return (pad + n).slice(-pad.length);
    }

    public static RequestIdleftPad(n, p, c?): any {
        var pad_char = typeof c !== 'undefined' ? c : '0';
        var pad = new Array(1 + p).join(pad_char);
        return (pad + n).slice(-pad.length);
    }

    private stdTimezoneOffset(date: Date) {
        var jan = new Date(date.getFullYear(), 0, 1);
        var jul = new Date(date.getFullYear(), 6, 1);
        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    }

    private dst(date: Date) {
        return date.getTimezoneOffset() < this.stdTimezoneOffset(date);
    }

    public calcualteTimeToEST() {

        var date = new Date();
        var isDST = this.dst(date) ? true : false;
        var pstOffset = isDST ? 7 : 8;
        var mstOffset = isDST ? 6 : 7;
        var cstOffset = isDST ? 5 : 6;
        var estOffset = isDST ? 4 : 5;
        var gmtOffset = 1;

        pstOffset = pstOffset * 60 * 60 * 1000;
        mstOffset = mstOffset * 60 * 60 * 1000;
        cstOffset = cstOffset * 60 * 60 * 1000;
        estOffset = estOffset * 60 * 60 * 1000;
        gmtOffset = gmtOffset * 60 * 60 * 1000;

        var todayMillis = date.getTime();
        var timeZoneOffset = (date.getTimezoneOffset() * 60 * 1000);
        var curretPST = todayMillis - pstOffset;
        var curretMST = todayMillis - mstOffset;
        var curretCST = todayMillis - cstOffset;
        var curretEST = todayMillis - estOffset;
        var curretGMT = todayMillis - gmtOffset;

        // console.log("PST Time : " + new Date(curretPST).toUTCString());
        // console.log("CST Time : " + new Date(curretCST).toUTCString());
        // console.log("EST Time : " + new Date(curretEST).toUTCString());
        // console.log("GMT Time : " + new Date(curretGMT).toUTCString());
        // console.log("Local Time : " + new Date(date.getTime() - timeZoneOffset ).toUTCString());

        let yyyy = new Date(curretEST).getUTCFullYear();
        let mm = ("0" + (new Date(curretEST).getUTCMonth() + 1)).slice(-2);
        let dd = ("0" + new Date(curretEST).getUTCDate()).slice(-2);
        let hh = ("0" + new Date(curretEST).getUTCHours()).slice(-2);
        let mi = ("0" + new Date(curretEST).getUTCMinutes()).slice(-2);
        let ss = ("0" + new Date(curretEST).getUTCSeconds()).slice(-2);
        let newDate = '' + yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + mi + ':' + ss;

        return newDate;
    }

    private epochToDate(t) {
        function pad2(n) {
            return n > 9 ? n : '0' + n;
        }
        var d = new Date(t * 1000);
        var year = d.getUTCFullYear();
        var month = d.getUTCMonth() + 1;  // months start at zero
        var day = d.getUTCDate();
        // console.log(day + '-' + month + '-' + year);
        return pad2(day) + '-' + pad2(month) + '-' + year;
    }

}