import { Injectable } from '@angular/core';

declare const raritan: any;

interface Session {
  token: string;
  // Add other properties based on the actual structure of your session object
}

@Injectable({
  providedIn: 'root'
})
export class JsonRpcService {
  private sessionManager: any;

  constructor() {
    raritan.rpc.setUsername('admin');
    raritan.rpc.setPassword('raritan');
    this.sessionManager = new raritan.rpc.session.SessionManager('/session');
  }

  createSession(): Promise<void> {
    return this.sessionManager
      .newSession()
      .then(([result, session]: [number, Session]) => { // Explicitly define types
        if (result == raritan.rpc.session.SessionManager.ERR_ACTIVE_SESSION_EXCLUSIVE_FOR_USER) {
          alert('Authentication failed - exclusive session is active');
        } else if (result == 0) {
          alert('Successfully created session - token: ' + session.token);
          raritan.rpc.setSessiontoken(session.token);
        } else {
          alert('return code: ' + result);
        }
      })
      .catch((error: any) => { // Explicitly define type
        if (error.status == 403 || error.status == 401) {
          alert('Authentication failed!');
        } else if (error.status != 200) {
          alert('Request failure - status code: ' + error.status + ' - message: ' + error.message);
        } else {
          alert('Request error - error code: ' + error.code + ' - message: ' + error.message);
        }
      })
      .then(() => {
        alert('RPC Request done');
      });
  }

  bulkRequest(): Promise<void> {
    const bulkRequest = new raritan.rpc.BulkRequest();

    return bulkRequest
      .addRequest(this.createSession.bind(this)) // You can add more requests as needed
      .send()
      .catch((error: any) => { // Explicitly define type
        if (error.status == 403 || error.status == 401) {
          alert('Bulk request: Authentication failed!');
        } else if (error.status != 200) {
          alert('Bulk request failure - status code: ' + error.status + ' - message: ' + error.message);
        } else {
          alert('Bulk request: JSON RPC returned error - code: ' + error.code + ' - message: ' + error.message);
        }
      })
      .then(() => {
        alert('Bulk request done');
      });
  }
}
