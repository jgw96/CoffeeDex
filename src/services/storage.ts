import { set, get } from "idb-keyval";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { getAuth } from "firebase/auth";

// declare var firebase: any;

const db = getFirestore();

export async function addChosenDisp(disp: any) {
  if (db) {
    try {
      // await db.collection('disps').doc(disp.name).set(disp);
      await setDoc(doc(db, "disps", disp.name), disp);
    } catch (err) {
      console.error(err);
    }
  }
}

export async function addCheckin(checkin) {
  console.log(checkin);

  if (db) {
    try {
      // await db.collection('checkins').add(checkin);
      await addDoc(collection(db, "checkins"), checkin);
    } catch (err) {
      console.error(err);

      // try locally
      let checkins: any[] = await get("localcheckins");

      if (checkins) {
        await set("localcheckins", [...checkins, checkin]);
      } else {
        await set("localcheckins", [checkin]);
      }
    }
  } else {
    let checkins: any[] = await get("localcheckins");

    if (checkins) {
      await set("localcheckins", [...checkins, checkin]);
    } else {
      await set("localcheckins", [checkin]);
    }
  }
}

export async function getDisps() {
  //  const querySnapshot = await db.collection('disps').limit(50).get();
  const querySnapshot = await getDocs(collection(db, "disps"));
  let disps = [];

  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    console.log(doc.id, " => ", doc.data());
    disps.push(doc.data());
  });

  return disps;
}

export async function getCheckins() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const citiesRef = collection(db, "checkins");
    const q = query(citiesRef, where("user.photo", "!=", user.photoURL));

    const querySnapshot = await getDocs(q);
    let checkins = [];

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      checkins.push(doc.data());
    });

    return checkins;
  }
}

export async function getMyCheckins() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    console.log(user);

    const citiesRef = collection(db, "checkins");

    const q = query(citiesRef, where("user.photo", "==", user.photoURL));

    let checkins = [];

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      checkins.push(doc.data());
    });

    return checkins;
  } else {
    let checkins = await get("localcheckins");

    if (checkins) {
      return checkins;
    }
  }
}

export async function getADisp(name: string) {
  console.log("id", name);
  // const querySnapshot = await db.collection('checkins').where("_id", "==", id).get();
  /*const querySnapshot = await db
    .collection("disps")
    .where("name", "==", name)
    .get();*/

  const citiesRef = collection(db, "disps");

  const q = query(citiesRef, where("name", "==", name));

  const querySnapshot = await getDocs(q);

  console.log("querySnapshot", querySnapshot);

  let disp = null;

  querySnapshot.forEach((doc) => {
    console.log("data", doc.data());
    // doc.data() is never undefined for query doc snapshots
    disp = doc.data();
    console.log(disp);
  });

  return disp;
}

export async function getDispCheckins(name: string) {
  const citiesRef = collection(db, "checkins");

  const q = query(citiesRef, where("shop.name", "==", name));

  const querySnapshot = await getDocs(q);

  console.log("querySnapshot", querySnapshot);

  let checkins = [];

  querySnapshot.forEach((doc) => {
    console.log("disp checkin data", doc.data());
    // doc.data() is never undefined for query doc snapshots
    checkins.push(doc.data());
  });

  console.log("checkins", checkins);

  return checkins;
}

export async function getACheckin(id) {
  console.log("id", id);
  // const querySnapshot = await db.collection('checkins').where("_id", "==", id).get();

  const citiesRef = collection(db, "checkins");

  const q = query(citiesRef, where("postID", "==", id));

  const querySnapshot = await getDocs(q);

  console.log("querySnapshot", querySnapshot);

  let post = null;

  querySnapshot.forEach((doc) => {
    console.log("data", doc.data());
    // doc.data() is never undefined for query doc snapshots
    post = doc.data();
    console.log(post);
  });

  return post;
}

export async function likeACheckin(id) {
  const citiesRef = collection(db, "checkins");

  const q = query(citiesRef, where("postID", "==", id));

  const querySnapshot = await getDocs(q);

  const auth = getAuth();
  const user = auth.currentUser;

  try {
    querySnapshot.forEach(
      async (doc) =>
        await updateDoc(doc.ref, {
          likes: arrayUnion(user.photoURL),
        })
    );
  } catch (err) {
    console.error(err);
  }
}

export async function deleteCheckin(id) {
  try {
    /*const querySnapshot = await db
      .collection("checkins")
      .where("postID", "==", id)
      .get();*/

    const citiesRef = collection(db, "checkins");

    const q = query(citiesRef, where("postID", "==", id));

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      console.log(doc);

      await deleteDoc(doc.ref);
    });
  } catch (err) {
    console.error(err);
  }
}

export async function addFavorite(checkin) {
  console.log(checkin);

  if (db) {
    try {
      await addDoc(collection(db, "favorites"), checkin);
    } catch (err) {
      console.error(err);

      // try locally
      let checkins: any[] = await get("localfavorites");

      if (checkins) {
        await set("localfavorites", [...checkins, checkin]);
      } else {
        await set("localfavorites", [checkin]);
      }
    }
  } else {
    let checkins: any[] = await get("localfavorites");

    if (checkins) {
      await set("localfavorites", [...checkins, checkin]);
    } else {
      await set("localfavorites", [checkin]);
    }
  }
}

export async function getFavorites(): Promise<any> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    console.log(user);

    const citiesRef = collection(db, "favorites");

    const q = query(citiesRef, where("user.photo", "==", user.photoURL));

    const querySnapshot = await getDocs(q);

    let checkins = [];

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      checkins.push(doc.data());
    });

    const citiesRefs = collection(db, "checkins");

    const qs = query(
      citiesRefs,
      where("likes", "array-contains", user.photoURL)
    );

    const querySnapshots = await getDocs(qs);

    querySnapshots.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      checkins.push(doc.data());
    });

    return checkins;
  } else {
    let checkins = await get("localfavorites");

    if (checkins) {
      return checkins;
    }
  }
}
