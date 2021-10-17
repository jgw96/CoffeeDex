import { Component, h, State } from "@stencil/core";

import { get } from "idb-keyval";
import { getMyCheckins } from "../../services/storage";

import "@pwabuilder/pwainstall";
import { getAuth, signOut } from "@firebase/auth";

declare var firebase: any;

@Component({
  tag: "app-settings",
  styleUrl: "app-settings.css",
})
export class AppSettings {
  @State() user: any;
  @State() checkins: any = [];
  @State() faves: any[] = [];

  async componentWillLoad() {
    const auth = getAuth();
    this.user = auth.currentUser;
    console.log('user', this.user);

    const data = await getMyCheckins();

    if (data) {
      this.checkins = data;
    }

    const favesData: any[] = await get("faves");

    if (favesData) {
      this.faves = favesData;
    }
  }

  async logout() {
    const auth = getAuth();
    await signOut(auth);

    const nav: HTMLIonRouterElement = document.querySelector("ion-router");
    await nav.back();

    setTimeout(() => {
      location.reload();
    }, 500);
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Profile</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content>
        <div id="content">
          <h2 id="username">Hello {this.user.displayName}!</h2>

          <ion-list id="settingsList" lines="none">
            <ion-item>
              <ion-label>
                <ion-text color="primary"># of checkins: </ion-text>{" "}
                {this.checkins.length}
              </ion-label>
            </ion-item>
          </ion-list>

          <pwa-install>Install CoffeeDex</pwa-install>

          <div id="setActions">
            <ion-button expand="block" onClick={() => this.logout()}>
              Logout
            </ion-button>
          </div>
        </div>
      </ion-content>,
    ];
  }
}
