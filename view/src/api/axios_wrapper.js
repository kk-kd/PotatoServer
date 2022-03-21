import axios from "axios";

/*
Welcome to the Axios Wrapper.
To extract data that you need or error codes, call `.data` on the output of these calls.
The example from ListUsers is below (as a hook):
export const ListUsers = () => {
  const [data] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        getAllUsers({ page: 0, size: 0, sort: "none", sortDir: "none" });
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
/*
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
  return await axios.get(`/api/users/all`, {
    params: specifications,
    headers: getHeaderWithAuthToken(),
  });
}
export async function getAllStudents(specifications) {
  return await axios.get(`/api/students/all`, {
    params: specifications,
    headers: getHeaderWithAuthToken(),
  });
}
export async function getAllSchools(specifications) {
  return await axios.get(`/api/schools/all`, {
    params: specifications,
    headers: getHeaderWithAuthToken(),
  });
}
export async function getAllRoutes(specifications) {
  return await axios.get(`/api/routes/all`, {
    params: specifications,
    headers: getHeaderWithAuthToken(),
  });
}
export async function getAllStops(specifications) {
  return await axios.get(`/api/stops/all`, {
    params: specifications,
    headers: getHeaderWithAuthToken(),
  });
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
  return await axios.get(`/api/users/filter`, {
    params: specifications,
    headers: getHeaderWithAuthToken(),
  });
}
export async function filterAllStudents(specifications) {
  return await axios.get(`/api/students/filter`, {
    params: specifications,
    headers: getHeaderWithAuthToken(),
  });
}
export async function filterAllSchools(specifications) {
  return await axios.get(`/api/schools/filter`, {
    params: specifications,
    headers: getHeaderWithAuthToken(),
  });
}
export async function filterAllRoutes(specifications) {
  return await axios.get(`/api/routes/filter`, {
    params: specifications,
    headers: getHeaderWithAuthToken(),
  });
}
export async function filterAllStops(specifications) {
  return await axios.get(`/api/stops/filter`, {
    params: specifications,
    headers: getHeaderWithAuthToken(),
  });
}
/*
   Returns one entry from a table (students, users, schools, routes) by UID.
*/
export async function returnUserInfoFromJWT() {
  return await axios.get("/api/user", { headers: getHeaderWithAuthToken() });
}

export async function getOneUser(uid) {
  return await axios.get("/api/users/" + uid, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function getOneStudent(uid) {
  return await axios.get("/api/students/" + uid, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function getOneSchool(uid) {
  return await axios.get("/api/schools/" + uid, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function getOneRoute(uid) {
  return await axios.get("/api/routes/" + uid, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function getOneStop(uid) {
  return await axios.get("/api/stops/" + uid, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function getOneRoutePlanner(uid) {
  return await axios.get("/api/routes/planner/" + uid, {
    headers: getHeaderWithAuthToken(),
  });
}

/*
   Deletes one entry from a table (students, users, schools, routes) by UID.
*/
export async function deleteUser(uid) {
  return await axios.delete("/api/users/" + uid, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function deleteStudent(uid) {
  return await axios.delete("/api/students/" + uid, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function deleteSchool(uid) {
  return await axios.delete("/api/schools/" + uid, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function deleteRoute(uid) {
  return await axios.delete("/api/routes/" + uid, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function deleteStop(uid) {
  return await axios.delete("/api/stops/" + uid, {
    headers: getHeaderWithAuthToken(),
  });
}
/*
Register a User for the first time to add them to the database.
        For a User:
            {
                email: "NewUniqueEmail@email.net",
                firstName: "NewFirstName",
                middleName: "NewMiddleName",
                lastName: "NewLastName",
                address: "New Address",
                isAdmin: false,
            }
*/
export async function registerUser(specifications) {
  return await axios.post("/api/register", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}

/*
Change a User Password
        You need to specify the old and new password:
            {
                oldPassword: "OldPassword123",
                newPassword: "NewPassword321",
            }
*/
export async function changeUserPassword(specifications) {
  return await axios.post("/api/change-password", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}

/*
Login Validation for a User
        You need to specify the old and new password:
            {
                email: "example@email.net",
                password: "myOldPassword",
            }
*/
export async function loginUser(specifications) {
  return await axios.post("/api/login", specifications);
}

/*
    Saves a new entry to a table (students, users, schools, routes).
    The INPUT is a json map of each entity property;
        These are examples below. If you need to see the specific property names, check out 
        model/src/entities/*.ts to see all properties
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
  return await axios.post("/api/users", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}

export async function saveStudent(specifications) {
  return await axios.post("/api/students", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}

export async function saveSchool(specifications) {
  return await axios.post("/api/schools", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function saveRoute(specifications) {
  return await axios.post("/api/routes", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function saveStop(specifications) {
  return await axios.post("/api/stops", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}
/*
   Updates an existing entry in a table (students, users, schools, routes) by UID.
*/
export async function updateUser(uid, specifications, changePassword) {
  return await axios.put("/api/users/" + uid, specifications, {
    params: { changePassword: changePassword },
    headers: getHeaderWithAuthToken(),
  });
}
export async function updateStudent(uid, specifications) {
  return await axios.put("/api/students/" + uid, specifications, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function updateSchool(uid, specifications) {
  return await axios.put("/api/schools/" + uid, specifications, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function updateRoute(uid, specifications) {
  return await axios.put("/api/routes/" + uid, specifications, {
    headers: getHeaderWithAuthToken(),
  });
}

export async function updateStop(uid, specifications) {
  return await axios.put("/api/stops/" + uid, specifications, {
    headers: getHeaderWithAuthToken(),
  });
}
// Email Calls
export async function sendGeneralAnnouncementToAll(specifications) {
  return await axios.post("/api/email/general/all", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function sendGeneralAnnouncementToUsersFromSchool(specifications) {
  return await axios.post("/api/email/general/school", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function sendGeneralAnnouncementToUsersOnRoute(specifications) {
  return await axios.post("/api/email/general/route", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}

export async function sendRouteAnnouncementToAll(specifications) {
  return await axios.post("/api/email/route/all", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function sendRouteAnnouncementToUsersFromSchool(specifications) {
  return await axios.post("/api/email/route/school", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function sendRouteAnnouncementToUsersOnRoute(specifications) {
  return await axios.post("/api/email/route/route", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}

export async function resetPassword(specifications) {
  return await axios.post("/api/reset-password", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}
export async function forgetPassword(specifications) {
  return await axios.post("/api/forget-password", specifications, {
    headers: getHeaderWithAuthToken(),
  });
}

export async function validateBulkParents(specifications) {
  return (
    await axios.post("/api/bulk/users/validate", specifications),
    {
      headers: getHeaderWithAuthToken(),
    }
  );
}

export async function saveBulkParents(specifications) {
  return (
    await axios.post("/api/bulk/users/save", specifications),
    {
      headers: getHeaderWithAuthToken(),
    }
  );
}

export async function validateBulkStudents(specifications) {
  return (
    await axios.post("/api/bulk/students/validate", specifications),
    {
      headers: getHeaderWithAuthToken(),
    }
  );
}

export async function saveBulkStudents(specifications) {
  return (
    await axios.post("/api/bulk/students/save", specifications),
    {
      headers: getHeaderWithAuthToken(),
    }
  );
}
// Helpers
function convertMapToURL(map) {
  return Object.keys(map)
    .map((key) => `${key}=${map[key]}`)
    .join("&");
}

function getHeaderWithAuthToken() {
  const token = sessionStorage.getItem("token");
  const header = { auth: token };
  return header;
}
