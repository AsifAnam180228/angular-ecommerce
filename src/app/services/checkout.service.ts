import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Purchase} from "../common/purchase";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  //spring boot backend rest endpoint
  private purchaseUrl = 'http://localhost:8080/api/checkout/purchase';
  constructor(private httpClient: HttpClient) {
    
  }
  placeOrder(purchase: Purchase): Observable<any>{
    return this.httpClient.post<Purchase>(this.purchaseUrl, purchase);
  }
}
