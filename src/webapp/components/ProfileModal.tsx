import React, { useEffect, useState } from "react";

interface ProfileModalProps {
  isOpen: boolean;
  userId?: string;
  initialBio: string | undefined;
  onClose: () => void;
  onSubmit: (
    bio: string | undefined
  ) => void;
}

const BioModal: React.FC<ProfileModalProps> = ({
  isOpen,
  initialBio,
  onClose,
  onSubmit,
}) => {
  const [bio, setBio] = useState<string>(initialBio || "");

  // Populate the modal with initial values
  useEffect(() => {
    if (isOpen) {
      setBio(initialBio || "");
    }
  }, [isOpen, initialBio]);

  // Handle form submission
  const handleConfirm = () => {
    onSubmit(bio);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          {/* <p className="modal-card-title">Update Bio</p> */}
          {/* <button className="delete" aria-label="close" onClick={onClose}></button> */}
        </header>
        <section className="modal-card-body">
          <div className="field">
            <label className="label">Bio</label>
            <div className="control">
              <textarea
                className="textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              ></textarea>
            </div>
          </div>
        </section>
        <footer className="modal-card-foot">
          <div className="buttons">
            <button className="button is-success" onClick={handleConfirm}>
              Save
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

export default BioModal;
