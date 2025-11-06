
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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase';
import { calculateWorkoutDuration, extractMuscleGroups } from '@/types/workout.js';

class WorkoutSetsService {
  getCollectionRef(uid) {
    return collection(db, 'users', uid, 'workoutSets');
  }

  getDocRef(uid, setId) {
    return doc(db, 'users', uid, 'workoutSets', setId);
  }

  async getMyWorkoutSets(uid) {
    try {
      const q = query(
        this.getCollectionRef(uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        publishedAt: doc.data().publishedAt?.toDate?.()?.toISOString() || doc.data().publishedAt
      }));
    } catch (error) {
      console.error('Error getting workout sets:', error);
      throw new Error('Failed to fetch workout sets');
    }
  }

  subscribeToWorkoutSets(uid, callback) {
    const q = query(
      this.getCollectionRef(uid),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const sets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
        publishedAt: doc.data().publishedAt?.toDate?.()?.toISOString() || doc.data().publishedAt
      }));
      callback(sets);
    }, (error) => {
      console.error('Error in workout sets subscription:', error);
    });
  }

  async createWorkoutSet(uid, workoutSetData) {
    try {
      const now = new Date().toISOString();
      
      const setData = {
        ...workoutSetData,
        ownerUid: uid,
        origin: 'created',
        isPublished: false,
        createdAt: now,
        updatedAt: now,
        totalDuration: calculateWorkoutDuration(workoutSetData.exercises),
        muscleGroups: extractMuscleGroups(workoutSetData.exercises)
      };

      const docRef = await addDoc(this.getCollectionRef(uid), setData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating workout set:', error);
      throw new Error('Failed to create workout set');
    }
  }

  async updateWorkoutSet(uid, setId, updateData) {
    try {
      const docRef = this.getDocRef(uid, setId);
      
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Workout set not found');
      }
      
      const currentData = docSnap.data();
      if (currentData.ownerUid !== uid) {
        throw new Error('Not authorized to update this workout set');
      }

      const now = new Date().toISOString();
      const finalUpdateData = {
        ...updateData,
        updatedAt: now
      };

      if (updateData.exercises) {
        finalUpdateData.totalDuration = calculateWorkoutDuration(updateData.exercises);
        finalUpdateData.muscleGroups = extractMuscleGroups(updateData.exercises);
      }

      await updateDoc(docRef, finalUpdateData);
      return setId;
    } catch (error) {
      console.error('Error updating workout set:', error);
      throw new Error('Failed to update workout set');
    }
  }

  async deleteWorkoutSet(uid, setId) {
    try {
      const docRef = this.getDocRef(uid, setId);
      
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Workout set not found');
      }
      
      const currentData = docSnap.data();
      if (currentData.ownerUid !== uid) {
        throw new Error('Not authorized to delete this workout set');
      }

      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting workout set:', error);
      throw new Error('Failed to delete workout set');
    }
  }

  async getWorkoutSet(uid, setId) {
    try {
      const docRef = this.getDocRef(uid, setId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Workout set not found');
      }

      const data = docSnap.data();
      if (data.ownerUid !== uid) {
        throw new Error('Not authorized to access this workout set');
      }

      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt
      };
    } catch (error) {
      console.error('Error getting workout set:', error);
      throw new Error('Failed to fetch workout set');
    }
  }

  async alreadyImported(uid, postId) {
    try {
      const q = query(
        this.getCollectionRef(uid),
        where('origin', '==', 'imported'),
        where('sourcePostId', '==', postId)
      );
      
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking import status:', error);
      return false;
    }
  }

  async importFromVault(uid, postId, vaultPostData) {
    try {
      const alreadyExists = await this.alreadyImported(uid, postId);
      if (alreadyExists) {
        throw new Error('You have already imported this workout set');
      }

      const now = new Date().toISOString();
      
      const setData = {
        title: vaultPostData.title,
        description: vaultPostData.description,
        exercises: vaultPostData.exercises,
        ownerUid: uid,
        origin: 'imported',
        sourcePostId: postId,
        isPublished: false,
        createdAt: now,
        updatedAt: now,
        totalDuration: calculateWorkoutDuration(vaultPostData.exercises),
        muscleGroups: extractMuscleGroups(vaultPostData.exercises)
      };

      const docRef = await addDoc(this.getCollectionRef(uid), setData);
      return docRef.id;
    } catch (error) {
      console.error('Error importing from vault:', error);
      throw new Error('Failed to import workout set');
    }
  }

  async markAsPublished(uid, setId, publishedAt, publishedBy) {
    try {
      const docRef = this.getDocRef(uid, setId);
      
      await updateDoc(docRef, {
        isPublished: true,
        publishedAt: publishedAt,
        publishedBy: publishedBy,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking as published:', error);
      throw new Error('Failed to mark workout set as published');
    }
  }
}

export const workoutSetsService = new WorkoutSetsService();
export default workoutSetsService;