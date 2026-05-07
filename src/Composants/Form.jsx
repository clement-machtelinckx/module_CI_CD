import React, { useState } from 'react';
import {
    isCPValid,
    isUserMajeur,
    isEmailValid,
    isStringValide,
} from '../utils/module.js';

/**
 * Valeurs initiales du formulaire d'inscription.
 * @type {{name: string, firstName: string, birthDate: string, email: string, city: string, postalCode: string}}
 */
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

/**
 * Charge la liste des inscrits depuis le localStorage.
 * @returns {Array<Object>} Liste des inscrits ou tableau vide si aucune donnee exploitable n'est presente.
 */
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

/**
 * Affiche le formulaire d'inscription, les messages de validation
 * et la liste des inscrits sauvegardes dans le localStorage.
 * @returns {JSX.Element} Composant formulaire.
 */
export default function Form() {
    const [formValues, setFormValues] = useState(initialFormValues);
    const [registeredUsers, setRegisteredUsers] = useState(getRegisteredUsersFromStorage);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const isSubmitDisabled = Object.values(formValues).some((value) => value.trim() === '');

    /**
     * Met a jour le champ modifie dans l'etat local du formulaire.
     * @param {React.ChangeEvent<HTMLInputElement>} event Evenement de changement.
     * @returns {void}
     */
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));
    };

    /**
     * Valide le formulaire, enregistre l'utilisateur
     * puis met a jour la liste des inscrits si tout est correct.
     * @param {React.FormEvent<HTMLFormElement>} event Evenement de soumission du formulaire.
     * @returns {void}
     */
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
            nextErrors.name = 'Le nom est invalide.';
        }

        if (!isStringValide(data.firstName)) {
            nextErrors.firstName = 'Le prénom est invalide.';
        }

        if (!isStringValide(data.city)) {
            nextErrors.city = 'La ville est invalide.';
        }

        if (!isEmailValid(data.email)) {
            nextErrors.email = "L'email est invalide.";
        }

        if (!isCPValid(data.postalCode)) {
            nextErrors.postalCode = "Le code postal est invalide.";
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
        <div className="form">
            <h1>Formulaire</h1>

            <form className='iner-form' onSubmit={handleSubmit} noValidate>
                <div className="box-col">
                <label>
                    Nom :
                    <input className="form-input-text" type="text" name="name" value={formValues.name} onChange={handleChange} />
                </label>
                {errors.name && <p role="alert" style={errorStyle}>{errors.name}</p>}

                <label>
                    Prénom :
                    <input className="form-input-text" type="text" name="firstName" value={formValues.firstName} onChange={handleChange} />
                </label>
                {errors.firstName && <p role="alert" style={errorStyle}>{errors.firstName}</p>}

                <label>
                    Date de naissance :
                    <input className="form-input-text" type="date" name="birthDate" value={formValues.birthDate} onChange={handleChange} />
                </label>
                {errors.birthDate && <p role="alert" style={errorStyle}>{errors.birthDate}</p>}
            </div>
            <div className="box-col" >
                <label>
                    Mail :
                    <input className="form-input-text" type="email" name="email" value={formValues.email} onChange={handleChange} />
                </label>
                {errors.email && <p role="alert" style={errorStyle}>{errors.email}</p>}

                <label>
                    Ville :
                    <input  className="form-input-text" type="text" name="city" value={formValues.city} onChange={handleChange} />
                </label>
                {errors.city && <p role="alert" style={errorStyle}>{errors.city}</p>}

                <label>
                    Code postal :
                    <input className="form-input-text" type="text" name="postalCode" value={formValues.postalCode} onChange={handleChange} />
                </label>
                {errors.postalCode && <p role="alert" style={errorStyle}>{errors.postalCode}</p>}

                <input className="button" type="submit" value="Sauvegarder" disabled={isSubmitDisabled} />
                {successMessage && <p role="status" style={successStyle}>{successMessage}</p>}
                </div>
            </form>

            <h2>Liste des inscrits</h2>

            {registeredUsers.length === 0 ? (
                <p>Aucun inscrit pour le moment.</p>
            ) : (
                <table className='table'>
                    <thead>
                        <tr>
                            <th scope="col">Nom</th>
                            <th scope="col">Prénom</th>
                            <th scope="col">Email</th>
                            <th scope="col">Ville</th>
                            <th scope="col">Code postal</th>
                            <th scope="col">Date de naissance</th>
                        </tr>
                    </thead>

                    <tbody>
                        {registeredUsers.map((user, index) => (
                            <tr key={`${user.email}-${index}`}>
                                <td>{user.name}</td>
                                <td>{user.firstName}</td>
                                <td>{user.email}</td>
                                <td>{user.city}</td>
                                <td>{user.postalCode}</td>
                                <td>{user.birthDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            </div>
        </>
    );
}
