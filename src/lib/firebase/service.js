// const { query, collection, where, getDocs } = require("firebase/firestore");
import { firestore, auth, storage } from "@/lib/firebase/init";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  endAt,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  startAt,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import bcryptjs from "bcryptjs";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 as uuid } from "uuid";

export async function register(data) {
  const emailQuery = query(
    collection(firestore, "email"),
    where("email", "==", data.email)
  );
  const usernameQuery = query(
    collection(firestore, "username"),
    where("username", "==", data.username)
  );

  const [emailSnapshot, usernameSnapshot] = await Promise.all([
    getDocs(emailQuery),
    getDocs(usernameQuery),
  ]);

  const emailExists = emailSnapshot.docs.length > 0;
  const usernameExists = usernameSnapshot.docs.length > 0;

  if (usernameExists) {
    return {
      status: false,
      statusCode: 400,
      message: "Username already taken",
    };
  }

  if (emailExists) {
    return { status: false, statusCode: 400, message: "Email already taken" };
  }
  const user = {
    email: data.email,
    username: data.username,
    fullname: data.fullname,
  };
  user.passwordHash = await bcryptjs.hash(data.password, 10);
  user.profilePictureUrl = null;
  user.bio = "";
  user.joinDate = Timestamp.now();
  user.followersCount = 0;
  user.followingCount = 0;
  user.postCount = 0;
  user.followers = [];
  user.following = [];
  user.privacySettings = {
    profileVisibility: "public",
    messageRequest: true,
  };

  try {
    await addDoc(collection(firestore, "users"), user);
    return { status: true, statusCode: 200, message: "Register Success" };
  } catch (error) {
    return { status: false, statusCode: 400, message: "Register Failed" };
  }
}

export async function login(username) {
  const q = query(
    collection(firestore, "users"),
    where("username", "==", username)
  );
  const snapshot = await getDocs(q);

  const user = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (user) {
    return user[0];
  } else {
    return null;
  }
}

export async function getUser(username) {
  const q = query(
    collection(firestore, "users"),
    where("username", "==", username)
  );
  const snapshot = await getDocs(q);

  const user = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (user.length > 0) {
    return { status: true, data: user[0] };
  } else {
    return { status: false };
  }
}

export async function searchUser(keyword) {
  if (!keyword.trim) return [];
  try {
    const usersRef = collection(firestore, "users");

    const q = query(
      usersRef,
      orderBy("username"),
      startAt(keyword),
      endAt(keyword + "\uf8ff")
    );
    const snap = await getDocs(q);

    const results = snap.docs.map((doc) => {
      const data = doc.data();
      delete data.passwordHash;
      return { id: doc.id, ...data };
    });
    return { status: true, data: results };
  } catch (error) {
    console.log("Error searching user: ", error);
    return { status: false, message: error };
  }
}

export async function getUserByEmail(email) {
  const q = query(collection(firestore, "users"), where("email", "==", email));
  const snapshot = await getDocs(q);

  const user = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  if (user.length > 0) {
    return { status: true, data: user[0] };
  } else {
    return { status: false };
  }
}

