import { NgModule } from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {OutletComponent} from "./outlet/outlet.component";
import {InletComponent} from "./inlet/inlet.component";
import {OcpsComponent} from "./ocps/ocps.component";
import {PeripheralComponent} from "./peripheral/peripheral.component";
import {HomeComponent} from "./home/home.component";
import {InfoComponent} from "./info/info.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {SettingsComponent} from "./settings/settings.component";


const routes: Routes= [
  {path: '', component:DashboardComponent},
  {path: 'home', component:HomeComponent},
  {path: 'outlets', component:OutletComponent},
  {path: 'inlets', component:InletComponent},
  {path: 'ocps', component:OcpsComponent},
  {path: 'peripherals', component:PeripheralComponent},
  {path: 'settings', component:SettingsComponent},
  {path: 'help', component:InfoComponent},
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
