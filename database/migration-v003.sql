USE ynov_ci;

INSERT IGNORE INTO users (
    name,
    firstName,
    birthDate,
    email,
    city,
    postalCode
) VALUES
    ('Machtelinckx', 'Clément', '1992-03-22', 'clement.machtelinckx@example.com', 'Marseille', '13001'),
    ('Dupont', 'Jean', '1990-05-14', 'jean.dupont@example.com', 'Paris', '75001'),
    ('Martin', 'Claire', '1988-11-03', 'claire.martin@example.com', 'Lyon', '69002'),
    ('Bernard', 'Lucas', '1995-07-21', 'lucas.bernard@example.com', 'Nice', '06000'),
    ('Petit', 'Emma', '1999-01-12', 'emma.petit@example.com', 'Lille', '59000'),
    ('Robert', 'Hugo', '1985-09-30', 'hugo.robert@example.com', 'Bordeaux', '33000'),
    ('Richard', 'Léa', '1993-04-18', 'lea.richard@example.com', 'Toulouse', '31000'),
    ('Durand', 'Nathan', '1997-12-05', 'nathan.durand@example.com', 'Nantes', '44000'),
    ('Moreau', 'Chloé', '1991-06-25', 'chloe.moreau@example.com', 'Rennes', '35000'),
    ('Simon', 'Arthur', '1989-10-09', 'arthur.simon@example.com', 'Cannes', '06400');