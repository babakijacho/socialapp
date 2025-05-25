// Initialize Firebase (same as in app.js)
const firebaseConfig = {
  apiKey: "AIzaSyBwEvd7oUGl8qw8gG95THR-lO73tsHeanE",
  authDomain: "socialapp-d36d6.firebaseapp.com",
  projectId: "socialapp-d36d6",
  storageBucket: "socialapp-d36d6.firebasestorage.app",
  messagingSenderId: "947087279578",
  appId: "1:947087279578:web:e5bd0463075138e4ec2ce3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleLoginBtn = document.getElementById('google-login');
const googleSignupBtn = document.getElementById('google-signup');
const forgotPasswordLink = document.getElementById('forgot-password');

// Login with Email/Password
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                window.location.href = "index.html";
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

// Sign Up with Email/Password
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const dob = document.getElementById('signup-dob').value;
        const gender = document.getElementById('signup-gender').value;
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up
                return userCredential.user.updateProfile({
                    displayName: name
                });
            })
            .then(() => {
                window.location.href = "index.html";
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

// Google Sign-In
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            window.location.href = "index.html";
        })
        .catch((error) => {
            alert(error.message);
        });
}

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', signInWithGoogle);
}

if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', signInWithGoogle);
}

// Password Reset
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt("Please enter your email address:");
        
        if (email) {
            auth.sendPasswordResetEmail(email)
                .then(() => {
                    alert("Password reset email sent!");
                })
                .catch((error) => {
                    alert(error.message);
                });
        }
    });
}

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html'))) {
        // User is signed in but on auth pages, redirect to home
        window.location.href = "index.html";
    }
});