import { InletsPipe } from './inlets.pipe';
import { WebsocketService } from '../services/websocket.service';
import { DataService } from '../services/data.service';

describe('InletsPipe', () => {
    let websocketService: WebsocketService;
    let dataService: DataService;

    beforeEach(() => {
        websocketService = jasmine.createSpyObj('WebsocketService', ['methodName1', 'methodName2']);
        dataService = jasmine.createSpyObj('DataService', ['methodName1', 'methodName2']);
    });

    it('create an instance', () => {
        const pipe = new InletsPipe(websocketService, dataService);
        expect(pipe).toBeTruthy();
    });
});
