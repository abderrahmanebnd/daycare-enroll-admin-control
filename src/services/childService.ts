import { Child } from "@/types";
import { MOCK_CHILDREN } from "./mockData";
import axiosPrivate from "@/axios/axios";

// Mock service for child data
class ChildService {
  private children: Child[] = [...MOCK_CHILDREN];

  async getAllChildren(): Promise<Child[]> {
    const { data } = await axiosPrivate.get("/users/children");
    console.log("Fetched children data:", data.data);
    return data.data;
  }

  async getChildById(id: string): Promise<Child | undefined> {
    const { data } = await axiosPrivate.get(`/users/children/${id}`);
    return data.data;
  }

  async getMyChildren(): Promise<Child[]> {
    const { data } = await axiosPrivate.get("/users/children/my");
    return data.data;
  }

  async createChild(child: Omit<Child, "id" | "createdAt">): Promise<Child> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newChild: Child = {
      ...child,
      id: (this.children.length + 1).toString(),
      createdAt: new Date().toISOString(),
    };

    this.children.push(newChild);
    return newChild;
  }

  async updateChild(
    id: string,
    childData: Partial<Child>
  ): Promise<Child | undefined> {
    const { data } = await axiosPrivate.put(`/users/children/${id}`, childData);
    console.log("Updated child data:", data.data);
    return data.data;
  }

  async deleteChild(id: string): Promise<boolean> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const initialLength = this.children.length;
    this.children = this.children.filter((child) => child.id !== id);

    return this.children.length < initialLength;
  }
}

export const childService = new ChildService();
