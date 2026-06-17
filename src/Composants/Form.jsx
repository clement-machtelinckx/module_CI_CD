import React, { useCallback, useEffect, useState } from 'react';
import {
    deleteAdminUser,
    getAdminUsers,
    updateAdminUser,
} from '../services/adminService.js';
import {
    createUser,
    getUsers,
} from '../services/userService.js';
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
const noop = () => {};

function toFormValues(user) {
    return {
        name: user.name,
        firstName: user.firstName,
        birthDate: String(user.birthDate).slice(0, 10),
        email: user.email,
        city: user.city,
        postalCode: user.postalCode,
    };
}

function validateUser(data) {
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

    return nextErrors;
}

/**
 * Affiche le formulaire d'inscription, les messages de validation
 * et la liste des inscrits recuperes depuis l'API.
 * @param {{ adminToken?: string, isAdmin?: boolean, onUsersChange?: (count: number) => void }} props Props du composant.
 * @returns {JSX.Element} Composant formulaire.
 */
export default function Form({ adminToken = '', isAdmin = false, onUsersChange = noop }) {
    const [formValues, setFormValues] = useState(initialFormValues);
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const isSubmitDisabled = Object.values(formValues).some((value) => value.trim() === '');

    const loadUsers = useCallback(async () => {
        setIsLoading(true);

        try {
            const apiUsers = isAdmin
                ? await getAdminUsers(adminToken)
                : await getUsers();

            setUsers(apiUsers);
            onUsersChange(apiUsers.length);
            setApiError('');
        } catch (error) {
            console.error(error);
            setApiError("Impossible de récupérer les utilisateurs depuis l'API.");
        } finally {
            setIsLoading(false);
        }
    }, [adminToken, isAdmin, onUsersChange]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const syncUsers = (users) => {
        setUsers(users);
        onUsersChange(users.length);
    };

    const resetForm = () => {
        setFormValues(initialFormValues);
        setEditingUserId(null);
    };

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
     * Valide le formulaire, enregistre l'utilisateur via l'API
     * puis rafraichit la liste si tout est correct.
     * @param {React.FormEvent<HTMLFormElement>} event Evenement de soumission du formulaire.
     * @returns {Promise<void>}
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        const data = {
            name: formValues.name.trim(),
            firstName: formValues.firstName.trim(),
            birthDate: formValues.birthDate.trim(),
            email: formValues.email.trim(),
            city: formValues.city.trim(),
            postalCode: formValues.postalCode.trim(),
        };
        const nextErrors = validateUser(data);

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            setSuccessMessage('');
            return;
        }

        try {
            if (editingUserId) {
                const updatedUser = await updateAdminUser(editingUserId, data, adminToken);
                const updatedUsers = users.map((user) => (
                    user.id === editingUserId ? updatedUser : user
                ));

                syncUsers(updatedUsers);
                setSuccessMessage('Utilisateur mis à jour avec succès !');
            } else {
                await createUser(data);
                await loadUsers();
                setSuccessMessage('Utilisateur enregistré avec succès !');
            }

            setErrors({});
            setApiError('');
            resetForm();
        } catch (error) {
            console.error(error);
            setApiError("Impossible d'enregistrer l'utilisateur depuis l'API.");
        }
    };

    const handleDelete = async (userId) => {
        try {
            await deleteAdminUser(userId, adminToken);

            const updatedUsers = users.filter((user) => user.id !== userId);
            syncUsers(updatedUsers);

            if (editingUserId === userId) {
                resetForm();
            }

            setApiError('');
            setSuccessMessage('Utilisateur supprimé avec succès !');
        } catch (error) {
            console.error(error);
            setApiError("Impossible de supprimer l'utilisateur depuis l'API.");
        }
    };

    const handleEdit = (user) => {
        setEditingUserId(user.id);
        setFormValues(toFormValues(user));
        setErrors({});
        setSuccessMessage('');
        setApiError('');
    };

    const handleCancelEdit = () => {
        resetForm();
        setErrors({});
        setSuccessMessage('');
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

                <input className="button" type="submit" value={editingUserId ? 'Mettre à jour' : 'Sauvegarder'} disabled={isSubmitDisabled} />
                {editingUserId && <button className="button" type="button" onClick={handleCancelEdit}>Annuler</button>}
                {successMessage && <p role="status" style={successStyle}>{successMessage}</p>}
                {apiError && <p role="alert" style={errorStyle}>{apiError}</p>}
                </div>
            </form>

            <h2>Liste des inscrits</h2>

            {isLoading ? (
                <p>Chargement des utilisateurs...</p>
            ) : users.length === 0 ? (
                <p>Aucun inscrit pour le moment.</p>
            ) : (
                <table className='table'>
                    <thead>
                        <tr>
                            <th scope="col">Nom</th>
                            <th scope="col">Prénom</th>
                            <th scope="col">Ville</th>
                            {isAdmin && <th scope="col">Email</th>}
                            {isAdmin && <th scope="col">Code postal</th>}
                            {isAdmin && <th scope="col">Date de naissance</th>}
                            {isAdmin && <th scope="col">Actions</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.firstName}</td>
                                <td>{user.city}</td>
                                {isAdmin && <td>{user.email}</td>}
                                {isAdmin && <td>{user.postalCode}</td>}
                                {isAdmin && <td>{String(user.birthDate).slice(0, 10)}</td>}
                                {isAdmin && (
                                    <td>
                                        <button className="button" type="button" onClick={() => handleEdit(user)}>Modifier</button>
                                        <button className="button" type="button" onClick={() => handleDelete(user.id)}>Supprimer</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            </div>
        </>
    );
}
