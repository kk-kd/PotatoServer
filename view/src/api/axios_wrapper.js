import axios from "axios";

/*
GetAll from table (students, users, schools, routes) gives you every entry in the table.
INPUT: {"page": page, "size": size, "sort": sort, "sortDir": sortDir}
    page: number, denotes the number page requested; starts at 0
    size: number, denotes the size of the page requested
    sort: str, denotes the sort rule; options are:
      - "none"
      - any user entity column (firstName, middleName, lastName, etc.)
    sortDir: str, denotes the sort direction; options are:
      - "none"
      - "ASC"
      - "DESC"
*/
export async function getAllUsers(specifications) {
  await axios.get(
    `https://localhost:3000/api/users/all/${convertMapToURL(specifications)}`
  );
}
export async function getAllStudents(specifications) {
  await axios.get(
    `https://localhost:3000/api/students/all/${convertMapToURL(specifications)}`
  );
}
export async function getAllSchools(specifications) {
  await axios.get(
    `https://localhost:3000/api/schools/all/${convertMapToURL(specifications)}`
  );
}
export async function getAllRoutes(specifications) {
  await axios.get(
    `https://localhost:3000/api/routes/all/${convertMapToURL(specifications)}`
  );
}

/*
FilterAll from table (students, users, schools, routes) gives you a filtered result from all entries.
INPUT: {"page": page, "size": size, "sort": sort, "sortDir": sortDir}
    page: number, denotes the number page requested; starts at 0
    size: number, denotes the size of the page requested
    sort: str, denotes the sort rule; options are:
      - "none"
      - any user entity column (firstName, middleName, lastName, etc.)
    sortDir: str, denotes the sort direction; options are:
      - "none"
      - "ASC"
      - "DESC"
    filterType: str, denotes what you want to filter by; options are:
      - "none"
      - any User entity column (firstName, middleName, lastName, etc.)
        Check out model/entities/User.ts for all options.

*/
export async function filterAllUsers(specifications) {
  await axios.get(
    `https://localhost:3000/api/users/filter/${convertMapToURL(specifications)}`
  );
}
export async function filterAllStudents(specifications) {
  await axios.get(
    `https://localhost:3000/api/students/filter/${convertMapToURL(
      specifications
    )}`
  );
}
export async function filtertAllSchools(specifications) {
  await axios.get(
    `https://localhost:3000/api/schools/filter/${convertMapToURL(
      specifications
    )}`
  );
}
export async function filterAllRoutes(specifications) {
  await axios.get(
    `https://localhost:3000/api/routes/filter/${convertMapToURL(
      specifications
    )}`
  );
}
/*
   Returns one entry from a table (students, users, schools, routes) by UID.
*/
export async function getOneUser(uid) {
  await axios.get("https://localhost:3000/api/users/" + uid);
}
export async function getOneStudent(uid) {
  await axios.get("https://localhost:3000/api/students/" + uid);
}
export async function getOneSchool(uid) {
  await axios.get("https://localhost:3000/api/schools/" + uid);
}
export async function getOneRoute(uid) {
  await axios.get("https://localhost:3000/api/routes/" + uid);
}
/*
   Deletes one entry from a table (students, users, schools, routes) by UID.
*/
export async function deleteUser(uid) {
  await axios.delete("https://localhost:3000/api/users/" + uid);
}
export async function deleteStudent(uid) {
  await axios.delete("https://localhost:3000/api/students/" + uid);
}
export async function deleteSchool(uid) {
  await axios.delete("https://localhost:3000/api/schools/" + uid);
}
export async function deleteRoute(uid) {
  await axios.delete("https://localhost:3000/api/routes/" + uid);
}

/*
    Saves a new entry to a table (students, users, schools, routes).
    The INPUT is a json map of each entity property;
        These are examples below. If you need to see the specific property names, check out 
        model/src/entities/*.ts to see all properties
        For a User:
            {
                email: "NewUniqueEmail@email.net",
                firstName: "NewFirstName",
                middleName: "NewMiddleName",
                lastName: "NewLastName",
                address: "New Address",
                isAdmin: false,
                password: "testnewpass",
            }
        For a Student,
            {
                id: 123456,
                firstName: "NewFirstName",
                middleName: "NewMiddleName",
                lastName: "NewLastName",
            }
        For a Route,
            {
                name: "NewRouteName",
                description: "NewRouteDescription",
            }
        For a School:
            {
                name: "NewSchoolName",
                address: "New School Address",
                longitude: 1,
                lattitude: 2,
            }

*/
export async function saveUser(specifications) {
  await axios.post("https://localhost:3000/api/users/", specifications);
}
export async function saveStudent(specifications) {
  await axios.post(
    `https://localhost:3000/api/students/${convertMapToURL(specifications)}`
  );
}
export async function saveSchool(specifications) {
  await axios.post(
    `https://localhost:3000/api/schools/${convertMapToURL(specifications)}`
  );
}
export async function saveRoute(specifications) {
  await axios.post(
    `https://localhost:3000/api/routes/${convertMapToURL(specifications)}`
  );
}
/*
   Updates an existing entry in a table (students, users, schools, routes) by UID.
*/
export async function updateUser(uid) {
  await axios.put("https://localhost:3000/api/users/" + uid);
}
export async function updateStudent(uid) {
  await axios.put("https://localhost:3000/api/students/" + uid);
}
export async function updateSchool(uid) {
  await axios.put("https://localhost:3000/api/schools/" + uid);
}
export async function updateRoute(uid) {
  await axios.put("https://localhost:3000/api/routes/" + uid);
}
// Helpers
function convertMapToURL(map) {
  return Object.keys(map)
    .map((key) => `${key}=${map[key]}`)
    .join("&");
}
