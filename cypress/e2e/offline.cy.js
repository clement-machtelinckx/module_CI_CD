describe('Users offline mode', () => {
    const user = {
        name: 'Offline',
        firstName: 'Cypress',
        birthDate: '1995-04-12',
        email: `offline.cy.${Date.now()}@example.com`,
        city: 'Nice',
        postalCode: '06000',
    };

    const fillUserForm = () => {
        cy.get('input[name="name"]').clear().type(user.name);
        cy.get('input[name="firstName"]').clear().type(user.firstName);
        cy.get('input[name="birthDate"]').clear().type(user.birthDate);
        cy.get('input[name="email"]').clear().type(user.email);
        cy.get('input[name="city"]').clear().type(user.city);
        cy.get('input[name="postalCode"]').clear().type(user.postalCode);
    };

    it('shows an error when the backend is unavailable', () => {
        cy.intercept('GET', '**/users', {
            statusCode: 200,
            body: {
                users: [],
            },
        }).as('getUsers');

        cy.intercept('POST', '**/users', {
            statusCode: 500,
            body: {
                detail: 'Backend unavailable in offline mode',
            },
        }).as('createUserOffline');

        cy.visit('/');

        cy.wait('@getUsers');

        cy.contains('Users manager', { timeout: 30000 }).should('be.visible');
        cy.contains('Formulaire').should('be.visible');
        cy.contains('0 utilisateur(s) récupéré(s) depuis l\'API').should('be.visible');
        cy.contains('Aucun inscrit pour le moment.').should('be.visible');

        fillUserForm();

        cy.get('input[type="submit"][value="Sauvegarder"]')
            .should('not.be.disabled')
            .click();

        cy.wait('@createUserOffline').then((interception) => {
            expect(interception.response.statusCode).to.equal(500);
        });

        cy.contains("Impossible d'enregistrer l'utilisateur depuis l'API.", { timeout: 30000 })
            .should('be.visible');

        cy.contains('Utilisateur enregistré avec succès !').should('not.exist');
        cy.contains(user.email).should('not.exist');
    });
});