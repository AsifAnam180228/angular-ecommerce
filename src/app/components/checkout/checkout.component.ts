import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ShopFormService} from "../../services/shop-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {
  logExperimentalWarnings
} from "@angular-devkit/build-angular/src/builders/browser-esbuild/experimental-warnings";
import {ShopValidators} from "../../validators/shop-validators";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";

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
              private ShopFormService: ShopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    this.checkoutFormGroup= this.formBuilder.group({
      customer:this.formBuilder.group({
        firstName: new FormControl('',
            [Validators.required,
              Validators.minLength(2),
              ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('',
            [Validators.required,
              Validators.minLength(2),
            ShopValidators.notOnlyWhitespace]),
        email: new FormControl('',
            [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress:this.formBuilder.group({
        street:new FormControl('',
            [Validators.required, Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
        city:new FormControl('',
            [Validators.required, Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
        state:new FormControl('',
            [Validators.required]),
        country:new FormControl('',
            [Validators.required]),
        zipCode:new FormControl('',
            [Validators.required, Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
      }),

      billingAddress: this.formBuilder.group({
        street:new FormControl('',
            [Validators.required, Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
        city:new FormControl('',
            [Validators.required, Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
        state:new FormControl('',
            [Validators.required]),
        country:new FormControl('',
            [Validators.required]),
        zipCode:new FormControl('',
            [Validators.required, Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
      }),
      creditCard:this.formBuilder.group({
        cardType:new FormControl('',
            [Validators.required]),
        nameOnCard:new FormControl('',
            [Validators.required, Validators.minLength(2),ShopValidators.notOnlyWhitespace]),
        cardNumber:new FormControl('',
            [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode:new FormControl('',
            [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth:new FormControl('',
            [Validators.required]),
        expirationYear:new FormControl('',
            [Validators.required]),
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
      // return;
    }
    //set up order
    let order = new Order();
    order.totalPrice = this.totalPrice
    order.totalQuantity = this.totalQuantity
    //get cart items
    const cartItems = this.cartService.cartItems;
    //create orderItems from cartItems
//-------long way--------
    /*let orderItems: OrderItem[] = [];
    for(let i =0; i<cartItems.length; i++){
      orderItems[i] = new OrderItem((cartItems[i]));
    }*/

    //short way
    let orderItems: OrderItem[] = cartItems.map(
        tempCartItem => new OrderItem(tempCartItem)
    );

    //set up purchase
    let purchase = new Purchase();

    //populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));

    purchase.shippingAddress.state = shippingState.name
    purchase.shippingAddress.country = shippingCountry.name

    //populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));

    purchase.billingAddress.state = billingState.name
    purchase.billingAddress.country = billingCountry.name


    //populate purchase - order and order - items
    purchase.order = order;
    purchase.orderItems = orderItems;

    //call rest api via CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe(
        {
          next: response => {
            alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`)
            console.log("order receieved")
            //reset cart
            this.resetCart();

          },
          error: err => {
            alert(`There was an error: ${err.message}`)
            console.log("error")
          }
        }
    );

  }
  get firstName(){return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){return this.checkoutFormGroup.get('customer.lastName');}
  get email(){return this.checkoutFormGroup.get('customer.email');}
  get shippingAddressStreet(){return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity(){return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressState(){return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressZipCode(){return this.checkoutFormGroup.get('shippingAddress.zipCode');}
  get shippingAddressCountry(){return this.checkoutFormGroup.get('shippingAddress.country');}

  get billingAddressStreet(){return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity(){return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressState(){return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAddressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode');}
  get billingAddressCountry(){return this.checkoutFormGroup.get('billingAddress.country');}

  get creditCardType(){return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOnCard(){return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber(){return this.checkoutFormGroup.get('creditCard.number');}
  get creditCardSecurityCode(){return this.checkoutFormGroup.get('creditCard.securityCode');}



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

  reviewCartDetails() {

    //subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
        totalQuantity => this.totalQuantity = totalQuantity
    );

    //subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
        totalPrice => this.totalPrice = totalPrice
    );
  }

  private resetCart() {

    //reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0)

    //reset form data
    this.checkoutFormGroup.reset();

    //navigate back to the product page
    this.router.navigateByUrl("/products");
  }
}
