# Database

PostgreSQL database will store data about users and their job offers.

You'll use uuid v7 for ids

User will consist of:

- Email
- Name
- Surname
- Password (hashed)
- Roles (user, admin)

Job offer will belong to a user and consist of:

- Owner (reference to a user)
- Company name
- Job title
- Date of creation
- Date of last update
- Status (Applied, Interview, Offer, Declined)
- Offer description (long text, markdown)
- Company address field (optional)
- Company e-mail (optional)
- Company phone (optional)
- Sent CV file (optional, stored as binary/bytes in the database)

There will be also tracking of status changes, so on change, there will be a list of changes.
Initially only the status field is tracked, but the change record is structured so more fields can be tracked in the future.

Changes consist of:

- Date of change
- Affected field name
- Original value
- New value

There will be docker compose ran, so if there are changes necessary for database, you'll use the following command to update the schema

```sh
docker compose run --build init_db
```

DB field names should be in PascalCase (e.g. CompanyName, JobTitle), while variables in code should be in camelCase (e.g. companyName, jobTitle)

The output will be in src/db/schema.ts
