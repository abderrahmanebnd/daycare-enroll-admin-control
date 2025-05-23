import { Child } from "@/types";
import { MOCK_CHILDREN } from "./mockData";
import axiosPrivate from "@/axios/axios";

// Mock service for child data
class ChildService {
  private children: Child[] = [...MOCK_CHILDREN];

  async getAllChildren(): Promise<Child[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...this.children];
  }

  async getChildById(id: string): Promise<Child | undefined> {
    // Simulate API delay
    const { data } = await axiosPrivate.get(`/users/children/${id}`);
    return data.data;
  }

  async getChildrenByParent(): Promise<Child[]> {
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
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const index = this.children.findIndex((child) => child.id === id);

    if (index === -1) {
      return undefined;
    }

    const updatedChild: Child = {
      ...this.children[index],
      ...childData,
    };

    this.children[index] = updatedChild;
    return updatedChild;
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
