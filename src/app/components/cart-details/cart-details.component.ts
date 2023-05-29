import { Component, OnInit } from '@angular/core';
import {CartItem} from "../../common/cart-item";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.css']
})
export class CartDetailsComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice: number= 0;
  totalQuantity:number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.listCartDetails();
  }

  private listCartDetails() {
    //get a handle to the cart items
    this.cartItems = this.cartService.cartItems;

    //subscribe to the cart totalPrice
    this.cartService.totalPrice.subscribe(
        data=>this.totalPrice = data
    );

    //subscribe to the cart totalquantity
    this.cartService.totalQuantity.subscribe(
        data => this.totalQuantity =data
    );

     //compute cart-totalPrice and quantity
    this.cartService.computeCartTotals();
  }
}
