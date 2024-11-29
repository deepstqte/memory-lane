import React, { useEffect, useState } from "react";
import useCsrfToken from "./hooks/useCsrfToken";

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
  const csrfToken = useCsrfToken();
  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [datetime, setDatetime] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!description.trim()) newErrors.description = "Description is required.";
    if (!datetime.trim()) newErrors.datetime = "A date and time are required.";
    if (!selectedFile) newErrors.file = "You must select a file.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Populate the modal with initial values
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle || "");
      setDescription(initialDescription || "");
      // Convert Unix timestamp to local ISO string for datetime-local input
      const initialDatetime = new Date(initialTimestamp * 1000).toISOString().slice(0, 16);
      setDatetime(initialDatetime || "");
    }
  }, [isOpen, initialTitle, initialDescription, initialImageUrl, initialTimestamp]);

  // Handle form submission
  const handleConfirm = () => {
    if (validateForm()) {
      uploadAndSubmit();
      onClose();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const uploadAndSubmit = async () => {
    if (selectedFile) {
      const updatedTimestamp = new Date(datetime).getTime() / 1000;
      const newMemoryId = await onSubmit(memoryId, title, description, initialImageUrl, updatedTimestamp);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('memoryId', newMemoryId);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
          credentials: "include",
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        });

        const data = await response.json();

        // if (response.ok && data.url) {
        if (response.ok) {
          // const updatedTimestamp = new Date(datetime).getTime() / 1000;
          // onSubmit(newMemoryId, title, description, data.url, updatedTimestamp);
          console.log("Image uploaded successfully")
        } else {
          console.error('Error uploading image:', data.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Error uploading image and creating memory:', error);
      }
    } else {
      try {
        const updatedTimestamp = new Date(datetime).getTime() / 1000;
        onSubmit(memoryId, title, description, initialImageUrl, updatedTimestamp);
      } catch (error) {
        console.error('Error updating memory:', error);
      }
    }
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
              {errors.title && <p className="help is-danger">{errors.title}</p>}
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
              {errors.description && <p className="help is-danger">{errors.description}</p>}
            </div>
          </div>

          <div className="file has-name is-fullwidth">
            <label className="file-label">
              <input
                className="file-input"
                type="file"
                name="file"
                onChange={handleFileChange}
              />
              <span className="file-cta">
                <span className="file-icon">
                  <i className="fas fa-upload"></i>
                </span>
                <span className="file-label">Choose a file…</span>
              </span>
              <span className="file-name">
                {selectedFile ? selectedFile.name : "No file selected"}
              </span>
            </label>

          </div>
          {errors.file && <p className="help is-danger">{errors.file}</p>}
          <div className="field">
            <label className="label">Timestamp</label>
            <div className="control">
              <input
                className="input"
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
              />
              {errors.datetime && <p className="help is-danger">{errors.datetime}</p>}
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
