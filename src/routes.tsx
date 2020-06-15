import * as React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";

import { inject, observer } from "mobx-react";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { SideNav } from "./components/Navbar/SideNav";
import { LoginPage } from "./pages/login-page/login.page";
import { HomePage } from "./pages/protected/home-page/home.page";
import { ProgramsPage } from "./pages/protected/programs-page/programs.page";
import { SettingsPage } from "./pages/protected/settings-page/settings.page";
import { CreateUserPage } from "./pages/protected/users/create/createUser.page";
import IdentityStore from "./stores/identity.store";

const ProtectedRoute: React.FC<{ isLoggedIn: boolean }> = (props) => {
  const { isLoggedIn } = props;

  if (!isLoggedIn) {
    return <Redirect to="/login" />;
  }
  return (
    <main style={{ height: "100%" }}>
      <SideNav />
      <div
        style={{
          display: "inline-block",
          position: "absolute",
          width: "84%",
          height: "100%",
        }}
      >
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/programs" exact component={ProgramsPage} />
          <Route path="/settings" exact component={SettingsPage} />
          <Route path="/users/create" exact component={CreateUserPage} />
          <Route component={HomePage} />
        </Switch>
        <ToastContainer />
      </div>
    </main>
  );
};

interface Props {
  identityStore?: IdentityStore;
}

@inject("identityStore")
@observer
export default class Routes extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }
  public render() {
    const { identityStore } = this.props;

    const isLoggedIn = identityStore!.isLoggedIn;

    return (
      <Router>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route component={() => <ProtectedRoute isLoggedIn={isLoggedIn} />} />
        </Switch>
      </Router>
    );
  }
}
