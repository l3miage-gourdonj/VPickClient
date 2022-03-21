import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SubscribeComponent } from './subscribe/subscribe.component';
import {RentComponent} from "./rent/rent.component";
import {BringBackComponent} from "./bring-back/bring-back.component";

const routes: Routes = [
  {path:"", component: HomeComponent},
  {path:"subscribe", component: SubscribeComponent},
  {path:"rent", component: RentComponent},
  {path:"bringBack",component:BringBackComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
