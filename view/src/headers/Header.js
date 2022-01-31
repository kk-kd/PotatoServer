import "./Header.css";
import { LogOut } from "./../login/LogOut";
import { TableLinks } from "./TableLinks";

export const Header = ({ setLoggedIn }) => {

  return (
      <div className="Header">
        <TableLinks hash="Schools" />
        <TableLinks hash="Users" />
        <TableLinks hash="Students" />
        <TableLinks hash="Routes" />
        <LogOut setLoggedIn={setLoggedIn} />
      </div>
  );
}
