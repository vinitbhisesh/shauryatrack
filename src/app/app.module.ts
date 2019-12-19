import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { DevicesComponent } from './devices/devices.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DrivesComponent } from './drives/drives.component';
import { HeaderBeforeLoginComponent } from './header-before-login/header-before-login.component';
import { HeaderAfterLoginComponent } from './header-after-login/header-after-login.component';
import { HomePageComponent } from './home-page/home-page.component';
import { NotificationComponent } from './notification/notification.component';
import { FooterComponent } from './footer/footer.component';
import { CompanyComponent } from './company/company.component';

import { ModalModule } from 'ngx-bootstrap/modal';
import { TrackingComponent } from './tracking/tracking.component';

@NgModule({
  declarations: [
    AppComponent,
    VehiclesComponent,
    DevicesComponent,
    LoginComponent,
    RegisterComponent,
    DrivesComponent,
    HeaderBeforeLoginComponent,
    HeaderAfterLoginComponent,
    HomePageComponent,
    NotificationComponent,
    FooterComponent,
    CompanyComponent,
    TrackingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ModalModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
