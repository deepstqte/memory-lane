import React from "react";
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

TimeAgo.addDefaultLocale(en);

const timeAgo = new TimeAgo('en-US');

interface MemoryCardProps {
  title: string;
  description: string;
  image: string;
  timestamp: number;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ title, description, image, timestamp }) => {
  const dateTime: Date = new Date(timestamp * 1000);
  const timeAgoString: string = timeAgo.format(dateTime);
  const timeString: string = dateTime.toDateString() + " - " + dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <p className="subtitle is-6 has-text-grey" title={timeString}>{timeAgoString}</p>
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
