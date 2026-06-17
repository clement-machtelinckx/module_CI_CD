describe('Home page spec', () => {
    it('deployed react app to localhost', () => {
        cy.visit('http://localhost:3000')
        cy.contains('14 utilisateur(s) récupéré(s) depuis l\'API')
    })

    it('creates a new user and displays it in the users table', () => {
        const user = {
            name: 'Testeur',
            firstName: 'Cypress',
            birthDate: '1995-04-12',
            email: `cypress.${Date.now()}@example.com`,
            city: 'Nice',
            postalCode: '06000',
        }

        cy.visit('http://localhost:3000')

        cy.contains('Formulaire').should('be.visible')

        cy.get('input[name="name"]').type(user.name)
        cy.get('input[name="firstName"]').type(user.firstName)
        cy.get('input[name="birthDate"]').type(user.birthDate)
        cy.get('input[name="email"]').type(user.email)
        cy.get('input[name="city"]').type(user.city)
        cy.get('input[name="postalCode"]').type(user.postalCode)

        cy.get('input[type="submit"][value="Sauvegarder"]').should('not.be.disabled').click()

        cy.contains('Utilisateur enregistré avec succès !').should('be.visible')

        cy.get('table').within(() => {
            cy.contains('td', user.name).should('be.visible')
            cy.contains('td', user.firstName).should('be.visible')
            cy.contains('td', user.city).should('be.visible')
        })
    })
})