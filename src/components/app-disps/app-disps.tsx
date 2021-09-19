import { Component, h, Prop } from "@stencil/core";
import { getDisps } from "../../services/storage";

@Component({
  tag: "app-disps",
  styleUrl: "app-disps.css",
})
export class AppDisps {
  @Prop() disps: any[] | null;

  async componentDidLoad() {
    this.disps = await getDisps();
    console.log(this.disps);
  }

  async dispDetail(name) {
    const router = document.querySelector("ion-router");
    await router.push(`/shops/${name}`, "forward");
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-title>Coffee Shops</ion-title>
        </ion-toolbar>
      </ion-header>,
      <ion-content class="ion-padding">
        <ion-list>
          {this.disps
            ? this.disps.map((disp) => {
                return (
                  <ion-card onClick={() => this.dispDetail(disp.name)}>
                    <ion-card-header>
                      <ion-card-subtitle>
                        {disp.address.streetAddress}
                      </ion-card-subtitle>
                      <ion-card-title>{disp.name}</ion-card-title>
                    </ion-card-header>

                    <ion-item lines="none">
                      <ion-buttons slot="end">
                        <ion-button
                          color="primary"
                          onClick={() => this.dispDetail(disp.name)}
                        >
                          Details
                        </ion-button>
                      </ion-buttons>
                    </ion-item>
                  </ion-card>
                );
              })
            : null}
        </ion-list>
      </ion-content>,
    ];
  }
}
