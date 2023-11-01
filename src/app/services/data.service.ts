import {Injectable} from '@angular/core';
import {Subscription} from 'rxjs';
import {WebsocketService} from './websocket.service';

const isNumeric = (value: string) => !isNaN(Number(value));
const isBoolean = (value: string) => value === 'true' || value === 'false';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private receivedMsgs : string[] = [];
  private readonly messageSubscription!: Subscription;
  private isSending = false;
  constructor(private ws: WebsocketService) {
    this.messageSubscription = this.ws.onMessage().subscribe((message) => {
      if (message.includes('>')) message = message.slice(0, -3);
      if (message != '' && !message.includes('help()')) {
        this.receivedMsgs.push(message)
      }
      this.isSending = false;
    });
  }

  close() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.ws.close();
  }

  send(msgToSend: string) {
    if (!this.isSending) {
      this.ws.sendMessage(msgToSend);
      this.isSending = true;
    } else {
      setTimeout(() => {
        this.send(msgToSend);
      }, 0);
    }
  }
  async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getList() {
    return this.receivedMsgs
  }
}
