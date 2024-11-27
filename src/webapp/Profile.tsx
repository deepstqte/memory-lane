import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import MemoryList from "./MemoryList";
import ProfileModal from "./ProfileModal";
import { User } from "./types";

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [csrfToken, setCsrfToken] = useState<string>("");

  const handleProfileUpdateClick = (
    // bio: string
  ) => {
    // setCurrentBio(bio);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("https://hmz.ngrok.io/csrf-token", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch CSRF token");
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    };

    fetchCsrfToken();
  }, []);

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const response = await fetch("https://hmz.ngrok.io/users/" + userId, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setUser(data.user);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, [userId]);

  const handleSubmit = async (
    bio: string | undefined
  ) => {
    // Update existing user
    try {
      const response = await fetch(
        "https://hmz.ngrok.io/users/",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          body: JSON.stringify({
            bio: bio
          }),
        }
      );
      if (response.ok) {
        // Update the bio in the UI
        setUser((prevUser) => {
          if (!prevUser) return undefined;
          return { ...prevUser, bio }; // Update the bio in the user state
        });
      } else {
        throw new Error(`Failed to update: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating bio:", error);
    }

  };

  if (isLoading) return <p className="has-text-centered">Loading memories...</p>;
  if (error) return <p className="has-text-centered has-text-danger">Error: {error}</p>;

  return (
    <div>
      <div className='overflow-hidden rounded-lg bg-white shadow h-56'>
        <div className='px-4 py-5 sm:p-6'>
          <div className='flex items-center'>
            <figure className="image is-48x48">
              <img className="is-rounded" src={user?.profilePictureUrl} />
            </figure>
            <h1 className='text-4xl font-semibold text-gray-900 mb-4 ml-4 mt-4'>
              {user?.firstName} {user?.lastName}
            </h1>
          </div>
          <p>
            {user?.bio}
          </p>
          <div className='is-flex is-justify-content-flex-end'>
            <button className="button is-normal" onClick={handleProfileUpdateClick}>
              Update Bio
            </button>
          </div>
        </div>
      </div>
      <MemoryList userId={userId} />

      <ProfileModal
        isOpen={isModalOpen}
        userId={user?.id}
        initialBio={user?.bio}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Profile;
