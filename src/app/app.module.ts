import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {WebsocketService} from "./services/websocket.service";
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatMenuModule} from "@angular/material/menu";
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatTabsModule} from "@angular/material/tabs";
import { OutletComponent } from './outlet/outlet.component';
import { InletComponent } from './inlet/inlet.component';
import {DataService} from "./services/data.service";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { OcpsComponent } from './ocps/ocps.component';
import { PeripheralComponent } from './peripheral/peripheral.component';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatExpansionModule} from "@angular/material/expansion";
import { AddPeripheralDeviceComponent } from './peripheral/add-peripheral-device/add-peripheral-device.component';
import {MatDialogModule} from "@angular/material/dialog";
import {SensorService} from "./services/sensor.service";
import {DialogModule} from "@angular/cdk/dialog";
import {MatListModule} from "@angular/material/list";
import {MatSelectModule} from "@angular/material/select";
import { EditPeripheralDeviceComponent } from './peripheral/edit-peripheral-device/edit-peripheral-device.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {RouterLink, RouterOutlet} from "@angular/router";
import {AppRoutingModule} from "./app-routing.module";
import { HomeComponent } from './home/home.component';
import { InfoComponent } from './info/info.component';

@NgModule({
  declarations: [
    AppComponent,
    OutletComponent,
    InletComponent,
    OcpsComponent,
    PeripheralComponent,
    AddPeripheralDeviceComponent,
    EditPeripheralDeviceComponent,
    HomeComponent,
    InfoComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    MatTableModule,
    MatDialogModule,
    MatSortModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatMenuModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatSortModule,
    DialogModule,
    MatListModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSidenavModule,
    RouterOutlet,
    RouterLink
  ],
  providers: [WebsocketService,DataService,SensorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
