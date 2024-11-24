import React, { useState } from "react";
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

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
}

const MemoryCard: React.FC<MemoryCardProps> = ({ title, description, image, timestamp, onDelete, memoryId, onUpdate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const dateTime: Date = new Date(timestamp * 1000);
  const timeAgoString: string = timeAgo.format(dateTime);
  const timeString: string = dateTime.toDateString() + " - " + dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div
      className="card"
      style={{
        maxWidth: "30%",
        margin: "0 auto",
        marginTop: "2rem",
        position: "relative",
      }}
    >
      <div className="card-image">
        <figure className="image is-1by1">
          <img
              src={image}
              alt={title}
          />
        </figure>
      </div>
      {/* Contextual Menu */}
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

      <div className="card-content is-flex is-align-items-center">
        {/* Content Section */}
        <div className="content">
          <p className="title is-4">{title}</p>
          <p className="subtitle is-6 has-text-grey" title={timeString}>
            {timeAgoString}
          </p>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
