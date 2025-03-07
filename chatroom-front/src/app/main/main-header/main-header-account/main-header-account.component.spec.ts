import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainHeaderAccountComponent } from './main-header-account.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MainHeaderAccountComponent', () => {
  let component: MainHeaderAccountComponent;
  let fixture: ComponentFixture<MainHeaderAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MainHeaderAccountComponent
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainHeaderAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
