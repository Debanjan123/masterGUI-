import {
   DivSonId
} from '../../../_domains/common/index';


export class EditDivSon {
    
    id: DivSonId;
    sourceName : string = '';
    authBuyerId : string = '';
    priceFormula : string = '';
    priceVariable :string = '';
    formulaMarkupPct : string = '';
    discPct : string = '';
    createTime: number = 0;
    updateTime: number = 0;
    createId: string = '';
    updateId: string = '';


}