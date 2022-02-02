export const LogOut = ({ setLoggedIn }) => {
  const logOut = () => {
    sessionStorage.removeItem("token");
    setLoggedIn(false);
  };

  return (
    <button
      type="button"
      class="btn btn-outline-primary"
      onClick={(e) => logOut()}
    >
      Log Out
    </button>
  );
};
