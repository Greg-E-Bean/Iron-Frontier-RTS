export {};

// ===== Cloud save / accounts (Firebase) =====
// Firebase's SDK is loaded lazily via dynamic import from Google's CDN the
// first time the player opens the Account screen or does a cloud save/load -
// players who never touch this feature never pay for it (no extra network
// request, no bundle weight), matching the rest of this game's "everything
// works offline until you ask for something that needs the network" design.
//
// FIREBASE_CONFIG below is a placeholder. To enable this feature for real:
//  1. Create a free Firebase project at https://console.firebase.google.com
//  2. Enable Authentication -> Sign-in method -> Email/Password (and
//     Anonymous, for guest cloud-saves without signup).
//  3. Enable Firestore Database (production mode is fine).
//  4. Project settings -> General -> Your apps -> add a Web app -> copy the
//     firebaseConfig object it gives you into FIREBASE_CONFIG below. These
//     values are public/client-safe by design (Firebase's real security
//     boundary is Firestore security rules, not hiding this config) - see
//     README or ask for the matching security-rules snippet.
//  5. Add whatever domain you serve this game from (and "localhost" for
//     local testing) under Authentication -> Settings -> Authorized domains.
// Until FIREBASE_CONFIG is filled in, the Account screen shows a clear
// "not configured yet" message instead of failing confusingly.

const FIREBASE_CONFIG = {
  apiKey: "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID",
};
const FIREBASE_SDK_VER = "10.14.1";
const FIREBASE_CDN = "https://www.gstatic.com/firebasejs/" + FIREBASE_SDK_VER;
const CLOUD_SAVE_MAX_BYTES = 900000; // Firestore documents cap out at ~1MiB

function firebaseConfigured() {
  return !!FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith("REPLACE_");
}

let fb: any = null;
let fbLoadPromise: Promise<any> | null = null;
let cloudUser: { uid: string; email: string | null; isAnonymous: boolean } | null = null;
let cloudAuthListeners: ((u: typeof cloudUser) => void)[] = [];

function onCloudAuthChanged(cb: (u: typeof cloudUser) => void) {
  cloudAuthListeners.push(cb);
}

async function ensureFirebase() {
  if (fb) return fb;
  if (!firebaseConfigured()) throw new Error("Cloud save isn't configured yet.");
  if (!fbLoadPromise) {
    fbLoadPromise = (async () => {
      const [appMod, authMod, fsMod] = await Promise.all([
        import(/* webpackIgnore: true */ FIREBASE_CDN + "/firebase-app.js"),
        import(/* webpackIgnore: true */ FIREBASE_CDN + "/firebase-auth.js"),
        import(/* webpackIgnore: true */ FIREBASE_CDN + "/firebase-firestore.js"),
      ]);
      const app = appMod.initializeApp(FIREBASE_CONFIG);
      const auth = authMod.getAuth(app);
      const db = fsMod.getFirestore(app);
      authMod.onAuthStateChanged(auth, (u: any) => {
        cloudUser = u ? { uid: u.uid, email: u.email, isAnonymous: u.isAnonymous } : null;
        cloudAuthListeners.forEach((cb) => { try { cb(cloudUser); } catch (e) {} });
      });
      fb = { app, auth, db, authMod, fsMod };
      return fb;
    })();
  }
  return fbLoadPromise;
}

function cloudCurrentUser() {
  return cloudUser;
}

async function cloudSignUp(email: string, password: string) {
  const { auth, authMod } = await ensureFirebase();
  const cred = await authMod.createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}
async function cloudSignIn(email: string, password: string) {
  const { auth, authMod } = await ensureFirebase();
  const cred = await authMod.signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}
async function cloudSignInGuest() {
  const { auth, authMod } = await ensureFirebase();
  const cred = await authMod.signInAnonymously(auth);
  return cred.user;
}
async function cloudSignOut() {
  const { auth, authMod } = await ensureFirebase();
  await authMod.signOut(auth);
}

async function cloudSaveSlot(n: number, data: any) {
  const { db, fsMod } = await ensureFirebase();
  if (!cloudUser) throw new Error("Not signed in");
  const json = JSON.stringify(data);
  if (json.length > CLOUD_SAVE_MAX_BYTES) throw new Error("Save is too large for cloud sync (try a smaller/simpler map).");
  await fsMod.setDoc(fsMod.doc(db, "users", cloudUser.uid, "saves", "slot" + n), { data: json, savedAt: Date.now() });
}
async function cloudLoadSlot(n: number) {
  const { db, fsMod } = await ensureFirebase();
  if (!cloudUser) throw new Error("Not signed in");
  const snap = await fsMod.getDoc(fsMod.doc(db, "users", cloudUser.uid, "saves", "slot" + n));
  if (!snap.exists()) return null;
  return JSON.parse(snap.data().data);
}
async function cloudListSaves(): Promise<Record<number, number>> {
  const { db, fsMod } = await ensureFirebase();
  if (!cloudUser) return {};
  const snaps = await fsMod.getDocs(fsMod.collection(db, "users", cloudUser.uid, "saves"));
  const out: Record<number, number> = {};
  snaps.forEach((s: any) => { out[+String(s.id).replace("slot", "")] = s.data().savedAt; });
  return out;
}

