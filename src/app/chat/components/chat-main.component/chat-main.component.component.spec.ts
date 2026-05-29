import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMainComponentComponent } from './chat-main.component.component';

describe('ChatMainComponentComponent', () => {
  let component: ChatMainComponentComponent;
  let fixture: ComponentFixture<ChatMainComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatMainComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMainComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
