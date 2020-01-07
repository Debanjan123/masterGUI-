import {
    ItemSummary,
    Miscellaneous,
    Price,
    OrderInfo,
    Substitution
} from '../../../_domains/common/index';
export class ItemSearch {

    itemNo: string = '';
    comments: string = '';
    relatedModelNo: string = '';
    buyerNotes: string = '';
    itemSummary: ItemSummary;
    miscellaneous: Miscellaneous;
    orderInformation: OrderInfo;
    price: Price;
    substitution: Substitution;

}