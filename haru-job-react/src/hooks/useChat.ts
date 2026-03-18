import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'manager';
    timestamp: Timestamp;
}

export const useChat = (roomId: string | null) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!roomId) {
            setMessages([]);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'chat_rooms', roomId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [roomId]);

    const sendMessage = async (text: string, sender: 'user' | 'manager') => {
        if (!roomId || !text.trim()) return;

        try {
            await addDoc(collection(db, 'chat_rooms', roomId, 'messages'), {
                text,
                sender,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return { messages, loading, sendMessage };
};
