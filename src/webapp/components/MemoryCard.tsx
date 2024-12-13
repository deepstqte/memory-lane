import React, { useEffect, useState } from "react";
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import useCsrfToken from "../hooks/useCsrfToken";
import MemoryText from "./MemoryText";

TimeAgo.addDefaultLocale(en);

const timeAgo = new TimeAgo('en-US');

interface MemoryCardProps {
  title: string;
  description: string;
  image: string;
  timestamp: number;
  onDelete: (memoryId: number) => void;
  memoryId: number;
  onUpdate: (memoryId: number, title: string, description: string, imageUrl: string, timestamp: number) => void;
  userId: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ title, description, image, timestamp, onDelete, memoryId, onUpdate, userId, firstName, lastName, profilePictureUrl }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const csrfToken = useCsrfToken();
  const [showUpdatMenu, setShowUpdatMenu] = useState<boolean>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const dateTime: Date = new Date(timestamp * 1000);
  const timeAgoString: string = timeAgo.format(dateTime);
  const timeString: string = dateTime.toDateString() + " - " + dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    const fetchLoggedInUserId = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/whoami`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setShowUpdatMenu(data.userId == userId);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoggedInUserId();
  }, [csrfToken, userId]);

  if (isLoading) return <p className="has-text-centered">Loading memories...</p>;
  if (error) return <p className="has-text-centered has-text-danger">Error: {error}</p>;

  return (
    <div
      className="card"
      style={{
        maxWidth: "80%",
        margin: "0 auto",
        marginTop: "2rem",
        marginBottom: "2rem",
        position: "relative",
      }}
    >
      <a href={"/"+userId}>
        <header className="card-header">
            <figure className="image is-48x48" style={{ margin: "1rem" }}>
              <img className="is-rounded" src={profilePictureUrl} />
            </figure>
            <p className="card-header-title">{firstName} {lastName}</p>
        </header>
      </a>

        <div className="card-content">
          <div className="columns is-vcentered">

            <div className="column is-one-third">
              <figure className="image is-square">
                <a href={"/"+userId+"/"+memoryId}>
                <img src={"https://res.cloudinary.com/memory-lane/image/upload/f_jpg,c_crop,g_center,ar_1:1/"+userId+"/"+memoryId} alt={title} />
                </a>
              </figure>
            </div>


            <div className="column" style={{ maxWidth: "80%", margin: "0 auto", overflow: "hidden" }}>
              <MemoryText title={title} timeString={timeString} timeAgoString={timeAgoString} description={description} />

              {showUpdatMenu && (
                <div style={{ position: "absolute", bottom: "1rem", right: "1rem" }}>
                  <div
                    className="dropdown is-right"
                    style={{ position: "relative" }}
                    onMouseLeave={() => setIsMenuOpen(false)}
                  >
                    <div
                      className="dropdown-trigger"
                      onClick={toggleMenu}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <span className="icon">
                        <i className="fas fa-ellipsis-h" aria-hidden="true"></i>
                      </span>
                    </div>

                    {isMenuOpen && (
                      <div
                        className="dropdown-menu"
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: "0",
                          zIndex: 9999,
                          backgroundColor: "white",
                          boxShadow: "0px 0px 0px rgba(0, 0, 0, 0.15)",
                          display: "block",
                        }}
                      >
                        <ul className="dropdown-content" style={{ padding: 0, margin: 0 }}>
                          <li
                            className="dropdown-item"
                            onClick={() => onUpdate(memoryId, title, description, image, timestamp)}
                            style={{
                              padding: "0.5rem 1rem",
                              cursor: "pointer",
                            }}
                          >
                            Update
                          </li>
                          <li
                            className="dropdown-item"
                            onClick={() => onDelete(memoryId)}
                            style={{
                              padding: "0.5rem 1rem",
                              cursor: "pointer",
                              color: "red",
                            }}
                          >
                            Delete
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default MemoryCard;
