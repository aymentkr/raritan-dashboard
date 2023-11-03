import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private myMap = new Map<string, string>();
  private messageSubscription!: Subscription;
  private key = '';
  private isSending = false;

  constructor(private ws: WebsocketService) {}
  open(){
    this.ws.connect();
    this.messageSubscription = this.ws.onMessage().subscribe((message) => {
      if (message.includes('>')) message = message.slice(0, -3);
      if (message != '') {
        this.myMap.set(this.key, message);
        this.isSending = false;
      }
    });
  }
  close() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.ws.close();
  }
  send(key: string, msgToSend: string) {
    if (!this.isSending) {
      this.key = key;
      this.ws.sendMessage(msgToSend);
      this.isSending = true;
    } else {
      setTimeout(() => {
        this.send(key, msgToSend);
      }, 0);
    }
  }
  sendToGo(msgToSend: string) {
    this.key = '';
    this.ws.sendMessage(msgToSend);
  }
  getResult(key: string, msg: string): Promise<string> {
    return new Promise((resolve) => {
      this.send(key, msg);
      const checkValue = () => {
        const value = <string>this.myMap.get(key);
        if (value) {
          resolve(value);
        } else {
          setTimeout(() => {
            checkValue();
          },0);
        }
      };
      checkValue();
    });
  }

  editMap(key: string, value: number | boolean) {
    this.myMap.set(key, String(value));
  }

  isConnected() {
    return this.ws.isConnected();
  }
}
