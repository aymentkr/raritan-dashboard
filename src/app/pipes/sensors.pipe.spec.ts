import { SensorsPipe } from './sensors.pipe';
import { WebsocketService } from '../services/websocket.service';

describe('SensorsPipe', () => {
  let websocketService: WebsocketService;

  beforeEach(() => {
    websocketService = jasmine.createSpyObj('WebsocketService', ['methodName1', 'methodName2']);
  });

  it('create an instance', () => {
    const pipe = new SensorsPipe(websocketService);
    expect(pipe).toBeTruthy();
  });
});
