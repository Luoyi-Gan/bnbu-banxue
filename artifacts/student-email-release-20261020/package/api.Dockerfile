FROM bnbu-banxue-api:huitongli-20261020-auth
COPY --chown=node:node backend-dist /app/backend/dist
COPY --chown=node:node verify-student-email.mjs /app/
