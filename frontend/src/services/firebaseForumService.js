import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase.js'

// Collections
const POSTS_COLLECTION = 'discussion_posts'
const COMMENTS_COLLECTION = 'discussion_comments'


export class FirebaseForumService {
  
  async fetchPosts(exerciseId) {
    try {
      console.log('=== FETCH POSTS DEBUG ===')
      console.log('Raw exerciseId received:', exerciseId)
      console.log('exerciseId type:', typeof exerciseId)
      
      const exerciseIdStr = exerciseId.toString()
      console.log('Converted exerciseId to string:', exerciseIdStr)
      
      console.log('🔍 Checking ALL posts in collection first...')
      const allPostsSnapshot = await getDocs(collection(db, POSTS_COLLECTION))
      console.log(`📊 Total posts in database: ${allPostsSnapshot.size}`)
      
      allPostsSnapshot.forEach(doc => {
        const data = doc.data()
        console.log(`📝 Post ID: ${doc.id}, exerciseId: "${data.exerciseId}" (type: ${typeof data.exerciseId}), content: "${data.content.substring(0, 50)}..."`)
      })
      
      console.log(`🎯 Now querying for exerciseId: "${exerciseIdStr}"`)
      const postsQuery = query(
        collection(db, POSTS_COLLECTION),
        where('exerciseId', '==', exerciseIdStr)
      )
      
      const postsSnapshot = await getDocs(postsQuery)
      console.log(`🎯 Posts found for exercise ${exerciseIdStr}: ${postsSnapshot.size}`)
      
      const posts = []
      
      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data()
        console.log(`✅ Processing post: ${postDoc.id}`, postData)
        
        const comments = await this.fetchComments(postDoc.id)
        
        const post = {
          id: postDoc.id,
          content: postData.content,
          author: postData.author,
          createdAt: postData.createdAt?.toDate() || new Date(),
          exerciseId: postData.exerciseId, 
          comments: comments
        }
        
        posts.push(post)
      }
      
      posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      console.log(`✅ Final result: ${posts.length} posts for exercise ${exerciseIdStr}`)
      console.log('Posts data:', posts)
      return posts
      
    } catch (error) {
      console.error('❌ Error fetching posts:', error)
      throw new Error('Failed to fetch posts: ' + error.message)
    }
  }

  async fetchCommentsByExercise(exerciseId) {
    try {
      console.log('Fetching all comments for exercise:', exerciseId)
      
      const exerciseIdStr = exerciseId.toString()
      
      const postsQuery = query(
        collection(db, POSTS_COLLECTION),
        where('exerciseId', '==', exerciseIdStr)
      )
      
      const postsSnapshot = await getDocs(postsQuery)
      const allComments = []
      
      for (const postDoc of postsSnapshot.docs) {
        const comments = await this.fetchComments(postDoc.id)
        
        const commentsWithExercise = comments.map(comment => ({
          ...comment,
          exerciseId: exerciseIdStr,
          postId: postDoc.id
        }))
        
        allComments.push(...commentsWithExercise)
      }
      
      allComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      console.log(`Fetched ${allComments.length} total comments for exercise ${exerciseIdStr}`)
      
      return {
        exerciseId: exerciseIdStr,
        total: allComments.length,
        items: allComments
      }
      
    } catch (error) {
      console.error('Error fetching comments by exercise:', error)
      throw new Error('Failed to fetch comments for exercise')
    }
  }

  async fetchComments(postId) {
    try {
      const commentsQuery = query(
        collection(db, COMMENTS_COLLECTION),
        where('postId', '==', postId)
      )
      
      const commentsSnapshot = await getDocs(commentsQuery)
      const comments = []
      
      commentsSnapshot.forEach(commentDoc => {
        const commentData = commentDoc.data()
        comments.push({
          id: commentDoc.id,
          content: commentData.content,
          author: commentData.author,
          createdAt: commentData.createdAt?.toDate() || new Date(),
          postId: commentData.postId
        })
      })
      
      comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      
      return comments
      
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  }

  async createPost(exerciseId, content, author) {
    try {
      console.log('=== FIREBASE CREATE POST DEBUG ===')
      console.log('Raw exerciseId received:', exerciseId)
      console.log('exerciseId type:', typeof exerciseId)
      console.log('Content:', content)
      console.log('Author:', author)
      console.log('Database connection:', !!db)
      
      const exerciseIdStr = exerciseId.toString()
      console.log('Converted exerciseId to string:', exerciseIdStr)
      
      const postData = {
        content: content.trim(),
        author: author,
        exerciseId: exerciseIdStr,
        createdAt: serverTimestamp()
      }
      
      console.log('📤 Post data being saved to Firebase:', postData)
      console.log('📍 Collection:', POSTS_COLLECTION)
      
      const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData)
      console.log('✅ Firebase document created with ID:', docRef.id)
      
      console.log('🔍 Verifying document was saved...')
      const savedDoc = await getDocs(query(
        collection(db, POSTS_COLLECTION),
        where('exerciseId', '==', exerciseIdStr)
      ))
      console.log(`📊 Posts now in database for exercise ${exerciseIdStr}: ${savedDoc.size}`)
      
      const newPost = {
        id: docRef.id,
        content: content.trim(),
        author: author,
        createdAt: new Date(),
        exerciseId: exerciseIdStr,
        comments: []
      }
      
      console.log('✅ Returning new post object:', newPost)
      return newPost
      
    } catch (error) {
      console.error('❌ Firebase createPost error:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      })
      throw new Error('Failed to create post: ' + error.message)
    }
  }

  async updatePost(postId, content) {
    try {
      console.log('Updating post:', postId)
      
      const postRef = doc(db, POSTS_COLLECTION, postId)
      await updateDoc(postRef, {
        content: content.trim(),
        updatedAt: serverTimestamp()
      })
      
      console.log('Post updated successfully')
      
    } catch (error) {
      console.error('Error updating post:', error)
      throw new Error('Failed to update post')
    }
  }

  async deletePost(postId) {
    try {
      console.log('Deleting post:', postId)
      
      const commentsQuery = query(
        collection(db, COMMENTS_COLLECTION),
        where('postId', '==', postId)
      )
      
      const commentsSnapshot = await getDocs(commentsQuery)
      const deletePromises = commentsSnapshot.docs.map(commentDoc => 
        deleteDoc(doc(db, COMMENTS_COLLECTION, commentDoc.id))
      )
      
      await Promise.all(deletePromises)
      
      await deleteDoc(doc(db, POSTS_COLLECTION, postId))
      
      console.log('Post and comments deleted successfully')
      
    } catch (error) {
      console.error('Error deleting post:', error)
      throw new Error('Failed to delete post')
    }
  }

  async createComment(postId, content, author) {
    try {
      console.log('Creating comment for post:', postId)
      
      const commentData = {
        content: content.trim(),
        author: author,
        postId: postId,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData)
      
      const newComment = {
        id: docRef.id,
        content: content.trim(),
        author: author,
        createdAt: new Date(),
        postId: postId
      }
      
      console.log('Comment created with ID:', docRef.id)
      return newComment
      
    } catch (error) {
      console.error('Error creating comment:', error)
      throw new Error('Failed to create comment')
    }
  }

  async deleteComment(commentId) {
    try {
      console.log('Deleting comment:', commentId)
      
      await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId))
      
      console.log('Comment deleted successfully')
      
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw new Error('Failed to delete comment')
    }
  }


  async getAllComments() {
    try {
      console.log('Fetching ALL comments from database...')
      
      const postsSnapshot = await getDocs(collection(db, POSTS_COLLECTION))
      const allComments = []
      
      const exerciseNames = {
        '1': 'Push-ups',
        '2': 'Squats', 
        '3': 'Plank',
        '4': 'Burpees',
        '5': 'Mountain Climbers',
        'bench-press': 'Bench Press',
        'shoulder-press': 'Shoulder Press',
        'dips': 'Dips',
        'pull-ups': 'Pull-ups',
        'bent-over-row': 'Bent Over Row'
      }
      
      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data()
        const comments = await this.fetchComments(postDoc.id)
        
        const enhancedComments = comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          author: comment.author,
          createdAt: comment.createdAt,
          postId: comment.postId,
          exerciseId: postData.exerciseId,
          exerciseName: exerciseNames[postData.exerciseId] || `Exercise ${postData.exerciseId}`,
          postContent: postData.content.substring(0, 100) + (postData.content.length > 100 ? '...' : ''),
          postAuthor: postData.author
        }))
        
        allComments.push(...enhancedComments)
      }
      
      allComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      
      console.log(`✅ Retrieved ${allComments.length} total comments from database`)
      console.log('Sample comment structure:', allComments[0])
      
      return {
        total: allComments.length,
        items: allComments,
        byExercise: this.groupCommentsByExercise(allComments)
      }
      
    } catch (error) {
      console.error('❌ Error fetching all comments:', error)
      throw new Error('Failed to fetch all comments: ' + error.message)
    }
  }

  groupCommentsByExercise(comments) {
    const grouped = {}
    
    comments.forEach(comment => {
      const exerciseId = comment.exerciseId
      if (!grouped[exerciseId]) {
        grouped[exerciseId] = {
          exerciseId,
          exerciseName: comment.exerciseName,
          comments: []
        }
      }
      grouped[exerciseId].comments.push(comment)
    })
    
    return grouped
  }

  async getCommentStats() {
    try {
      const allCommentsData = await this.getAllComments()
      const stats = {
        totalComments: allCommentsData.total,
        commentsByExercise: {},
        topAuthors: {},
        recentActivity: allCommentsData.items.slice(0, 10) 
      }
      
      Object.values(allCommentsData.byExercise).forEach(exercise => {
        stats.commentsByExercise[exercise.exerciseId] = {
          exerciseName: exercise.exerciseName,
          count: exercise.comments.length
        }
      })
      
      allCommentsData.items.forEach(comment => {
        const authorName = comment.author.name || comment.author
        stats.topAuthors[authorName] = (stats.topAuthors[authorName] || 0) + 1
      })
      
      return stats
      
    } catch (error) {
      console.error('Error getting comment stats:', error)
      throw new Error('Failed to get comment statistics')
    }
  }
}

export const firebaseForumService = new FirebaseForumService()