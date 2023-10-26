import { OutletsPipe } from './outlets.pipe';
import { WebsocketService } from '../services/websocket.service';
import { DataService } from '../services/data.service';

describe('OutletsPipe', () => {
  let websocketService: WebsocketService;
  let dataService: DataService;

  beforeEach(() => {
    websocketService = jasmine.createSpyObj('WebsocketService', ['methodName1', 'methodName2']);
    dataService = jasmine.createSpyObj('DataService', ['methodName1', 'methodName2']);
  });

  it('create an instance', () => {
    const pipe = new OutletsPipe(websocketService, dataService);
    expect(pipe).toBeTruthy();
  });
});
