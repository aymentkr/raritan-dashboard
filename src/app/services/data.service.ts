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
  open() {
    this.ws.connect();

    this.messageSubscription = this.ws.onMessage().subscribe(
      (message) => {
        if (message.includes('>')) message = message.slice(0, -3);
        if (message !== '') {
          this.myMap.set(this.key, message);
          this.isSending = false;
        }
      },
      (error) => {
        console.error('WebSocket error:', error);
        // You might want to handle the error here (e.g., show a notification)
      }
    );
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
  async getResult(key: string, msg: string): Promise<string> {
    try {
      return await new Promise((resolve) => {
        this.send(key, msg);

        const checkValue = () => {
          const value = this.myMap.get(key);
          if (value !== undefined) {
            resolve(value);
          } else {
            setTimeout(() => {
              checkValue();
            }, 0);
          }
        };

        checkValue();
      });
    } catch (error) {
      console.error('Error in getResult:', error);
      return '';
    }
  }


  editMap(key: string, value: number | boolean) {
    this.myMap.set(key, String(value));
  }

  removeMap(key : string) {
    this.myMap.delete(key);
  }

  isConnected() {
    return this.ws.isConnected();
  }
}
