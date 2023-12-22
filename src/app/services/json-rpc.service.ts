import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class JsonRpcService {
  private apiUrl = '/api/model/pdu/0';
    constructor(private http: HttpClient) {}

    getPduMetaData(): Observable<any> {
      const payload = {
        jsonrpc: '2.0',
        method: 'getMetaData',
        params: '2.0',
        id: 1,
      };

      // Define the headers
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      return this.http.post(this.apiUrl, payload, { headers });
    }
}
