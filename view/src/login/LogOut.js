export const LogOut = ({ setLoggedIn }) => {
  const logOut = () => {
    sessionStorage.removeItem("token");
    setLoggedIn(false);
  }

  return (
      <button onClick={e => logOut()}>Log Out</button>
  );
}
