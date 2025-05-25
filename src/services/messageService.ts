import { Message } from "@/types";
import axiosPrivate from "@/axios/axios";

class MessageService {
  async getAllMessages(): Promise<Message[]> {
    const { data } = await axiosPrivate.get("/messages");
    return data.messages;
  }

  async getMessageById(id: string): Promise<Message | undefined> {
    const { data } = await axiosPrivate.get(`/messages/${id}`);
    return data.message;
  }

  async getMessagesBySenderId(senderId: string): Promise<Message[]> {
    const { data } = await axiosPrivate.get(`/messages/sender/${senderId}`);
    return data.messages;
  }

  async getMessagesByReceiverId(receiverId: string): Promise<Message[]> {
    const { data } = await axiosPrivate.get(`/messages/receiver/${receiverId}`);
    return data.messages;
  }

  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    // Assuming your backend has a route to fetch conversation between two users
    const { data } = await axiosPrivate.get(
      `/messages/conversation/${userId1}/${userId2}`
    );
    return data.messages;
  }

  async createMessage(
    message: Omit<Message, "id" | "seen" | "createdAt">
  ): Promise<Message> {
    const { data } = await axiosPrivate.post("/messages", message);
    return data.message;
  }

  async markAsRead(id: string): Promise<Message | undefined> {
    const { data } = await axiosPrivate.patch(`/messages/${id}/read`);
    return data.message;
  }

  async markAllAsRead(receiverId: string): Promise<number> {
    const { data } = await axiosPrivate.patch(
      `/messages/receiver/${receiverId}/read`
    );
    return data.count; // number of messages marked read
  }

  async getConversation(recipientId: string): Promise<Message[]> {
    const { data } = await axiosPrivate.get(`/messages/${recipientId}`);
    return data.messages;
  }
}

export const messageService = new MessageService();
