import {FormControl, ValidationErrors} from "@angular/forms";

export class ShopValidators {
    // whitespace validation
    static notOnlyWhitespace(control: FormControl) : ValidationErrors | null{
        //check if string only contains whitespace
        if((control.value != null) && (control.value.trim().length === 0) ){
            return {'notOnlyWhitespace': true}
        }
        else {
            //invalid, return error object
            return null;
        }


    }
}
