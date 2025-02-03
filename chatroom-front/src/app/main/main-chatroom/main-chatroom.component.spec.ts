import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainChatroomComponent } from './main-chatroom.component';

describe('MainChatroomComponent', () => {
  let component: MainChatroomComponent;
  let fixture: ComponentFixture<MainChatroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainChatroomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainChatroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
