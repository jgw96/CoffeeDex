import { Component, h, State } from "@stencil/core";
import {
  getAuth,
  onAuthStateChanged,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
  useDeviceLanguage,
  signInAnonymously,
} from "firebase/auth";

@Component({
  tag: "app-login",
  styleUrl: "app-login.css",
})
export class AppLogin {
  @State() authed: boolean = false;
  @State() user: any;

  provider: any;

  async componentWillLoad() {
    this.provider = new GoogleAuthProvider();

    const auth = getAuth();
    useDeviceLanguage(auth);

    // this.provider.useDeviceLanguage();
  }

  async componentDidLoad() {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.user = user;

        this.authed = true;
      }
    });

    try {
      getRedirectResult(auth, (result) => {
        if (result.user) {
          const user = result.user;
          this.user = user;

          this.authed = true;
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  async login() {
    const auth = getAuth();
    signInWithRedirect(auth, this.provider);
  }

  async loginAnon() {
    const auth = getAuth();
    signInAnonymously(auth)
  }

  render() {
    return (
      <div>
        {this.authed === false ? (
          <div id="login-actions">
              <ion-button onClick={() => this.login()}>
                Login with Google
              </ion-button>

              <ion-button part="visiting" id="visiting" onClick={() => this.loginAnon()}>Just Visiting 😊</ion-button>
          </div>
        ) : (
          <div id="loggedInDiv">
            <ion-button href="/settings" fill="clear">
              <img src={this.user.photoURL}></img>
            </ion-button>
          </div>
        )}
      </div>
    );
  }
}
