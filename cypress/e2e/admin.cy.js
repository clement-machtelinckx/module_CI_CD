describe('Admin users E2E', () => {
    const user = {
        name: 'AdminTest',
        firstName: 'Cypress',
        birthDate: '1995-04-12',
        email: `admin.cy.${Date.now()}@example.com`,
        city: 'Nice',
        postalCode: '06000',
    };

    const admin = {
        email: 'loise.fenoll@ynov.com',
        password: 'PvdrTAzTeR247sDnAZBr',
    };

    const fillUserForm = () => {
        cy.get('input[name="name"]').clear().type(user.name);
        cy.get('input[name="firstName"]').clear().type(user.firstName);
        cy.get('input[name="birthDate"]').clear().type(user.birthDate);
        cy.get('input[name="email"]').clear().type(user.email);
        cy.get('input[name="city"]').clear().type(user.city);
        cy.get('input[name="postalCode"]').clear().type(user.postalCode);
    };

    const assertPublicRow = () => {
        cy.contains('td', user.name)
            .parents('tr')
            .within(() => {
                cy.contains('td', user.name).should('be.visible');
                cy.contains('td', user.firstName).should('be.visible');
                cy.contains('td', user.city).should('be.visible');
                cy.contains(user.email).should('not.exist');
                cy.contains(user.postalCode).should('not.exist');
                cy.contains(user.birthDate).should('not.exist');
                cy.contains('button', 'Modifier').should('not.exist');
                cy.contains('button', 'Supprimer').should('not.exist');
            });
    };

    const getAdminRow = () => (
        cy.contains('td', user.email, { timeout: 30000 }).parents('tr')
    );

    it('creates a public user, shows private data to admin, then deletes that user', () => {
        cy.visit('/');

        cy.contains('Users manager', { timeout: 30000 }).should('be.visible');
        cy.contains('Formulaire', { timeout: 30000 }).should('be.visible');
        cy.contains('Liste des inscrits', { timeout: 30000 }).should('be.visible');

        fillUserForm();

        cy.get('input[type="submit"][value="Sauvegarder"]')
            .should('not.be.disabled')
            .click();

        cy.contains('Utilisateur enregistré avec succès !', { timeout: 30000 })
            .should('be.visible');

        assertPublicRow();
        cy.contains(user.email).should('not.exist');
        cy.contains(user.postalCode).should('not.exist');
        cy.contains(user.birthDate).should('not.exist');
        cy.contains('button', 'Modifier').should('not.exist');
        cy.contains('button', 'Supprimer').should('not.exist');

        cy.get('input[name="adminEmail"]').clear().type(admin.email);
        cy.get('input[name="adminPassword"]').clear().type(admin.password);
        cy.contains('button', 'Connexion admin').click();

        cy.contains(`Connecté en tant que ${admin.email}`, { timeout: 30000 })
            .should('be.visible');

        getAdminRow().within(() => {
            cy.contains('td', user.name).should('be.visible');
            cy.contains('td', user.firstName).should('be.visible');
            cy.contains('td', user.city).should('be.visible');
            cy.contains('td', user.email).should('be.visible');
            cy.contains('td', user.postalCode).should('be.visible');
            cy.contains('td', user.birthDate).should('be.visible');
            cy.contains('button', 'Modifier').should('be.visible');
            cy.contains('button', 'Supprimer').should('be.visible');
        });

        cy.contains('td', user.email)
            .parents('tr')
            .within(() => {
                cy.contains('button', 'Supprimer').click();
            });

        cy.contains('Utilisateur supprimé avec succès !', { timeout: 30000 })
            .should('be.visible');
        cy.contains('td', user.email).should('not.exist');
        cy.contains(user.email).should('not.exist');

        cy.contains('button', 'Déconnexion').click();
        cy.contains('button', 'Connexion admin').should('be.visible');
    });
});
