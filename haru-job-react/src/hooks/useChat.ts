import { useState, useEffect } from 'react';
import {
    addDoc,
    collection,
    doc,
    increment,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase';

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'manager' | 'system';
    timestamp: Timestamp;
    isRead?: boolean;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
}

export const useChat = (roomId: string | null, isAdmin: boolean = false, shouldMarkAsRead: boolean = true) => {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        if (!roomId) {
            return;
        }

        const roomRef = doc(db, 'chat_rooms', roomId);
        const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                let msgs = snapshot.docs.map((messageDoc) => ({
                    id: messageDoc.id,
                    ...messageDoc.data(),
                } as Message));

                // Keep the user view focused on the recent conversation.
                if (!isAdmin) {
                    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                    msgs = msgs.filter((message) => {
                        if (!message.timestamp) return true;
                        return message.timestamp.toMillis() > sevenDaysAgo;
                    });
                }

                setMessages(msgs);

                const unreadMessages = snapshot.docs.filter((messageDoc) => {
                    const data = messageDoc.data();
                    const isRecipient = isAdmin ? data.sender === 'user' : data.sender === 'manager';
                    return isRecipient && data.isRead === false;
                });

                if (shouldMarkAsRead) {
                    const unreadField = isAdmin ? 'unreadCountManager' : 'unreadCountUser';
                    updateDoc(roomRef, { [unreadField]: 0 }).catch((error) => {
                        console.error('Failed to reset unread counter:', error);
                    });
                }

                if (shouldMarkAsRead && unreadMessages.length > 0) {
                    const batch = writeBatch(db);
                    unreadMessages.forEach((messageDoc) => {
                        batch.update(doc(db, 'chat_rooms', roomId, 'messages', messageDoc.id), {
                            isRead: true,
                        });
                    });
                    batch.commit().catch((error) => {
                        console.error('Failed to mark messages as read:', error);
                    });
                }
            },
            (error) => {
                console.error('Chat listener failed:', error);
            }
        );

        return () => unsubscribe();
    }, [roomId, isAdmin, shouldMarkAsRead]);

    const effectiveMessages = roomId ? messages : [];

    const uploadFile = async (file: File) => {
        if (!roomId) return null;

        try {
            const fileRef = ref(storage, `chat_attachments/${roomId}/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.error('Error uploading file:', error);
            return null;
        }
    };

    const sendMessage = async (
        text: string,
        sender: 'user' | 'manager' | 'system',
        fileDetails?: { url: string; name: string; type: string }
    ) => {
        if (!roomId || (!text.trim() && !fileDetails)) return;

        try {
            await addDoc(collection(db, 'chat_rooms', roomId, 'messages'), {
                text,
                sender,
                timestamp: serverTimestamp(),
                isRead: false,
                ...(fileDetails && {
                    fileUrl: fileDetails.url,
                    fileName: fileDetails.name,
                    fileType: fileDetails.type,
                }),
            });

            const unreadField =
                sender === 'manager'
                    ? { unreadCountUser: increment(1) }
                    : sender === 'user'
                        ? { unreadCountManager: increment(1) }
                        : {};

            await updateDoc(doc(db, 'chat_rooms', roomId), {
                lastMessage: fileDetails
                    ? fileDetails.type.startsWith('image/')
                        ? '새 이미지가 도착했습니다.'
                        : '새 파일이 도착했습니다.'
                    : text,
                lastMessageTime: serverTimestamp(),
                lastSenderRole: sender,
                ...unreadField,
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const leaveChat = async () => {
        if (!roomId) return;

        try {
            await addDoc(collection(db, 'chat_rooms', roomId, 'messages'), {
                text: '지원자가 채팅방을 떠났습니다.',
                sender: 'system',
                timestamp: serverTimestamp(),
                isRead: false,
            });

            await updateDoc(doc(db, 'chat_rooms', roomId), {
                lastMessage: '지원자가 채팅방을 떠났습니다.',
                lastMessageTime: serverTimestamp(),
                lastSenderRole: 'user',
                userStatus: 'left',
            });

            localStorage.removeItem('chatRoomId');
        } catch (error) {
            console.error('Error leaving chat:', error);
        }
    };

    return { messages: effectiveMessages, loading: false, sendMessage, leaveChat, uploadFile };
};
