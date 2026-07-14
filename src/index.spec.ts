import { sample } from './index';

describe('@robert.tools/sample', () => {
    it('should return a sample string', () => {
        expect(sample('hello')).toBe('sample: hello');
    });

    it('should return a sample string with empty input', () => {
        expect(sample('')).toBe('sample: ');
    });
});
