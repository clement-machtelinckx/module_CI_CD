import React, { useState } from 'react';
import {
    isCPValid,
    isUserMajeur,
    isEmailValid,
    isStringValide,
} from '../utils/module.js';

const initialFormValues = {
    name: '',
    firstName: '',
    birthDate: '',
    email: '',
    city: '',
    postalCode: '',
};

const errorStyle = { color: 'red' };
const successStyle = { color: 'green' };
const storageKey = 'registeredUsers';

function getRegisteredUsersFromStorage() {
    const savedUsers = localStorage.getItem(storageKey);

    if (!savedUsers) {
        return [];
    }

    try {
        const parsedUsers = JSON.parse(savedUsers);

        if (Array.isArray(parsedUsers)) {
            return parsedUsers;
        }

        return [];
    } catch (error) {
        return [];
    }
}

export default function Form() {
    const [formValues, setFormValues] = useState(initialFormValues);
    const [registeredUsers, setRegisteredUsers] = useState(getRegisteredUsersFromStorage);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const isSubmitDisabled = Object.values(formValues).some((value) => value.trim() === '');

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const data = {
            name: formValues.name.trim(),
            firstName: formValues.firstName.trim(),
            birthDate: formValues.birthDate.trim(),
            email: formValues.email.trim(),
            city: formValues.city.trim(),
            postalCode: formValues.postalCode.trim(),
        };

        const nextErrors = {};

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
            if (!isUserMajeur(user)) {
                nextErrors.birthDate = 'Vous devez être majeur pour soumettre ce formulaire.';
            }
        }

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            setSuccessMessage('');
            return;
        }

        const updatedUsers = [...registeredUsers, data];

        localStorage.setItem(storageKey, JSON.stringify(updatedUsers));
        setRegisteredUsers(updatedUsers);
        setErrors({});
        setSuccessMessage('Utilisateur enregistré avec succès !');
        setFormValues(initialFormValues);
        form.reset();
    };

    return (
        <>
            <h1 className="card">Formulaire</h1>
            <form className="form" onSubmit={handleSubmit} noValidate>
                <label>
                    Nom :
                    <input type="text" name="name" value={formValues.name} onChange={handleChange} />
                </label>
                {errors.name && <p role="alert" style={errorStyle}>{errors.name}</p>}

                <label>
                    Prénom :
                    <input type="text" name="firstName" value={formValues.firstName} onChange={handleChange} />
                </label>
                {errors.firstName && <p role="alert" style={errorStyle}>{errors.firstName}</p>}

                <label>
                    Date de naissance :
                    <input type="date" name="birthDate" value={formValues.birthDate} onChange={handleChange} />
                </label>
                {errors.birthDate && <p role="alert" style={errorStyle}>{errors.birthDate}</p>}

                <label>
                    Mail :
                    <input type="email" name="email" value={formValues.email} onChange={handleChange} />
                </label>
                {errors.email && <p role="alert" style={errorStyle}>{errors.email}</p>}

                <label>
                    Ville :
                    <input type="text" name="city" value={formValues.city} onChange={handleChange} />
                </label>
                {errors.city && <p role="alert" style={errorStyle}>{errors.city}</p>}

                <label>
                    Code postal :
                    <input type="text" name="postalCode" value={formValues.postalCode} onChange={handleChange} />
                </label>
                {errors.postalCode && <p role="alert" style={errorStyle}>{errors.postalCode}</p>}

                <input type="submit" value="Sauvegarder" disabled={isSubmitDisabled} />
                {successMessage && <p role="status" style={successStyle}>{successMessage}</p>}
            </form>

            <h2>Liste des inscrits</h2>
            {registeredUsers.length === 0 ? (
                <p>Aucun inscrit pour le moment.</p>
            ) : (
                <ul>
                    {registeredUsers.map((user, index) => (
                        <li key={`${user.email}-${index}`}>
                            {user.firstName} {user.name} - {user.email} - {user.city} - {user.postalCode}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
