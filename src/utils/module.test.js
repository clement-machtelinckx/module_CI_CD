import {
    calculateAge,
    isCPValid,
    isEmailValid,
    isStringValide,
    isUserMajeur,
} from './module.js';

describe('module utils', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-05-05T12:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('calculateAge', () => {
        it('returns the correct age when the birthday already passed', () => {
            expect(calculateAge({ birth: new Date('1991-03-22T12:00:00Z') })).toBe(35);
        });

        it('subtracts one year when the birthday has not passed yet', () => {
            expect(calculateAge({ birth: new Date('2008-12-01T12:00:00Z') })).toBe(17);
        });

        it('throws when the parameter is missing', () => {
            expect(() => calculateAge()).toThrow('missing param p');
        });

        it('throws when the parameter shape is invalid', () => {
            expect(() => calculateAge('not-an-object')).toThrow('invalid param p');
            expect(() => calculateAge({})).toThrow('invalid param p');
            expect(() => calculateAge({ birth: '1991-03-22' })).toThrow('invalid param p');
        });

        it('returns NaN when the birth date is invalid', () => {
            expect(calculateAge({ birth: new Date('invalid') })).toBeNaN();
        });
    });

    describe('isUserMajeur', () => {
        it('returns true for an adult user', () => {
            expect(isUserMajeur({ birth: new Date('2000-01-01T12:00:00Z') })).toBe(true);
        });

        it('returns false for a minor user', () => {
            expect(isUserMajeur({ birth: new Date('2008-12-01T12:00:00Z') })).toBe(false);
        });

        it('throws when the parameter is missing', () => {
            expect(() => isUserMajeur()).toThrow('missing param p');
        });
    });

    describe('isCPValid', () => {
        it('accepts a French postal code with exactly five digits', () => {
            expect(isCPValid('75001')).toBe(true);
        });

        it('rejects postal codes with the wrong format', () => {
            expect(isCPValid('7500')).toBe(false);
            expect(isCPValid('7500A')).toBe(false);
            expect(isCPValid('75 001')).toBe(false);
        });

        it('throws when the parameter is missing', () => {
            expect(() => isCPValid()).toThrow('missing param cp');
        });
    });

    describe('isEmailValid', () => {
        it('accepts a valid email address', () => {
            expect(isEmailValid('john.doe@example.com')).toBe(true);
        });

        it('rejects invalid email addresses', () => {
            expect(isEmailValid('john.doe')).toBe(false);
            expect(isEmailValid('john.doe@')).toBe(false);
            expect(isEmailValid('john.doe@example')).toBe(false);
        });

        it('throws when the parameter is missing', () => {
            expect(() => isEmailValid()).toThrow('missing param email');
        });
    });

    describe('isStringValide', () => {
        it('accepts names and cities with accents, spaces, apostrophes and hyphens', () => {
            expect(isStringValide('Élodie')).toBe(true);
            expect(isStringValide("L'Haÿ-les-Roses")).toBe(true);
            expect(isStringValide('Saint Étienne')).toBe(true);
        });

        it('rejects strings with digits or invalid special characters', () => {
            expect(isStringValide('Jean2')).toBe(false);
            expect(isStringValide('Paris!')).toBe(false);
            expect(isStringValide('   ')).toBe(false);
            expect(isStringValide(42)).toBe(false);
        });

        it('throws when the parameter is missing', () => {
            expect(() => isStringValide()).toThrow('missing param str');
        });
    });
});
