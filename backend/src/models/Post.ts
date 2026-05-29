// backend/src/models/Post.ts

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorVerified?: boolean;
  title: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

// Хранилище постов в памяти
const postsStore: Post[] = [];

export const createPost = (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments' | 'shares'>): Post => {
  const newPost: Post = {
    ...post,
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 0,
    comments: 0,
    shares: 0
  };
  postsStore.unshift(newPost);
  return newPost;
};

export const getAllPosts = (): Post[] => {
  return [...postsStore];
};

export const getPostById = (id: string): Post | undefined => {
  return postsStore.find(p => p.id === id);
};

export const updatePost = (id: string, updates: Partial<Post>): Post | undefined => {
  const index = postsStore.findIndex(p => p.id === id);
  if (index === -1) return undefined;
  postsStore[index] = { ...postsStore[index], ...updates, updatedAt: new Date().toISOString() };
  return postsStore[index];
};

export const deletePost = (id: string): boolean => {
  const index = postsStore.findIndex(p => p.id === id);
  if (index === -1) return false;
  postsStore.splice(index, 1);
  return true;
};

export const incrementLike = (id: string): Post | undefined => {
  const post = getPostById(id);
  if (!post) return undefined;
  post.likes += 1;
  return post;
};

export const incrementShare = (id: string): Post | undefined => {
  const post = getPostById(id);
  if (!post) return undefined;
  post.shares += 1;
  return post;
};