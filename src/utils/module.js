/**
 * Calculates the age of a person based on their birth date.
 * @param {Object} p - Object contenant une propriété "birth" (Date).
 * @returns {number} L'âge calculé ou NaN si la date est invalide.
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

/**
 * Vérifie si un code postal est valide (format français).
 * @param {string|number} cp - Code postal à vérifier.
 * @returns {boolean} true si valide, false sinon.
 */
export function isCPValid(cp) {
    if (!cp) {
        throw new Error("missing param cp");
    }

    const cpRegex = /^\d{5}$/;

    return cpRegex.test(String(cp).trim());
}

/**
 * Vérifie si un utilisateur est majeur (>= 18 ans).
 * @param {Object} p - Object contenant une propriété "birth" (Date).
 * @returns {boolean} true si majeur, false sinon.
 */
export function isUserMajeur(p) {
    if (!p) {
        throw new Error("missing param p");
    }

    const age = calculateAge(p);

    return age >= 18;
}

/**
 * Vérifie si un email est valide.
 * @param {string} email - Email à vérifier.
 * @returns {boolean} true si valide, false sinon.
 */
export function isEmailValid(email) {
    if (!email) {
        throw new Error("missing param email");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(String(email).trim());
}

/**
 * Vérifie si une chaîne est valide (nom, prénom, ville).
 * Autorise lettres, accents, espaces, tirets et apostrophes.
 * @param {string} str - Chaîne à vérifier.
 * @returns {boolean} true si valide, false sinon.
 */
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