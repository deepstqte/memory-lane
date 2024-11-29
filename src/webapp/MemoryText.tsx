import React from "react";

interface MemoryTextProps {
  title: string;
  timeString: string;
  timeAgoString: string;
  description: string;
}

const MemoryText: React.FC<MemoryTextProps> = ({ title, timeString, timeAgoString, description }) => {
  return (
      <div className="content">
        <p className="title is-4">{title}</p>
        <p className="subtitle is-6 has-text-grey" title={timeString}>
          {timeAgoString}
        </p>
        <p>{description}</p>
      </div>
  );
};

export default MemoryText;
