import { Component, Element, h, State } from '@stencil/core';
import { loadingController, alertController, toastController } from '@ionic/core';

// import { removeDuplicates } from '../../utils.worker';
import { getCheckins, likeACheckin } from '../../services/storage';
import { getAuth } from '@firebase/auth';

declare var firebase: any;

@Component({
  tag: 'near-me',
  styleUrl: 'near-me.css'
})
export class NearMe {

  @Element() el: HTMLElement;

  @State() posts: any[];
  @State() map: any;

  @State() currentUser: any;

  filterValue: string = "roast";

  async componentDidLoad() {
    const loading = await loadingController.create({
      message: 'Loading...'
    });
    await loading.present();

    const auth = getAuth();
    this.currentUser = auth.currentUser;

    try {
      await this.getData();
    }
    catch {
      await loading.dismiss();
    }

    await loading.dismiss();
  }

  async getData() {
    /*return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await fetch('https://marydex-server.azurewebsites.net/getcheckins', {
            method: "POST",
            body: JSON.stringify({
              loco: {
                lat: position.coords.latitude,
                long: position.coords.longitude
              }
            }),
            headers: {
              "Content-Type": "application/json"
            }
          });
          const data: any[] = await response.json();
          console.log(data);

          const cleanedArray = await removeDuplicates([...data], (val) => val._id);

          console.log('cleanedArray', cleanedArray);

          this.posts = cleanedArray;

          resolve();

        }
        catch (err) {
          console.error(err);
          reject(err);
        }
      });
    })*/

    const data = await getCheckins();
    console.log('near me data', data);

    this.posts = data;
  }

  handleRefresh() {
    console.log('called');
    const refresh = this.el.querySelector('ion-refresher');

    refresh.addEventListener('ionRefresh', async () => {
      await this.getData();
      await refresh.complete();
    })
  }

  async postDetail(id) {
    console.log(id);

    const router = document.querySelector("ion-router");
    await router.push(`/near/${id}`, 'forward');
  }

  async doSearch(event) {
    console.log(event);
    let searchValue: string = event.detail.value;

    let posts: any[] = (await getCheckins() as any);
    console.log('posts', posts);

    let searchPosts = [];

    posts.forEach((post) => {
      console.log(this.filterValue);

      if (this.filterValue === "foast") {
        if (post.roast.toLowerCase().includes(searchValue.toLowerCase())) {
          searchPosts.push(post);
        }
      }
      else if (this.filterValue === "brand") {
        if (post.brand.toLowerCase().includes(searchValue.toLowerCase())) {
          searchPosts.push(post);
        }
      }
      else if (this.filterValue === "comments") {
        if (post.comments.toLowerCase().includes(searchValue.toLowerCase())) {
          searchPosts.push(post);
        }
      }
    });

    if (searchPosts.length > 0) {
      (window as any).requestIdleCallback(() => {
        this.posts = searchPosts;
      })
    }
    else {
      await this.getData();
    }
  }

  async chooseFilter() {
    const alert = await alertController.create({
      header: "Filter",
      inputs: [
        {
          type: 'radio',
          label: 'Roast',
          value: 'roast',
          checked: this.filterValue === "roast" ? true : false
        },
        {
          type: 'radio',
          label: 'shop',
          value: 'brand',
          checked: this.filterValue === "brand" ? true : false
        },
        {
          type: 'radio',
          label: 'Comments',
          value: 'comments',
          checked: this.filterValue === "comments" ? true : false
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Confirm Cancel')
          }
        }, {
          text: 'Confirm',
          handler: (data) => {
            console.log('Confirm Ok', data);
            if (data) {
              this.filterValue = data;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async refresh(event?) {

    if (!event) {
      const loading = await loadingController.create({
        message: "Refreshing..."
      });
      await loading.present();

      await this.getData();

      await loading.dismiss();
    }
    else {
      await this.getData();
      event.detail.complete();
    }
  }

  async like(id) {
    try {
      await likeACheckin(id);

      (window as any).requestIdleCallback(async () => {
        await this.getData();
      }, {
        timeout: 2000
      });
    }
    catch (err) {
      const toast = await toastController.create({
        message: "Couldnt like post, try again later",
        duration: 3000
      });
      await toast.present();
    }
  }

  render() {
    return [
      <ion-header no-border>
        <ion-toolbar>
          <ion-title>Community</ion-title>

          <ion-buttons slot="end">
            <ion-button onClick={() => this.refresh()} fill="clear">
              <ion-icon name="reload"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,

      <ion-content>
        <ion-refresher slot="fixed" id="refresher" onIonRefresh={(event) => this.refresh(event)}>
          <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <ion-toolbar id="desktopSearch">
          <ion-searchbar onIonChange={(event) => this.doSearch(event)} placeholder="Dark Roast..."></ion-searchbar>

          <ion-buttons slot="end">
            <ion-button onClick={() => this.chooseFilter()} fill="clear">
              <ion-icon name="ellipsis-vertical-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>

        <ion-list id="nearMeList" lines="none">
          {this.posts ?
            this.posts.map((post) => {
              return (
                <ion-item>
                  <ion-avatar slot="start">
                    <img src={post.image}></img>
                  </ion-avatar>
                  <ion-label>
                    <h2>{post.name}</h2>
                    <h4>Roast: {post.roast}, Shop: {post.shop ? post.shop.name : post.brand}</h4>

                    {this.currentUser && post.likes ? <ion-item>
                      <ion-buttons slot="end">
                        <ion-button disabled={(post.likes as any[]).includes(this.currentUser.photoURL)} color="warning" onClick={() => this.like(post.postID)}>
                          {post.likes.length}
                          <ion-icon name="star" slot="start"></ion-icon>
                        </ion-button>

                        <ion-button color="primary" onClick={() => this.postDetail(post.postID)}>
                          Details
                        </ion-button>
                      </ion-buttons>
                    </ion-item> : null}

                  </ion-label >

                </ion-item>
              )
            })
            : <div id="noData">
              <h3>No Data</h3>

              <app-login></app-login>
            </div>}
        </ion-list>
      </ion-content>,

      <ion-footer id="searchFooter">
        <ion-toolbar>
          <ion-searchbar onIonChange={(event) => this.doSearch(event)} placeholder="Dark Roast..."></ion-searchbar>

          <ion-buttons slot="end">
            <ion-button onClick={() => this.chooseFilter()} fill="clear">
              <ion-icon name="ellipsis-vertical-outline"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-footer>
    ]
  }
}
