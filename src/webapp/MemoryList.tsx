import React, { useEffect, useState } from "react";
import MemoryCard from "./MemoryCard";
import MemoryModal from "./MemoryModal";
import { Memory } from "./types";
import useCsrfToken from "./hooks/useCsrfToken";

interface MemoryListProps {
  userId?: string;
}

const MemoryList: React.FC<MemoryListProps> = ({ userId }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentMemoryId, setCurrentMemoryId] = useState<number | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [currentDescription, setCurrentDescription] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

  const csrfToken = useCsrfToken();

  const handleDelete = async (memoryId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/memories/` + memoryId, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });
      if (response.ok) {
        setMemories((prevMemories) =>
          prevMemories.filter((memory) => memory.id !== memoryId)
        );
      } else {
        throw new Error(`Failed to delete: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleUpdateClick = (
    memoryId: number,
    title: string,
    description: string,
    imageUrl: string,
    timestamp: number
  ) => {
    setCurrentMemoryId(memoryId);
    setCurrentTitle(title);
    setCurrentDescription(description);
    setCurrentImageUrl(imageUrl);
    setCurrentTimestamp(timestamp);
    setIsModalOpen(true);
  };

  const handleNewMemoryClick = () => {
    setCurrentMemoryId(null);
    setCurrentTitle("");
    setCurrentDescription("");
    setCurrentImageUrl("");
    setCurrentTimestamp(0);
    setIsModalOpen(true);
  };

  const handleSubmit = async (
    memoryId: number | null,
    title: string,
    description: string,
    imageUrl: string,
    timestamp: number
  ): Promise<number | null> => {
    if (memoryId) {
      // Update existing memory
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/memories/` + memoryId,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrfToken,
            },
            body: JSON.stringify({
              name: title,
              description,
              imageUrl,
              timestamp,
            }),
          }
        );
        if (response.ok) {
          setMemories((prevMemories) =>
            prevMemories.map((memory) =>
              memory.id === memoryId
                ? { ...memory, name: title, description, imageUrl, timestamp }
                : memory
            )
          );
        } else {
          throw new Error(`Failed to update: ${response.statusText}`);
        }
        return memoryId;
      } catch (error) {
        console.error("Error updating item:", error);
      }
      return null;
    } else {
      // Create new memory
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/memories`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({
            name: title,
            description,
            imageUrl,
            timestamp,
          }),
        });
        if (response.ok) {
          const newMemory = await response.json();
          console.log(newMemory);
          setMemories((prevMemories) => [...prevMemories, newMemory]);
          return(newMemory.id);
        } else {
          throw new Error(`Failed to create: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error creating item:", error);
      }
      return null;
    }
  };

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const url = userId
          ? `${import.meta.env.VITE_API_BASE_URL}/users/${userId}/memories`
          : `${import.meta.env.VITE_API_BASE_URL}/memories`;
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setMemories(data.memories);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, [userId]);

  if (isLoading) return <p className="has-text-centered">Loading memory...</p>;
  if (error) return <p className="has-text-centered has-text-danger">Error: {error}</p>;
  return (
    <div className="container" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
      <div className="is-flex is-justify-content-flex-end">
        <button className="button is-normal" onClick={handleNewMemoryClick}>
          New Memory
        </button>
      </div>
      <div className="columns is-multiline is-centered">
        {memories.map((memory) => (
          <div className="column is-full" key={memory.id}>
            {memory.id && (
              <MemoryCard
                memoryId={memory.id}
                title={memory.name}
                description={memory.description}
                image={memory.imageUrl}
                timestamp={memory.timestamp}
                onDelete={handleDelete}
                onUpdate={handleUpdateClick}
                userId={memory.author}
                firstName={memory.user.firstName || ""}
                lastName={memory.user.lastName || ""}
                profilePictureUrl={memory.user.profilePictureUrl || ""}
              />)
            }
          </div>
        ))}
      </div>

      <MemoryModal
        isOpen={isModalOpen}
        memoryId={currentMemoryId}
        initialTitle={currentTitle}
        initialDescription={currentDescription}
        initialImageUrl={currentImageUrl}
        initialTimestamp={currentTimestamp}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default MemoryList;