export async function uploadImage(userId, file) {
  try {
    const storageRef = ref(storage, `/profilePicture/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return { status: true };
  } catch (error) {
    return { status: false, message: error };
  }
}

export async function updateProfilePicture(userId, file) {
  try {
    const storageRef = ref(storage, `/profilePicture/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);

    const downloadURL = await getDownloadURL(storageRef);

    const userDocRef = doc(firestore, "users", userId);

    await updateDoc(userDocRef, {
      profilePictureUrl: downloadURL,
    });
    return { status: true, message: "profile picture changed" };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

export async function removeProfilePicture(userId) {
  try {
    const userDocRef = doc(firestore, "users", userId);

    await updateDoc(userDocRef, {
      profilePictureUrl: null,
    });

    return { status: true, message: "Profile removed" };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

export async function followUser(userData, userToFollow) {
  try {
    const userDocRef = doc(firestore, "users", userData.userId);
    const userToFollowRef = doc(firestore, "users", userToFollow.userId);

    await updateDoc(userDocRef, {
      following: arrayUnion(userToFollow),
      followingCount: increment(1),
    });

    await updateDoc(userToFollowRef, {
      followers: arrayUnion(userData),
      followersCount: increment(1),
    });

    return { status: true };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

export async function unfollowUser(userId, userToUnfollowId) {
  try {
    const userDocRef = doc(firestore, "users", userId);
    const userToUnfollowDocRef = doc(firestore, "users", userToUnfollowId);

    const userDocSnapshot = await getDoc(userDocRef);
    const userToUnfollowSnapshot = await getDoc(userToUnfollowDocRef);

    if (userDocSnapshot.exists() && userToUnfollowSnapshot.exists()) {
      const currentFollowing = userDocSnapshot.data().following || [];
      const currentFollowers = userToUnfollowSnapshot.data().followers || [];

      const updatedFollowing = currentFollowing.filter(
        (follow) => follow.userId !== userToUnfollowId
      );

      const updatedFollowers = currentFollowers.filter(
        (follower) => follower.userId !== userId
      );

      await updateDoc(userDocRef, {
        following: updatedFollowing,
        followingCount: increment(-1),
      });

      await updateDoc(userToUnfollowDocRef, {
        followers: updatedFollowers,
        followersCount: increment(-1),
      });

      return { status: true };
    }
  } catch (error) {
    return { status: false, message: error.message };
  }
}

export async function createPost(
  userId,
  username,
  profilePictureUrl,
  image,
  caption
) {
  try {
    const uniqueFileName = `${uuid()}_${image.name}`;
    const storageRef = ref(storage, `/post/${username}/${uniqueFileName}`);
    await uploadBytes(storageRef, image);

    const userRef = doc(firestore, "users", userId);

    const downloadUrl = await getDownloadURL(storageRef);

    const postRef = await addDoc(collection(firestore, "posts"), {
      username,
      profilePictureUrl,
      mediaUrl: downloadUrl,
      caption,
      createdAt: Timestamp.now(),
      isEdited: false,
      likesCount: 0,
      commentsCount: 0,
    });

    const likesSubCollectionRef = doc(
      collection(postRef, "likes"),
      "likesData"
    );
    await setDoc(likesSubCollectionRef, {
      users: [],
    });

    const commentsSubCollectionRef = doc(
      collection(postRef, "comments"),
      "commentsData"
    );
    await setDoc(commentsSubCollectionRef, {
      comments: [],
    });

    await updateDoc(userRef, {
      postCount: increment(1),
    });

    return { status: true };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

export async function getPosts(username) {
  try {
    // Query untuk mengambil post berdasarkan username
    const q = query(
      collection(firestore, "posts"),
      where("username", "==", username)
    );
    const snapshot = await getDocs(q);

    if (snapshot.docs.length > 0) {
      // Ambil setiap post dan subcollection-nya
      const data = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const postData = {
            id: doc.id,
            ...doc.data(),
          };

          // Ambil subcollection 'likes' dari setiap post
          const likesSnapshot = await getDocs(collection(doc.ref, "likes"));
          const likesData = likesSnapshot.docs.map((likeDoc) => likeDoc.data());

          // Ambil subcollection 'comments' dari setiap post
          const commentsSnapshot = await getDocs(
            collection(doc.ref, "comments")
          );
          const commentsData = commentsSnapshot.docs.map((commentDoc) =>
            commentDoc.data()
          );

          // Tambahkan 'likes' dan 'comments' ke dalam post
          return {
            ...postData,
            likes: likesData,
            comments: commentsData,
          };
        })
      );

      return { status: true, data };
    } else {
      return {
        status: true,
        statusCode: 404,
        message: "Post not found",
        data: [],
      };
    }
  } catch (error) {
    return { status: false, statusCode: 400, message: error.message };
  }
}

export async function getPostById(id) {
  try {
    // Ambil dokumen post berdasarkan ID
    const snapshot = await getDoc(doc(firestore, "posts", id));

    if (snapshot.exists()) {
      const postData = snapshot.data();
      postData.id = snapshot.id;

      // Ambil data dari dokumen 'likesData'
      const likesDataRef = doc(snapshot.ref, "likes", "likesData");
      const likesSnapshot = await getDoc(likesDataRef);
      const likesData = likesSnapshot.exists()
        ? likesSnapshot.data()
        : { users: [] };

      // Ambil data dari dokumen 'commentsData'
      const commentsSnapshot = await getDocs(
        collection(firestore, "posts", id, "comments")
      );
      const commentsData = commentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Return post dengan data subcollection likes dan comments
      return {
        status: true,
        statusCode: 200,
        data: {
          ...postData,
          likes: likesData.users, // Ambil array users dari likes
          comments: commentsData, // Ambil array comments dari comments
        },
      };
    } else {
      return { status: false, statusCode: 404, message: "Post not found" };
    }
  } catch (error) {
    return { status: false, statusCode: 400, message: error.message };
  }
}

export function timeAgo(firebaseTimestamp) {
  // Mengonversi timestamp Firebase ke milidetik
  const timestampInMillis =
    firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1000000;
  const now = Date.now(); // waktu saat ini dalam milidetik
  const differenceInSeconds = (now - timestampInMillis) / 1000; // menghitung selisih waktu dalam detik

  if (differenceInSeconds < 60) {
    return `${Math.floor(differenceInSeconds)}s ago`; // jika kurang dari 60 detik, tampilkan dalam detik
  } else if (differenceInSeconds < 3600) {
    return `${Math.floor(differenceInSeconds / 60)}m ago`; // jika kurang dari 60 menit, tampilkan dalam menit
  } else if (differenceInSeconds < 86400) {
    return `${Math.floor(differenceInSeconds / 3600)}h ago`; // jika kurang dari 24 jam, tampilkan dalam jam
  } else if (differenceInSeconds < 604800) {
    return `${Math.floor(differenceInSeconds / 86400)}d ago`; // jika kurang dari 7 hari, tampilkan dalam hari
  } else {
    return `${Math.floor(differenceInSeconds / 604800)}w ago`; // jika lebih dari 7 hari, tampilkan dalam minggu
  }
}
export function getTime(firebaseTimestamp) {
  // Mengonversi timestamp Firebase ke milidetik
  const timestampInMillis =
    firebaseTimestamp.seconds * 1000 + firebaseTimestamp.nanoseconds / 1000000;
  const now = Date.now(); // waktu saat ini dalam milidetik
  const differenceInSeconds = (now - timestampInMillis) / 1000; // menghitung selisih waktu dalam detik

  if (differenceInSeconds < 60) {
    return `${Math.floor(differenceInSeconds)}s`; // jika kurang dari 60 detik, tampilkan dalam detik
  } else if (differenceInSeconds < 3600) {
    return `${Math.floor(differenceInSeconds / 60)}m`; // jika kurang dari 60 menit, tampilkan dalam menit
  } else if (differenceInSeconds < 86400) {
    return `${Math.floor(differenceInSeconds / 3600)}h`; // jika kurang dari 24 jam, tampilkan dalam jam
  } else if (differenceInSeconds < 604800) {
    return `${Math.floor(differenceInSeconds / 86400)}d`; // jika kurang dari 7 hari, tampilkan dalam hari
  } else {
    return `${Math.floor(differenceInSeconds / 604800)}w`; // jika lebih dari 7 hari, tampilkan dalam minggu
  }
}

export async function toggleLike(postId, userId, username, profilePictureUrl) {
  try {
    const postRef = doc(firestore, "posts", postId);
    const likeRef = doc(firestore, "posts", postId, "likes", "likesData");
    const snapshot = await getDoc(likeRef);

    const postData = {
      id: snapshot.id,
      ...snapshot.data(),
    };

    if (snapshot.exists()) {
      // Cek apakah userId sudah ada dalam array users
      const userIndex = postData.users.findIndex(
        (user) => user.userId === userId
      );

      if (userIndex !== -1) {
        // Jika like ada, hapus like
        await updateDoc(likeRef, {
          users: arrayRemove({
            userId,
            username,
            profilePictureUrl,
          }),
        });

        // Kurangi likesCount pada dokumen post
        await updateDoc(postRef, {
          likesCount: increment(-1),
        });
      } else {
        // Jika like tidak ada, tambahkan like baru
        await updateDoc(likeRef, {
          users: arrayUnion({
            userId,
            username,
            profilePictureUrl,
          }),
        });

        // Tambahkan likesCount pada dokumen post
        await updateDoc(postRef, {
          likesCount: increment(1),
        });
      }
    } else {
      // Jika dokumen likesData tidak ada, buat dokumen baru dan tambahkan like
      await setDoc(likeRef, {
        users: [
          {
            userId,
            username,
            profilePictureUrl,
          },
        ],
      });

      // Tambahkan likesCount pada dokumen post
      await updateDoc(postRef, {
        likesCount: increment(1),
      });
    }

    return { status: true };
  } catch (error) {
    // Tangkap error jika ada
    return { status: false, message: error.message };
  }
}

export async function getLikesByPostId(postId) {
  try {
    const likesRef = doc(firestore, "posts", postId, "likes", "likesData");
    const snapshot = await getDoc(likesRef);

    const likesData = {
      id: snapshot.id,
      ...snapshot.data(),
    };

    return { status: true, data: likesData.users };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

export async function postComment(
  postId,
  userId,
  username,
  profilePictureUrl,
  comment
) {
  try {
    const postRef = doc(firestore, "posts", postId);
    const commentRef = collection(firestore, "posts", postId, "comments");

    const newComment = {
      userId,
      username,
      profilePictureUrl,
      comment,
      createdAt: Timestamp.now(),
      likesCount: 0,
      likes: [],
    };

    await addDoc(commentRef, newComment);

    await updateDoc(postRef, {
      commentsCount: increment(1),
    });

    return { status: true };
  } catch (error) {
    return { status: false, message: error.message };
  }
}

export async function toggleLikeComment(
  postId,
  userId,
  username,
  profilePictureUrl,
  commentId,
  fullname
) {
  try {
    const postRef = doc(firestore, "posts", postId);
    const commentRef = doc(firestore, "posts", postId, "comments", commentId);
    const commentSnapshot = await getDoc(commentRef);

    const commentData = {
      ...commentSnapshot.data(),
    };

    const userIndex = commentData.likes.findIndex(
      (like) => like.userId === userId
    );

    if (userIndex !== -1) {
      await updateDoc(commentRef, {
        likes: arrayRemove({
          postId,
          userId,
          username,
          profilePictureUrl,
          fullname,
        }),
        likesCount: increment(-1),
      });
    } else {
      await updateDoc(commentRef, {
        likes: arrayUnion({
          postId,
          userId,
          username,
          profilePictureUrl,
          fullname,
        }),
        likesCount: increment(1),
      });

      return { status: true };
    }

    // const snapshot = await getDoc(likeRef)

    // const postData = {
    //     id: snapshot.id,
    //     ...snapshot.data()
    // }

    // if (snapshot.exists()) {

    //     // Cek apakah userId sudah ada dalam array users
    //     const userIndex = postData.users.findIndex(user => user.userId === userId);

    //     if (userIndex !== -1) {
    //         // Jika like ada, hapus like
    //         await updateDoc(likeRef, {
    //             users: arrayRemove({
    //                 userId,
    //                 username,
    //                 profilePictureUrl
    //             })
    //         });

    //         // Kurangi likesCount pada dokumen post
    //         await updateDoc(postRef, {
    //             likesCount: increment(-1)
    //         });

    //     } else {
    //         // Jika like tidak ada, tambahkan like baru
    //         await updateDoc(likeRef, {
    //             users: arrayUnion({
    //                 userId,
    //                 username,
    //                 profilePictureUrl
    //             })
    //         });

    //         // Tambahkan likesCount pada dokumen post
    //         await updateDoc(postRef, {
    //             likesCount: increment(1)
    //         });

    //     }
    // } else {
    //     // Jika dokumen likesData tidak ada, buat dokumen baru dan tambahkan like
    //     await setDoc(likeRef, {
    //         users: [{
    //             userId,
    //             username,
    //             profilePictureUrl
    //         }]
    //     });

    //     // Tambahkan likesCount pada dokumen post
    //     await updateDoc(postRef, {
    //         likesCount: increment(1)
    //     });

    // }

    // return { status: true };
  } catch (error) {
    // Tangkap error jika ada
    return { status: false, message: error.message };
  }
}

export async function getCommentLikes(commentId, postId) {
  try {
    const snapshot = await getDoc(
      doc(firestore, "posts", postId, "comments", commentId)
    );
    if (!snapshot.exists()) {
      return { status: false, message: "comment not found" };
    }

    const commentData = {
      ...snapshot.data(),
    };

    const likes = commentData.likes;
    return { status: true, data: likes };
  } catch (error) {
    return { status: false, message: error.message };
  }
}
