import { Component, h, State } from "@stencil/core";

import {
  modalController,
  alertController,
} from "@ionic/core";

import { getAuth, onAuthStateChanged } from "firebase/auth";

import { deleteCheckin, getMyCheckins } from "../../services/storage";

@Component({
  tag: "app-home",
  styleUrl: "app-home.css",
})
export class AppHome {
  @State() checkins: any[] = null;
  @State() authed: boolean = false;

  async componentDidLoad() {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.authed = true;

        const data: any = await getMyCheckins();

        if (data && data.length > 0) {
          this.checkins = data;
        }
      }
    })
  }

  async checkin() {
    const modal = await modalController.create({
      component: "checkin-camera",
    });
    await modal.present();

    await modal.onDidDismiss();

    console.log("dismissed");

    const data: any = await getMyCheckins();

    if (data) {
      this.checkins = data;
      console.log(this.checkins);
    }
  }

  async postDetail(id) {
    const router = document.querySelector("ion-router");
    await router.push(`/${id}`, 'forward');
  }

  async deleteItem(event, post) {
    const alert = await alertController.create({
      header: "Delete",
      message: "Are you sure you want to delete this checkin?",
      backdropDismiss: false,
      buttons: [
        {
          text: "No",
          role: "cancel",
          cssClass: "secondary",
          handler: async () => {},
        },
        {
          text: "Yes",
          cssClass: "ion-color ion-color-danger",
          handler: async () => {
            console.log("Confirm Ok");

            await deleteCheckin(post.postID);
            await alert.dismiss();

            const data: any = await getMyCheckins();

            if (data) {
              this.checkins = data;
              console.log(this.checkins);
            }
          },
        },
      ],
    });

    await alert.present();

    event.preventDefault();

    console.log(post.postID);

    event.preventDefault();
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>CoffeeDex</ion-title>

          <ion-buttons slot="end">
            <app-login id="header-login"></app-login>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,

      <ion-content>
        {this.checkins ? (
          <ion-list id="checkinList" lines="none">
            {this.checkins.map((checkin) => {
              let stars = [];

              for (let i = 1; i <= checkin.rating; i++) {
                stars.push({});
              }

              return (
                <ion-card>
                  <img
                    onClick={() => this.postDetail(checkin.postID)}
                    src={checkin.image || "/assets/leaf.svg"}
                    alt={checkin.name}
                  ></img>
                  <ion-card-header
                    onClick={() => this.postDetail(checkin.postID)}
                  >
                    <ion-card-subtitle>
                      From:{" "}
                      {checkin.shop
                        ? checkin.shop.name
                        : checkin.brand}
                    </ion-card-subtitle>
                    <ion-card-title>{checkin.name}</ion-card-title>
                  </ion-card-header>

                  <ion-card-content
                    onClick={() => this.postDetail(checkin.postID)}
                  >
                    <ion-text text-wrap>
                      {checkin.comments || "No Comments"}
                    </ion-text>
                  </ion-card-content>

                  <ion-item
                    lines="none"
                    onClick={() => this.postDetail(checkin.postID)}
                  >
                    <ion-label>Roast: {checkin.roast}</ion-label>
                  </ion-item>

                  <ion-item
                    lines="none"
                    onClick={() => this.postDetail(checkin.postID)}
                  >
                    <ion-label id="ratingLabel">
                      Rating:{" "}
                      <span id="starsSpan">
                        {stars.map(() => {
                          return <ion-icon name="star"></ion-icon>;
                        })}
                      </span>
                    </ion-label>
                  </ion-item>

                  <ion-item
                    lines="none"
                    onClick={() => this.postDetail(checkin.postID)}
                  >
                    <ion-label>Likes: {checkin.likes.length}</ion-label>
                  </ion-item>

                  <ion-item>
                    <ion-buttons slot="end">
                      <ion-button
                        onClick={(event) => this.deleteItem(event, checkin)}
                        color="danger"
                      >
                        Delete
                        <ion-icon slot="end" name="trash-outline"></ion-icon>
                      </ion-button>

                      <ion-button
                        color="primary"
                        onClick={() => this.postDetail(checkin.postID)}
                      >
                        Details
                      </ion-button>
                    </ion-buttons>
                  </ion-item>
                </ion-card>
              );
            })}
          </ion-list>
        ) : (
          <div id="introSection">
            <img id="introImg" src="/assets/leaf.svg" alt="intro image"></img>

            <p>
              Start checking in your favorite Coffees! Share you favorite coffee you recently tried
              with your friends!
            </p>

            <app-login></app-login>
          </div>
        )}

        {this.authed ? (
          <ion-fab
            id="checkinButton"
            vertical="bottom"
            horizontal="end"
            slot="fixed"
          >
            <ion-fab-button onClick={() => this.checkin()}>
              <ion-icon name="add"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        ) : null}
      </ion-content>,
    ];
  }
}
