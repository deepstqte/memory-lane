import React, { useEffect, useState } from "react";

interface UpdateMemoryModalProps {
  isOpen: boolean;
  memoryId: number | null;
  initialTitle: string;
  initialDescription: string;
  initialImageUrl: string;
  initialTimestamp: number;
  onClose: () => void;
  onUpdate: (memoryId: number, updatedTitle: string, updatedDescription: string, updatedImageUrl: string, updatedTimestamp: number) => void;
}

const UpdateMemoryModal: React.FC<UpdateMemoryModalProps> = ({
  isOpen,
  memoryId,
  initialTitle,
  initialDescription,
  initialImageUrl,
  initialTimestamp,
  onClose,
  onUpdate,
}) => {
  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
  const [timestamp, setTimestamp] = useState<number>(initialTimestamp);

  useEffect(() => {
      if (isOpen) {
        setTitle(initialTitle);
        setDescription(initialDescription);
        setImageUrl(initialImageUrl);
        setTimestamp(initialTimestamp);
      }
    }, [isOpen, initialTitle, initialDescription, initialImageUrl, initialTimestamp]);

  const handleConfirm = () => {
    if (memoryId) {
      onUpdate(memoryId, title, description, imageUrl, timestamp);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Update Memory</p>
          <button className="delete" aria-label="close" onClick={onClose}></button>
        </header>
        <section className="modal-card-body">
          <div className="field">
            <label className="label">Title</label>
            <div className="control">
              <input
                className="input"
                type="text"
                value={title || ""}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">Description</label>
            <div className="control">
              <textarea
                className="textarea"
                value={description || ""}
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
                value={imageUrl || ""}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">Timestamp</label>
            <div className="control">
              <input
                className="input"
                type="number"
                value={timestamp || 0}
                onChange={(e) => setTimestamp(Number(e.target.value))}
              />
            </div>
          </div>
        </section>
        <footer className="modal-card-foot">
          <div className="buttons">
            <button className="button" onClick={handleConfirm}>
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

export default UpdateMemoryModal;
