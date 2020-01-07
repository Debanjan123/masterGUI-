export class ErrorMessage {
    public static ES999 = new ErrorMessage("ES999", "Something went wrong, please try again later. If issue continue to persist, please contact application support team.");
    public static ES001 = new ErrorMessage("ES001", "Description is required.");
    public static ES002 = new ErrorMessage("ES002", "Hazmat Code is not found.");
    public static ES003 = new ErrorMessage("ES003", "Hazmat Code is inactive.");
    public static ES004 = new ErrorMessage("ES004", "System error occurred while fetching list of Hazmat code values.");
    public static ES005 = new ErrorMessage("ES005", "DIV is required");
    public static ES006 = new ErrorMessage("ES006", "PLS is required");
    public static ES007 = new ErrorMessage("ES007", "Part No is required");
    public static ES008 = new ErrorMessage("ES008", "Comments are required when Alpha Code is NPI.");
    public static ES009 = new ErrorMessage("ES009", "Substitute Buyer Auth No is invalid.");
    public static ES010 = new ErrorMessage("ES010", "Item can not be subbed to itself.");
    public static ES011 = new ErrorMessage("ES011", "Substitution fields are required.");
    public static ES012 = new ErrorMessage("ES012", "Substitute Item is not active.");
    public static ES013 = new ErrorMessage("ES013", "Substitute Item is marked for deletion.");
    public static ES014 = new ErrorMessage("ES014", "Substitute Item is already subbed to another item.");
    public static ES015 = new ErrorMessage("ES015", "Substitute Item is no longer available.");
    public static ES016 = new ErrorMessage("ES016", "Substitute Item is not found.");
    public static ES017 = new ErrorMessage("ES017", "Comments are required when Alpha Code is NPI.");
    public static ES018 = new ErrorMessage("ES018", "Alpha Code is invalid.");
    public static ES019 = new ErrorMessage("ES019", "Sell Price can't be greater than $99999.99");
    public static ES020 = new ErrorMessage("ES020", "Cost can't be greater than $99999.99");
    public static ES021 = new ErrorMessage("ES021", "List Price can't be greater than $99999.99");
    public static ES022 = new ErrorMessage("ES022", "Exchange Price can't be greater than $99999.99");
    public static ES023 = new ErrorMessage("ES023", "Related model number is invalid. Only Alpha-numeric characters, forward slash (/), period (.), hypen (-) are allowed.");
    public static ES024 = new ErrorMessage("ES024", "Related model number can not be all zeros.");
    public static ES025 = new ErrorMessage("ES025", "Substitute Part should contains only 0-9 a-z A-Z . \/ -");
    public static ES026 = new ErrorMessage("ES026", "Buyer No. is not valid.");
    public static ES027 = new ErrorMessage("ES027", "SON is not valid.");
    public static ES028 = new ErrorMessage("ES028", "Discount Percentage can't be greater than $99.9.");
    public static ES029 = new ErrorMessage("ES029", "Item does not exist.");
    public static ES030 = new ErrorMessage("ES030", "Hazmat Code is mandatory.");
    public static ES031 = new ErrorMessage("ES031", "PLS should be 3 digits.");
    public static ES032 = new ErrorMessage("ES032", "Part should contains only 0-9 a-z A-Z . \/ -");
    public static ES033 = new ErrorMessage("ES033", "PartNo should not be blank.");
    public static ES034 = new ErrorMessage("ES034", "Item already exists.");
    public static ES035 = new ErrorMessage("ES035", "Next Item not found.");
    public static ES036 = new ErrorMessage("ES036", "Previous Item not found.");
    public static ES037 = new ErrorMessage("ES037", "DIV should be 2 digits.");
    public static ES038 = new ErrorMessage("ES038", "System error encountered while fetching price history details.");
    public static ES039 = new ErrorMessage("ES039", "System error encountered while fetching substitution history details.");
    public static ES041 = new ErrorMessage("ES041", "From Part No. is greater than To Part No.");
    public static ES042 = new ErrorMessage("ES042", "User not found. It may have been deleted.");
    public static ES043 = new ErrorMessage("ES043", "User LDAP Id should not be blank");
    public static ES044 = new ErrorMessage("ES044", "Hazmat code already present");
    public static ES045 = new ErrorMessage("ES045", "Hazmat code is required");
    public static ES046 = new ErrorMessage("ES046", "Hazmat code description is required.");
    public static ES047 = new ErrorMessage("ES047", "Calendar date is required.");
    public static ES048 = new ErrorMessage("ES048", "Calendar Entry already present.");
    public static ES049 = new ErrorMessage("ES049", "Limit should not be more than 200,000.");
    public static ES050 = new ErrorMessage("ES050", "Limit should not be more than 200,000 File type should be TEXT !!!");
    public static ES051 = new ErrorMessage("ES051", "File size should not be more than 18 mb  !!! ");
    public static ES052 = new ErrorMessage("ES052", "Div Pls is already present.");
    public static ES053 = new ErrorMessage("ES053", "Div Son is already present.");
    public static ES054 = new ErrorMessage("ES054", "Div Pls are required ");
    public static ES055 = new ErrorMessage("ES055", "Div Pls not found ");
    public static ES056 = new ErrorMessage("ES056", "Markup % can't be greater than $99.99");
    public static ES057 = new ErrorMessage("ES057", "Price Variable can't be greater than $99");
    public static ES058 = new ErrorMessage("ES058", "Please fill all the mandatory fields");
    public static ES059 = new ErrorMessage("ES059", "Div Son not found ");
    public static ES060 = new ErrorMessage("ES060", "Div Son are required ");
    public static ES061 = new ErrorMessage("ES061", "Buyer Auth is already present.");
    public static ES062 = new ErrorMessage("ES062", "Buyer Auth not found.");
    public static ES063 = new ErrorMessage("ES063", "Buyer Id is required.");
    public static ES064 = new ErrorMessage("ES064", "DIV is not valid.");
    public static ES065 = new ErrorMessage("ES065", "Buyer Auth is required ");
    public static ES066 = new ErrorMessage("ES066", "Only Excel files are allowed.");
    public static ES067 = new ErrorMessage("ES067", "Please select File Type before upload.");
    public static ES068 = new ErrorMessage("ES068", "File name must be less than 60 characters.");
    public static ES069 = new ErrorMessage("ES069", "Please select a valid State.");
  


    // Error Codes for Warning
    public static WS001 = new ErrorMessage("WS001", "This was long running request and has timed out. Service is still processing this request and may take additional 5 to 10 minutes to complete it. Please verify later before resubmitting request.");

    constructor(private code: string, private message: string, private type?: string) {
        if (code && !type) {
            if (code.slice(0, 1) == 'E') {
                this.type = "ERROR";
            }
            if (code.slice(0, 1) == 'W') {
                this.type = "WARNING";
            }
        }
    }

    static buildErrorMessage(rawMessage: string) {
        let index = rawMessage.indexOf('-');
        if (index == -1) {
            throw new RangeError('Invalid message');
        }
        let errorCode = rawMessage.substring(0, index);
        let errorMessage = rawMessage.substring(index + 1);
        return new ErrorMessage(errorCode.trim(), errorMessage.trim());
    }

    public getCode(): string {
        return this.code;
    }

    public getMessage(): string {
        return this.message;
    }

    public getType(): string {
        return this.type;
    }
}