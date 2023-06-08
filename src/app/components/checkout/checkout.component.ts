import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ShopFormService} from "../../services/shop-form.service";
import {Country} from "../../common/country";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  countries: Country[] = [];

  constructor(private formBuilder: FormBuilder,
              private ShopFormService: ShopFormService) { }

  ngOnInit(): void {

    this.checkoutFormGroup= this.formBuilder.group({
      customer:this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress:this.formBuilder.group({
        street:[''],
        city:[''],
        state:[''],
        country:[''],
        zipCode:[''],
      }),
      billingAddress:this.formBuilder.group({
        street:[''],
        city:[''],
        state:[''],
        country:[''],
        zipCode:[''],
      }),
      creditCard:this.formBuilder.group({
        cardType:[''],
        nameOnCard:[''],
        cardNumber:[''],
        securityCode:[''],
        expirationMonth:[''],
        expirationYear:[''],
      })
        });
    //populate credit card months
    const startMonth: number = new Date().getMonth() +1;
    console.log("Start month "+ startMonth)
    this.ShopFormService.getCreditCardMonths(startMonth).subscribe(
        data => {
          console.log("Retrieved credit card months: "+ JSON.stringify(data));
          this.creditCardMonths = data;
        }
    )


    //populate credit card years

    this.ShopFormService.getCreditCardYears().subscribe(
        data => {
          this.creditCardYears = data;
        }
    )
    //populate countires
    this.ShopFormService.getCountries().subscribe(
        data =>{
          console.log("Retrieved countries: " + JSON.stringify(data));
          this.countries = data;
        }
    )

  }
  onSubmit(){
    console.log("Handling the submit button");
    console.log(this.checkoutFormGroup.get('customer')?.value)
    console.log("the email address is " + this.checkoutFormGroup.get('customer')?.value.email)
  }

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
          .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selecteYear: number = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;
    if(currentYear == selecteYear){
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }
    this.ShopFormService.getCreditCardMonths(startMonth).subscribe(
        data =>{
          console.log("Retrieved credit card months: "+ JSON.stringify(data));
          this.creditCardMonths = data
        }
    )
  }
}
