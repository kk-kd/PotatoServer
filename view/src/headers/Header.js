import "./Header.css";
import { LogOut } from "./../login/LogOut";
import { TableLinks } from "./TableLinks";
import { StartRunModal } from "./../run/StartRunModal";
import { StopRun } from "./../run/StopRun";

export const Header = ({ setLoggedIn, role }) => {
  const anyRights =
    role === "School Staff" || role === "Admin" || role === "Driver";
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

      {!anyRights && <TableLinks hash="MyStudents" link="MyStudents" display="My Students" />}
      {role === "Driver" && <StartRunModal isHeader />}
      {role === "Driver" && <StopRun />}
      {anyRights && (
          <TableLinks hash="Routes" link="Routes/list" display="Routes" />
      )}
      {anyRights && (
          <TableLinks hash="Runs" link="Runs/list" display="Transit Runs" />
      )}
      {anyRights && (
        <TableLinks hash="Schools" link="Schools/list" display="Schools" />
      )}
      {anyRights && (
        <TableLinks hash="Users" link="Users/list" display="Users" />
      )}
      {anyRights && (
        <TableLinks hash="Students" link="Students/list" display="Students" />
      )}
      {emailRights && (
        <TableLinks
          hash="Import"
          link="Import/upload"
          display="Import Account Info"
        />
      )}

      {emailRights && (
        <TableLinks
          hash="Emails"
          link="Emails/send"
          display="Send Announcement"
        />
      )}
      <TableLinks
        hash="ChangeMyPassword"
        link="ChangeMyPassword"
        display="Change Password"
      />
      <LogOut setLoggedIn={setLoggedIn} />
    </div>
  );
};
