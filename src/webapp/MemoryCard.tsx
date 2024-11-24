import React from "react";

interface MemoryCardProps {
  title: string;
  description: string;
  image: string; // URL for the image
  timestamp: string; // ISO string or formatted date
}

const MemoryCard: React.FC<MemoryCardProps> = ({ title, description, image, timestamp }) => {
  return (
    <div className="card" style={{ maxWidth: "30%", margin: "0 auto", marginTop: "2rem" }}>
      <div className="card-content is-flex is-align-items-center">
        {/* Image Section */}
        <div className="media">
          <figure className="image is-64x64" style={{ marginRight: "1rem" }}>
            <img className="is-rounded" src={image} alt={title} />
          </figure>
        </div>
        {/* Content Section */}
        <div className="content">
          <p className="title is-4">{title}</p>
          <p className="subtitle is-6 has-text-grey">{timestamp}</p>
          <p>{description}</p>
        </div>
      </div>
      {/* Actions Section */}
      <footer className="card-footer">
        <span className="card-footer-item has-text-grey">...</span>
      </footer>
    </div>
  );
};

export default MemoryCard;
