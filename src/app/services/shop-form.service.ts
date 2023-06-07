import { Injectable } from '@angular/core';
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ShopFormService {

  constructor() { }


  getCreditCardMonths(startMonth: number): Observable<number[]>{


    let data: number[] = [];
    // build an array for "Month" dorpdown list
    //-start at current month and loop until

    for(let theMonth = startMonth; theMonth<=12;theMonth++){
      data.push(theMonth);
    }
    return of(data);
  }

  getCreditCardYears(): Observable<number[]>{
    let data: number[] = [];
    // build an array for "Year" dorpdown list
    //-start at current year and loop for next 10 years

    const startYear: number = new Date().getFullYear();
    const endyear: number = startYear+10;

    for (let theYear = startYear; theYear<= endyear; theYear++){
      data.push(theYear)
    }
    return of(data)
  }

}
