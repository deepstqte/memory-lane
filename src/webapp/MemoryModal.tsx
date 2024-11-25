import React, { useEffect, useState } from "react";

interface MemoryModalProps {
  isOpen: boolean;
  memoryId: number | null;
  initialTitle: string;
  initialDescription: string;
  initialImageUrl: string;
  initialTimestamp: number; // Unix timestamp
  onClose: () => void;
  onSubmit: (
    memoryId: number | null,
    title: string,
    description: string,
    imageUrl: string,
    timestamp: number
  ) => void;
}

const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  memoryId,
  initialTitle,
  initialDescription,
  initialImageUrl,
  initialTimestamp,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [datetime, setDatetime] = useState<string>(""); // Local ISO string for datetime-local input

  // Populate the modal with initial values
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle || "");
      setDescription(initialDescription || "");
      setImageUrl(initialImageUrl || "");
      // Convert Unix timestamp to local ISO string for datetime-local input
      const initialDatetime = new Date(initialTimestamp * 1000).toISOString().slice(0, 16);
      setDatetime(initialDatetime || "");
    }
  }, [isOpen, initialTitle, initialDescription, initialImageUrl, initialTimestamp]);

  // Handle form submission
  const handleConfirm = () => {
    // Convert local ISO string back to Unix timestamp
    const updatedTimestamp = new Date(datetime).getTime() / 1000;
    onSubmit(memoryId, title, description, imageUrl, updatedTimestamp);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{memoryId ? "Update Memory" : "New Memory"}</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <div className="field">
            <label className="label">Title</label>
            <div className="control">
              <input
                className="input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">Description</label>
            <div className="control">
              <textarea
                className="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
          <div className="field">
            <label className="label">Image URL</label>
            <div className="control">
              <input
                className="input"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">Timestamp</label>
            <div className="control">
              <input
                className="input"
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
              />
            </div>
          </div>
        </section>
        <footer className="modal-card-foot">
          <div className="buttons">
            <button className="button is-success" onClick={handleConfirm}>
              Confirm
            </button>
            <button className="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MemoryModal;