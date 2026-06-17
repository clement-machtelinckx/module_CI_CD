#!/bin/bash
set -e

: "${MYSQL_DATABASE:?MYSQL_DATABASE is required}"
: "${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD is required}"
: "${EMAIL_ADMIN:?EMAIL_ADMIN is required}"
: "${PASSWORD_ADMIN:?PASSWORD_ADMIN is required}"
: "${ADMIN_PASSWORD_SALT:?ADMIN_PASSWORD_SALT is required}"

mysql --protocol=socket -uroot -p"${MYSQL_ROOT_PASSWORD}" "${MYSQL_DATABASE}" <<EOSQL
SET NAMES utf8mb4;

INSERT INTO admins (email, passwordHash)
VALUES (
    '${EMAIL_ADMIN}',
    SHA2(CONCAT('${PASSWORD_ADMIN}', '${ADMIN_PASSWORD_SALT}'), 256)
)
ON DUPLICATE KEY UPDATE
    passwordHash = SHA2(CONCAT('${PASSWORD_ADMIN}', '${ADMIN_PASSWORD_SALT}'), 256);
EOSQL
