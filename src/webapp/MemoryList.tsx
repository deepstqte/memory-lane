import React, { useEffect, useState } from "react";
import MemoryCard from "./MemoryCard";
import MemoryModal from "./MemoryModal";
import { Memory } from "./types";

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
  const [csrfToken, setCsrfToken] = useState<string>("");

    useEffect(() => {
      const fetchCsrfToken = async () => {
        try {
          const response = await fetch("https://hmz.ngrok.io/csrf-token", {
            method: "GET",
            credentials: "include",
          });
          if (!response.ok) throw new Error("Failed to fetch CSRF token");
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        } catch (error) {
          console.error("Error fetching CSRF token:", error);
        }
      };

      fetchCsrfToken();
    }, []);

  const handleDelete = async (memoryId: number) => {
    try {
      const response = await fetch("https://hmz.ngrok.io/memories/" + memoryId, {
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
  ) => {
    if (memoryId) {
      // Update existing memory
      try {
        const response = await fetch(
          "https://hmz.ngrok.io/memories/" + memoryId,
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
      } catch (error) {
        console.error("Error updating item:", error);
      }
    } else {
      // Create new memory
      try {
        const response = await fetch("https://hmz.ngrok.io/memories", {
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
          setMemories((prevMemories) => [...prevMemories, newMemory]);
        } else {
          throw new Error(`Failed to create: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error creating item:", error);
      }
    }
  };

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const response = await fetch("https://hmz.ngrok.io/memories", {
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
  }, []);

  if (isLoading) return <p className="has-text-centered">Loading memories...</p>;
  if (error) return <p className="has-text-centered has-text-danger">Error: {error}</p>;

  return (
    <div className="container" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
      <button className="button is-normal" onClick={handleNewMemoryClick}>
        New Memory
      </button>
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
