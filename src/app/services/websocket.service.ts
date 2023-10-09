import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Observer, Subscription } from 'rxjs';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { Subject } from 'rxjs';

const baseUrl = "wss://10.0.42.2/vpxlua";

@Injectable()
export class WebsocketService implements OnDestroy {
  private subject!: AnonymousSubject<Blob>;
  public messages: Subject<string> = new Subject<string>();
  private subscription: Subscription | undefined;
  private messageList: string[] = [];

  constructor() {
    this.connect(baseUrl).subscribe(
      (response: Blob) => {
        this.handleBlobMessage(response);
      },
      (error) => {
        console.error("WebSocket error:", error);
      }
    );
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  public connect(url: string): AnonymousSubject<Blob> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("Successfully connected: " + url);
    }
    return this.subject;
  }

  public send(message: string) {
    if (this.subject) {
      this.subject.next(new Blob([message]));
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  public unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  public getMessages(): string[] {
    return this.messageList;
  }

  private create(url: string): AnonymousSubject<Blob> {
    let ws = new WebSocket(url);
    let observable = new Observable((obs: Observer<Blob>) => {
      ws.onmessage = async (event) => {
        const message = await blobToText(event.data); // Await the promise
        this.messageList.push(message);
        obs.next(new Blob([event.data]));
      };

      ws.onerror = (error) => {
        obs.error(error);
      };
      ws.onclose = () => {
        obs.complete();
      };
      return () => {
        ws.close();
      };
    });
    let observer = {
      error: (err: any) => {
        console.error('WebSocket error: ', err);
      },
      complete: () => {
        // Handle completion here if needed
      },
      next: (data: any) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      }
    };

    // Store the subscription to be able to unsubscribe later
    this.subscription = observable.subscribe(observer);
    return new AnonymousSubject<Blob>(observer, observable);
  }

  private handleBlobMessage(blob: Blob) {
    blobToText(blob).then((text) => {
      this.messages.next(text);
    }).catch((error) => {
      console.error('Error converting Blob to text:', error);
    });
  }

  clearMessages() {
    this.messageList = [];
  }

  async sendMessage(msgToSend: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.send(msgToSend);
      this.messages.subscribe((message) => {
        resolve();
      });
    });
  }
  async getResult(msgToSend: string): Promise<string> {
    this.send(msgToSend);
    return new Promise((resolve, reject) => {
      this.messages.subscribe((message) => {
        resolve(message);
      });
    });
  }



}

function blobToText(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(blob);
  });
}
