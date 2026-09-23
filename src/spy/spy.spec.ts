// external dependencies
import { LOG } from '@robert.tools/log';
import { command } from '@robert.tools/cmd';

// internal dependencies
import { spyOnCommand, spyOnURLs } from './spy';

describe('✅ spyOnCommand', () => {
    const FN = spyOnCommand;
    it('should create a spy on cmd.command and return the specified result', () => {
        const result = 'mocked result';
        const spy = FN(result);
        const commandResult = command('test');
        expect(commandResult).toBe(result);
        expect(spy).toHaveBeenCalledWith('test');
        spy.mockRestore();
    });
    it('should restore the original implementation after mockRestore is called', () => {
        const result = 'mocked result';
        const spy = FN(result);
        spy.mockRestore();
        const commandResult = command('test');
        expect(commandResult).not.toBe(result);
    });
});
describe('✅ spyOnURLs', () => {
    it('should create a spy on cmd.command and return the specified result for each URL ID', () => {
        const results = {
            forwards: {
                url1: 'mocked result 1',
                url2: 'mocked result 2',
            },
            orders: {},
        };
        const spy = spyOnURLs(results);
        expect(command('url1')).toBe('mocked result 1');
        expect(spy).toHaveBeenCalledWith('url1');
        spy.mockRestore();
    });
    it('should create a spy on cmd.command and return a fallback for unknown URL IDs', () => {
        const results = {
            forwards: {
                url1: 'mocked result 1',
                url2: 'mocked result 2',
                fallback: '<fallback-result>',
            },
            orders: {},
        };
        const spyCMD = spyOnURLs(results);
        const spyLOG = jest.spyOn(LOG, 'FAIL');
        expect(command('url3')).toBe('<fallback-result>');
        expect(spyCMD).toHaveBeenCalledWith('url3');
        expect(spyLOG).toHaveBeenCalledWith('No mock result for URL ID: url3');
        spyCMD.mockRestore();
        spyLOG.mockRestore();
    });
    it('should create a spy on cmd.command and return <invalid> for unknown URL IDs', () => {
        const results = {
            forwards: {
                url1: 'mocked result 1',
                url2: 'mocked result 2',
            },
            orders: {},
        };
        const spyCMD = spyOnURLs(results);
        const spyLOG = jest.spyOn(LOG, 'FAIL');
        expect(command('url3')).toBe('<invalid>');
        expect(spyCMD).toHaveBeenCalledWith('url3');
        expect(spyLOG).toHaveBeenCalledWith('No mock result for URL ID: url3');
        spyCMD.mockRestore();
        spyLOG.mockRestore();
    });
});
