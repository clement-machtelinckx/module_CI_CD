import React, { FormEvent, useState } from 'react';
import {
    calculateAge,
    isCPValid,
    isUserMajeur,
    isEmailValid,
    isStringValide,
} from '../utils/module.js';

type FormFields = {
    name: string;
    firstName: string;
    birthDate: string;
    email: string;
    city: string;
    postalCode: string;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

const errorStyle = { color: 'red' };
const successStyle = { color: 'green' };

export default function Form() {
    const [errors, setErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);
        const rawData = Object.fromEntries(formData.entries());
        const data: FormFields = {
            name: String(rawData.name ?? '').trim(),
            firstName: String(rawData.firstName ?? '').trim(),
            birthDate: String(rawData.birthDate ?? '').trim(),
            email: String(rawData.email ?? '').trim(),
            city: String(rawData.city ?? '').trim(),
            postalCode: String(rawData.postalCode ?? '').trim(),
        };

        const nextErrors: FormErrors = {};

        if (!isStringValide(data.name)) {
            nextErrors.name = 'Le nom doit contenir uniquement des lettres.';
        }

        if (!isStringValide(data.firstName)) {
            nextErrors.firstName = 'Le prénom doit contenir uniquement des lettres.';
        }

        if (!isStringValide(data.city)) {
            nextErrors.city = 'La ville doit contenir uniquement des lettres.';
        }

        if (!isEmailValid(data.email)) {
            nextErrors.email = "L'email n'est pas valide.";
        }

        if (!isCPValid(data.postalCode)) {
            nextErrors.postalCode = "Le code postal n'est pas valide.";
        }

        if (!data.birthDate) {
            nextErrors.birthDate = 'La date de naissance est obligatoire.';
        } else {
            const user = { birth: new Date(data.birthDate) };
            const age = calculateAge(user);

            if (Number.isNaN(age)) {
                nextErrors.birthDate = 'La date de naissance est invalide.';
            } else if (!isUserMajeur(user)) {
                nextErrors.birthDate = 'Vous devez être majeur pour soumettre ce formulaire.';
            }
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            setSuccessMessage('');
            return;
        }

        setErrors({});
        setSuccessMessage('Formulaire soumis avec succès !');
        form.reset();
    };

    return (
        <>
            <h1>Formulaire</h1>
            <form className="form" onSubmit={handleSubmit} noValidate>
                <label>
                    Nom :
                    <input type="text" name="name" />
                </label>
                {errors.name && <p style={errorStyle}>{errors.name}</p>}

                <label>
                    Prénom :
                    <input type="text" name="firstName" />
                </label>
                {errors.firstName && <p style={errorStyle}>{errors.firstName}</p>}

                <label>
                    Date de naissance :
                    <input type="date" name="birthDate" />
                </label>
                {errors.birthDate && <p style={errorStyle}>{errors.birthDate}</p>}

                <label>
                    Mail :
                    <input type="email" name="email" />
                </label>
                {errors.email && <p style={errorStyle}>{errors.email}</p>}

                <label>
                    Ville :
                    <input type="text" name="city" />
                </label>
                {errors.city && <p style={errorStyle}>{errors.city}</p>}

                <label>
                    Code postal :
                    <input type="text" name="postalCode" />
                </label>
                {errors.postalCode && <p style={errorStyle}>{errors.postalCode}</p>}

                <input type="submit" value="Envoyer" />
                {successMessage && <p style={successStyle}>{successMessage}</p>}
            </form>
        </>
    );
}
