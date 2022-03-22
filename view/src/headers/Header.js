import "./Header.css";
import { LogOut } from "./../login/LogOut";
import { TableLinks } from "./TableLinks";

export const Header = ({ setLoggedIn, role }) => {
  const anyRights = role === "School Staff" || role === "Admin" || role === "Driver";
  const emailRights = role === "School Staff" || role === "Admin";
  return (
    <div className="Header">
      <div>
        <p className="display-4">
          {" "}
          Potato{" "}
          {/* <img
            className="header-image-app"
            src={"../cute_potato.png"}
            alt="Cute Potato!"
            style={{ fontSize: "medium" }}
          /> */}
          Web Service
        </p>
      </div>

      <TableLinks hash="MyStudents" link="MyStudents" display="My Students" />
      <TableLinks
        hash="ChangeMyPassword"
        link="ChangeMyPassword"
        display="Change Password"
      />
      {anyRights && (
        <TableLinks hash="Schools" link="Schools/list" display="Schools" />
      )}
      {anyRights && (
        <TableLinks
          hash="Users"
          link="Users/list"
          display="Parents & Administrators "
        />
      )}
      {anyRights && (
        <TableLinks hash="Students" link="Students/list" display="Students" />
      )}
      {anyRights && (
        <TableLinks hash="Routes" link="Routes/list" display="Routes" />
      )}
      {emailRights && (
        <TableLinks hash="Import" link="Import/upload" display="Import Account Info"/>)
      }

      {emailRights && (
        <TableLinks
          hash="Emails"
          link="Emails/send"
          display="Send Announcement"
        />
      )}
      <LogOut setLoggedIn={setLoggedIn} />
    </div>
  );
};
