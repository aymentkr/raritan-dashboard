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
import {DialogModule} from "@angular/cdk/dialog";
import {MatListModule} from "@angular/material/list";
import {MatSelectModule} from "@angular/material/select";
import { EditPeripheralDeviceComponent } from './peripheral/edit-peripheral-device/edit-peripheral-device.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {RouterLink, RouterOutlet} from "@angular/router";
import {AppRoutingModule} from "./app-routing.module";
import { InfoComponent } from './info/info.component'
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import { SettingsComponent } from './settings/settings.component';
import {MatCardModule} from "@angular/material/card";
import { SmartlockComponent } from './smartlock/smartlock.component';
import {MatBadgeModule} from "@angular/material/badge";
import { SensorsPipe } from './pipes/sensors.pipe';
import { EnvhubComponent } from './envhub/envhub.component';
import {InletPoleTableComponent} from "./inlet/inlet-pole-table/inlet-pole-table.component";
import {InletTableComponent} from "./inlet/inlet-table/inlet-table.component";
import { TransferSwitchComponent } from './inlet/transfer-switch/transfer-switch.component';
import {PeripheralClass} from "./model/PeripheralClass";
import { DeleteDeviceDialogComponent } from './peripheral/delete-device-dialog/delete-device-dialog.component';
import { DevicesPipe } from './pipes/devices.pipe';
import { SensorportComponent } from './sensorport/sensorport.component';
import { BottomSheetInfoComponent } from './inlet/transfer-switch/bottom-sheet-info/bottom-sheet-info.component';
import { BottomSheetDetailsComponent } from './inlet/transfer-switch/bottom-sheet-details/bottom-sheet-details.component';
import {MatBottomSheet} from "@angular/material/bottom-sheet";

@NgModule({
  declarations: [
    AppComponent,
    OutletComponent,
    InletComponent,
    InletPoleTableComponent,
    InletTableComponent,
    OcpsComponent,
    PeripheralComponent,
    AddPeripheralDeviceComponent,
    EditPeripheralDeviceComponent,
    InfoComponent,
    SettingsComponent,
    SmartlockComponent,
    SensorsPipe,
    EnvhubComponent,
    TransferSwitchComponent,
    DeleteDeviceDialogComponent,
    DevicesPipe,
    SensorportComponent,
    BottomSheetInfoComponent,
    BottomSheetDetailsComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatTableModule,
    MatDialogModule,
    MatSortModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
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
    RouterLink,
    MatTooltipModule,
    MatButtonToggleModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatCardModule,
    MatBadgeModule,
  ],
  providers: [WebsocketService,DataService,SensorsPipe,PeripheralClass,MatBottomSheet],
  bootstrap: [AppComponent]
})
export class AppModule { }
