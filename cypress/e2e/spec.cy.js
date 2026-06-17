describe('Users E2E', () => {
    const validUser = {
        name: 'Machtelinckx',
        firstName: 'Cypress',
        birthDate: '1995-04-12',
        email: `cypress.${Date.now()}@example.com`,
        city: 'Nice',
        postalCode: '06000',
    }

    const invalidUser = {
        name: 'Erreur',
        firstName: 'Test',
        birthDate: '2010-04-12',
        email: 'email-invalide',
        city: 'Paris',
        postalCode: '7500',
    }

    const goHome = () => {
        cy.visit('/')
        cy.contains('Users manager', { timeout: 30000 }).should('be.visible')
        cy.contains('Formulaire', { timeout: 30000 }).should('be.visible')
        cy.contains('Liste des inscrits', { timeout: 30000 }).should('be.visible')
    }

    const fillUserForm = (user) => {
        cy.get('input[name="name"]').clear().type(user.name)
        cy.get('input[name="firstName"]').clear().type(user.firstName)
        cy.get('input[name="birthDate"]').clear().type(user.birthDate)
        cy.get('input[name="email"]').clear().type(user.email)
        cy.get('input[name="city"]').clear().type(user.city)
        cy.get('input[name="postalCode"]').clear().type(user.postalCode)
    }

    it('starts with no registered user, creates a user without error, then shows one registered user', () => {
        goHome()

        cy.contains('0 utilisateur(s) récupéré(s) depuis l\'API', { timeout: 30000 }).should('be.visible')
        cy.contains('Aucun inscrit pour le moment.').should('be.visible')

        fillUserForm(validUser)

        cy.get('input[type="submit"][value="Sauvegarder"]')
            .should('not.be.disabled')
            .click()

        cy.contains('Utilisateur enregistré avec succès !', { timeout: 30000 }).should('be.visible')
        cy.contains('1 utilisateur(s) récupéré(s) depuis l\'API', { timeout: 30000 }).should('be.visible')

        cy.get('table').within(() => {
            cy.contains('td', validUser.name).should('be.visible')
            cy.contains('td', validUser.firstName).should('be.visible')
            cy.contains('td', validUser.city).should('be.visible')
        })
    })

    it('starts with one registered user, tries to create an invalid user, then still shows one registered user', () => {
        goHome()

        cy.contains('1 utilisateur(s) récupéré(s) depuis l\'API', { timeout: 30000 }).should('be.visible')

        fillUserForm(invalidUser)

        cy.get('input[type="submit"][value="Sauvegarder"]')
            .should('not.be.disabled')
            .click()

        cy.contains('L\'email est invalide.').should('be.visible')
        cy.contains('Le code postal est invalide.').should('be.visible')
        cy.contains('Vous devez être majeur pour soumettre ce formulaire.').should('be.visible')

        cy.contains('Utilisateur enregistré avec succès !').should('not.exist')

        goHome()

        cy.contains('1 utilisateur(s) récupéré(s) depuis l\'API', { timeout: 30000 }).should('be.visible')

        cy.get('table').within(() => {
            cy.contains('td', validUser.name).should('be.visible')
            cy.contains('td', validUser.firstName).should('be.visible')
            cy.contains('td', validUser.city).should('be.visible')
            cy.contains('td', invalidUser.name).should('not.exist')
        })
    })
})