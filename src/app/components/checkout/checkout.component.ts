import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ShopFormService} from "../../services/shop-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {
  logExperimentalWarnings
} from "@angular-devkit/build-angular/src/builders/browser-esbuild/experimental-warnings";

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

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder,
              private ShopFormService: ShopFormService) { }

  ngOnInit(): void {

    this.checkoutFormGroup= this.formBuilder.group({
      customer:this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
        email: new FormControl('',
            [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2-4}$')])
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
    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
    }
    console.log(this.checkoutFormGroup.get('customer')?.value)
    console.log("the email address is " + this.checkoutFormGroup.get('customer')?.value.email);
    console.log("the shipping address country is " +this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log("the shipping address state is " +this.checkoutFormGroup.get('shippingAddress')?.value.state.name);


  }
  get firstName(){return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){return this.checkoutFormGroup.get('customer.lastName');}
  get email(){return this.checkoutFormGroup.get('customer.email');}


  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress']
          .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      //BUG FIX FOR STATES
      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      //bug fix for states
      this.billingAddressStates = [];
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

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;
    console.log(`${formGroupName} country code: ${countryCode}`)
    console.log(`${formGroupName} country name: ${countryName}`)

    this.ShopFormService.getStates(countryCode).subscribe(
        data =>{
          if(formGroupName === 'shippingAddress'){
            this.shippingAddressStates = data;
            console.log(data)
          }
          else {
            this.billingAddressStates = data;
          }
          //select first state as default
          formGroup?.get('state')!.setValue(data[0])
        }
    )
  }

  protected readonly logExperimentalWarnings = logExperimentalWarnings;
}
