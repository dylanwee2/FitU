// Service for managing public vault posts and operations
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit as queryLimit,
  runTransaction,
  increment,
  serverTimestamp,
  onSnapshot,
  where
} from 'firebase/firestore';
import { db } from '@/firebase';
import { calculateWorkoutDuration, extractMuscleGroups } from '@/types/workout.js';
import { workoutSetsService } from './workoutSetsService.js';

class VaultService {
  getPostsCollectionRef() {
    return collection(db, 'vaultPosts');
  }

  getPostDocRef(postId) {
    return doc(db, 'vaultPosts', postId);
  }

  getReviewsCollectionRef(postId) {
    return collection(db, 'vaultPosts', postId, 'reviews');
  }

  /**
   * List vault posts with optional sorting and filtering
   */
  async listVaultPosts(options = {}) {
    try {
      const { sort = 'newest', limit = 20 } = options;
      
      let orderByField = 'createdAt';
      let orderDirection = 'desc';

      switch (sort) {
        case 'highestRating':
          orderByField = 'avgRating';
          orderDirection = 'desc';
          break;
        case 'mostReviewed':
          orderByField = 'reviewsCount';
          orderDirection = 'desc';
          break;
        case 'newest':
        default:
          orderByField = 'createdAt';
          orderDirection = 'desc';
          break;
      }

      const q = query(
        this.getPostsCollectionRef(),
        orderBy(orderByField, orderDirection),
        queryLimit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      }));
    } catch (error) {
      console.error('Error listing vault posts:', error);
      throw new Error('Failed to fetch vault posts');
    }
  }

  /**
   * Get a single vault post by ID
   */
  async getVaultPost(postId) {
    try {
      const docRef = this.getPostDocRef(postId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Vault post not found');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      };
    } catch (error) {
      console.error('Error getting vault post:', error);
      throw new Error('Failed to fetch vault post');
    }
  }


  async publishWorkoutSet(uid, setId) {
    try {
      return await runTransaction(db, async (transaction) => {
        const setDocRef = workoutSetsService.getDocRef(uid, setId);
        const setDoc = await transaction.get(setDocRef);
        
        if (!setDoc.exists()) {
          throw new Error('Workout set not found');
        }

        const setData = setDoc.data();
        
        if (setData.ownerUid !== uid) {
          throw new Error('Not authorized to publish this workout set');
        }
        
        if (setData.origin !== 'created') {
          throw new Error('Only created workout sets can be published');
        }
        
        if (setData.isPublished) {
          throw new Error('Workout set is already published');
        }

        const now = new Date().toISOString();
        const vaultPostData = {
          title: setData.title,
          description: setData.description,
          exercises: setData.exercises, 
          createdBy: uid,
          createdAt: now,
          avgRating: 0,
          reviewsCount: 0,
          totalDuration: calculateWorkoutDuration(setData.exercises),
          muscleGroups: extractMuscleGroups(setData.exercises)
        };

        const vaultPostRef = doc(this.getPostsCollectionRef());
        transaction.set(vaultPostRef, vaultPostData);

        transaction.update(setDocRef, {
          isPublished: true,
          publishedAt: now,
          publishedBy: uid,
          updatedAt: now
        });

        return vaultPostRef.id;
      });
    } catch (error) {
      console.error('Error publishing workout set:', error);
      throw new Error('Failed to publish workout set');
    }
  }

  async addReview(postId, reviewData) {
    try {
      return await runTransaction(db, async (transaction) => {
        const postRef = this.getPostDocRef(postId);
        const postDoc = await transaction.get(postRef);
        
        if (!postDoc.exists()) {
          throw new Error('Vault post not found');
        }

        const postData = postDoc.data();
        
        const reviewRef = doc(this.getReviewsCollectionRef(postId));
        const reviewWithTimestamp = {
          ...reviewData,
          createdAt: new Date().toISOString()
        };
        transaction.set(reviewRef, reviewWithTimestamp);

        const newReviewsCount = postData.reviewsCount + 1;
        const currentTotal = postData.avgRating * postData.reviewsCount;
        const newAvgRating = (currentTotal + reviewData.rating) / newReviewsCount;

        transaction.update(postRef, {
          avgRating: Number(newAvgRating.toFixed(2)),
          reviewsCount: newReviewsCount
        });

        return reviewRef.id;
      });
    } catch (error) {
      console.error('Error adding review:', error);
      throw new Error('Failed to add review');
    }
  }

  async getReviews(postId) {
    try {
      const q = query(
        this.getReviewsCollectionRef(postId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      }));
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  }

  async alreadyImported(uid, postId) {
    return workoutSetsService.alreadyImported(uid, postId);
  }

  async importFromVault(uid, postId) {
    try {
      const vaultPost = await this.getVaultPost(postId);
      
      return workoutSetsService.importFromVault(uid, postId, {
        title: vaultPost.title,
        description: vaultPost.description,
        exercises: vaultPost.exercises
      });
    } catch (error) {
      console.error('Error importing from vault:', error);
      throw new Error('Failed to import workout set');
    }
  }

  subscribeToVaultPosts(callback, options = {}) {
    const { sort = 'newest', limit = 20 } = options;
    
    let orderByField = 'createdAt';
    let orderDirection = 'desc';

    switch (sort) {
      case 'highestRating':
        orderByField = 'avgRating';
        orderDirection = 'desc';
        break;
      case 'mostReviewed':
        orderByField = 'reviewsCount';
        orderDirection = 'desc';
        break;
      case 'newest':
      default:
        orderByField = 'createdAt';
        orderDirection = 'desc';
        break;
    }

    const q = query(
      this.getPostsCollectionRef(),
      orderBy(orderByField, orderDirection),
      queryLimit(limit)
    );
    
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      }));
      callback(posts);
    }, (error) => {
      console.error('Error in vault posts subscription:', error);
    });
  }

  subscribeToReviews(postId, callback) {
    const q = query(
      this.getReviewsCollectionRef(postId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      }));
      callback(reviews);
    }, (error) => {
      console.error('Error in reviews subscription:', error);
    });
  }
}

export const vaultService = new VaultService();
export default vaultService;