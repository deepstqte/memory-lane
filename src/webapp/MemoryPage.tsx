import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Memory } from "./types";
import MemoryText from "./MemoryText";
import TimeAgo from 'javascript-time-ago';

const timeAgo = new TimeAgo('en-US');

const MemoryPage: React.FC = () => {
  const { userId, memoryId } = useParams<{ userId: string, memoryId: string }>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [memory, setMemory] = useState<Memory>();

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/memories/${memoryId}`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setMemory(data.memory[0]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemory();
  }, [memoryId]);

  const dateTime: Date = new Date(memory?.timestamp || 0 * 1000);
  const timeAgoString: string = timeAgo.format(dateTime);
  const timeString: string = dateTime.toDateString() + " - " + dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isLoading) return <p className="has-text-centered">Loading memory...</p>;
  if (error) return <p className="has-text-centered has-text-danger">Error: {error}</p>;

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <figure className="image" style={{ margin: "2 auto", display: "flex", justifyContent: "center" }}>
        <img src={"https://res.cloudinary.com/memory-lane/image/upload/"+userId+"/"+memoryId} alt={"altText"} style={{
          borderRadius: "8px",
          width: "auto",
          height: "auto",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }} />
      </figure>
      <div className="has-text-left" style={{ marginTop: "4rem", marginBottom: "4rem", fontSize: "1.2rem" }}>
        <MemoryText title={memory?.name || ""} timeString={timeString} timeAgoString={timeAgoString} description={memory?.description || ""} />
      </div>
    </div>
  );
};

export default MemoryPage;
