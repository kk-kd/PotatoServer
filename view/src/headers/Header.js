import "./Header.css";
import { LogOut } from "./../login/LogOut";
import { TableLinks } from "./TableLinks";

export const Header = ({ setLoggedIn, isAdmin }) => {
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
      {isAdmin && (
        <TableLinks hash="Schools" link="Schools/list" display="Schools" />
      )}
      {isAdmin && (
        <TableLinks
          hash="Users"
          link="Users/list"
          display="Parents & Administrators "
        />
      )}
      {isAdmin && (
        <TableLinks hash="Students" link="Students/list" display="Students" />
      )}
      {isAdmin && (
        <TableLinks hash="Routes" link="Routes/list" display="Routes" />
      )}
      {isAdmin && (
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
