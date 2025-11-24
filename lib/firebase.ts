import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { Topic, Message } from '../types';

// NOTE: In a real production app, these would come from import.meta.env
// For this demo, we will check if they exist. If not, we fall back to a local mock service.
const firebaseConfig = {
  apiKey: "AIzaSyAKSyyzR7o6wx3WkpXFucCMUyA4mIDHQwg",
  authDomain: "database-kasbon.firebaseapp.com",
  projectId: "database-kasbon",
  storageBucket: "database-kasbon.firebasestorage.app",
  messagingSenderId: "486058131418",
  appId: "1:486058131418:web:114dfa98ad91ffc7160ae3",
  measurementId: "G-93M7PW5XE4"
};

const isFirebaseConfigured = !!firebaseConfig.apiKey;

let db: any;
if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

// --- MOCK DATA STORE (For Demo when no Firebase keys) ---
class MockStore {
  topics: Topic[] = [
    { id: '1', title: 'Welcome Lounge', description: 'Introduce yourself!', createdAt: Date.now() - 100000, messageCount: 5, ownerId: 'guest_12345', ownerName: 'Alex' },
    { id: '2', title: 'Tech Talk', description: 'Discuss the latest in tech.', createdAt: Date.now() - 50000, messageCount: 12, ownerId: 'guest_22222', ownerName: 'DevSam' },
    { id: '3', title: 'Random', description: 'Anything goes.', createdAt: Date.now(), messageCount: 2, ownerId: 'guest_99999', ownerName: 'Guest' }
  ];
  messages: Record<string, Message[]> = {
    '1': [
      { id: 'm1', topicId: '1', text: 'Hello everyone!', senderId: 'guest_12345', timestamp: Date.now() - 10000 },
      { id: 'm2', topicId: '1', text: 'Welcome to the chat.', senderId: 'guest_99999', timestamp: Date.now() - 5000 }
    ]
  };
  listeners: Record<string, Function[]> = {};

  notify(key: string, data: any) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => cb(data));
    }
  }

  subscribe(key: string, cb: Function) {
    if (!this.listeners[key]) this.listeners[key] = [];
    this.listeners[key].push(cb);
    // Initial call
    if (key === 'topics') cb(this.topics);
    if (key.startsWith('messages_')) {
      const topicId = key.split('_')[1];
      cb(this.messages[topicId] || []);
    }
    return () => {
      this.listeners[key] = this.listeners[key].filter(l => l !== cb);
    };
  }

  addTopic(topic: Omit<Topic, 'id' | 'createdAt'>) {
    const newTopic = { ...topic, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now(), messageCount: 0 };
    this.topics.push(newTopic);
    this.notify('topics', this.topics);
  }

  closeTopic(topicId: string, requestedBy?: string) {
    const t = this.topics.find((x) => x.id === topicId);
    if (!t) return;
    // allow close only if requester is owner (or no owner set for backwards compatibility)
    if (t.ownerId && requestedBy && t.ownerId !== requestedBy) {
      // ignore unauthorized close in mock (could throw or return false)
      return;
    }
    (t as any).closed = true;
    this.notify('topics', this.topics);
  }

  addMessage(topicId: string, message: Omit<Message, 'id' | 'timestamp'>) {
    const newMessage = { ...message, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
    if (!this.messages[topicId]) this.messages[topicId] = [];
    this.messages[topicId].push(newMessage);
    this.notify(`messages_${topicId}`, this.messages[topicId]);
  }
}

const mockStore = new MockStore();

// --- SERVICE ABSTRACTION ---

export const subscribeToTopics = (callback: (topics: Topic[]) => void) => {
  if (isFirebaseConfigured) {
    const q = query(collection(db, 'topics'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Topic));
      callback(topics);
    });
  } else {
    return mockStore.subscribe('topics', callback);
  }
};

export const createTopic = async (title: string, description: string, ownerId?: string, ownerName?: string) => {
  if (isFirebaseConfigured) {
    await addDoc(collection(db, 'topics'), {
      title,
      description,
      createdAt: serverTimestamp(),
      messageCount: 0,
      ownerId: ownerId || null,
      ownerName: ownerName || null
    });
  } else {
    mockStore.addTopic({ title, description, ownerId, ownerName });
  }
};

export const subscribeToMessages = (topicId: string, callback: (messages: Message[]) => void) => {
  if (isFirebaseConfigured) {
    // Note: In a real app we would use a subcollection `topics/{topicId}/messages`
    // OR a top level collection with a where clause.
    // The prompt requested: topics/{topicId}/messages
    const messagesRef = collection(db, 'topics', topicId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      callback(messages);
    });
  } else {
    return mockStore.subscribe(`messages_${topicId}`, callback);
  }
};

export const sendMessage = async (topicId: string, text: string, senderId: string) => {
  if (isFirebaseConfigured) {
    const messagesRef = collection(db, 'topics', topicId, 'messages');
    await addDoc(messagesRef, {
      topicId,
      text,
      senderId,
      timestamp: Date.now() // or serverTimestamp()
    });
  } else {
    mockStore.addMessage(topicId, { topicId, text, senderId });
  }
};

export const closeTopic = async (topicId: string, requestedBy?: string) => {
  if (isFirebaseConfigured) {
    // In a real app, enforce via security rules; here we optimistically set closed flag.
    await updateDoc(doc(db, 'topics', topicId), { closed: true });
  } else {
    mockStore.closeTopic(topicId, requestedBy);
  }
};
