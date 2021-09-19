import { Component, h, Prop, State } from "@stencil/core";
import { toastController } from "@ionic/core";

import { getACheckin, addFavorite } from "../../services/storage";

@Component({
  tag: "post-detail",
  styleUrl: "post-detail.css",
})
export class PostDetail {
  @Prop() postID: string;
  @Prop() localID: string;

  @State() post: any = {};
  @State() near_test: boolean = false;

  async componentWillLoad() {
    console.log(this.postID);

    const data: any = await getACheckin(this.postID || this.localID);
    console.log(data);

    if (data) {
      if (location.href.includes('near') === true) {
        this.near_test = true;
      }

      this.post = data;
    }
  }

  async fave() {
    await addFavorite(this.post);

    const toast = await toastController.create({
      message: "Favorited!",
      duration: 1300,
    });
    await toast.present();
  }

  async share() {
    console.log("share", this.post);

    if ((navigator as any).share) {
      await (navigator as any).share({
        title: "coffeedex",
        text: "Check out this product I found",
        url: `https://coffeedex-app.web.app/${this.post.postID}`,
      });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(
        `https://coffeedex-app.web.app/${this.post.postID}`
      );

      const toast = await toastController.create({
        message: "URL copied for sharing",
        duration: 1300,
      });
      await toast.present();
    }
  }

  async goToDisp(disp) {
    const router = document.querySelector("ion-router");

    if (location.href.includes('near')) {
      await router.push(`/near/neardispensary/${disp.name}`, "forward");
    }
    else {
      await router.push(`/shop/${disp.name}`, "forward");
    }
  }

  async close() {
    const router = document.querySelector("ion-router");
    console.log(window.history);
    await router.back();
  }

  render() {
    return [
      <ion-header no-border>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-back-button></ion-back-button>
          </ion-buttons>

          <ion-buttons id="headerButtons" slot="end">
            <ion-button
              onClick={() => this.fave()}
              color="secondary"
              id="detailFave"
              shape="round"
            >
              Favorite <ion-icon slot="end" name="star-outline"></ion-icon>
            </ion-button>
            <ion-button
              onClick={() => this.share()}
              color="primary"
              id="detailShare"
              shape="round"
            >
              Share <ion-icon slot="end" name="share-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      <ion-content class="ion-padding">
        <div>
          <img id="detailImg" src={this.post.image} alt="post image"></img>

          <div>
            <h2>{this.post.name}</h2>

            {
              this.near_test === true ? <h4 id="poster">Posted by {this.post.user.name}</h4> : null
            }

            <ion-button
              onClick={() => this.goToDisp(this.post.shop)}
              expand="block"
              id="find-shop"
            >
              Find Shop
            </ion-button>

            <p>{this.post.comments || "No Comments"}</p>

            <ion-item id="detailItem" lines="none">
              <ion-icon
                color="primary"
                name="ice-cream-outline"
                slot="start"
              ></ion-icon>
              <ion-label>Roast: {this.post.roast}</ion-label>
            </ion-item>

            <ion-item id="detailItem" lines="none">
              <ion-icon color="primary" name="star" slot="start"></ion-icon>
              <ion-label>Likes: {this.post.likes.length}</ion-label>
            </ion-item>
          </div>
        </div>
      </ion-content>,

      <ion-footer no-border>
        <ion-toolbar>
          <ion-buttons slot="end">
            <ion-button
              onClick={() => this.share()}
              color="tertiary"
              id="detailShare"
              shape="round"
            >
              Share <ion-icon slot="end" name="share-outline"></ion-icon>
            </ion-button>
            <ion-button
              onClick={() => this.fave()}
              color="primary"
              id="detailFave"
              shape="round"
            >
              Favorite <ion-icon slot="end" name="star-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-footer>,
    ];
  }
}
