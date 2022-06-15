import React, { useContext, useState, useEffect } from "react";
import { Button, Form } from "semantic-ui-react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";

import { AuthContext } from "../context/auth";
import { useForm } from "../util/hooks";

import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
export const injected = new InjectedConnector({
  supportedChainIds: [1, 56, 4, 5, 42],
});

function Register(props) {
  const context = useContext(AuthContext);
  const [errors, setErrors] = useState({});

  const { active, account, library, activate, deactivate } = useWeb3React();

  // activate wallet connection
  useEffect(() => {
    activate(injected);
  }, [library, account, activate]);

  const { onChange, onSubmit, values } = useForm(registerUser, {
    account: account,
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [addUser, { loading }] = useMutation(REGISTER_USER, {
    update(_, { data: { register: userData } }) {
      context.login(userData);
      props.history.push("/");
    },
    onError(err) {
      console.log(err);
    },
    variables: values,
  });

  function registerUser() {
    addUser();
  }

  async function connect() {
    try {
      activate(injected);
    } catch (ex) {
      //console.log(ex);
    }
  }

  async function disconnect() {
    try {
      deactivate();
    } catch (ex) {
      //console.log(ex);
    }
  }

  return (
    <>
      {account ? (
        <div className="form-container">
          <Form
            onSubmit={onSubmit}
            noValidate
            className={loading ? "loading" : ""}
          >
            <h1>Register</h1>

            <Form.Input
              readOnly
              label="Account"
              placeholder={!values.account ? "Connect Wallet" : values.account}
              name="account"
              type="text"
              value={account}
            />
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
              label="Email"
              placeholder="Email.."
              name="email"
              type="email"
              value={values.email}
              error={errors.email ? true : false}
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
            <Form.Input
              label="Confirm Password"
              placeholder="Confirm Password.."
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              error={errors.confirmPassword ? true : false}
              onChange={onChange}
            />
            <Button type="submit" primary>
              Register
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
        </div>
      ) : (
        <div className="form-container">
          <Button onClick={connect} primary>
            Connect MetaMask Account
          </Button>
        </div>
      )}
    </>
  );
}

const REGISTER_USER = gql`
  mutation register(
    $account: String
    $username: String!
    $email: String!
    $password: String!
    $confirmPassword: String!
  ) {
    register(
      registerInput: {
        account: $account
        username: $username
        email: $email
        password: $password
        confirmPassword: $confirmPassword
      }
    ) {
      id
      account
      email
      username
      token
    }
  }
`;

export default Register;
