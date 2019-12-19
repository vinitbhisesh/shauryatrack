import { Component, TemplateRef } from '@angular/core';
import AOS from 'aos';
import { Router } from '@angular/router';
import { setTheme } from 'ngx-bootstrap/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'vtsWeb';

  constructor(public router: Router) {
    setTheme('bs4');
  }

// tslint:disable-next-line: use-lifecycle-interface
ngOnInit() {
  AOS.init({
    once: true, // whether animation should happen only once - while scrolling down
  });
}

}
