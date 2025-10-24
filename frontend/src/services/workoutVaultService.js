// Firebase service for workout sets
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase.js';

class WorkoutVaultService {
  constructor() {
    this.userWorkoutsCollection = 'workoutSets'; // Personal user workouts
    this.vaultWorkoutsCollection = 'publishedWorkouts'; // Published vault workouts
    this.reviewsCollection = 'workoutReviews';
  }

  // User's personal workout sets (unpublished)
  async createUserWorkout(userId, workoutData) {
    try {
      const docRef = await addDoc(collection(db, this.userWorkoutsCollection), {
        ...workoutData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublished: false
      });
      return { id: docRef.id, ...workoutData };
    } catch (error) {
      console.error('Error creating user workout:', error);
      throw error;
    }
  }

  async getUserWorkouts(userId) {
    try {
      const q = query(
        collection(db, "workoutSets"), 
        where("userId", "==", userId)
      )
      const querySnapshot = await getDocs(q)
      
      // Convert querySnapshot to array of workout objects with IDs
      const workouts = []
      querySnapshot.forEach((doc) => {
        workouts.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return workouts
    } catch (error) {
      console.error('Error fetching user workouts:', error);
      throw error;
    }
  }

  async updateUserWorkout(workoutId, updateData) {
    try {
      const docRef = doc(db, this.userWorkoutsCollection, workoutId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user workout:', error);
      throw error;
    }
  }

  async deleteUserWorkout(workoutId) {
    try {
      await deleteDoc(doc(db, this.userWorkoutsCollection, workoutId));
      return true;
    } catch (error) {
      console.error('Error deleting user workout:', error);
      throw error;
    }
  }

  // Publish workout to vault
  async publishWorkout(workoutId, userId) {
    try {
      // Get the user workout
      const userWorkoutDoc = await getDoc(doc(db, this.userWorkoutsCollection, workoutId));
      if (!userWorkoutDoc.exists()) {
        throw new Error('Workout not found');
      }

      const workoutData = userWorkoutDoc.data();
      
      // Verify ownership
      if (workoutData.userId !== userId) {
        throw new Error('Unauthorized: You can only publish your own workouts');
      }

      // Create published version in vault
      const publishedWorkout = {
        ...workoutData,
        originalId: workoutId,
        publishedAt: serverTimestamp(),
        avgRating: 0,
        reviewsCount: 0,
        totalRating: 0
      };

      const vaultDocRef = await addDoc(collection(db, this.vaultWorkoutsCollection), publishedWorkout);

      // Mark original as published
      await updateDoc(doc(db, this.userWorkoutsCollection, workoutId), {
        isPublished: true,
        publishedId: vaultDocRef.id,
        publishedAt: serverTimestamp()
      });

      return { id: vaultDocRef.id, ...publishedWorkout };
    } catch (error) {
      console.error('Error publishing workout:', error);
      throw error;
    }
  }

  async unpublishWorkout(workoutId, userId) {
    try {
      // Get the published workout
      const vaultDoc = await getDoc(doc(db, this.vaultWorkoutsCollection, workoutId));
      if (!vaultDoc.exists()) {
        throw new Error('Published workout not found');
      }

      const workoutData = vaultDoc.data();
      
      // Verify ownership
      if (workoutData.userId !== userId) {
        throw new Error('Unauthorized: You can only unpublish your own workouts');
      }

      // Delete from vault
      await deleteDoc(doc(db, this.vaultWorkoutsCollection, workoutId));

      // Update original workout
      if (workoutData.originalId) {
        await updateDoc(doc(db, this.userWorkoutsCollection, workoutData.originalId), {
          isPublished: false,
          publishedId: null,
          publishedAt: null
        });
      }

      return true;
    } catch (error) {
      console.error('Error unpublishing workout:', error);
      throw error;
    }
  }

  async updatePublishedWorkout(publishedWorkoutId, updates, userId) {
    try {
      // Get the published workout to verify ownership
      const vaultDoc = await getDoc(doc(db, this.vaultWorkoutsCollection, publishedWorkoutId));
      if (!vaultDoc.exists()) {
        throw new Error('Published workout not found');
      }

      const workoutData = vaultDoc.data();
      
      // Verify ownership
      if (workoutData.userId !== userId) {
        throw new Error('Unauthorized: You can only update your own published workouts');
      }

      // Prepare updates for published workout
      // Only update fields that are safe to update (don't overwrite ratings, etc.)
      const safeUpdates = {
        name: updates.name,
        description: updates.description,
        exercises: updates.exercises,
        totalDuration: updates.totalDuration,
        estimatedDuration: updates.totalDuration, // Keep both for compatibility
        updatedAt: serverTimestamp()
      };

      // Remove undefined values
      Object.keys(safeUpdates).forEach(key => {
        if (safeUpdates[key] === undefined) {
          delete safeUpdates[key];
        }
      });

      // Update the published workout
      await updateDoc(doc(db, this.vaultWorkoutsCollection, publishedWorkoutId), safeUpdates);

      return true;
    } catch (error) {
      console.error('Error updating published workout:', error);
      throw error;
    }
  }

  // Vault operations (published workouts)
  async getVaultWorkouts(sortBy = 'newest', limit = 20) {
    try {
      let orderByField = 'publishedAt';
      let orderDirection = 'desc';

      switch (sortBy) {
        case 'rating':
          orderByField = 'avgRating';
          orderDirection = 'desc';
          break;
        case 'reviews':
          orderByField = 'reviewsCount';
          orderDirection = 'desc';
          break;
        case 'newest':
        default:
          orderByField = 'publishedAt';
          orderDirection = 'desc';
          break;
      }

      const q = query(
        collection(db, this.vaultWorkoutsCollection),
        orderBy(orderByField, orderDirection)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching vault workouts:', error);
      throw error;
    }
  }

  // Get published workouts by user ID
  async getPublishedWorkoutsByUser(userId) {
    try {
      const q = query(
        collection(db, this.vaultWorkoutsCollection),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      const publishedWorkouts = [];
      querySnapshot.forEach((doc) => {
        publishedWorkouts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return publishedWorkouts;
    } catch (error) {
      console.error('Error fetching published workouts by user:', error);
      throw error;
    }
  }

  async getWorkoutById(workoutId) {
    try {
      const docSnap = await getDoc(doc(db, this.vaultWorkoutsCollection, workoutId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Workout not found');
      }
    } catch (error) {
      console.error('Error fetching workout:', error);
      throw error;
    }
  }

  // Reviews and ratings
  async hasUserRated(workoutId, userId) {
    try {
      const q = query(
        collection(db, this.reviewsCollection),
        where('workoutId', '==', workoutId),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if user has rated:', error);
      throw error;
    }
  }

  async getUserReview(workoutId, userId) {
    try {
      const q = query(
        collection(db, this.reviewsCollection),
        where('workoutId', '==', workoutId),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user review:', error);
      throw error;
    }
  }

  async addReview(workoutId, userId, userName, rating, comment) {
    try {
      // Check if user has already rated this workout
      const existingReview = await this.getUserReview(workoutId, userId);
      if (existingReview) {
        // Update existing review instead of creating new one
        return await this.updateReview(
          existingReview.id, 
          workoutId, 
          rating, 
          comment, 
          existingReview.rating
        );
      }

      // Add new review if none exists
      const reviewRef = await addDoc(collection(db, this.reviewsCollection), {
        workoutId,
        userId,
        userName,
        rating,
        comment,
        createdAt: serverTimestamp()
      });

      // Update workout's rating statistics
      const workoutRef = doc(db, this.vaultWorkoutsCollection, workoutId);
      await updateDoc(workoutRef, {
        reviewsCount: increment(1),
        totalRating: increment(rating)
      });

      // Recalculate average rating
      const workoutDoc = await getDoc(workoutRef);
      const workoutData = workoutDoc.data();
      const newAvgRating = workoutData.totalRating / workoutData.reviewsCount;
      
      await updateDoc(workoutRef, {
        avgRating: newAvgRating
      });

      return { id: reviewRef.id, workoutId, userId, userName, rating, comment };
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  async updateReview(reviewId, workoutId, newRating, newComment, oldRating) {
    try {
      // Update the review document
      const reviewRef = doc(db, this.reviewsCollection, reviewId);
      await updateDoc(reviewRef, {
        rating: newRating,
        comment: newComment,
        updatedAt: serverTimestamp()
      });

      // Update workout's rating statistics
      const workoutRef = doc(db, this.vaultWorkoutsCollection, workoutId);
      const ratingDifference = newRating - oldRating;
      
      await updateDoc(workoutRef, {
        totalRating: increment(ratingDifference)
      });

      // Recalculate average rating
      const workoutDoc = await getDoc(workoutRef);
      const workoutData = workoutDoc.data();
      const newAvgRating = workoutData.totalRating / workoutData.reviewsCount;
      
      await updateDoc(workoutRef, {
        avgRating: newAvgRating
      });

      return { id: reviewId, workoutId, rating: newRating, comment: newComment };
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  async getWorkoutReviews(workoutId) {
    try {
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        collection(db, this.reviewsCollection),
        where('workoutId', '==', workoutId)
      );

      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by createdAt in JavaScript instead of Firestore
      return reviews.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  async deleteReview(reviewId, userId) {
    try {
      // Get the review first to verify ownership and get workout info
      const reviewDoc = await getDoc(doc(db, this.reviewsCollection, reviewId));
      if (!reviewDoc.exists()) {
        throw new Error('Review not found');
      }

      const reviewData = reviewDoc.data();
      
      // Verify ownership
      if (reviewData.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own reviews');
      }

      // Delete the review
      await deleteDoc(doc(db, this.reviewsCollection, reviewId));

      // Update workout's rating statistics
      const workoutRef = doc(db, this.vaultWorkoutsCollection, reviewData.workoutId);
      await updateDoc(workoutRef, {
        reviewsCount: increment(-1),
        totalRating: increment(-reviewData.rating)
      });

      // Recalculate average rating
      const workoutDoc = await getDoc(workoutRef);
      const workoutData = workoutDoc.data();
      const newAvgRating = workoutData.reviewsCount > 0 ? workoutData.totalRating / workoutData.reviewsCount : 0;
      
      await updateDoc(workoutRef, {
        avgRating: newAvgRating
      });

      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToVaultWorkouts(callback, sortBy = 'newest') {
    let orderByField = 'publishedAt';
    let orderDirection = 'desc';

    switch (sortBy) {
      case 'rating':
        orderByField = 'avgRating';
        orderDirection = 'desc';
        break;
      case 'reviews':
        orderByField = 'reviewsCount';
        orderDirection = 'desc';
        break;
      case 'newest':
      default:
        orderByField = 'publishedAt';
        orderDirection = 'desc';
        break;
    }

    const q = query(
      collection(db, this.vaultWorkoutsCollection),
      orderBy(orderByField, orderDirection)
    );

    return onSnapshot(q, (querySnapshot) => {
      const workouts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(workouts);
    });
  }

  subscribeToUserWorkouts(userId, callback) {
    const q = query(
      collection(db, this.userWorkoutsCollection),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const workouts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(workouts);
    });
  }

  subscribeToWorkoutReviews(workoutId, callback) {
    const q = query(
      collection(db, this.reviewsCollection),
      where('workoutId', '==', workoutId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(reviews);
    });
  }
}

export const workoutVaultService = new WorkoutVaultService();
export default workoutVaultService;