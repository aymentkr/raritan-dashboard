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
import {SmartlockComponent} from "./smartlock/smartlock.component";
import {DeactivateGuard} from "./deactivate.guard";


const routes: Routes= [
  {path: '', component:DashboardComponent},
  {path: 'home', component:HomeComponent,canDeactivate: [DeactivateGuard]},
  {path: 'outlets', component:OutletComponent,canDeactivate: [DeactivateGuard]},
  {path: 'inlets', component:InletComponent,canDeactivate: [DeactivateGuard]},
  {path: 'ocps', component:OcpsComponent,canDeactivate: [DeactivateGuard]},
  {path: 'peripherals', component:PeripheralComponent,canDeactivate: [DeactivateGuard]},
  {path: 'smartlock', component:SmartlockComponent,canDeactivate: [DeactivateGuard]},
  {path: 'settings', component:SettingsComponent},
  {path: 'help', component:InfoComponent},
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [DeactivateGuard],
})
export class AppRoutingModule { }
