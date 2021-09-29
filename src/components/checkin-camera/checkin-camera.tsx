import { Component, Element, h, Listen, State } from "@stencil/core";

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

import { getAnalytics, logEvent } from "firebase/analytics";

import {
  modalController,
  toastController,
  loadingController,
} from "@ionic/core";

// import { maybeInstantiateStreaming } from '../../helpers/utils';
// import { get, set } from 'idb-keyval';

import { rotateImage, rotateImageOffscreen } from "../../rotate.worker";
import { addCheckin, addChosenDisp } from "../../services/storage";
import { search } from "../../services/location";
import { fileOpen } from "browser-nativefs";
import { getAuth } from "@firebase/auth";

declare var ImageCapture: any;

declare var firebase: any;

@Component({
  tag: "checkin-camera",
  styleUrl: "checkin-camera.css",
})
export class CheckinCamera {
  stream: MediaStream;
  imageCapture: any;
  worker: any;

  @Element() el: HTMLElement;

  @State() imageBlob: Blob;
  @State() ready: boolean = false;
  @State() rotated: boolean = false;

  @State() places: any[] = null;

  @State() chosenDisp: string | null = null;

  @State() dispLoading: boolean = false;

  @State() mediaStreamTrack: MediaStreamTrack | null = null;

  async componentDidLoad() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "environment",
      },
    });

    const videoEl = document.querySelector("video");

    if (videoEl) {
      videoEl.srcObject = this.stream;
      videoEl.play();
    }

    this.mediaStreamTrack = this.stream.getVideoTracks()[0];

    if (this.mediaStreamTrack) {
      this.imageCapture = new ImageCapture(this.mediaStreamTrack);
    }

    this.ready = true;

    const toast = await toastController.create({
      message: "Point at a product and press the button",
      position: "top",
      duration: 1200,
    });
    await toast.present();

    history.pushState({ modal: true }, null);
  }

  @Listen("popstate", { target: "window" })
  async handleHardwareBackbutton(_e: PopStateEvent) {
    await this.cancel();
  }

  async takePic() {
    console.log("hello world");
    const blob = await this.imageCapture.takePhoto();
    console.log(blob);

    this.imageBlob = blob;
  }

  cancel() {
    modalController.dismiss();
  }

  async uploadImage(imageBlob: Blob) {
    const storage = getStorage();

    // Create a storage reference from our storage service
    const storageRef = ref(storage);

    // const imageRef = storageRef.child(`${Math.random().toString()}`);
    const imageRef = ref(storageRef, `${Math.random().toString()}`);

    console.log('imageRef', imageRef);

    await uploadBytes(imageRef, imageBlob)

    let imageURL;

    try {
      imageURL = await getDownloadURL(imageRef);
      console.log('imageURL', imageURL);
    }
    catch(err) {
      console.error(err);
    }

    return imageURL;
  }

  async checkIN() {
    const loading = await loadingController.create({
      message: "Checking in...",
    });
    await loading.present();

    const prodName = (this.el.querySelector(
      "#productName input"
    ) as HTMLInputElement).value;
    //  const shop = (this.el.querySelector("#brandName input") as HTMLInputElement).value;
    const roast = (this.el.querySelector(
      "#roastSelect"
    ) as any).value;
    const type = (this.el.querySelector("#typeSelect") as any).value;
    const rating = (this.el.querySelector("#rating") as any).value;
    const comments = (this.el.querySelector("#comments") as HTMLInputElement)
      .value;

    const auth = getAuth();
    const user = auth.currentUser;
    console.log(user);

    let imageURL;

    if (user) {
      imageURL = await this.uploadImage(this.imageBlob);
      console.log("imageURL", imageURL);
    } else {
      imageURL = URL.createObjectURL(this.imageBlob);
    }

    console.log("chosenDisp", this.chosenDisp);

    if (this.chosenDisp) {
      await addChosenDisp(this.chosenDisp);
    }

    const newCheckin = {
      postID: Math.floor(Math.random() * 1000).toString(),
      name: prodName,
      rating: rating,
      comments: comments,
      shop: this.chosenDisp,
      roast: roast,
      type: type,
      image: imageURL,
      user: user ? { name: user.displayName, photo: user.photoURL } : null,
      likes: [],
    };

    console.log(newCheckin);

    await addCheckin(newCheckin);

    const analytics = getAnalytics();
    logEvent(analytics, 'actual_checkin');

    await loading.dismiss();

    this.cancel();
  }

  async rotate() {
    const toast = await toastController.create({
      message: "rotating...",
    });
    await toast.present();

    if ((window as any).OffscreenCanvas) {
      console.log("doing offscreen");
      const im: HTMLImageElement = this.el.querySelector("#productImage");

      const image = new Image(im.width, im.height);
      image.src = im.src;

      const imdata = await window.createImageBitmap(image);

      const blob = await rotateImageOffscreen(im.width, im.height, imdata);

      this.imageBlob = blob;
      im.src = URL.createObjectURL(blob);

      setTimeout(async () => {
        await toast.dismiss();
      }, 800);
    } else {
      const im: HTMLImageElement = this.el.querySelector("#productImage");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = im.width;
      canvas.height = im.height;

      ctx.drawImage(im, 0, 0, im.width, im.height);

      const resultData = await rotateImage(
        ctx.getImageData(0, 0, im.width, im.height).data,
        im.width,
        im.height
      );

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.putImageData(
        new ImageData(resultData, canvas.height, canvas.width),
        im.width / 8,
        0
      );

      canvas.toBlob(async (blob) => {
        this.imageBlob = blob;

        im.src = URL.createObjectURL(blob);

        setTimeout(async () => {
          await toast.dismiss();
        }, 800);
      });
    }

    this.rotated = true;
  }

  async handleShop(queryObject: any) {
    console.log(queryObject.value);

    this.dispLoading = true;

    if (queryObject.value) {
      try {
        // const results = await searchDisps(queryObject.value);
        const results = await search(queryObject.value);
        if (results) {
          this.dispLoading = false;

          this.places = [...results];
          console.log("this.places", this.places);
        } else {
          this.dispLoading = false;
        }
      } catch (err) {
        this.dispLoading = false;
        console.error(err, err.message);
      }
    }
  }

  chooseShop(place) {
    const shop = this.el.querySelector(
      "#brandName input"
    ) as HTMLInputElement;
    shop.value = place.name;

    this.chosenDisp = place;

    this.places = null;
  }

  async rotateButton() {
    let constraints = this.mediaStreamTrack.getConstraints();

    if (constraints) {
      if (constraints.facingMode === "environment") {
        this.mediaStreamTrack.applyConstraints({
          facingMode: "user",
        });
      } else {
        this.mediaStreamTrack.applyConstraints({
          facingMode: "environment",
        });
      }
    }
  }

  async openPhotos() {
    const options = {
      mimeTypes: ["image/*"],
      extensions: [".png", ".jpg", ".jpeg", ".webp"],
      multiple: false,
      description: "Image files",
    };

    const blob = await fileOpen(options);

    if (blob) {
      this.imageBlob = blob as Blob;
    }
  }

  disconnectedCallback() {
    const tracks = this.stream.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
  }

  render() {
    return [
      this.imageBlob ? (
        <div id="dataEntry">
          <div id="dataHeader">
            <h3>New Check-in</h3>

            <ion-button
              onClick={() => this.cancel()}
              color="danger"
              fill="clear"
              size="small"
            >
              <ion-icon name="close"></ion-icon>
            </ion-button>
          </div>

          <img
            id="productImage"
            src={URL.createObjectURL(this.imageBlob)}
          ></img>

          <div id="rotateBar">
            <ion-button
              disabled={this.rotated}
              onClick={() => this.rotate()}
              fill="clear"
              size="small"
              id="rotateButton"
            >
              <ion-icon name="brush-outline" slot="start"></ion-icon>
              Rotate
            </ion-button>
          </div>

          <ion-item>
            <ion-label position="stacked">Name</ion-label>
            <ion-input id="productName" type="text"></ion-input>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Coffee Shop</ion-label>
            <ion-input
              debounce={500}
              onIonChange={(event) => this.handleShop(event.target)}
              id="brandName"
              type="text"
            ></ion-input>
          </ion-item>

          {this.dispLoading ? (
            <ion-progress-bar type="indeterminate"></ion-progress-bar>
          ) : this.places ? (
            <ul id="placesList">
              {this.places.map((place) => {
                return (
                  <li onClick={() => this.chooseShop(place)}>{place.name}</li>
                );
              })}
            </ul>
          ) : null}

          <ion-item>
            <ion-label>Roast</ion-label>
            <ion-select id="roastSelect" placeholder="Dark">
              <ion-select-option value="Dark">Dark</ion-select-option>
              <ion-select-option value="Medium">Medium</ion-select-option>
              <ion-select-option value="Light">Light</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label>Country of Origin</ion-label>
            <ion-select id="typeSelect" placeholder="Brazil">
              <ion-select-option value="Brazil">Brazil</ion-select-option>
              <ion-select-option value="Ethiopia">Ethiopia</ion-select-option>
              <ion-select-option value="Colombia">Colombia</ion-select-option>
              <ion-select-option value="Vietnam">Vietnam</ion-select-option>
              <ion-select-option value="Indoensia">Indonesia</ion-select-option>
              <ion-select-option value="Honduras">Honduras</ion-select-option>
              <ion-select-option value="India">India</ion-select-option>
            </ion-select>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Description and tasting notes</ion-label>
            <ion-textarea id="comments"></ion-textarea>
          </ion-item>

          <ion-item>
            <ion-label position="stacked">Rating</ion-label>
            <ion-range
              id="rating"
              min={1}
              max={5}
              step={1}
              snaps={true}
              pin={true}
            ></ion-range>
          </ion-item>

          <div id="checkinButtonWrapper">
            <ion-button
              id="checkinButton"
              expand="block"
              onClick={() => this.checkIN()}
            >
              Check In
            </ion-button>
          </div>
        </div>
      ) : null,

      <ion-header no-border>
        <ion-toolbar>
          <ion-buttons slot="end">
            {!this.imageBlob ? (
              <ion-button
                fill="clear"
                color="danger"
                onClick={() => this.cancel()}
              >
                cancel
              </ion-button>
            ) : null}
          </ion-buttons>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <video autoplay></video>

        {this.ready ? (
          <ion-fab vertical="bottom" horizontal="center" slot="fixed">
            <ion-fab-button onClick={() => this.takePic()}>
              <ion-icon name="aperture-outline"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        ) : null}

        {this.ready ? (
          <ion-button
            onClick={() => this.rotateButton()}
            id="rotateCameraButton"
            fill="clear"
          >
            <ion-icon name="refresh-circle-outline"></ion-icon>
          </ion-button>
        ) : null}

        {this.ready ? (
          <ion-button
            onClick={() => this.openPhotos()}
            id="openPhotosButton"
            fill="clear"
          >
            <ion-icon name="images-outline"></ion-icon>
          </ion-button>
        ) : null}
      </ion-content>,
    ];
  }
}
