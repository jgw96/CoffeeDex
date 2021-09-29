import { Component, h } from "@stencil/core";

import { initializeApp } from 'firebase/app';

import { getAnalytics, logEvent } from "firebase/analytics";

@Component({
  tag: "app-root",
  styleUrl: "app-root.css",
})
export class AppRoot {

  async componentWillLoad() {
    const firebaseConfig = {
      apiKey: "AIzaSyCzU4nYZIUNclE1YsHxHy-AYO1RcSidAPc",
      authDomain: "coffeedex-ba785.firebaseapp.com",
      projectId: "coffeedex-ba785",
      storageBucket: "coffeedex-ba785.appspot.com",
      messagingSenderId: "218173067706",
      appId: "1:218173067706:web:7f1a6efdcb49bc90c1cd83",
      measurementId: "G-7H7JZHE6LS"
    };

    await initializeApp(firebaseConfig);

    const analytics = getAnalytics();
    logEvent(analytics, 'app_initialized');
  }

  render() {
    return (
      <ion-app>
        <ion-router useHash={false}>
          <ion-route url="/" component="tab-home">
            <ion-route component="app-home"></ion-route>
            <ion-route url="/:postID" component="post-detail"></ion-route>
            <ion-route url="/shop/:name" component="disp-detail"></ion-route>
          </ion-route>
          <ion-route url="/near" component="tab-near">
            <ion-route component="near-me"></ion-route>
            <ion-route url="/:postID" component="post-detail"></ion-route>
            <ion-route url="/neardispensary/:name" component="disp-detail"></ion-route>
          </ion-route>
          <ion-route url="/shops" component="tab-disps">
            <ion-route component="app-disps"></ion-route>
            <ion-route url="/:name" component="disp-detail"></ion-route>
          </ion-route>

          <ion-route url="/faves" component="tab-faves" />
          <ion-route url="/settings" component="tab-settings" />
        </ion-router>

        <ion-tabs>
          <ion-tab tab="tab-home">
            <ion-nav></ion-nav>
          </ion-tab>

          <ion-tab tab="tab-near">
            <ion-nav></ion-nav>
          </ion-tab>

          <ion-tab tab="tab-disps">
            <ion-nav></ion-nav>
          </ion-tab>

          <ion-tab tab="tab-faves" component="app-faves"></ion-tab>

          <ion-tab tab="tab-settings" component="app-settings"></ion-tab>

          <ion-tab-bar slot="bottom">
            <ion-tab-button tab="tab-home">
              <ion-icon name="home-outline"></ion-icon>
              <ion-label>check-ins</ion-label>
            </ion-tab-button>

            <ion-tab-button tab="tab-near">
              <ion-icon name="people-outline"></ion-icon>
              <ion-label>Community</ion-label>
            </ion-tab-button>

            <ion-tab-button tab="tab-disps">
              <ion-icon name="business-outline"></ion-icon>
              <ion-label>Coffee Shops</ion-label>
            </ion-tab-button>

            <ion-tab-button tab="tab-settings">
              <ion-icon name="person-outline"></ion-icon>
              <ion-label>Profile</ion-label>
            </ion-tab-button>
          </ion-tab-bar>
        </ion-tabs>
      </ion-app>
    );
  }
}
