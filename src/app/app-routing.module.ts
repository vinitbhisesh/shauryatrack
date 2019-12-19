import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyComponent } from './company/company.component';
import { DevicesComponent } from './devices/devices.component';
import { DrivesComponent } from './drives/drives.component';
import { NotificationComponent } from './notification/notification.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { HomePageComponent } from './home-page/home-page.component';
import { TrackingComponent } from './tracking/tracking.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'company', component: CompanyComponent },
  { path: 'devices', component: DevicesComponent },
  { path: 'vehicles', component: VehiclesComponent },
  { path: 'drives', component: DrivesComponent },
  { path: 'notification', component: NotificationComponent },
  { path: 'tracking', component: TrackingComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
