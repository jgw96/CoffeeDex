import { Component, h, State } from '@stencil/core';

import { getFavorites } from '../../services/storage';


@Component({
  tag: 'app-faves',
  styleUrl: 'app-faves.css'
})
export class AppFaves {

  @State() posts: any[];

  async componentDidLoad() {
    const data: any[] = await getFavorites();

    if (data) {
      this.posts = data;
    }
  }

  async refresh() {
    const data: any[] = await getFavorites();

    if (data) {
      this.posts = data;
    }
  }

  render() {
    return [
      <ion-header no-border>
        <ion-toolbar>
          <ion-title>My Favorites</ion-title>

          <ion-buttons slot="end">
            <ion-button fill="clear" onClick={() => this.refresh()}>
              <ion-icon name="reload"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,

      <ion-content>
        <ion-list id="favesList" lines="none">
          {this.posts ?
            this.posts.map((checkin) => {
              return (
                <ion-card>
                  <img src={checkin.image || '/assets/leaf.svg'} alt={checkin.name}></img>
                  <ion-card-header>
                    <ion-card-subtitle>From: {checkin.shop ? checkin.shop.name : checkin.brand}</ion-card-subtitle>
                    <ion-card-title>{checkin.name}</ion-card-title>
                  </ion-card-header>

                  <ion-card-content>
                    <ion-text text-wrap>{checkin.comments || "No Comments"}</ion-text>
                  </ion-card-content>

                  <ion-item lines="none">
                    <ion-icon color="primary" name="ice-cream-outline" slot="start"></ion-icon>
                    <ion-label>Roast: {checkin.roast}</ion-label>
                  </ion-item>
                </ion-card>
              )
            })
            : <div id="noData">
              <h3>No Data</h3>
            </div>}
        </ion-list>
      </ion-content>
    ]
  }
}
