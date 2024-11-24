import React, { useEffect, useState } from "react";
import MemoryCard from "./MemoryCard";
import { Memory } from "./types"

const MemoryList: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
            console.log(data); // Process the JSON data here
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
        {memories.map((memory) => (
          <div className="column" key={memory.id}>
            <MemoryCard
              title={memory.name}
              description={memory.description}
              image={memory.image}
              timestamp={memory.timestamp}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryList;
