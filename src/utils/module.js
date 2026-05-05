/**
 * Calculates the age of a person based on their birth date.
 * @param {Object} p - The person object with a birth date.
 * @returns {number} The calculated age.
 */

export function calculateAge(p) {
    if (!p) {
        throw new Error("missing param p");
    }

    if (typeof p !== "object" || !(p.birth instanceof Date)) {
        throw new Error("invalid param p");
    }

    const birthTime = p.birth.getTime();

    if (Number.isNaN(birthTime)) {
        return NaN;
    }

    const today = new Date();
    let age = today.getFullYear() - p.birth.getFullYear();
    const monthDiff = today.getMonth() - p.birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < p.birth.getDate())) {
        age -= 1;
    }

    return age;
}

export function isCPValid(cp) {
    if (!cp) {
        throw new Error("missing param cp");
    }

    const cpRegex = /^\d{5}$/;

    return cpRegex.test(String(cp).trim());
}

export function isUserMajeur(p) {
    if (!p) {
        throw new Error("missing param p");
    }

    const age = calculateAge(p);

    return age >= 18;
}

export function isEmailValid(email) {
    if (!email) {
        throw new Error("missing param email");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(String(email).trim());
}

export function isStringValide(str) {
    if (!str) {
        throw new Error("missing param str");
    }

    if (typeof str !== "string") {
        return false;
    }

    const normalizedValue = str.trim();
    const validStringRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/u;

    return validStringRegex.test(normalizedValue);
}

