import React, { useContext } from "react";

import { AuthContext } from "../context/auth";

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h1>Hello {user ? user.username : "unlogged user"}</h1>
      <div>
        {user ? (
          <ul>
            <li>
              <p>"your emails is:" {user.email} </p>
            </li>
            <li>Your publicAddress is: {user.account}</li>
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default Home;