// ---------- Account screen ----------

function showAccount() {
  $("#menu").classList.remove("hidden");
  renderAccountScreen();
}
function renderAccountScreen(status?: string) {
  if (!firebaseConfigured()) {
    $("#panelMain").innerHTML =
      '<h1>ACCOUNT</h1><div class="sub">Cloud save</div>' +
      '<div class="small" style="margin:12px 0;line-height:1.5">Cloud save isn\'t configured for this build yet - it needs a Firebase project\'s config wired into src/cloud.ts. Local save/load in the pause menu still works normally.</div>' +
      '<button id="backAccount" ' + SECBTN + '>BACK</button>';
    $("#backAccount").onclick = showSetup;
    return;
  }
  const u = cloudCurrentUser();
  if (u) {
    $("#panelMain").innerHTML =
      '<h1>ACCOUNT</h1><div class="sub">' + (u.isAnonymous ? "Signed in as guest" : "Signed in as " + u.email) + '</div>' +
      (status ? '<div class="small" style="margin:8px 0;color:#9db4cc">' + status + '</div>' : '') +
      '<div class="small" style="margin:10px 0">Cloud saves sync from the SAVE / LOAD GAME screens once you\'re signed in.</div>' +
      '<button id="acctSignOut" style="width:100%;margin-top:8px;padding:11px;border-radius:8px;border:1px solid #a04040;background:#2a1c1c;color:#f0a0a0;font-size:13px">SIGN OUT</button>' +
      '<button id="backAccount" ' + SECBTN + '>BACK</button>';
    $("#acctSignOut").onclick = async () => { await cloudSignOut(); renderAccountScreen("Signed out."); };
    $("#backAccount").onclick = showSetup;
    return;
  }
  $("#panelMain").innerHTML =
    '<h1>ACCOUNT</h1><div class="sub">Sign in for cloud save</div>' +
    (status ? '<div class="small" style="margin:8px 0;color:#ff9a8a">' + status + '</div>' : '') +
    '<div class="fld"><label>Email</label><input type="email" id="acctEmail" placeholder="you@example.com"></div>' +
    '<div class="fld"><label>Password</label><input type="password" id="acctPassword" placeholder="At least 6 characters"></div>' +
    '<button id="acctSignIn" style="width:100%;margin-top:8px;padding:11px;border-radius:8px;border:1px solid #5b74a0;background:#22334a;color:#cfe0f5;font-size:13px">SIGN IN</button>' +
    '<button id="acctSignUp" style="width:100%;margin-top:8px;padding:11px;border-radius:8px;border:1px solid #5b74a0;background:#1a2536;color:#9db4cc;font-size:13px">CREATE ACCOUNT</button>' +
    '<button id="acctGuest" style="width:100%;margin-top:8px;padding:11px;border-radius:8px;border:1px dashed #5b74a0;background:transparent;color:#9db4cc;font-size:13px">CONTINUE AS GUEST</button>' +
    '<button id="backAccount" ' + SECBTN + '>BACK</button>';
  const cred = () => ({ email: ($("#acctEmail") as HTMLInputElement).value.trim(), password: ($("#acctPassword") as HTMLInputElement).value });
  $("#acctSignIn").onclick = async () => {
    const { email, password } = cred();
    if (!email || !password) return renderAccountScreen("Enter an email and password.");
    try { await cloudSignIn(email, password); renderAccountScreen("Signed in."); }
    catch (e: any) { renderAccountScreen(e.message || "Sign in failed."); }
  };
  $("#acctSignUp").onclick = async () => {
    const { email, password } = cred();
    if (!email || !password) return renderAccountScreen("Enter an email and password.");
    try { await cloudSignUp(email, password); renderAccountScreen("Account created."); }
    catch (e: any) { renderAccountScreen(e.message || "Could not create account."); }
  };
  $("#acctGuest").onclick = async () => {
    try { await cloudSignInGuest(); renderAccountScreen("Signed in as guest."); }
    catch (e: any) { renderAccountScreen(e.message || "Could not sign in as guest."); }
  };
  $("#backAccount").onclick = showSetup;
}

Object.assign(window, {
  firebaseConfigured, cloudCurrentUser, onCloudAuthChanged,
  cloudSignUp, cloudSignIn, cloudSignInGuest, cloudSignOut,
  cloudSaveSlot, cloudLoadSlot, cloudListSaves,
  showAccount, renderAccountScreen,
});
