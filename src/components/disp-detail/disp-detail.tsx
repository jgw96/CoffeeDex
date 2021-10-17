import { Component, h, Prop, State } from "@stencil/core";
import { getADisp, getDispCheckins } from "../../services/storage";

@Component({
  tag: "disp-detail",
  styleUrl: "disp-detail.css",
})
export class DispDetail {
  @State() disp: any;
  @State() dispCheckins: any[];

  @Prop() name: string;

  async componentWillLoad() {
    if (this.name) {
      this.disp = await getADisp(this.name);

      this.dispCheckins = await getDispCheckins(this.name);
    }
  }

  async share() {
    if ((navigator as any).share) {
      await (navigator as any).share({
        title: "CoffeeDex",
        text: "Check out this shop I found",
        url: this.disp.url,
      });
    }
  }

  navigate() {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${this.disp.address.streetAddress}`
    );
  }

  async postDetail(id) {
    const router = document.querySelector("ion-router");
    await router.push(`/${id}`, "forward");
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
        {this.disp ? (
          <div id="dispDetailContent">
            <h2>{this.disp.name}</h2>

            <ion-item lines="none">
              <ion-label>
                Website: <a href={this.disp.url}>{this.disp.url}</a>
              </ion-label>
            </ion-item>

            <ion-item lines="none">
              <ion-label>Phone: {this.disp.telephone}</ion-label>
            </ion-item>
          </div>
        ) : null}

        {this.dispCheckins ? (
          <div>
            <h4 id="checkinHeader">Checkins from {this.disp.name}</h4>
            <ion-list id="shop-checkin-list">

              {this.dispCheckins.map((checkin) => {
                let stars = [];

                for (let i = 1; i <= checkin.rating; i++) {
                  stars.push({});
                }

                return (
                  <ion-card>
                    <img
                      onClick={() => this.postDetail(checkin.postID)}
                      src={checkin.image || "/assets/coffee.svg"}
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
          </div>
        ) : null}
      </ion-content>,

      <ion-footer no-border>
        <ion-toolbar>
          <ion-buttons slot="end">
            <ion-button
              onClick={() => this.share()}
              color="tertiary"
              id="detailShare"
            >
              Share <ion-icon slot="end" name="share-outline"></ion-icon>
            </ion-button>
            <ion-button onClick={() => this.navigate()} color="primary">
              Navigate To <ion-icon slot="end" name="map-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-footer>,
    ];
  }
}
