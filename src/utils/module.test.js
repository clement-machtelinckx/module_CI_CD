
const { calculateAge } = require('./module.js');

/*
* @function calculateAge
* @description Calculates the age of a person based on their birth date.
* @param {Object} p - The person object with a birth date.
* @returns {number} The calculated age.
*/

describe('calculateAge Unit Test Suites', () => {

    it('should return the correct age', () => {
        const loise =  {
            birth: new Date('1991-03-22')
        };
        expect(calculateAge(loise)).toEqual(35);
    })
        // test TDD
     it('should throw a "missing param p" error', () => {
        expect(() => calculateAge()).toThrow("missing param p")
    })
        // test calculateAge with no argument 
    it('should throw an error if not argument is passed', () => {
        expect(() => calculateAge()).toThrow();
     })
        // test argument not an object 
    it('should throw an error if argument is not an object', () => {
        expect(() => calculateAge("not an object")).toThrow();
     })

      // no birth property in the object
    it ('should throw error object do not contain birth property', () => {
        expect(() => calculateAge({})).toThrow();
     })
        // birth property is not a date
    it('should trhow an error birth not a date', () => {
        expect(() => calculateAge({ birth: 23 })).toThrow();
     })
     
     // test date wrong format
    it('should throw an error if birth date is not valid', () => {
    const result = calculateAge({ birth: new Date('1991-03-33') });
    expect(result).toBeNaN();
    });

    // test ok si passr next year
    it ("should work next year", () => {
        const loise = {
            birth: new Date('1991-03-22')
        };
        birthYear = loise.birth.getUTCFullYear();
        console.log(birthYear);
        const currentYear = new Date().getUTCFullYear();
        console.log(currentYear);
        const expectedAge = currentYear - birthYear;
        expect(calculateAge(loise)).toEqual(expectedAge);

    });


});






// _____________________________________
// toBe
test('deux plus deux font quatre', () => {
 expect(2 + 2).toBe(4);
});

// toEqual
test('object assignment', () => {
 const data = {one: 1};
 data['two'] = 2;
 expect(data).toEqual({one: 1, two: 2});
});

// not
test('l\'addition de nombres positifs n\'est pas égale à zéro', () => {
 for (let a = 1; a < 10; a++) {
 for (let b = 1; b < 10; b++) {
 expect(a + b).not.toBe(0);
 }
 }
});

// Valeurs de vérités - null
test('null', () => {
 const n = null;
 expect(n).toBeNull();
 expect(n).toBeDefined();
 expect(n).not.toBeUndefined();
 expect(n).not.toBeTruthy();
 expect(n).toBeFalsy();
});

// Valeurs de vérités - zero
test('zero', () => {
 const z = 0;
 expect(z).not.toBeNull();
 expect(z).toBeDefined();
 expect(z).not.toBeUndefined();
 expect(z).not.toBeTruthy();
 expect(z).toBeFalsy();
});


// Nombres
test('deux plus deux', () => {
 const value = 2 + 2;
 expect(value).toBeGreaterThan(3);
 expect(value).toBeGreaterThanOrEqual(3.5);
 expect(value).toBeLessThan(5);
 expect(value).toBeLessThanOrEqual(4.5);
 // toBe et toEqual sont équivalents pour les nombres
 expect(value).toBe(4);
 expect(value).toEqual(4);
});


// toBeCloseTo
test('ajout de nombres à virgule flottantes', () => {
 const value = 0.1 + 0.2;
 //expect(value).toBe(0.3); Cela ne fonctionnera pas en raison d'une erreur d'arrondi
 expect(value).toBeCloseTo(0.3); // Cela fonctionne.
});

// Strings
test("il n'y a pas de I dans team", () => {
 expect('team').not.toMatch(/I/);
});
test('mais il y a "stop" dans Christoph', () => {
 expect('Christoph').toMatch(/stop/);
});

// Tableau et itérable
const shoppingList = ['diapers','kleenex','trash bags','paper towels','milk'];
test('la liste de course possède du lait', () => {
 expect(shoppingList).toContain('milk');
 expect(new Set(shoppingList)).toContain('milk');
});

// Exceptions
function compileAndroidCode() { throw new Error('vous utilisez le mauvais JDK!');}
test("la compilation d'android se déroule comme prévue", () => {
 expect(() => compileAndroidCode()).toThrow();
 expect(() => compileAndroidCode()).toThrow(Error);
});

// Exceptions
test("la compilation d'android se déroule comme prévue", () => {
 // Vous pouvez aussi utiliser une chaîne de caractère qui doit être contenue dans le message d'erreur, ouun RegExp
 expect(() => compileAndroidCode()).toThrow('vous utilisez le mauvais JDK!');
 expect(() => compileAndroidCode()).toThrow(/JDK/);
 // Ou vous pouvez faire correspondre un message d'erreur spécifique en utilisant un RegExp commeci-dessous
 expect(() => compileAndroidCode()).toThrow(/^vous utilisez le mauvais JDK!$/);
 expect(() => compileAndroidCode()).toThrow(/^vous utilisez le mauvais JDK!$/); // Test passé
});
