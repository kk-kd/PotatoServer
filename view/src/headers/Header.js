import "./Header.css";
import { LogOut } from "./../login/LogOut";
import { TableLinks } from "./TableLinks";

export const Header = ({ setLoggedIn, isAdmin }) => {

  return (
      <div className="Header">
        <TableLinks hash="MyStudents" />
        {isAdmin && <TableLinks hash="Schools" />}
        {isAdmin && <TableLinks hash="Users" />}
        {isAdmin && <TableLinks hash="Students" />}
        {isAdmin && <TableLinks hash="Routes" />}
        <LogOut setLoggedIn={setLoggedIn} />
      </div>
  );
}
