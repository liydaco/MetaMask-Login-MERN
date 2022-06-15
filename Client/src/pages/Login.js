import React, { useContext, useState, useEffect } from "react";
import { Button, Form } from "semantic-ui-react";
import { useMutation } from "@apollo/react-hooks";

import { AuthContext } from "../context/auth";
import { useForm } from "../util/hooks";

import { useWeb3React } from "@web3-react/core";

import { LOGIN_USER, WALLET_AUTH, WALLET_LOGIN } from "../util/graphql";

import { InjectedConnector } from "@web3-react/injected-connector";

export const injected = new InjectedConnector({
  supportedChainIds: [1, 56, 4, 5, 42],
});

function Login(props) {
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});

  const { account, library, activate } = useWeb3React();

  // activate wallet connection
  useEffect(() => {
    activate(injected);
  }, [activate]);

  
  // async function disconnect() {
  //   try {
  //     deactivate();
  //   } catch (ex) {
  //     //console.log(ex);
  //   }
  // }

  // Wallet login logic
  const [walletAuth, {}] = useMutation(WALLET_AUTH, {
    update(_, { data: { walletAuth: userData } }) {
      context.login(userData);
      props.history.push("/");
    },
  });

  const [walletLogin] = useMutation(WALLET_LOGIN, {
    variables: {
      account: account,
    },

    onError(error) {
      error.graphQLErrors.map((error) => {
        console.log(error);
      });
    },

    // if error return "account does not exist please switch account / create an account"

    onCompleted({ walletLogin }) {
      handleSignMessage(walletLogin);
    },
  });

  const handleSignMessage = ({ nonce, account, username }) => {
    library
      .getSigner()
      .signMessage("Hi " + username + "! Your Unique Login Code: " + nonce)

      .then((signature) => {
        console.log(signature);
        walletAuth({ variables: { signature: signature, account } });
      })

      .catch((error) => {
        window.alert(
          "Failure!" + (error && error.message ? `\n\n${error.message}` : "")
        );
      });
  };

  // Username / password logic

  const { onChange, onSubmit, values } = useForm(loginUserCallback, {
    username: "",
    password: "",
  });

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    update(_, { data: { login: userData } }) {
      context.login(userData);
      props.history.push("/");
    },
    onError(err) {
      err.graphQLErrors.map((err) => {
        console.log(err.message);
      });
    },
    variables: values,
  });

  function loginUserCallback() {
    loginUser();
  }

  return (
    <div className="form-container">
      <Form onSubmit={onSubmit} noValidate className={loading ? "loading" : ""}>
        <h1>Login</h1>
        <Form.Input
          label="Username"
          placeholder="Username.."
          name="username"
          type="text"
          value={values.username}
          error={errors.username ? true : false}
          onChange={onChange}
        />
        <Form.Input
          label="Password"
          placeholder="Password.."
          name="password"
          type="password"
          value={values.password}
          error={errors.password ? true : false}
          onChange={onChange}
        />
        <Button type="submit" primary>
          Login
        </Button>
      </Form>
      {Object.keys(errors).length > 0 && (
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      )}
      <br />
      <div>
        <h1> Login with MetaMask </h1>
        <Button onClick={walletLogin} primary>
          Login with MetaMask
        </Button>
      </div>
    </div>
  );
}

export default Login;
