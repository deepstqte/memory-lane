import React, { useEffect, useState } from "react";
import MemoryCard from "./MemoryCard";
import UpdateMemoryModal from "./UpdateMemoryModal";
import { Memory } from "./types"

const MemoryList: React.FC = () => {
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

  const handleDelete = async (memoryId : number) => {
    try {
      const response = await fetch("https://hmz.ngrok.io/memories/" + memoryId, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log("Item deleted successfully");
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
    timestamp: number,
  ) => {
    setCurrentMemoryId(memoryId);
    setCurrentTitle(title);
    setCurrentDescription(description);
    setCurrentImageUrl(imageUrl);
    setCurrentTimestamp(timestamp);
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (
    memoryId: number,
    updatedTitle: string,
    updatedDescription: string,
    updatedImageUrl: string,
    updatedTimestamp: number,
  ) => {
    try {
      const response = await fetch(
        "https://hmz.ngrok.io/memories/" + memoryId,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: updatedTitle,
            description: updatedDescription,
            imageUrl: updatedImageUrl,
            timestamp: updatedTimestamp,
          }),
        }
      );
      if (response.ok) {
        console.log("Item updated successfully");

        // Update memory in state
        setMemories((prevMemories) =>
          prevMemories.map((memory) =>
            memory.id === memoryId
              ? { ...memory, name: updatedTitle, description: updatedDescription, imageUrl: updatedImageUrl, timestamp: updatedTimestamp }
              : memory
          )
        );
      } else {
        throw new Error(`Failed to update: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  useEffect(() => {
    // Replace with your API endpoint
    const fetchMemories = async () => {
      try {
        fetch("https://hmz.ngrok.io/memories")
        .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Only call response.json() once
          })
          .then((data) => {
            setMemories(data.memories);
          })
          .catch((error) => console.error('Error fetching data:', error));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, []);

  if (isLoading) {
    return <p className="has-text-centered">Loading memories...</p>;
  }

  if (error) {
    return <p className="has-text-centered has-text-danger">Error: {error}</p>;
  }

  return (
    <div className="container">
      <div className="columns is-multiline is-centered">
        {memories.map((memory) => {
          if (!memory.id) return null;
          return (
            <div className="column" key={memory.id}>
              <MemoryCard
                title={memory.name}
                description={memory.description}
                image={memory.imageUrl}
                timestamp={memory.timestamp}
                onDelete={handleDelete}
                memoryId={memory.id}
                onUpdate={handleUpdateClick}
              />
            </div>
          )
        }
        )}
      </div>

      <UpdateMemoryModal
        isOpen={isModalOpen}
        memoryId={currentMemoryId}
        initialTitle={currentTitle}
        initialDescription={currentDescription}
        initialImageUrl={currentImageUrl}
        initialTimestamp={currentTimestamp}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdateSubmit} // Handle the update logic
      />
    </div>
  );
};

export default MemoryList;
