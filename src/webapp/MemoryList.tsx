import React, { useEffect, useState } from "react";
import MemoryCard from "./MemoryCard";
import { Memory } from "./types"

const MemoryList: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
            console.log(data.memories); // Process the JSON data here
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
              />
            </div>
          )
        }
        )}
      </div>
    </div>
  );
};

export default MemoryList;
