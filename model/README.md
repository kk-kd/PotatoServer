## Quick Start for entire Backend

1. Start the PostgreSQL Server with: `ssh -L 5432:127.0.0.1:5432 vcm-23920.vm.duke.edu -l zz160`
2. To start the backend, cd into `PotatoServer/model/` and type `npm run type-start`.
3. In your browser, go to https://localhost:3000/api/users/all/page=0&size=0&sort=none&sortDir=none to check if the database is working locally!

## BACKEND API

Making a backend API call?

**Tips and Tricks**

- The **Tables are refreshed and restarted on every restart** with clean data each time your `run npm run type-start`. Accidentally delete or add bad data? No problem, just `CTRL C` out of the npm script and rerun it.
- Although status codes are returned; the wrapper should handle all the errors for you

**Examples**

Posting a New School:
`await saveSchool({ name: "newnewnew@email.net", address: "NewFirstName", longitude: 1, latitude: 2, })`

Updating an existing User: (note you need the UID)
`await updateUser(2, { email: "newnewnew@email.net", firstName: "NewFirstName", middleName: "newMiddleName", lastName: "newLastName", address: "new Address", isAdmin: false, password: "testnewpassUpdated"});`

Backend Options; can add additional calls to smooth out operations if needed:

- Can add soft delete / restore

### TODOS

Jackson:
Bulk import:

- check deleting entry combinations
  - esp for those with multiple errors in a single row
