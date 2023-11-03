import { Injectable } from '@angular/core';
import { Observable, Subject} from 'rxjs';
import {baseUrl} from "../model/environment";



@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws = new WebSocket(baseUrl);
  private messageSubject: Subject<string> = new Subject<string>();

  constructor() {}

  public connect() {
    this.ws.onmessage = (event) => this.handleMessage(event);
    this.ws.onerror = (error) => this.handleError(error);
    this.ws.onopen = () => {
      console.log('WebSocket connection opened');
    };
    this.ws.onclose = () => {
      console.log('WebSocket connection closed. Reconnecting...');
      this.connect(); // Reconnect on close
    };
  }

  public onMessage(): Observable<string> {
    return this.messageSubject.asObservable();
  }

  private handleMessage(event: MessageEvent) {
    this.readBlobData(event.data).then((message) => {
      this.messageSubject.next(message);
    });
  }

  private readBlobData(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          const result = event.target.result as string;
          resolve(result);
        } else {
          reject('Failed to read data from Blob');
        }
      };
      reader.readAsText(blob);
    });
  }

  private handleError(error: Event) {
    console.error('WebSocket error: ', error);
  }

  public sendMessage(message: string) {
    if (this.isConnected())
      this.ws.send(message);
    else
      console.log('WebSocket connection is not established. Message not sent.');
  }
  public close() {
    this.ws.close();
  }
  public isConnected(): boolean {
    return this.ws.readyState === WebSocket.OPEN;
  }


}
