// Firebase configuration (replace with your own config)
const firebaseConfig = {
  apiKey: "AIzaSyBwEvd7oUGl8qw8gG95THR-lO73tsHeanE",
  authDomain: "socialapp-d36d6.firebaseapp.com",
  projectId: "socialapp-d36d6",
  storageBucket: "socialapp-d36d6.firebasestorage.app",
  messagingSenderId: "947087279578",
  appId: "1:947087279578:web:e5bd0463075138e4ec2ce3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const postsContainer = document.getElementById('posts-container');
const postContentInput = document.getElementById('post-content');
const profilePic = document.getElementById('profile-pic');
const usernameElement = document.getElementById('username');
const bigProfilePic = document.getElementById('big-profile-pic');
const fullUsernameElement = document.getElementById('full-username');
const contactsList = document.getElementById('contacts-list');
const logoutBtn = document.createElement('button'); // We'll add this dynamically

// Auth state observer
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        console.log("User signed in:", user);
        updateUserProfile(user);
        loadPosts();
        loadContacts();
        setupLogoutButton();
        
        // If on auth page, redirect to home
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
            window.location.href = "index.html";
        }
    } else {
        // No user is signed in
        console.log("No user signed in");
        // If not on auth page, redirect to login
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('signup.html')) {
            window.location.href = "login.html";
        }
    }
});

// Update user profile in the UI
function updateUserProfile(user) {
    profilePic.src = user.photoURL || "https://via.placeholder.com/40";
    usernameElement.textContent = user.displayName || "User";
    bigProfilePic.src = user.photoURL || "https://via.placeholder.com/80";
    fullUsernameElement.textContent = user.displayName || "User Name";
}

// Setup logout button
function setupLogoutButton() {
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    logoutBtn.className = 'logout-btn';
    logoutBtn.title = 'Logout';
    logoutBtn.addEventListener('click', handleLogout);
    
    // Add logout button next to user profile
    const userProfileDiv = document.querySelector('.user-profile');
    if (userProfileDiv && !userProfileDiv.querySelector('.logout-btn')) {
        userProfileDiv.appendChild(logoutBtn);
    }
}

// Handle logout
function handleLogout() {
    auth.signOut().then(() => {
        console.log("User signed out");
        window.location.href = "login.html";
    }).catch(error => {
        console.error("Logout error:", error);
    });
}

// Load posts from Firestore
function loadPosts() {
    db.collection("posts")
        .orderBy("timestamp", "desc")
        .onSnapshot(snapshot => {
            postsContainer.innerHTML = "";
            snapshot.forEach(doc => {
                const post = doc.data();
                createPostElement(post);
            });
        }, error => {
            console.error("Error loading posts:", error);
        });
}

// Create a post element in the DOM
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    
    const postDate = new Date(post.timestamp?.seconds * 1000);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = postDate.toLocaleDateString('en-US', options);
    
    postElement.innerHTML = `
        <div class="post-header">
            <img src="${post.userPhoto || 'https://via.placeholder.com/40'}" alt="Profile">
            <div class="post-user">
                <h4>${post.userName}</h4>
                <span class="post-time">${formattedDate}</span>
            </div>
        </div>
        <div class="post-content">${post.content}</div>
        ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="Post image">` : ''}
        <div class="post-actions">
            <div class="post-action"><i class="far fa-thumbs-up"></i> Like</div>
            <div class="post-action"><i class="far fa-comment"></i> Comment</div>
            <div class="post-action"><i class="fas fa-share"></i> Share</div>
        </div>
    `;
    
    // Add like functionality
    const likeBtn = postElement.querySelector('.post-action');
    likeBtn.addEventListener('click', () => {
        // In a real app, you would update the like count in Firestore
        likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i> Liked';
        likeBtn.style.color = '#1877f2';
    });
    
    postsContainer.appendChild(postElement);
}

// Load contacts/friends
function loadContacts() {
    // In a real app, you would fetch this from Firestore
    const mockContacts = [
        { name: "John Doe", photo: "https://via.placeholder.com/30" },
        { name: "Jane Smith", photo: "https://via.placeholder.com/30" },
        { name: "Mike Johnson", photo: "https://via.placeholder.com/30" },
        { name: "Sarah Williams", photo: "https://via.placeholder.com/30" },
        { name: "David Brown", photo: "https://via.placeholder.com/30" }
    ];
    
    contactsList.innerHTML = "";
    mockContacts.forEach(contact => {
        const contactElement = document.createElement('div');
        contactElement.className = 'contact';
        contactElement.innerHTML = `
            <img src="${contact.photo}" alt="${contact.name}">
            <span>${contact.name}</span>
        `;
        contactsList.appendChild(contactElement);
    });
}

// Create a new post
const postButtons = document.querySelectorAll('.post-actions button');
if (postButtons.length > 1) {
    postButtons[1].addEventListener('click', () => {
        const content = postContentInput.value.trim();
        if (content) {
            const user = auth.currentUser;
            
            const newPost = {
                content: content,
                userName: user.displayName || "Anonymous",
                userPhoto: user.photoURL || "",
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0,
                comments: []
            };
            
            db.collection("posts").add(newPost)
                .then(() => {
                    postContentInput.value = "";
                    console.log("Post created successfully");
                })
                .catch(error => {
                    console.error("Error creating post:", error);
                    alert("Error creating post: " + error.message);
                });
        }
    });
}

// Image upload functionality (placeholder)
if (postButtons.length > 1) {
    postButtons[1].addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const user = auth.currentUser;
                const storageRef = storage.ref(`posts/${user.uid}/${file.name}`);
                
                storageRef.put(file).then((snapshot) => {
                    return snapshot.ref.getDownloadURL();
                }).then((downloadURL) => {
                    const content = postContentInput.value.trim() || "Shared a photo";
                    
                    const newPost = {
                        content: content,
                        userName: user.displayName || "Anonymous",
                        userPhoto: user.photoURL || "",
                        imageUrl: downloadURL,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        likes: 0,
                        comments: []
                    };
                    
                    return db.collection("posts").add(newPost);
                }).then(() => {
                    postContentInput.value = "";
                    console.log("Post with image created successfully");
                }).catch(error => {
                    console.error("Error uploading image:", error);
                    alert("Error uploading image: " + error.message);
                });
            }
        });
        
        fileInput.click();
    });
}

// Add logout button styles to the CSS dynamically
const style = document.createElement('style');
style.textContent = `
    .logout-btn {
        background: none;
        border: none;
        color: #65676b;
        font-size: 16px;
        cursor: pointer;
        margin-left: 10px;
    }
    
    .logout-btn:hover {
        color: #1877f2;
    }
`;
document.head.appendChild(style);